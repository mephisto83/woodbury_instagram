# Woodbury Instagram

A Chrome extension to post content to Instagram from the web interface.

## Features

- 📸 **Post images** to Instagram from your browser
- ✍️ **Add captions** with full character support (2200 max)
- 🖱️ **Drag & drop** or paste images from clipboard
- 🔗 **Load images from URL**
- 🎨 **Dark mode UI** matching Instagram's aesthetic

## Installation

### Developer Mode (Recommended for testing)

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `woodbury_instagram` folder

### From Chrome Web Store

*Coming soon*

## Usage

1. **Open Instagram** in a Chrome tab and make sure you're logged in
2. Click the **Woodbury Instagram** extension icon in your toolbar
3. **Select an image**:
   - Click the upload area to choose a file
   - Drag and drop an image
   - Paste an image from clipboard (Ctrl/Cmd+V)
   - Enter an image URL and click "Load"
4. **Add a caption** (optional)
5. Click **Post to Instagram**
6. The extension will automatically:
   - Open the Create post dialog
   - Upload your image
   - Navigate through the crop/filter steps
   - Add your caption
   - Share the post

## How It Works

This extension automates Instagram's web interface rather than using the official API. This means:

✅ **Works with personal accounts** (not just Professional/Business)
✅ **No API keys required**
✅ **No app approval process**

⚠️ **Limitations:**
- Instagram may change their UI, which could temporarily break the extension
- Subject to Instagram's normal rate limits and terms of service
- Videos and carousels are not yet supported (coming soon)

## Documentation

Detailed technical documentation is available in the `/docs` folder:

| Document | Description |
|----------|-------------|
| [SITE_SURVEY.md](docs/SITE_SURVEY.md) | Complete survey of Instagram's web interface - pages, layouts, elements |
| [DOM_SELECTORS.md](docs/DOM_SELECTORS.md) | Reliable CSS selectors for automation + flow-frame-core integration |
| [CREATE_POST_FLOW.md](docs/CREATE_POST_FLOW.md) | Step-by-step guide for automating post creation with file modal handling |
| [RESEARCH.md](RESEARCH.md) | Initial research notes and architecture decisions |

## Architecture

```
woodbury_instagram/
├── manifest.json         # Extension configuration
├── background.js         # Service worker for message passing
├── content.js            # DOM automation on instagram.com
├── content-styles.css    # Styles injected into Instagram
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic
├── popup.css             # Popup styles
├── icons/                # Extension icons
│   ├── icon16.svg
│   ├── icon48.svg
│   └── icon128.svg
├── docs/                 # Technical documentation
│   ├── SITE_SURVEY.md    # Complete Instagram UI survey
│   ├── DOM_SELECTORS.md  # Automation selectors + flow-frame-core
│   └── CREATE_POST_FLOW.md # Post creation guide with file modal
├── RESEARCH.md           # Initial research documentation
└── README.md             # This file
```

## Integration with flow-frame-core

For desktop automation (outside the browser), this extension's documentation includes integration patterns with [flow-frame-core](https://github.com/your-org/flow-frame).

### Key flow-frame-core Functions

| Function | Description |
|----------|-------------|
| `moveMouse(position)` | Move mouse to element center (with Chrome UI offset) |
| `mouseClick()` | Left click at current position |
| `fileModalOperate(filePath)` | Navigate OS file picker dialog (cross-platform) |
| `pasteText(text)` | Paste text from clipboard |
| `clearAllText()` | Select all + delete |
| `pressReturn()` | Press Enter key |

### File Modal Handling

When clicking "Select from computer" triggers an OS file picker dialog, use `fileModalOperate`:

```javascript
import { fileModalOperate } from 'flow-frame-core/dist/operations.js';

// After clicking button that opens file dialog
await fileModalOperate('/path/to/image.jpg');
```

This handles platform differences:
- **macOS/Linux**: Opens "Go to Folder" (Cmd+Shift+G), pastes path, presses Enter twice
- **Windows**: Pastes path directly, presses Enter once

See [CREATE_POST_FLOW.md](docs/CREATE_POST_FLOW.md) for full examples.

## Instagram Web Interface Overview

Based on the [site survey](docs/SITE_SURVEY.md):

### Main Sections

| Section | URL | Description |
|---------|-----|-------------|
| Home | `/` | Feed with stories and posts |
| Reels | `/reels/` | Full-screen vertical video feed |
| Explore | `/explore/` | Discovery grid |
| Messages | `/direct/inbox/` | Direct messages |
| Profile | `/<username>/` | User profile with posts grid |
| Settings | `/accounts/edit/` | Account settings |
| Activity | `/your_activity/` | Interaction history |

### Navigation
- Left sidebar is always present with navigation icons
- "Create" button opens the post creation modal
- Messages panel floats in bottom-right corner

### Key Technical Notes
- Instagram is a React SPA with frequent DOM updates
- Class names are minified and unreliable
- Use `aria-label`, `role`, and structural selectors
- Always use `MutationObserver` to wait for elements

## Development

### Prerequisites

- Google Chrome (latest version)
- Basic knowledge of Chrome extensions
- (Optional) flow-frame-core for desktop automation

### Making Changes

1. Edit the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Woodbury Instagram extension
4. Test your changes

### Debugging

- **Popup**: Right-click the extension icon → "Inspect popup"
- **Background**: Go to `chrome://extensions/` → Click "Inspect views: service worker"
- **Content Script**: Open DevTools on instagram.com → Console (filter by "Woodbury")

### Useful Commands

```javascript
// In DevTools console on instagram.com:

// Find all clickable elements
document.querySelectorAll('[role="button"], button, a[role="link"]')

// Find elements by aria-label
document.querySelectorAll('[aria-label]')

// Check if extension content script is loaded
window.__woodbury_instagram_loaded
```

## Roadmap

- [ ] Video upload support
- [ ] Carousel (multi-image) posts
- [ ] Reels support
- [ ] Stories support
- [ ] Post scheduling
- [ ] Draft saving
- [ ] Hashtag suggestions
- [ ] Location tagging

## Troubleshooting

### "Connection error" or "Open Instagram to post"

Make sure you have Instagram open in a Chrome tab and are logged in.

### Post fails at a specific step

Instagram may have updated their UI. Please:
1. Try again in a few seconds
2. Check if Instagram works normally (manual posting)
3. Report the issue with the error message

### Images won't load from URL

Some URLs may be blocked by CORS. Try:
- Downloading the image and uploading it directly
- Using a different image host

### OS file dialog not working

If using desktop automation with flow-frame-core:
1. Ensure you're using `fileModalOperate` for cross-platform compatibility
2. On macOS, the file dialog may need Accessibility permissions
3. Check that the file path is absolute and the file exists

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Disclaimer

This extension is not affiliated with, endorsed by, or connected to Instagram or Meta. Use at your own risk and in compliance with Instagram's Terms of Service.
