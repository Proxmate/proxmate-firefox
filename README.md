# Proxmate

Website: https://web.proxmate.me

## Overview

Proxmate is a browser plug-in service using web proxy technology to allow users to easily access certain web content that would normally not be accessible for them due to geo blocking of IPs.


## Product components

* Chrome (and Opera) plugin: https://github.com/SecureSoftwareVenture/proxmate-chrome
* Firefox plugin: https://github.com/SecureSoftwareVenture/proxmate-firefox
* Backend: https://github.com/SecureSoftwareVenture/proxmate-backend

### Chrome

This is the plugin that installs as add-on in Chrome browsers.

### Firefox

This is the plugin that installs as add-on in Firefox browsers.

### Backend

This is the software that is used by the Chrome plugin in order to make Proxmate operational.


## Building

ProxMate is using grunt for building. To build a dist file (completely minified through googles clojurecompiler, cssmin and htmlmin) run `grunt build-live` or `grunt build-beta`.

Run `cfx run` inside the resulting folder to load the extension into firefox. 
