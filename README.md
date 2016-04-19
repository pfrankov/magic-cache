# Magic Cache

Tiny lib with _zero_ dependencies that can handle all `GET` requests, store them in Browser's Cache and return them back in case of connection issues (Offline, DNS Errors).  
It's so simple to make your site available in offline as never before.

<img src="https://cloud.githubusercontent.com/assets/584632/14590104/aadf0a6a-0514-11e6-9b22-ad9a144e9731.gif"/>

[This DEMO example](https://rawgit.com/pfrankov/magic-cache/master/example/example.html)

## Limitations
Cache API is available over _HTTPS_ only. Time to switch to _HTTPS_!  
Chrome 40+ / Firefox 44+ / Opera 24+ / Chrome for Android 49+

## Installation

```bash
npm install --save magic-cache
# or
git clone https://github.com/pfrankov/magic-cache
```
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
_Check the [`examples/react-webpack`](https://github.com/pfrankov/magic-cache/examples/react-webpack) example if you are using the Webpack_

## Usage

#### `init(options)`

Initializer. MagicCache will not work without it.  
Can be executed only once.

```js
MagicCache.init();

// is the same as

MagicCache.init({
    url: "/sw.js"
});
```

### Methods

#### `onCached(callback)`

Subscribe to an event when any request has gotten from the *cache*.
Additionally executed if the current status is _Cached_

```js
var cancelHandler = MagicCache.onCached(function(){
   console.log("Looks like you offline, but don't worry -- you are still geting cached pages"); 
});

// cancelHandler(); to obviously cancel the handler
```

#### `onOnline(callback)`

Subscribe to an event when any request has gotten from *server*.
Additionally executed if the current status is _Online_ 

```js
var cancelHandler = MagicCache.onOnline(function(){
   console.log("Online"); 
});

// cancelHandler(); to obviously cancel the handler 
```

### Properties

#### `isCached`

`Boolean`. Helps to understand what's going on in this particular moment.

```js
if (MagicCache.isCached) {
    alert("Oh, no!");
}
```