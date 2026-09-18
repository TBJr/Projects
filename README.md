# Projects

A collection of independent web projects and interface demos. Most use HTML, CSS, and JavaScript directly, so there is no shared build step.

## Project index

| Project | Description |
| --- | --- |
| [Check internet connection](<Check internet connection/>) | Shows an online or offline status message after checking a remote endpoint. |
| [Cookie consent box](<Cookie consent box/>) | Displays a consent notice and remembers the choice in a browser cookie. |
| [Detect browser](<Detect browser/>) | Identifies the browser and highlights its logo. |
| [Expanding Cards](<Expanding Cards/>) | Expands an image panel when it is selected. |
| [File upload with progress bar](<File upload with progress bar/>) | Uploads a file to a PHP handler and displays transfer progress. |
| [Get user location](<Get user location/>) | Uses browser geolocation and reverse geocoding to show a location. |
| [Progress Steps](<Progress Steps/>) | Moves forward and backward through a visual progress indicator. |
| [QR Code Generator](<QR Code Generator/>) | Generates a QR code image from entered text or a URL. |
| [Responsive personal portfolio](<Responsive personal portfolio/>) | A responsive, multi-section portfolio with animated text and a carousel. |
| [Rotating Navigation](<Rotating Navigation/>) | Reveals navigation by rotating the page layout. |
| [Service box with flip animation](<Service box with flip animation/>) | Displays service cards with a CSS flip effect. |
| [Text to Speech](<Text to Speech/>) | Speaks entered text with the browser's speech synthesis API. |
| [Typing Speed Test](<Typing Speed Test/>) | Times a typing exercise and reports mistakes, words per minute, and characters per minute. |
| [Url shortener](<Url shortener/>) | A PHP and MySQL/MariaDB URL shortener with custom links, click counts, and link management. |
| [boikerplate_template](<boikerplate_template/>) | A basic HTML, CSS, and JavaScript starter page. |
| [text typing animation](<text typing animation/>) | A CSS typing animation that cycles through short phrases. |

## Running the browser projects

Open a project's `index.html` in a browser. You can also serve the repository locally from its root:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/` and select a project folder. Browser features such as geolocation may require a secure context; `localhost` is supported by modern browsers.

Some demos use external services or CDN-hosted assets. The connectivity check queries a remote endpoint, the location demo uses OpenCage for reverse geocoding, and the QR generator requests an image from qrserver.com. An internet connection is needed for those features.

## Running the PHP projects

**File upload with progress bar** requires PHP. From the repository root, create the upload destination and start PHP's local server:

```sh
mkdir -p "File upload with progress bar/php/files"
php -S localhost:8001 -t "File upload with progress bar"
```

Open `http://localhost:8001/`.

**Url shortener** requires PHP with `mysqli`, MySQL or MariaDB, and an Apache server with URL rewriting enabled for shortened links. Create a `urlshortener` database and import [`database/url.sql`](<Url shortener/database/url.sql>). Set the database connection and base URL in [`php/config.php`](<Url shortener/php/config.php>), and set the displayed short-link domain in [`js/script.js`](<Url shortener/js/script.js>) to match. Serve the `Url shortener` folder and open `index.php` directly; its `index.html` is a separate starter page.

The PHP projects are local demos. Review their upload and link-management behavior before exposing them publicly.
