# Instagram Web Interface Complete Survey

## Date: 2026-02-19
## Method: Live DOM inspection via Chrome Extension

---

## 1. Global Layout

### Screen Structure
- **Viewport:** 2056x1102 (tested resolution)
- **Left Sidebar:** Fixed navigation, 48-214px width (collapsed/expanded)
- **Main Content:** Variable width, centered
- **Right Sidebar:** ~300px, suggestions and footer (home page only)
- **Floating Messages Panel:** Bottom-right corner

### Left Sidebar Navigation (Always Present)

| Position | Item | href | Notes |
|----------|------|------|-------|
| Top | Instagram Logo | `/` | 48x56px |
| 1 | Home | `/` | "HomeHome" |
| 2 | Reels | `/reels/` | "ReelsReels" |
| 3 | Messages | `/direct/inbox/` | Shows unread count (e.g., "Messages7") |
| 4 | Search | `#` | Opens search panel (modal) |
| 5 | Explore | `/explore/` | "ExploreExplore" |
| 6 | Notifications | `#` | Opens notifications panel |
| 7 | Create | `#` | "New postCreate" - Opens creation modal |
| 8 | Profile | `/<username>/` | Shows user avatar |
| Bottom | Settings/More | `#` | Opens settings menu |
| Bottom | Also from Meta | `#` | Links to Threads, Facebook |

**Selectors:**
```css
/* Navigation items */
div:nth-of-type(N) > div > span > div > a  /* where N = position */

/* Create button specifically */
div:nth-of-type(7) > div > span > div > a

/* Settings/More */
div > div:nth-of-type(3) > span:nth-of-type(1) > div > a
```

---

## 2. Home Feed (`/`)

### Stories Row
- **Location:** Top of main content
- **Structure:** Horizontal scrollable list
- **Story Items:** `div[aria-label="Story by <username>, not seen"]` or `seen`
- **Size:** 90x102px per story
- **Navigation:** `button[aria-label="Next"]` to scroll

### Feed Posts (Articles)
- **Container:** `<article>` elements
- **Header:** Username, profile pic, time posted, options menu
- **Media:** Video/Image container with mute button for videos
- **Interaction Bar:**
  - Like (`div[role=button]` "Like")
  - Comment (`div[role=button]` "Comment")
  - Share (`div[role=button]` "Share")
  - Save (`div[role=button]` "Save")
- **Stats:** Like count (clickable), comment count
- **Caption:** Username + text, "more" to expand

**Audio Controls:**
```css
button[aria-label="Toggle audio"]  /* Mute/unmute video */
div[aria-label="Audio is muted"]   /* Muted state indicator */
```

### Right Sidebar (Home Only)
- **User Info:** Current user profile pic, username, "Switch" button
- **Suggested For You:** "See All" link → `/explore/people/`
- **Suggestion Items:** Avatar, username, reason ("Followed by..."), Follow button
- **Footer:** About, Help, Press, API, Jobs, Privacy, Terms, Locations, Language, Meta Verified

---

## 3. Reels (`/reels/`)

### Layout
- **Full-screen video player:** Center content
- **Video Size:** 600x1068px (portrait format)
- **Navigation:** Previous/Next reel buttons
  - `div[aria-label="Navigate to previous Reel"]`
  - `div[aria-label="Navigate to next Reel"]`

### Reel Interaction Panel (Right side)
| Action | Selector Notes |
|--------|----------------|
| Like | `span:nth-of-type(1) > div > div` with like count below |
| Comment | With comment count |
| Share | |
| Save | |
| More | "⋯" menu |
| Audio Link | Links to `/reels/audio/<id>/` |

### Reel Info (Bottom)
- **Creator:** Avatar + username + Follow button
- **Caption:** Expandable text
- **Audio:** Scrolling audio info with link

---

## 4. Explore (`/explore/`)

### Grid Layout
- **Structure:** Masonry-style grid of posts
- **Item Types:** Reels, Photos, Carousels
- **Item Size:** Variable (320x320px, 320x641px for large)
- **Items:** `<a[role=link]>` with "Reel" or other type label

### Explore Sub-sections
- `/explore/` - Main grid
- `/explore/people/` - Suggested accounts
- `/explore/locations/` - Browse by location

---

## 5. Direct Messages (`/direct/inbox/`)

### Layout (Two-Column)
- **Left Panel:** Thread list (460px width)
- **Right Panel:** Conversation view

### Thread List Header
- **Account Switcher:** `div[role=button]` with username + down chevron
- **New Message:** `div[role=button]` "New message"

### Notes Section
- **Your Note:** Start note button
- **Friend Notes:** Visible note bubbles from friends

### Thread Items
```css
div[role=button]  /* Each thread item */
/* Contains: Avatar, Name, Preview, Time, Unread indicator */
```

### Requests
- **Link:** `/direct/requests/` - Shows pending message requests

---

## 6. Profile Page (`/<username>/`)

### Header Section
- **Profile Photo:** 150x150px, clickable to view stories
- **Note Bubble:** "Note..." button above photo
- **Username:** Large heading with options button
- **Stats:** `<a>` links
  - Posts count
  - Followers (`/<username>/followers/`)
  - Following (`/<username>/following/`)
- **Threads Link:** Links to threads.com profile
- **Action Buttons:**
  - Edit profile (`/accounts/edit/`)
  - View archive (`/archive/stories/`)

### Highlights Row
- **Structure:** Horizontal scrollable
- **New Highlight:** "Plus iconNew" button

### Content Tabs
| Tab | href | Description |
|-----|------|-------------|
| Posts | `/<username>/` | Grid of posts |
| Reels | `/<username>/reels/` | Grid of reels |
| Saved | `/<username>/saved/` | Saved collections (own profile only) |
| Tagged | `/<username>/tagged/` | Posts tagged in |

### Post Grid
- **Item Types:** `<a[role=link]>` with labels:
  - "Clip" for Reels
  - "Carousel" for multi-image
  - (unlabeled) for single images
- **Size:** 290x387px per item

---

## 7. Settings (`/accounts/edit/`)

### Settings Sidebar (Left)

**How you use Instagram:**
- Edit profile (`/accounts/edit/`)
- Notifications (`/accounts/notifications/`)

**Who can see your content:**
- Account privacy (`/accounts/settings/v2/account_privacy/`)
- Close Friends (`/accounts/close_friends/`)
- Blocked (`/accounts/blocked_accounts/`)
- Story and location (`/accounts/hide_story_and_live/`)

**How others can interact with you:**
- Messages and story replies (`/accounts/messages_and_story_replies/`)
- Tags and mentions (`/accounts/settings/v2/tags_and_mentions/`)
- Comments (`/accounts/comments/`)
- Sharing and reuse (`/accounts/settings/v2/sharing_and_reuse/`)
- Restricted accounts (`/accounts/restricted_accounts/`)
- Hidden Words (`/accounts/settings/v2/hidden_words/`)
- Muted accounts (`/accounts/muted_accounts/`)

### Edit Profile Form (Right)
- **Change Photo:** Button to update profile picture
- **Name Field:** Input
- **Username Field:** Input
- **Pronouns:** Dropdown ("Prefer not to say")
- **Bio Field:** Textarea
- **Gender:** Selector
- **Show Threads badge:** Toggle switch
- **Show account suggestions:** Toggle switch
- **Submit Button:** Saves changes

### Meta Accounts Center
- Link to `accountscenter.instagram.com` for cross-app settings

---

## 8. Settings Menu (Popup)

When clicking "Settings/More" in sidebar:

| Item | Type | Destination |
|------|------|-------------|
| Settings | Link | `/accounts/edit/` |
| Your activity | Link | `/your_activity/interactions` |
| Saved | Link | `/<username>/saved/` |
| Switch appearance | Button | Theme toggle |
| Report a problem | Button | Feedback form |
| Switch accounts | Button | Account switcher |
| Log out | Button | Logout action |

---

## 9. Your Activity (`/your_activity/interactions`)

### Navigation Tabs
- Likes (`/your_activity/interactions/likes`)
- Comments (`/your_activity/interactions/comments`)
- Story Replies (`/your_activity/interactions/story_replies`)
- Reviews (`/your_activity/interactions/reviews`)

### Left Sidebar
- Interactions (current)
- Photos and videos (`/your_activity/photos_and_videos`)
- Account history (`/your_activity/account_history`)

### Content
- **Filter:** "Sort & filter" button
- **Grid:** Posts you've interacted with
- **Items:** Clickable post thumbnails

---

## 10. Archive (`/archive/stories/`)

### Structure
- **Back Link:** Returns to profile
- **Tab:** "Stories" tab (currently only option on web)
- **Content:** Grid of archived stories by date

### Story Items
- **Format:** `div[role=button]` with date labels (e.g., "19Feb2026")
- **Size:** 260x462px (story aspect ratio)

---

## 11. Saved Posts (`/<username>/saved/`)

### Layout
- Same header as profile page
- **New Collection Button:** "+ New Collection"

### Collections Grid
- **All posts:** `/saved/all-posts/`
- **Custom collections:** `/saved/<collection-name>/<id>/`
- **Size:** 302x302px per collection preview

---

## 12. Individual Post View (`/p/<post_id>/`)

### Layout (Two-Column)
- **Left:** Media (image/video)
- **Right:** Post details and comments

### Post Header
- Avatar (links to profile)
- Username + Verified badge
- Audio info (for Reels)
- Following/Follow button
- More options (⋯)

### Engagement Section
- **Like:** `div[role=button]` "Like"
- **Like Count:** Clickable `span[role=button]` showing count
- **Comment:** `div[role=button]` "Comment"
- **Comment Count:** Clickable
- **Share:** `div[role=button]` "Share"
- **Save:** `div[role=button]` "Save"
- **Timestamp:** Link to permalink

### Comment Input
- Profile avatar
- Text input area
- Emoji picker button

### Comments List
- **Each Comment:**
  - Avatar + Username + Timestamp
  - Comment text
  - Like button (heart)
  - Like count
  - Reply button

### Related Posts
- "More posts from [username]" grid below

---

## 13. Explore People (`/explore/people/`)

### Structure
- List of suggested accounts
- Each row: Avatar, Username, Subtext (reason), Follow button

---

## 14. Explore Locations (`/explore/locations/`)

### Structure
- Two-column list of countries
- Each country links to `/explore/locations/<country_code>/<country_name>/`
- Examples: `/explore/locations/US/united-states/`, `/explore/locations/JP/japan/`

---

## 15. Messages Floating Panel

Always visible in bottom-right corner:
- **Collapsed:** Shows avatars of recent conversations + unread count
- **Selector:** `div[role=button]` "Messages6Messages6 unread chats"
- **Expand:** Click to open full messages view

---

## 16. Modals and Dialogs

### Detection
```css
div[role=dialog]
[aria-modal=true]
```

### Common Modal Types
1. **Search Panel:** Opens from Search nav item
2. **Notifications Panel:** Opens from Notifications nav item
3. **Create Post Modal:** Opens from Create nav item
4. **Settings Menu:** Opens from Settings/More nav item

### Modal Close
```css
div[aria-label="Close"]
```

---

## 17. Key Selectors Reference

### Navigation
```css
/* Home */
a[href="/"]

/* Create post button */
div:nth-of-type(7) > div > span > div > a[href="#"]

/* Profile link */
a[href="/<username>/"]
```

### Feed Interactions
```css
/* Like button */
div[role=button]:has-text('Like')
section > div:nth-of-type(1) > span:nth-of-type(1) > div > div

/* Comment button */
div[role=button]:has-text('Comment')

/* Share button */
div[role=button]:has-text('Share')

/* Save button */
div[role=button]:has-text('Save')
```

### Form Elements
```css
/* Text inputs */
input[type="text"]
textarea

/* Toggle switches */
input[role=switch]

/* Buttons */
button
div[role=button]
```

### Stories
```css
/* Story item (unseen) */
div[aria-label^="Story by"][aria-label$="not seen"]

/* Story item (seen) */
div[aria-label^="Story by"]:not([aria-label$="not seen"])
```

---

## 18. URL Patterns

| Pattern | Description |
|---------|-------------|
| `/` | Home feed |
| `/reels/` | Reels feed |
| `/reels/audio/<id>/` | Audio page |
| `/explore/` | Explore grid |
| `/explore/people/` | Suggested accounts |
| `/explore/locations/` | Location browser |
| `/direct/inbox/` | Messages inbox |
| `/direct/requests/` | Message requests |
| `/<username>/` | User profile |
| `/<username>/reels/` | User's reels |
| `/<username>/saved/` | Saved posts (own profile) |
| `/<username>/tagged/` | Tagged posts |
| `/<username>/followers/` | Followers list |
| `/<username>/following/` | Following list |
| `/p/<post_id>/` | Individual post |
| `/accounts/edit/` | Settings/Edit profile |
| `/your_activity/*` | Activity history |
| `/archive/stories/` | Story archive |
| `/legal/privacy/` | Privacy policy |
| `/legal/terms/` | Terms of service |

---

## 19. Footer Links

| Link | URL |
|------|-----|
| About | https://about.instagram.com/ |
| Help | https://help.instagram.com/ |
| Press | https://about.instagram.com/blog/ |
| API | https://developers.facebook.com/docs/instagram |
| Jobs | https://about.instagram.com/about-us/careers |
| Privacy | /legal/privacy/ |
| Consumer Health Privacy | /legal/privacy/health_privacy_policy/ |
| Terms | /legal/terms/ |
| Locations | /explore/locations/ |
| Language | /language/preferences/ |
| Meta Verified | /accounts/meta_verified/ |
| Meta AI | https://www.meta.ai/ |
| Threads | https://www.threads.com/ |

---

## 20. Technical Notes

### React Architecture
- Instagram uses React with frequent re-renders
- Class names are minified and change frequently
- Use `aria-label`, `role`, and structural selectors
- Use `MutationObserver` to detect element appearance

### Video Handling
- Videos auto-play muted
- `button[aria-label="Toggle audio"]` to unmute
- Video player has `role="group"` with label "Video player"

### Accessibility Attributes
- Most interactive elements have `role="button"` or `role="link"`
- `aria-label` provides element descriptions
- Use these for reliable element identification

### Timestamps
- Relative format: "4h", "1d", "2w"
- Link to individual post permalink
