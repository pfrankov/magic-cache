(function (root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory;
	} else {
		factory();
	}
})(this, function () {
	var CACHE_KEY = "magic-cache";

	var isCachedOld;

	/**
	 * @param {boolean} isCached
	 */
	function setCachedStatus(isCached) {
		if (isCached === isCachedOld) { // Emit event only on changes
			return;
		}

		isCachedOld = isCached;

		self.clients.matchAll()
			.then(function(clientList) {
				clientList.forEach(function(client) {
					client.postMessage({
						type: "magic-cache",
						isCached: isCached
					});
				});
			});
	}

	self.addEventListener("fetch", function(event) {
		if (event.request.method === "GET") {
			var requestClone = event.request.clone();

			event.respondWith(
				fetch(event.request)
					.then(function(response) {
						if (response.status === 200) {
							var responseClone = response.clone();

							setCachedStatus(false);

							caches.open(CACHE_KEY)
								.then(function(cache) {
									cache.put(requestClone, responseClone);
								});
						}

						return response;
					})
					.catch(function() {
						return caches.match(event.request)
							.then(function(response) {
								setCachedStatus(true);

								return response;
							});
					})
			);
		}
	});


	self.addEventListener("message", function(event) {
		if (event.data && event.data.type === "magic-cache") {

			////////////
			/// ADD ////
			////////////
			var adding = [];

			try {
				adding = JSON.parse(event.data.add);
			}catch(e){}

			if (adding && adding instanceof Array) {
				caches.open(CACHE_KEY)
					.then(function(cache) {
						var addingRequests = adding.map(function(el) {
							if (el === Object(el) && "url" in el) {
								return new Request(el.url, el);
							}

							return el;
						});

						cache.addAll(addingRequests);
					});
			}

			///////////////
			/// REMOVE ////
			///////////////
			var removing = [];
			try {
				removing = JSON.parse(event.data.remove);
			}catch(e){}

			if (removing && removing instanceof Array) {
				caches.open(CACHE_KEY)
					.then(function(cache) {
						removing.forEach(function(remove) {
							if (remove === Object(remove) && "url" in remove) {
								remove = new Request(remove.url, remove);
							}

							cache.matchAll(remove)
								.then(function(matched) {
									matched.forEach(function(key) {
										cache.delete(key.url);
									});
								});
						});
					});
			}
		}
	});

	self.addEventListener("activate", function(event) {
		// Destroy the cache
		event.waitUntil(caches.delete(CACHE_KEY));
		event.waitUntil(self.clients.claim());
	});
});