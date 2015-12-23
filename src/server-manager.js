(function () {
    var Browser, Config, ServerManager, Storage;

    Storage = require('./storage').Storage;

    Config = require('./config').Config;

    Browser = require('./browser').Browser;

    ServerManager = (function () {
        function ServerManager() {
            this.servers = [];
        }

        ServerManager.prototype.init = function (callback) {
            Storage = require('./storage').Storage;
            Config = require('./config').Config;
            Browser = require('./browser').Browser;
            this.servers = this.loadServersFromStorage();
            if (this.servers.length > 0) {
                this.fetchServerList(function () {
                });
                return callback();
            } else {
                return this.fetchServerList(callback);
            }
        };


        /**
         * Load servers from storage into array
         */

        ServerManager.prototype.loadServersFromStorage = function () {
            var tmpServers;
            tmpServers = Storage.get('server_config');
            if (!tmpServers) {
                tmpServers = [];
            }
            this.servers = tmpServers;
            return this.servers;
        };


        /**
         * Fetch a fresh server list from storage
         * @param  {Function} callback Callback
         */

        ServerManager.prototype.fetchServerList = function (callback) {
            var api_key, server, serverUrl;
            server = Config.get('primary_server');
            api_key = Storage.get('api_key');
            serverUrl = "" + server + "api/server/list/" + api_key + "/?api_v=" + require("sdk/self").version;


            if (!api_key) {
                return callback()
            }


            return Browser.GET(serverUrl, (function (_this) {
                return function (data) {
                    _this.servers = data;
                    Storage.set('server_config', _this.servers);
                    return callback();
                };
            })(this));
        };


        /**
         * Return all servers
         * @return {Object} all servers
         */

        ServerManager.prototype.getServers = function () {
            return this.servers;
        };

        return ServerManager;

    })();

    exports.ServerManager = new ServerManager();

}).call(this);
