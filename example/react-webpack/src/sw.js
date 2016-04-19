if (typeof module === "object" && module.exports) { // CommonJS
	require("magic-cache").MagicCacheSW();
} else {
	importScripts("magic-cache-sw.js");
}
