---
title: Rules Engine & Content Filtering
description: Complete reference for Pream's non-destructive Rules Engine, regex patterns, group normalization, and 2-column live preview.
---

# 🪄 Rules Engine & Content Filtering

The **Rules Engine** is the core distinguishing feature of Pream. It allows you to clean up, re-group, hide, and normalize messy provider playlists using intuitive regular expression (regex) rules.

Access the rules dashboard by clicking **Rules Engine** (`/rules`) in the navigation bar.

---

## 💡 How It Works: Raw Name Retention

Most playlist managers permanently overwrite channel and group names when applying rules. If you make a mistake in a regex pattern or change your grouping logic, you are forced to re-download gigabytes of data from your provider.

**Pream takes a non-destructive approach:**

```
[ Raw Untouched from Source ]               [ Computed Display Output ]
raw_name:  "[HD] Sky Sports Main Event FHD" ──▶ display_name:  "Sky Sports Main Event"
raw_group: "UK | SPORTS & LIVE EVENTS"      ──▶ display_group: "UK - Sports"
is_hidden: false                            ──▶ is_hidden:     false
```

- **`raw_name` & `raw_group`**: Never altered. Stored permanently in SQLite.
- **`display_name` & `display_group`**: Computed sequentially across your enabled rules list.
- **Instant Execution**: Whenever you create, edit, or reorder rules, clicking **Apply Rules Now** re-transforms the entire library in seconds without touching your upstream providers.

---

## 🛠️ Supported Rule Types

Pream supports 5 primary transformation actions:

### 1. Rename Group / Category (`rename_group`)
Substitutes matching patterns in category names with a cleaner replacement string. Works across Live Channels, VOD Movies, and Series groups.

- **Example Goal**: Standardize `UK| Sports`, `UK - Sports HD`, and `[EN] Sports` into `UK - Sports`.
- **Match Pattern**: `^(?:UK\s*[|\-]\s*|\[EN\]\s*)Sports.*$`
- **Replacement**: `UK - Sports`

---

### 2. Rename Channel / Item Title (`rename_channel`)
Cleans up messy channel titles, strips resolution prefixes or suffixes, and unifies naming.

- **Example Goal**: Remove prefixes like `[HD]`, `|EN|`, and suffixes like `FHD`, `HEVC`, `50FPS`.
- **Match Pattern**: `^\[HD\]\s*|\s*(?:FHD|HEVC|50FPS)$`
- **Replacement**: *(Leave blank to remove matched text)*
- **Supports Regex Capture Groups**:
  - Pattern: `Sky Cinema (.*) HD`
  - Replacement: `Cinema \1`

---

### 3. Hide Entire Group / Category (`hide_group`)
Hides all channels, movies, or series belonging to matching categories.

- **Example Goal**: Hide all foreign language or adult categories.
- **Match Pattern**: `Adult|XXX|French|German|Scandinavia`
- **Effect**: All matching categories and their contents are marked `is_hidden = true`. They are excluded from M3U playlists and Xtream Codes API outputs.

---

### 4. Hide Single Channel / Item (`hide_channel`)
Hides specific streams matching a title pattern without hiding the entire category.

- **Example Goal**: Hide Pay-Per-View placeholder channels or test feeds.
- **Match Pattern**: `(?i)placeholder|test\s*feed|event\s*ended`
- **Effect**: Only matching channels are hidden.

---

### 5. Set / Move to Group (`set_group`)
Assigns matching channels, movies, or series to a brand new custom category name.

- **Example Goal**: Move any channel containing `Premier League` or `EFL` into a dedicated `UK - Football` group.
- **Match Pattern**: `Premier\s*League|EFL|Champions\s*League`
- **Target Group Name**: `UK - Football`

---

### 6. Case Transformations (Regex Matched)
Normalize inconsistent capitalization, shouty uppercase titles, or all-lowercase metadata without writing complex replacement logic:

- **`uppercase_channel`**: Converts matched substring (or entire channel title) to `UPPERCASE`.
- **`lowercase_channel`**: Converts matched substring (or entire channel title) to `lowercase`.
- **`capitalize_channel`**: Converts matched substring to `Capitalized` (first letter uppercase, rest lowercase).
- **`titlecase_channel`**: Converts matched words to `Title Case` (e.g. `sky cinema action` ➔ `Sky Cinema Action`).
- **`uppercase_group` / `lowercase_group` / `capitalize_group` / `titlecase_group`**: Applies the identical case normalization to category and group names.

---

## 📚 Popular Regex Recipes & Presets

Below is a curated set of battle-tested regex recipes you can copy directly into your Pream rules:

### 1. Stripping Resolution & Quality Tags
Providers often pollute channel titles with quality tags like `[HD]`, `FHD`, `HEVC`, `4K`, or `50FPS`.
- **Rule Type**: `rename_channel`
- **Match Field**: `name`
- **Regex Pattern**: `\s*(?:\[?(?:FHD|UHD|4K|1080p|720p|50FPS|HEVC|H\.265|RAW)\]?|\(FHD\)|\(4K\))\s*$`
- **Replacement**: *(Leave blank)*
- **Before**: `Sky Sports Main Event FHD 50FPS` ➔ **After**: `Sky Sports Main Event`

---

### 2. Stripping Country & Language Prefixes
Removes bracketed or pipe-separated country codes like `[UK]`, `US |`, `|EN|` from channel names.
- **Rule Type**: `rename_channel`
- **Match Field**: `name`
- **Regex Pattern**: `^(?:\[(?:UK|US|CA|EN|FR|DE)\]\s*|(?:UK|US|CA)\s*[-|:]\s*|\|[A-Z]{2}\|\s*)`
- **Replacement**: *(Leave blank)*
- **Before**: `[UK] BBC One HD` ➔ **After**: `BBC One HD`

---

### 3. Hiding Adult & Explicit Categories
Quickly hides all adult, XXX, and porn channels and categories from your output playlist.
- **Rule Type**: `hide_group`
- **Match Field**: `group`
- **Regex Pattern**: `(?i)(?:adult|xxx|18\+|porn|for\s*adults|erotic|playboy)`
- **Effect**: All channels, movies, and series inside matching categories are marked `is_hidden = true`.

---

### 4. Unifying Provider Sports Categories
Consolidate varied sports group names from multiple providers into a single clean group.
- **Rule Type**: `rename_group`
- **Match Field**: `group`
- **Regex Pattern**: `^(?:UK|US|CA|EN)\s*[|\-:]\s*SPORTS.*$`
- **Replacement**: `Sports - Live Events`
- **Before**: `UK | SPORTS & LIVE EVENTS` ➔ **After**: `Sports - Live Events`

---

### 5. Stripping Release Year from Movie Titles
Remove trailing release years in parentheses from VOD titles to improve TMDB search matching.
- **Rule Type**: `rename_channel`
- **Content Scope**: `VOD Movies Only (vod)`
- **Match Field**: `name`
- **Regex Pattern**: `\s*\((?:19|20)\d{2}\).*$`
- **Replacement**: *(Leave blank)*
- **Before**: `Interstellar (2014) 1080p` ➔ **After**: `Interstellar`

---

### 6. Standardizing Category Casing
Convert chaotic uppercase category names into clean, readable Title Case.
- **Rule Type**: `titlecase_group`
- **Match Field**: `group`
- **Regex Pattern**: `.*`
- **Before**: `UK DOCUMENTARY & NATURE` ➔ **After**: `Uk Documentary & Nature`

---

### 7. Hiding Test Feeds and Pay-Per-View Placeholders
Exclude inactive event channels that are currently offline or displaying placeholder images.
- **Rule Type**: `hide_channel`
- **Match Field**: `name`
- **Regex Pattern**: `(?i)(?:placeholder|event\s*ended|test\s*feed|offline|no\s*event)`
- **Effect**: Hides only matching offline channels without affecting their parent category.

---

## 🎯 Content Scope Options

Every rule can be scoped to specific media types:
- **All Content (Live, Movies, Series)**: Applies universally across your whole database.
- **Live TV Only (`live`)**: Restricts rule application strictly to Live TV channels and categories.
- **VOD Movies Only (`vod`)**: Restricts rule application to movies and movie categories.
- **TV Series Only (`series`)**: Restricts rule application to series titles and series categories.

---

## 🔍 2-Column Live Transformation Preview

Located directly on the `/rules` page beneath your active rules list, the **Live Transformation Preview** lets you inspect how your raw source metadata transforms into client output in real-time.

```
┌───────────────────────────────────────┬──────────────────────────────────────────┐
│  Original (Untouched from Source)     │  Filtered (After Rules Applied)          │
├───────────────────────────────────────┼──────────────────────────────────────────┤
│  [HD] Sky Sports Main Event FHD       │  Sky Sports Main Event                   │
│  📁 UK | SPORTS & LIVE EVENTS         │  📁 UK - Sports        [Renamed & Moved] │
├───────────────────────────────────────┼──────────────────────────────────────────┤
│  [FR] Canal+ Ligue 1 HD               │  Canal+ Ligue 1                          │
│  📁 FR | SPORTS                       │  📁 FR | Sports                 [Hidden] │
└───────────────────────────────────────┴──────────────────────────────────────────┘
```

### Preview Scopes:
Use the **Scope Dropdown** to preview:
- **Streams & Titles**:
  - `Live TV Channels`
  - `VOD Movies`
  - `TV Series`
- **Categories & Groups**:
  - `Channel Groups` (includes item counts and active/hidden totals)
  - `Movie Groups`
  - `Series Groups`
  - `All Groups Combined`

Toggle the **"Modified only"** switch to instantly filter down to items affected by your rules.

---

## 🧪 Rule Test Sandbox

Test regex patterns on arbitrary sample names before saving them into your live pipeline:
1. Click **Rule Sandbox** at the top of the Rules page.
2. Enter sample names (e.g. `[HD] Sky Sports Main Event FHD`) and sample group names.
3. Choose a rule type and enter your regex pattern.
4. Click **Run Test Preview** to inspect the resulting output name, group, and visibility state instantly.
