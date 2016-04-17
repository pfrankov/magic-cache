(function() {
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

	self.addEventListener("activate", function(event) {
		// Destroy the cache
		event.waitUntil(caches.delete(CACHE_KEY));
		event.waitUntil(self.clients.claim());
	});
})();