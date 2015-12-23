(function () {
    var Runtime, Config, Browser, ProxyManager, ServerManager, PackageManager, MessageManager, Storage, Status;
    PackageManager = require('./package-manager').PackageManager;
    ServerManager = require('./server-manager').ServerManager;
    ProxyManager = require('./proxy-manager').ProxyManager;
    Storage = require('./storage').Storage;
    Browser = require('./browser').Browser;
    MessageManager = require('./message-manager').MessageManager;
    Config = require('./config').Config;
    Status = require('./status').Status;

    Runtime = (function () {
        function Runtime() {
        }

        Runtime.prototype.init = function () {
            var api_key, self = this, is_install, server, uninstall_url;
            PackageManager = require("./package-manager").PackageManager;
            ServerManager = require("./server-manager").ServerManager;
            ProxyManager = require("./proxy-manager").ProxyManager;
            Config = require("./config").Config;
            Storage = require("./storage").Storage;
            Browser = require("./browser").Browser;
            Status = require("./status").Status;
            MessageManager = require("./message-manager").MessageManager;

            server = Config.get('primary_server');

            Browser.generateButtons();

            is_install = Storage.get('is_install')
            uninstall_url = Storage.get('uninstall_url');

            if (!uninstall_url) {
                Storage.set('uninstall_url', "" + server + "remove/");
            }

            api_key = Storage.get('api_key');

            if (api_key) {
                Browser.setPopup("pages/popup/index.html");
            } else if (is_install) {
                self.is_install(function () {
                })
            } else {
                self.is_update(function () {
                })
            }
        };

        Runtime.prototype.is_install = function (callback) {
            var server, uninstallUrl;
            server = Config.get('primary_server');
            uninstallUrl = "" + server + "remove/";
            Browser.setUninstallURL(uninstallUrl);
            Browser.createTab('pages/install/index.html')
        };

        Runtime.prototype.is_update = function (callback) {
            var self = this, is_update;
            Storage.set('is_update', true);
            self.requestActivation("", function (data) {
                self.activatePlugin(data.api_key,
                    function (data) {
                        Storage.set('is_update', '')
                    })
            })
        };


        Runtime.prototype.requestActivation = function (email, callback) {
            var server, is_update, requestActivationUrl;
            server = Config.get('primary_server');
            //is_update = Storage.get('is_update') == undefined ? false : true;
            is_update = Storage.get('is_update') == undefined ? '' : 'is_update';

            requestActivationUrl = "" + server + "api/user/activation/require/";
            Browser.POST(
                requestActivationUrl,
                {
                    email: email,
                    browser: 'Firefox',
                    is_update: is_update
                },
                function (data) {
                    Storage.set('activation_link', data.activation_link);
                    return callback(data);
                }
            );
        };

        Runtime.prototype.activatePlugin = function (key, callback) {
            var server, requestActivationUrl, uninstallUrl, self;
            self = this;
            server = Config.get('primary_server');
            requestActivationUrl = "" + server + "api/user/confirm/" + key + '/';
            uninstallUrl = "" + server + "uninstall/" + key + '/';
            Browser.GET(requestActivationUrl, function (data) {
                if (!data.success) {
                    return callback(data)
                }
                Storage.set('activation_link', "")
                Storage.set('api_key', key);
                Status.update();
                Browser.setPopup("pages/popup/index.html");
                Browser.setUninstallURL(uninstallUrl);
                self.restart();
                return callback(data);
            });
        };

        /**
         * Update the app. Retrieves servers and sets pac
         */

        Runtime.prototype.checkApi = function () {
            var apiKey;
            apiKey = Storage.get('api_key');
            if (!apiKey) {
                Browser.createTab('pages/install/index.html')
            }
        };

        /**
         * Starts the app. Retrieves servers and sets pac
         */

        Runtime.prototype.start = function () {
            var globalStatus, pac, packages, servers, api_key;
            api_key = Storage.get('api_key');
            globalStatus = Storage.get('proxmate_global_status');
            console.info('-----> starting runtime....');
            console.info("global status: " + globalStatus);


            if (!globalStatus || !api_key) {
                console.info('I am deactivated????');
                this.stop();
                return
            }

            Browser.generateButtons();
            Browser.setIcon("ressources/images/icon48.png");
            console.info('start after browser');

            MessageManager.get();

            packages = PackageManager.getInstalledPackages();
            servers = ServerManager.getServers();
            if (packages.length === 0 || servers.length === 0) {
                if (packages.length === 0) {
                    console.info('---------> no packages or servers');
                    return console.info('start after seticontext to none');
                }
            } else {
                pac = ProxyManager.generateProxyAutoconfigScript(packages, servers);
                return ProxyManager.setProxyAutoconfig(pac);
            }
        };


        /**
         * Restarts application flow. This means the app is already running and now getting started again.
         */

        Runtime.prototype.restart = function (callback) {
            var globalStatus;
            if (typeof callback === "undefined") {
                callback = function () {
                }
            }

            globalStatus = Storage.get('proxmate_global_status');
            if (!globalStatus) {
                this.stop();
                return;
            }

            console.info('-----> restarting runtime');
            this.stop();
            return ServerManager.init((function (_this) {
                return function () {
                    PackageManager.init();
                    console.info('-----> before starting runtime again');
                    return _this.start(), callback();
                }
            })(this))
        };


        /**
         * Removed the proxy from chrome
         */

        Runtime.prototype.stop = function () {
            Browser.setIcon("ressources/images/icon48_grey.png");
            return ProxyManager.clearProxy();
        };

        return Runtime;
    })(this);

    exports.Runtime = new Runtime()

}).call(this);
