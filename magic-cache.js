"use strict";

(function (root, factory) {
	if (typeof module === 'object' && module.exports) {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else {
		root.MagicCache = factory();
	}
}(this, function () {
	/**
	 * @constructor
	 */
	var MagicCache = function() {
		var _instance = this;
		var onCachedListeners = [];
		var onOnlineListeners = [];
		

		/**
		 * @param {Array} array
		 * @param {boolean} isCachedHandler
		 * @returns {function}
		 */
		function generateEventHandler(array, isCachedHandler) {
			return function(callback) {
				array.push(callback);

				if (_instance.isCached === isCachedHandler) {
					callback();
				}

				return function() {
					var index = array.indexOf(callback);
					if (index >= 0) {
						array.splice(index, 1);
						return true;
					}else {
						return false;
					}
				}
			}
		}


		var alreadyInitialized = false;
		
		/**
		 * @methodOf MagicCache
		 * @param {object=} options
		 * @param {string} options.url 	relative url to `magic-cache-service-worker.js`
		 */
		this.init = function(options) {
			if (alreadyInitialized) {
				return;
			}
			alreadyInitialized = true;
			
			if ("serviceWorker" in navigator) {
				navigator.serviceWorker.addEventListener("message", function(event) {
					if (event.data && event.data.type) {
						if (event.data.isCached) {
							onCachedListeners.forEach(function(listener) {
								listener();
							});
						}else {
							onOnlineListeners.forEach(function(listener) {
								listener();
							});
						}

						_instance.isCached = event.data.isCached;
					}
				});

				navigator.serviceWorker.register(options.url || "/magic-cache-service-worker.js", {scope: "./"})
					.then(function(registration) {
						return registration.pushManager.getSubscription()
							.then(function(subscription) {
								if (subscription) {
									return subscription;
								}

								return registration.pushManager.subscribe({userVisibleOnly: true});
							});
					});
			}
		};


		/**
		 * Executed immediately
		 *
		 * @methodOf MagicCache
		 * @param {function} callback
		 * @returns {function} dispose
		 */
		this.onCached = generateEventHandler(onCachedListeners, true);

		/**
		 * Executed immediately
		 *
		 * @methodOf MagicCache
		 * @param {function} callback
		 * @returns {function} dispose
		 */
		this.onOnline = generateEventHandler(onOnlineListeners, false);

		/**
		 * @type {boolean}
		 */
		this.isCached = false;
	};

	return new MagicCache;
}));