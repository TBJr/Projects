# File upload with progress bar

A file-upload demonstration with a progress indicator and a list of completed transfers. It needs a PHP server; opening `index.html` as a local file or hosting it on a static site will not run the upload endpoint.

From this folder, create a writable `php/files` directory, run `php -S localhost:8000`, then open `http://localhost:8000` in a browser. The page sends the selected file to `php/upload.php`, which saves it in `php/files` with a timestamp prepended to its original name. Uploaded files remain on the server until removed.

This endpoint has no file-type, size, authentication, or filename validation. The progress display tracks bytes sent by the browser and does not verify that PHP saved the file successfully. Add those checks before exposing it to untrusted users. The page loads Font Awesome icons from a CDN.

Code credit: Thomas Brown — [thomasbrown.app](https://thomasbrown.app). The icon library has its own license.
