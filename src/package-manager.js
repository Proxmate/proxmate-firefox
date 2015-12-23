(function () {
    var Browser, Config, PackageManager, Storage;
    Storage = require("./storage").Storage;
    Config = require("./config").Config;
    Browser = require("./browser").Browser;
    PackageManager = (function () {
        function PackageManager() {
        }

        PackageManager.prototype.init = function () {
            Storage = require('./storage').Storage;
            Config = require('./config').Config;
            Browser = require('./browser').Browser;
            return this.checkForUpdates();
        };


        /**
         * Downloads a list containing of ID and version
         * @param  {Function} callback callback to pass json on
         */

        PackageManager.prototype.downloadVersionRepository = function (callback) {
            var api_key, server, updateUrl;
            api_key = Storage.get('api_key');
            server = Config.get('primary_server');
            updateUrl = "" + server + "api/package/update/" + api_key + "/";
            if (!api_key) {
                //installedPackages = Storage.set('proxmate_installed_packages', {});
                return callback()
            }
            return Browser.GET(
                updateUrl,
                function (data) {
                    return callback(data)
                })
        };


        /**
         * Queries the primary server and checks for updates
         */

        PackageManager.prototype.checkForUpdates = function () {
            return this.downloadVersionRepository((function (_this) {
                return function (versionRepository) {
                    var installedPackages, key, _requireRestart, _results;
                    installedPackages = Storage.get('proxmate_installed_packages');
                    _results = [];
                    for (key in installedPackages) {
                        if (versionRepository && !(key in versionRepository)) {
                            _requireRestart = true;
                            _this.removePackage(key)
                        }
                    }

                    for (key in versionRepository) {
                        if (installedPackages && key in installedPackages && parseFloat(versionRepository[key].version) == parseFloat(installedPackages[key])) {
                            continue;
                        }

                        _results.push(key)
                    }

                    if (!_results.length) {
                        return _results
                    }

                    _this.installProxmate(_results, function () {
                        Runtime = require('./runtime').Runtime;
                        Runtime.restart();
                    });
                    return _results;
                };
            })(this));
        };


        PackageManager.prototype.installProxmate = function (packages, callback) {
            var api_key, packageUrl, server, _self = this;
            callback = callback || function () {
                };
            server = Config.get('primary_server');
            api_key = Storage.get('api_key');
            packageUrl = "" + server + "api/packages/install/" + api_key + "/";

            if (!api_key) {
                return callback({
                    success: false,
                    message: "plugin inactive"
                });
            }
            return Browser.POST(packageUrl, {packages: JSON.stringify(packages)}, function (packages) {
                var installedPackages;
                installedPackages = Storage.get('proxmate_installed_packages');
                if (!installedPackages) {
                    installedPackages = {};
                }

                for (var i = 0; i < packages.length; i++) {
                    _self.storePackage(packages[i])
                }

                callback()
            })
        };


        PackageManager.prototype.storePackage = function (packageData, callback) {
            var installedPackages;
            installedPackages = Storage.get('proxmate_installed_packages');
            if (!installedPackages) {
                installedPackages = {};
            }

            if (packageData.additional_countries.length && packageData.name == 'Netflix') {
                netflix_countries = Storage.get('netflix_countries');

                if (!netflix_countries || !netflix_countries.selected) {
                    netflix_countries = {
                        'selected': packageData.country,
                        'id': packageData.id
                    }
                }

                packageData.country = netflix_countries.selected;

                Storage.set('netflix_countries', netflix_countries)
            }

            installedPackages[packageData.id] = packageData['version'];
            Storage.set(packageData.id, packageData);
            Storage.set('proxmate_installed_packages', installedPackages);

            return;
        };

        /**
         * Installs / overrides package for key 'key'
         * @param  {String} key package identifier
         * @param {Function} callback callback function
         */

        PackageManager.prototype.installPackage = function (key, callback) {
            var api_key, packageUrl, server;
            callback = callback || function () {
                };
            server = Config.get('primary_server');
            api_key = Storage.get('api_key');
            packageUrl = "" + server + "api/package/install/" + key + "/" + api_key + "/";

            if (!api_key) {
                return callback({
                    success: false,
                    message: "plugin_inactive"
                });
            }
            return Browser.xhr(packageUrl, function (packageData) {
                var installedPackages;
                //installedPackages = Storage.set('proxmate_installed_packages',"");
                installedPackages = Storage.get('proxmate_installed_packages');
                if (!installedPackages) {
                    installedPackages = {};
                }


                if (packageData.additional_countries.length && packageData.name == 'Netflix') {
                    netflix_countries = Storage.get('netflix_countries');
                    if (!netflix_countries || !netflix_countries.selected) {
                        netflix_countries = {
                            'selected': packageData.country
                        }
                    }

                    packageData.country = netflix_countries.selected;

                    netflix_countries.package = packageData;
                    Storage.set('netflix_countries', netflix_countries)
                }

                installedPackages[key] = packageData['version'];
                Storage.set(key, packageData);
                Storage.set('proxmate_installed_packages', installedPackages);

                return callback({
                    success: true,
                    package: key
                });
            }, function (xhr) {
                switch (xhr.status) {
                    case 401:
                        callback({
                            success: false,
                            message: xhr.responseJSON.message
                        });
                        break;
                    case 404:
                        callback({
                            success: false,
                            message: "The package you tried to install doesn't exist..."
                        });
                        break;
                    default:
                        return callback({
                            success: false,
                            message: 'There was a problem installing this package.'
                        });
                }
            });
        };


        /**
         * Returns all installed packages with their package contents
         * @return {Object} packages
         */

        PackageManager.prototype.getInstalledPackages = function () {
            var id, installedPackages, packageJson, version;
            installedPackages = Storage.get('proxmate_installed_packages');
            packageJson = [];
            for (id in installedPackages) {
                version = installedPackages[id];
                packageJson.push(Storage.get(id));
            }
            return packageJson;
        };


        /**
         * Removes a installed package
         * @param  {String} key package id
         */

        PackageManager.prototype.removePackage = function (key) {
            var Runtime, installedPackages;
            Storage.remove(key);
            installedPackages = Storage.get('proxmate_installed_packages');
            if( !installedPackages ) {
                installedPackages = {}
            }
            delete installedPackages[key];
            return Storage.set('proxmate_installed_packages', installedPackages);
        };

        PackageManager.prototype.getNetflixCountries = function () {
            var netflix_countries;

            netflix_countries = Storage.get('netflix_countries');

            if (!netflix_countries) return false;

            netflix_countries.package = Storage.get(netflix_countries.id)
            return netflix_countries;
        };

        PackageManager.prototype.selectNetflixCountry = function (country, callback) {
            var netflix_countries, netflix_package
            console.log( country )
            netflix_countries = Storage.get('netflix_countries');
            netflix_package = Storage.get(netflix_countries.package.id);
            netflix_package.country = country.short_hand;
            netflix_countries.selected = country.short_hand;

            Storage.set('netflix_countries', netflix_countries);
            Storage.set(netflix_countries.package.id, netflix_package);

            callback(netflix_countries)
            return;
        };
        return PackageManager;

    })();

    exports.PackageManager = new PackageManager();


}).call(this);
