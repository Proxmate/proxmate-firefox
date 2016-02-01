(function () {
    var App, Browser, Config, EventBinder, PackageManager, ProxyManager, Runtime, ServerManager, Storage, app, Status, MessageManager;

    Config = require('./config').Config;

    PackageManager = require('./package-manager').PackageManager;

    Storage = require('./storage').Storage;

    ProxyManager = require('./proxy-manager').ProxyManager;

    ServerManager = require('./server-manager').ServerManager;

    EventBinder = require('./event-binder').EventBinder;

    Runtime = require('./runtime').Runtime;

    Browser = require('./browser').Browser;

    Status = require('./status').Status;

    MessageManager = require('./message-manager').MessageManager;

    App = (function () {
        function App() {
        }

        exports.onUnload = function (reason) {
            if (reason == "disable" || reason == "uninstall") {
                Browser.uninstallScript()
            }
        };

        exports.main = function (options) {
            if (options.loadReason == 'install') {
                Storage.set('is_install', true);
                Storage.set('ran_install', '');
                delete require("sdk/simple-storage").storage['api_key']
            }
        };

        App.prototype.init = function () {
            Browser.init();
            Config.init({
                'primary_server': 'https://web.proxmate.me/'
            });
            return Storage.init(function () {
                return ServerManager.init(function () {
                    PackageManager.init();
                    ProxyManager.init();
                    EventBinder.init();
                    MessageManager.init();
                    Status.init();
                    Runtime.init();
                    Runtime.start();
                    return console.info('-----------> muh');
                });
            });
        };

        return App;

    })();

    app = new App();

    Browser.setTimeout(function () {
        app = new App();
        app.init();
    }, 500)
    //app.init();

}).call(this);
