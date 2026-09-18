# Check internet connection

A small toast that reports whether a request to JSONPlaceholder succeeds. Open `index.html` in a browser. The page uses plain HTML, CSS, and JavaScript; no build step is needed.

The check requests `https://jsonplaceholder.typicode.com/posts` every 100 ms. It also loads Unicons from a CDN. An unavailable API, a blocked cross-origin request, or a network policy can make the page report "offline" even when other sites work. The frequent requests make this a demonstration rather than a general connectivity monitor. If requests are blocked when opening the file directly, serve the folder over local HTTP.

Code credit: Thomas Brown — [thomasbrown.app](https://thomasbrown.app). The external API and icon library have their own terms.
