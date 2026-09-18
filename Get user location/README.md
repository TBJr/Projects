# Get user location

This browser demo asks for location permission and uses OpenCage to turn coordinates into a county, postcode, and country.

## Run

1. Get an [OpenCage API key](https://opencagedata.com/api).
2. Serve this folder on `localhost` or over HTTPS. For example, run `python3 -m http.server 8000` from this folder and open `http://localhost:8000`.
3. Enter your key on the page and select **Detect your location**. Allow the browser's location request.

Geolocation requires a secure context, browser permission, and a device location source. The address lookup requires internet access and an active OpenCage key. A county or postcode may be unavailable for some places.

The page does not store your key or location persistently. The key remains in the form while the tab is open, and your key and coordinates are sent directly to OpenCage for each lookup. The key is visible in your browser's network requests, so a client-side page cannot keep it secret. Use a server endpoint if your application needs to protect its own key.

**Maintainer note:** An earlier version included a key in JavaScript. [Replace that key in the OpenCage account](https://opencagedata.com/guides/how-to-create-a-new-api-key); changing this file does not remove the key from Git history or already published copies.

Code credit: Thomas Brown — [thomasbrown.app](https://thomasbrown.app). OpenCage is an external service with separate terms.
