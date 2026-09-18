# URL shortener

A PHP and MySQL demo that creates short links, redirects visitors, counts clicks, and lists or deletes saved links. Use `index.php` as the entry point; `index.html` is only a placeholder page.

## Run locally

1. Use a local Apache server with PHP, the `mysqli` extension, MySQL or MariaDB, and URL rewriting enabled.
2. Create a database named `urlshortener` and import `database/url.sql`.
3. Set the local database connection and link domain in `php/config.php`. Update the matching domain string in `js/script.js` for your local URL.
4. Serve this folder through Apache and open `index.php` in the browser. The included `.htaccess` routes short paths through `index.php`.

A static host such as GitHub Pages cannot run this project. The page requests Unicons from Iconscout and Poppins from Google Fonts.

## Before public deployment

This is a local demo, not a hardened public short-link service. Delete actions have no authentication, and saved URL values are written into page markup without output escaping. Address those issues before allowing untrusted users. The included `unzipper.php` is a separate server archive utility; keep it inaccessible on a public deployment or remove it if unused. Its header identifies Andreas Tasch as author and GNU GPL v3 as its license.

Repository maintainer: Thomas Brown — [thomasbrown.app](https://thomasbrown.app).
