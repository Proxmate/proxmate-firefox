//
// Need to know if the plugin is installed
//

var elt = document.createElement("script");
elt.textContent = "window._pluginID = '" + Math.random() + "'";
document.head.appendChild(elt);