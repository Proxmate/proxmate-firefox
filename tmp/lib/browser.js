(function () {
    var Storage, EventBinder, Config, Browser;
    EventBinder = require('./event-binder').EventBinder;
    Config = require('./config').Config;
    Storage = require('./storage').Storage;
    Browser = (function () {
        function Browser() {
            this.statusButton = null;
            this.panel = null;
        }

        Browser.prototype.init = function () {
            Config = require("./config").Config;
            Storage = require("./storage").Storage;
            return EventBinder = require("./event-binder"), EventBinder = EventBinder.EventBinder, EventBinder
        };

        /**
         * Generates the button and the popup window
         */

        Browser.prototype.generateButtons = function () {
            var toggleButton, panel, __self = this;
            if (null != this.statusButton && null != this.panel) {
                return false;
            }
            require("sdk/ui");
            toggleButton = require("sdk/ui/button/toggle").ToggleButton;
            panel = require("sdk/panel");
            require("sdk/self");
            null != this.statusButton && this.statusButton.destroy();
            null != this.panel && this.panel.destroy();
            this.statusButton = toggleButton({
                id: "my-button", label: "my button",
                icon: {
                    16: require("sdk/self").data.url("ressources/images/icon16.png"),
                    24: require("sdk/self").data.url("ressources/images/icon24.png"),
                    48: require("sdk/self").data.url("ressources/images/icon48.png")
                }, onChange: function (toggleButton) {
                    return function (panel) {
                        if (toggleButton.panel) {
                            key = Storage.get('api_key');
                            if (!key) {
                                __self.createTab('pages/install/index.html');
                                toggleButton.statusButton.state("window", {checked: false});
                                return;
                            }
                            if (panel.checked) {
                                return toggleButton.panel.show(
                                    {
                                        position: toggleButton.statusButton
                                    }).postMessage({reload: true});
                            }
                        }
                    }
                }(this)
            });
            this.panel = panel.Panel({
                contentURL: require("sdk/self").data.url("pages/popup/index.html"),
                contentScriptFile: [
                    require("sdk/self").data.url("bower_components/jquery/dist/jquery.js"),
                    require("sdk/self").data.url("bower_components/jquery/dist/jquery.mCustomScrollbar.concat.min.js"),
                    require("sdk/self").data.url("bower_components/angular/angular.js"),
                    require("sdk/self").data.url("bower_components/bootstrap/bootstrap.min.js"),
                    require("sdk/self").data.url("src/pages/services/chrome.js"),
                    require("sdk/self").data.url("src/pages/popup.js")
                ],
                width: 352,
                height: 523,
                onHide: function () {
                    return __self.statusButton.state("window", {checked: false})
                },
                onShow: function (toggleButton) {
                    return function () {
                        return //toggleButton.statusButton.state("window", {checked: !1})
                    }
                }(this)
            });
            return EventBinder.handlePort(this.panel.port)
        };

        /**
         * NEEDS Implementation
         * Sets the popup window of the extension
         * @param {String} url  url of the popup
         */

        Browser.prototype.setPopup = function (url) {
            //console.info('///// to be done')
        };

        /**
         * Sets browser wide proxy to autoconfig
         * @param {String}   pacScript the autoconfig string
         * @param {Function} callback  callback to execute after
         */

        Browser.prototype.setProxyAutoconfig = function (pacScript, callback) {
            var pac;
            if (callback == null) {
                callback = function () {
                };
            }
            pac = "data:text/javascript," + pacScript;
            require("sdk/preferences/service").set("network.proxy.type", 2);
            require("sdk/preferences/service").set("network.proxy.autoconfig_url", pac);
            return callback();
        };

        /**
         * Sets the uninstall url
         * @param  {string} url url of the page where user should be send
         * @param  {Function} callback callback not yet implemented
         */

        Browser.prototype.setUninstallURL = function (url, callback) {
            Storage.set('uninstall_url', url)
        };

        /**
         * This is run when Proxmate is uninstalled
         */

        Browser.prototype.uninstallScript = function () {
            var storage, url;

            url = Storage.get('uninstall_url');
            this.clearStorage()
            require("sdk/tabs").open({
                url: url,
                inNewWindow: true
            });
        };

        /**
         * Removes all custom proxies and resets to system
         * @param  {Function} callback callback
         */

        Browser.prototype.clearProxy = function (callback) {
            if (callback == null) {
                callback = function () {
                };
            }
            require("sdk/preferences/service").reset("network.proxy.type");
            require("sdk/preferences/service").reset("network.proxy.http");
            require("sdk/preferences/service").reset("network.proxy.http_port");
            return callback();
        };


        /**
         * Sets the browser icon
         * @param {string} iconUrl the url for the icon
         */

        Browser.prototype.setIcon = function (iconUrl) {
            return this.statusButton.icon = {
                "16": require('sdk/self').data.url(iconUrl),
                "24": require('sdk/self').data.url(iconUrl),
                "48": require('sdk/self').data.url(iconUrl)
            };
        };


        /**
         * Sets the text for the icon
         * @param {string} text the text to set
         */

         Browser.prototype.setIcontext = function (text) {
             return this.statusButton.badge = text;
         };

        /**
         * Gets the text for the icon
         */

        Browser.prototype.getIcontext = function () {
            return this.statusButton.badge;
        };

        /**
         * Clears the browser storage
         */

        Browser.prototype.clearStorage = function () {
            var key;
            Storage.flush();
            for (key in require("sdk/simple-storage").storage) {
                delete require("sdk/simple-storage").storage[key]
            }
        };
        /**
         * Removes a key from the browser storage
         * @param  {string} key the key to remove
         */

        Browser.prototype.removeFromStorage = function (key) {
            return delete require("sdk/simple-storage").storage[key];
        };


        /**
         * Writes a object into browser storage
         * @param  {Object} object the object (key, value) to write
         */

        Browser.prototype.writeIntoStorage = function (object) {
            var key, ss, _results;
            ss = require("sdk/simple-storage").storage;
            _results = [];
            for (key in object) {
                _results.push(ss[key] = object[key]);
            }
            return _results;
        };


        /**
         * Returns a element from storage
         * @param  {string}   key      the elements key
         * @param  {Function} callback callback
         */

        Browser.prototype.retrieveFromStorage = function (key, callback) {
            if (key === null) {
                console.info("~~~~~~~> Returning all keys");
                return callback(require("sdk/simple-storage").storage);
            } else {
                return callback(require("sdk/simple-storage").storage[key]);
            }
        };


        /**
         * Add a event listener for the message event
         * @param  {function} listener listener function
         */

        Browser.prototype.addEventListener = function (listener) {
        };

        /**
         * Opens a tab in a new window
         * @param  {string} url url of tab to open
         */

        Browser.prototype.createTab = function (url) {
            return require("sdk/tabs").open(url)
        };

        /**
         * Performs a xmlhttprequest
         * This will be removed
         * @param  {string} url             the url to request
         * @param  {Function} callback   callback with the result
         */

        Browser.prototype.xhr = function (url, callback) {
            return require("sdk/request").Request({
                url: url, onComplete: function (result) {
                    result = JSON.parse(result.text);
                    return callback(result)
                }
            }).get()
        };

        /**
         * Performs a GET xmlhttprequest
         * @param  {string} url             the url to request
         * @param  {Function} callback   callback
         */

        Browser.prototype.GET = function (url, callback) {
            return require("sdk/request").Request({
                url: url,
                onComplete: function (response) {
                    if (200 === response.status) {
                        return callback(JSON.parse(response.text));
                    }
                    else {
                        response.responseJSON = JSON.parse(response.text);
                        return callback(response)
                    }
                }
            }).get()
        };

        /**
         * Performs a POST xmlhttprequest
         * @param  {string} url             the url to request
         * @param  {object} data        data for the POST request
         * @param  {Function} callback   callback
         */

        Browser.prototype.POST = function (url, data, callback) {
            return require("sdk/request").Request({
                url: url,
                content: data,
                onComplete: function (response) {
                    if (200 === response.status) {
                        return callback(JSON.parse(response.text));
                    }
                    else {
                        response.responseJSON = JSON.parse(response.text);
                        return callback(response)
                    }
                }
            }).post()
        };

        /**
         * wrapper for setTimeout function
         * @param {Function} callback [description]
         * @param {int}   ms       number
         */

        Browser.prototype.setTimeout = function (callback, ms) {
            return require('sdk/timers').setTimeout(callback, ms);
        };


        /**
         * Wrapper for clearInterval function
         * @param  {Object} timeoutId timeout
         */

        Browser.prototype.clearTimeout = function (timeoutId) {
            return require('sdk/timers').clearTimeout(timeoutId);
        };

        return Browser;

    })();

    exports.Browser = new Browser();

}).call(this);
