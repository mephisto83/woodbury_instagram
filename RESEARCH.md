# Instagram Web Posting Research

## Date: 2026-02-19

## Overview

This document summarizes the research conducted for building a Chrome extension to post content to Instagram from the web interface.

---

## 1. Instagram Web Interface Analysis

### Page Layout (instagram.com)

**Left Sidebar (Navigation):**
1. Home icon (~y:165)
2. Search icon (~y:215)
3. Explore icon (~y:265)
4. Reels icon (~y:315)
5. Messages icon (~y:365)
6. Notifications/Heart icon (~y:415)
7. **Create (+) icon (~y:465)** ← This is the post creation button
8. Profile icon (~y:515)
9. More options (~y:565)

**Sidebar width:** ~250px (expanded with text labels)

**Center Content Area:**
- Stories row at top (horizontally scrollable)
- Feed posts from followed accounts
- Each post has: username, media, likes, comments, interaction buttons

**Right Sidebar:**
- User profile info with "Switch" option
- "Suggested for you" section
- Footer links (help, privacy, terms)

---

## 2. Post Creation Flow (Web Interface)

When clicking the Create (+) button:

### Step 1: Create New Post Modal
- Modal appears with title "Create new post"
- Drag and drop area for media
- "Select from computer" button
- Supports: Images (JPEG), Videos

### Step 2: Crop/Edit
- Crop tool with aspect ratio options (1:1, 4:5, 16:9)
- Zoom slider
- Add more media button (for carousel)

### Step 3: Filters/Adjustments
- Filter presets
- Adjustment sliders (brightness, contrast, saturation, etc.)

### Step 4: Caption & Settings
- Caption text area
- Add location
- Alt text for accessibility
- Advanced settings (turn off comments, hide like counts)
- Tag people

### Step 5: Share
- "Share" button publishes the post

---

## 3. Official Instagram API (Graph API)

### Requirements
- Instagram Professional account (Business or Creator)
- Facebook Page connected to Instagram account
- Meta App with proper permissions
- Page Publishing Authorization (PPA) may be required

### Permissions Needed
- `instagram_basic`
- `instagram_content_publish`
- `pages_read_engagement`

### Content Publishing Endpoints

**Create Media Container:**
```
POST /<IG_USER_ID>/media
Params:
  - image_url: URL of image (must be publicly accessible)
  - video_url: URL of video
  - caption: Post caption
  - media_type: IMAGE, VIDEO, REELS, STORIES, CAROUSEL
  - is_carousel_item: true/false
```

**Publish Container:**
```
POST /<IG_USER_ID>/media_publish
Params:
  - creation_id: Container ID from previous step
```

### Limitations
- JPEG only for images
- Media must be hosted on public URL
- 100 API-published posts per 24 hours
- No shopping tags, branded content tags, or filters
- Stories only available for business accounts

### Supported Post Types
1. **Single Image** - Standard photo post
2. **Single Video** - Video post
3. **Reels** - Short-form video (media_type=REELS)
4. **Stories** - Temporary content (media_type=STORIES)
5. **Carousel** - Up to 10 images/videos

---

## 4. Existing Chrome Extensions

### INSSIST | Web Client for Instagram
- Rating: 4.7/5
- Features: Post stories, reels, photos from web
- Download, schedule posts, track unfollowers

### EasyLoad
- Rating: 4.4/5
- Upload photo and video to Instagram feed and stories

### Common Approach
Most extensions work by:
1. Intercepting/emulating Instagram's internal web API
2. Automating the web UI through content scripts
3. Providing a custom UI overlay

---

## 5. Technical Approach for woodbury_instagram

### Option A: Web UI Automation (Selected)
**Pros:**
- Works with personal accounts (not just Professional)
- No API keys or app approval needed
- User is already logged in

**Cons:**
- Fragile (breaks when Instagram changes UI)
- Must handle Instagram's React/SPA architecture
- Rate limited by normal web UI limits

### Option B: Graph API Integration
**Pros:**
- Official, supported method
- More reliable
- Access to additional features

**Cons:**
- Requires Professional account
- Complex OAuth flow
- App review process

### Selected Approach: Web UI Automation

Since the user specified "don't need to sign in" (user is already logged in), we'll automate the web interface.

---

## 6. Extension Architecture

```
woodbury_instagram/
├── manifest.json           # Extension manifest (Manifest V3)
├── background.js           # Service worker
├── content.js              # Injected into instagram.com
├── popup.html              # Extension popup UI
├── popup.js                # Popup logic
├── styles.css              # Popup styles
├── icons/                  # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── lib/
    └── instagram-dom.js    # DOM interaction helpers
```

### Key DOM Selectors (May Change)

**Create Button:**
- Look for SVG with specific path or aria-label
- Navigation items have `role="link"` or are `<a>` tags

**Modal Elements:**
- Modals typically have `role="dialog"`
- File input: `<input type="file" accept="image/*,video/*">`
- Caption textarea: Within the final step of creation flow
- Share button: Usually has specific text content

### Message Passing

```javascript
// popup.js -> content.js
chrome.tabs.sendMessage(tabId, { action: 'createPost', data: {...} });

// content.js -> popup.js
chrome.runtime.sendMessage({ status: 'postCreated', id: '...' });
```

---

## 7. Features to Implement

### MVP (Minimum Viable Product)
1. [ ] Click Create button programmatically
2. [ ] Upload image via file input
3. [ ] Add caption
4. [ ] Click Share to publish

### Future Features
- [ ] Multi-image carousel support
- [ ] Video upload
- [ ] Scheduling posts
- [ ] Reels support
- [ ] Stories support
- [ ] Draft saving
- [ ] Hashtag suggestions
- [ ] Location tagging

---

## 8. Challenges & Solutions

### Challenge 1: Instagram's React Architecture
Instagram uses React with frequent DOM updates.
**Solution:** Use MutationObserver to detect when elements appear.

### Challenge 2: Finding Reliable Selectors
Class names are often minified/randomized.
**Solution:** Use:
- `aria-label` attributes
- `data-testid` attributes (if available)
- Text content matching
- DOM structure patterns

### Challenge 3: File Upload
Instagram's file input may be hidden.
**Solution:** Create and trigger a synthetic file input, then dispatch events.

### Challenge 4: Timing
Modal transitions and API calls need time.
**Solution:** Use `MutationObserver` and `waitForElement` patterns instead of fixed delays.

---

## 9. References

- Instagram Graph API: https://developers.facebook.com/docs/instagram-api/
- Content Publishing: https://developers.facebook.com/docs/instagram-platform/content-publishing
- Chrome Extension Manifest V3: https://developer.chrome.com/docs/extensions/mv3/
- Instagram Web App: https://www.instagram.com/

---

## 10. Next Steps

1. Create extension manifest and basic structure
2. Implement content script for DOM inspection
3. Build popup UI for entering post details
4. Implement post creation flow automation
5. Test with various media types
6. Add error handling and user feedback
