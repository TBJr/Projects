# Get user location

A geolocation demonstration that asks for the browser's location permission, then uses OpenCage to turn coordinates into a county, postcode, and country. The result is shown on the button.

Serve this folder on `localhost` or over HTTPS, then open it in a browser and select **Detect your location**. For example, run `python3 -m http.server 8000` from this folder and visit `http://localhost:8000`. Geolocation requires a secure context, browser permission, and a device location source. Reverse geocoding also requires internet access and a working OpenCage API key; the current JavaScript includes a browser-visible key. Use your own key and move the request behind a server endpoint if the key must remain private.

Coordinates are sent to OpenCage for the lookup. The displayed address depends on the fields returned for that location; the page does not store a location history.

Code credit: Thomas Brown — [thomasbrown.app](https://thomasbrown.app). OpenCage is an external service with separate terms.
