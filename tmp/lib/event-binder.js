(function () {
    var Browser, EventBinder, PackageManager, Runtime, Storage, MessageManager, Status;

    Browser = require('./browser').Browser;

    PackageManager = require('./package-manager').PackageManager;

    Storage = require('./storage').Storage;

    Runtime = require('./runtime').Runtime;

    Status = require('./status').Status;

    MessageManager = require('./message-manager').MessageManager;



    EventBinder = (function () {
        function EventBinder() {
            this.port = null;
        }

        EventBinder.prototype.init = function () {
            Browser = require('./browser').Browser;
            PackageManager = require('./package-manager').PackageManager;
            MessageManager = require('./message-manager').MessageManager;
            Storage = require('./storage').Storage;
            Runtime = require('./runtime').Runtime;
            Status = require('./status').Status;
            require("sdk/page-mod").PageMod({
                include: /.*proxmate\.me.*/,
                attachTo: ["existing", "top"],
                contentScriptWhen: "ready",
                contentScriptFile: [
                    require('sdk/self').data.url("bower_components/jquery/dist/jquery.js"),
                    require('sdk/self').data.url('bower_components/angular/angular.js'),
                    require('sdk/self').data.url('bower_components/angular-route/angular-route.js'),
                    require('sdk/self').data.url('bower_components/moment/dist/moment.js'),
                    require('sdk/self').data.url('src/page-worker/services/detect.js'),
                    require('sdk/self').data.url("src/page-worker/proxmate.js")],
                onAttach: (function (_this) {
                    return function (worker) {
                        return _this.handlePort(worker.port);
                    };
                })(this)
            });

            require("sdk/page-mod").PageMod({
                include: /resource\:\/\/jid1-qphd8urtzwjc2a-at-jetpack\/proxmate\/data\/pages\/install\/index.html.*/,
                contentScriptFile: [
                    require('sdk/self').data.url('bower_components/jquery/dist/jquery.js'),
                    require('sdk/self').data.url('bower_components/angular/angular.js'),
                    require('sdk/self').data.url('bower_components/angular-route/angular-route.js'),
                    require('sdk/self').data.url('src/pages/install.js'),
                    require('sdk/self').data.url('src/pages/services/chrome.js')],
                onAttach: (function (_this) {
                    return function (worker) {
                        return _this.handlePort(worker.port);
                    };
                })(this)
            });
            return require("sdk/page-mod").PageMod({
                include: /.*/,
                contentScriptFile: [
                    require('sdk/self').data.url('bower_components/jquery/dist/jquery.js'),
                    require('sdk/self').data.url('src/page-worker/services/proxmate.js'),
                    require('sdk/self').data.url('src/page-worker/proxmatecs.js')],
                onAttach: (function (_this) {
                    return function (worker) {
                        return _this.handlePort(worker.port);
                    };
                })(this)
            });
        };

        EventBinder.prototype.handlePort = function (port) {
            port.on('installPackage', function (payload) {
                return PackageManager.installPackage(payload.packageId, function (response) {
                    return port.emit(payload.eventId, response);
                });
            });
            port.on('getProxmateGlobalStatus', function (payload) {
                var status;
                Storage = require('./storage').Storage;
                console.info('---> in proxmate global status');
                status = Storage.get('proxmate_global_status');
                if (status) {
                    return port.emit(payload.eventId, status);
                } else {
                    return port.emit(payload.eventId, false);
                }
            });
            port.on('setProxmateGlobalStatus', function (payload) {
                var newStatus;
                newStatus = payload.newStatus;
                if (typeof newStatus !== 'boolean') {
                    newStatus = false;
                }
                Storage.set('proxmate_global_status', newStatus);
                if (newStatus) {
                    Runtime.start();
                } else {
                    Runtime.stop();
                }
                return port.emit(payload.eventId, true);
            });
            port.on('getInstalledPackages', function (payload) {
                var packages;
                packages = PackageManager.getInstalledPackages();
                console.info('Installed packages before giving back to port');
                return port.emit(payload.eventId, packages);
            });
            port.on('removePackage', function (payload) {
                var packageId;
                packageId = payload.packageId;
                PackageManager.removePackage(packageId);
                return port.emit(payload.eventId, true);
            });
            port.on('requestActivation', function (payload) {
                Runtime.requestActivation(payload.email, function (response) {
                    return port.emit(payload.eventId, response);
                });
            });
            port.on('activatePlugin', function (payload) {
                Runtime.activatePlugin(payload.activation_code, function (response) {
                    return port.emit(payload.eventId, response);
                });
            });
            port.on('checkInstall', function (payload) {
                return port.emit(payload.eventId, {is_installed: true});
            });
            port.on('getApiKey', function (payload) {
                return port.emit(payload.eventId, {key: Storage.get('api_key')});
            });
            port.on('getStatus', function (payload) {
                return port.emit(payload.eventId, {status: Storage.get('subscription_status')});
            });
            port.on('updateStatus', function (payload) {
                Status.update(function (response) {
                    response.api_key = Storage.get('api_key');
                    return port.emit(payload.eventId, response);
                });
            });
            port.on('getDonationkey', function (payload) {
                var key;
                key = Storage.get('donation_key');
                return port.emit(payload.eventId, key);
            });
            port.on('setDonationkey', function (payload) {
                var key;
                key = payload.donationKey;
                if (key != null) {
                    Storage.set('donation_key', key);
                } else {
                    Storage.remove('donation_key');
                }
                Runtime = require('./runtime').Runtime;
                Runtime.restart();
                return port.emit(payload.eventId, true);
            });
            port.on('getUrlFor', function (payload) {
                console.info("requesting url for " + payload.url);
                return port.emit(payload.eventId, require('sdk/self').data.url(payload.url));
            });
            port.on("showMessages", function (payload) {
                msg = MessageManager.show()
                return port.emit(payload.eventId, msg)
            });
            port.on("checkForUpdates", function (payload) {
                PackageManager.checkForUpdates();
                return port.emit(payload.eventId, true)
            });
            port.on("getNetflixCountries", function (payload) {
                return port.emit(payload.eventId, PackageManager.getNetflixCountries())
            });
            port.on("selectNetflixCountry", function (payload) {
                PackageManager.selectNetflixCountry(payload.country, function (response) {
                    return port.emit(payload.eventId, response)
                })
            });
            port.on("closeMessage", function (payload) {
                var msg = MessageManager.closeMessage(payload.id);
                return port.emit(payload.eventId, msg)
            });
            port.on("restartProxmate", function (payload) {
                return Runtime.restart(function () {
                    var tabs = require("sdk/tabs");

                    if (tabs.activeTab.url.indexOf('netflix.com') == -1) {
                        Browser.createTab('http://netflix.com/')
                    } else {
                        tabs.activeTab.reload()
                    }
                })
            });
            port.on('openUrl', (function (_this) {
                return function (payload) {
                    return require("sdk/tabs").open(payload.url);
                };
            })(this));
            return port.on('xhr', (function (_this) {
                return function (payload) {
                    console.info('doing xhr request...');
                    console.info("url: " + payload.url);
                    return Browser.xhr(payload.url, function (data) {
                        console.info('xhr success');
                        console.info(data);
                        return port.emit(payload.eventId, data);
                    }, function (data) {
                        console.info('failure');
                        console.info(data);
                        return port.emit(payload.eventId, data);
                    });
                };
            })(this));
        };

        return EventBinder;

    })();

    exports.EventBinder = new EventBinder();

}).call(this);
