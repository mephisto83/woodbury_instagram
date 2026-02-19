# Extension Icons

These are SVG icons for the Woodbury Instagram extension.

## Icon Sizes

- `icon16.svg` - Small UI elements, favicon
- `icon48.svg` - Extension management page
- `icon128.svg` - Chrome Web Store listing

## Converting to PNG (if needed)

Some older Chrome versions may require PNG icons. Convert using:

### Using Inkscape
```bash
inkscape -w 16 -h 16 icon16.svg -o icon16.png
inkscape -w 48 -h 48 icon48.svg -o icon48.png
inkscape -w 128 -h 128 icon128.svg -o icon128.png
```

### Using ImageMagick
```bash
convert -background none -density 300 icon16.svg -resize 16x16 icon16.png
convert -background none -density 300 icon48.svg -resize 48x48 icon48.png
convert -background none -density 300 icon128.svg -resize 128x128 icon128.png
```

### Online Tools
- https://svgtopng.com/
- https://cloudconvert.com/svg-to-png
