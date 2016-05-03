# Magic Cache
[![npm version](https://badge.fury.io/js/magic-cache.svg)](https://www.npmjs.com/package/magic-cache)

Tiny lib with _zero_ dependencies that can handle all `GET` requests, store them in Browser's Cache and return them back in case of connection issues (Offline, DNS Errors).  
It's so simple to make your site available in offline as never before.  
With the Magic Cache you can even preload important resources in any time.

<img src="https://cloud.githubusercontent.com/assets/584632/14590104/aadf0a6a-0514-11e6-9b22-ad9a144e9731.gif"/>

[The DEMO](https://rawgit.com/pfrankov/magic-cache/master/examples/example.html)

## Limitations
Cache API is available over _HTTPS_ only. Time to switch to _HTTPS_!  
Chrome 40+ / Firefox 44+ / Opera 24+ / Chrome for Android 49+

## Installation

```bash
npm install --save magic-cache
# or
git clone https://github.com/pfrankov/magic-cache
```

_Check the [examples/react-webpack](https://github.com/pfrankov/magic-cache/tree/master/examples/react-webpack) example if you are using the Webpack_

```
// ES6
import {MagicCache} from "magic-cache";

// CommonJS
var MagicCache = require("magic-cache").MagicCache;

// Including via `script` tag
<script src="magic-cache.js"></script>
```
Then just copy `sw.js` and `magic-cache-sw.js` to the _root directory_ (*important*) of your site.  
Almost done. Now we need only one line of initializing code.  

## Usage

#### `init(options)`

Initializer. MagicCache will not work without it.  
Can be executed only once.    

|Option|Type|Default Value|Description|
|---|---|---|---|
|`url`|string|"./sw.js"|   |
|`forceReload`|boolean|false|Reload page if the registration of the ServiceWorker was failed (usually it happens at the first start)|

```js
MagicCache.init();

// is the same as

MagicCache.init({
    url: "/sw.js"
});
```

### Methods

#### `onCached(callback)`

Subscribe to an event when any request has gotten from the **cache**.
Additionally executed after `init` method if the current status is _Cached_.

```js
var cancelHandler = MagicCache.onCached(function(){
   console.log("Looks like you offline, but don't worry -- you are still geting cached pages"); 
});

// cancelHandler(); to obviously cancel the handler
```

#### `onOnline(callback)`

Subscribe to an event when any request has received from **server**.
Additionally executed after `init` method if the current status is _Online_.

```js
var cancelHandler = MagicCache.onOnline(function(){
   console.log("Online"); 
});

// cancelHandler(); to obviously cancel the handler 
```

#### `add(request)`

`request: String, Object, Array of mixed Strings or Objects`

**Load** and add the `request` resources to the offline cache. Useful for an important resources or on initialization step.  
If passed an Object -- `url` field is mandatory. The other fields is the same as in [the Request docs](https://developer.mozilla.org/en-US/docs/Web/API/Request).

```js
MagicCache.add(["/some-important-resource.html", {url: "/important-request/"}]);

MagicCache.add("/some-important-resource.jpg");
```

#### `remove(request)`

`request: String, Object, Array of mixed Strings or Objects`

The opposite of `add` method. Remove the `request` resources from the cache. Don't know why you might want that. Maybe after logout?   

```js
MagicCache.remove(["/some-important-resource.html", {url: "/important-request/"}]);

MagicCache.remove("/some-important-resource.jpg");
```

### Properties

#### `isCached`

`Boolean`. Helps to understand what's going on in this particular moment.

```js
if (MagicCache.isCached) {
    alert("Oh, no!");
}
```