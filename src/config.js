(function () {
    var Config;

    Config = (function () {
        function Config() {
            this.config = {};
        }

        Config.prototype.init = function (configObj) {
            return this.config = configObj;
        };


        /**
         * Return config content for key 'key'
         * @param  {String} key the key
         * @return {Mixed}     Whatever is written in the config
         */

        Config.prototype.get = function (key) {
            return this.config[key];
        };

        return Config;

    })();

    exports.Config = new Config();

}).call(this);
