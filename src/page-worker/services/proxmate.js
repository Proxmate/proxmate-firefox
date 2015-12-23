(function () {
    'use strict';
    var ProxMate;

    ProxMate = (function () {
        function ProxMate() {
        }

        ProxMate.prototype.emitMessage = function (messageId, parameter, callback) {
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

        ProxMate.prototype.installPackage = function (packageId, callback) {
            return this.emitMessage('installPackage', {
                packageId: packageId
            }, callback);
        };

        ProxMate.prototype.getProxmateStatus = function (callback) {
            return this.emitMessage('getProxmateGlobalStatus', {}, callback);
        };

        ProxMate.prototype.setProxmateStatus = function (status, callback) {
            return this.emitMessage('setProxmateGlobalStatus', {
                newStatus: status
            }, callback);
        };

        ProxMate.prototype.dailyActiveCheck = function (callback) {
            return this.emitMessage("dailyActiveCheck", {}, callback)
        };

        ProxMate.prototype.dailyChannelCheck = function (callback) {
            return this.emitMessage("dailyChannelCheck", {}, callback)
        };

        ProxMate.prototype.getInstalledPackages = function (callback) {
            return this.emitMessage('getInstalledPackages', {}, callback);
        };

        ProxMate.prototype.removePackage = function (packageId, callback) {
            return this.emitMessage('removePackage', {
                packageId: packageId
            }, callback);
        };

        ProxMate.prototype.getDonationkey = function (callback) {
            return this.emitMessage('getDonationkey', {}, callback);
        };

        ProxMate.prototype.setDonationkey = function (key, callback) {
            return this.emitMessage('setDonationkey', {
                donationKey: key
            }, callback);
        };

        return ProxMate;

    })();

    window.ProxMate = new ProxMate();

}).call(this);
