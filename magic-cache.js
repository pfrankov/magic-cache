"use strict";

(function (root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else if (typeof define === "function" && define.amd) {
		define([], factory);
	} else {
		root.MagicCache = factory();
	}
})(this, function () {
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
		var subscriptionPromise;

		var controllerPromise;

		if ("Promise" in window) {
			controllerPromise = new Promise(function(resolve) {
				var interval = setInterval(function() {
					if (navigator.serviceWorker.controller) {
						clearInterval(interval);
						resolve();
					}
				}, 50);
			});
		}

		/**
		 * @methodOf MagicCache
		 * @param {object=} options
		 * @param {string} options.url 					relative url to `sw.js`
		 * @param {boolean=false} options.forceReload	reload the page if the registration of ServiceWorker was failed 	
		 */
		this.init = function(options) {
			if (alreadyInitialized) {
				return;
			}
			alreadyInitialized = true;

			options = options || {};
			
			if ("serviceWorker" in navigator) {
				navigator.serviceWorker.addEventListener("message", function(event) {
					if (event.data && event.data.type && event.data.type === "magic-cache") {
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

				if (navigator.serviceWorker.controller) {
					subscriptionPromise = navigator.serviceWorker.ready
						.then(function(registration) {
							return registration.pushManager.getSubscription();
						});
				}else {
					subscriptionPromise = navigator.serviceWorker.register(options.url || "/sw.js")
						.then(function(registration) {
							return registration.pushManager.getSubscription()
								.then(function(subscription) {
									if (subscription) {
										return subscription;
									}

									return registration.pushManager.subscribe({userVisibleOnly: true});
								});
						})
						.catch(function(rejection) {
							if (options.forceReload) {
								location.reload();
							}

							return Promise.reject(rejection);
						});
				}

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
		 * Add `request` to the cache
		 * 
		 * @param {string[]|Request[]|string|Request} request
		 */
		this.add = function(request) {
			if ("serviceWorker" in navigator) {
				var cachingList = [];

				if (typeof request === "string" || (request === Object(request) && "url" in request)) {
					cachingList = [request];
				}else if (request instanceof Array) {
					cachingList = request;
				}

				if (controllerPromise) {
					controllerPromise.then(function() {
						navigator.serviceWorker.controller.postMessage({
							"type": "magic-cache",
							"add": JSON.stringify(cachingList)
						});
					});
				}
			}
		};

		/**
		 * Remove `request` from the cache
		 * 
		 * @param {string[]|Request[]|string|Request} request
		 */
		this.remove = function(request) {
			if ("serviceWorker" in navigator) {
				var removingList = [];

				if (typeof request === "string" || (request === Object(request) && "url" in request)) {
					removingList = [request];
				} else if (request instanceof Array) {
					removingList = request;
				}

				if (controllerPromise) {
					controllerPromise.then(function() {
						navigator.serviceWorker.controller.postMessage({
							"type": "magic-cache",
							"remove": JSON.stringify(removingList)
						});
					});
				}
			}
		};

		/**
		 * @type {boolean}
		 */
		this.isCached = false;
	};

	return new MagicCache;
});