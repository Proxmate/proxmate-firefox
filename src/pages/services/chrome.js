(function () {
    'use strict';
    angular.module('chrome', []).factory('Chrome', function () {
        var emitMessage;
        emitMessage = function (messageId, parameter, callback) {
            var eventId, portVar;
            portVar = {};
            if (typeof addon !== "undefined" && addon !== null) {
                console.info("addon.port exists");
                portVar.port = addon.port;
            }
            if (self.port != null) {
                console.info('self.port is defined');
                portVar.port = self.port;
            }
            console.info("Triggering event: " + messageId);
            eventId = ("event-" + (new Date().getTime())) + Math.random().toString(36).substring(7);
            portVar.port.on(eventId, callback);
            parameter.eventId = eventId;
            return portVar.port.emit(messageId, parameter);
        };
        return {
            installPackage: function (packageId, callback) {
                return emitMessage('installPackage', {
                    packageId: packageId
                }, callback);
            },
            getProxmateStatus: function (callback) {
                return emitMessage('getProxmateGlobalStatus', {}, callback);
            },
            setProxmateStatus: function (status, callback) {
                return emitMessage('setProxmateGlobalStatus', {
                    newStatus: status
                }, callback);
            },
            getInstalledPackages: function (callback) {
                return emitMessage('getInstalledPackages', {}, callback);
            },
            removePackage: function (packageId, callback) {
                return emitMessage('removePackage', {
                    packageId: packageId
                }, callback);
            },
            getDonationkey: function (callback) {
                return emitMessage('getDonationkey', {}, callback);
            },
            setDonationkey: function (key, callback) {
                return emitMessage('setDonationkey', {
                    donationKey: key
                }, callback);
            },
            getUrlFor: function (ressource, callback) {
                return emitMessage('getUrlFor', {
                    url: ressource
                }, callback);
            },
            openUrl: function (url, callback) {
                return emitMessage('openUrl', {
                    url: url
                }, callback);
            },
            xhr: function (url, callback) {
                return emitMessage('xhr', {
                    url: url
                }, callback);
            },
            requestActivation: function (email, callback) {
                return emitMessage('requestActivation', {
                    email: email
                }, callback);
            },
            checkForUpdates: function (email, callback) {
                return emitMessage('checkForUpdates', {
                    email: email
                }, callback);
            },
            getNetflixCountries: function (callback) {
                return emitMessage('getNetflixCountries', {}, callback);
            },
            selectNetflixCountry: function (country, callback) {
                return emitMessage('selectNetflixCountry', {
                    country: country
                }, callback);
            },
            updateStatus: function (callback) {
                return emitMessage('updateStatus', {}, callback);
            },
            getStatus: function (callback) {
                return emitMessage('getStatus', {}, callback);
            },
            showMessages: function (callback) {
                return emitMessage('showMessages', {}, callback);
            },
            closeMessage: function (id, callback) {
                return emitMessage('closeMessage', {
                    id: id
                }, callback);
            },
            restartProxmate: function (id, callback) {
                return emitMessage('restartProxmate', {}, callback);
            }
        };
    });

}).call(this);
