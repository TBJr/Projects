# Image Resizer and Compressor

Resize an image, convert it to another format, and download the result. Open `index.html` in a browser; there is no build step or server requirement. The image stays on your device.

Choose or drop a PNG, JPEG, or WebP file, up to 25 MB. Set the maximum width and height, choose an output format, and select a quality level for JPEG or WebP. The tool preserves the image's proportions and does not enlarge it. Compare the original and output dimensions and file sizes before downloading.

The tool accepts images up to 40 megapixels and limits output to 16 megapixels, with a maximum width or height of 8192 pixels. Transparent areas turn white when exporting to JPEG. Animated images export as a single frame, and output files do not retain the original metadata. PNG output is lossless, so the quality control does not apply. Available output formats depend on browser support; if a format cannot be created, choose another. Large images may exceed the memory available on some devices.
