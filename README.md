# Bar Visualizer Card 🟦🟦🟦

A custom Lovelace card for **Home Assistant** that displays an animated, audio-style bar visualizer driven by an entity state (typically a `media_player`).

This card uses **absolute pixel heights** (no `scaleY` tricks), supports **profile-based behavior** (`playing`, `calm`, `freeze`, or your own), and allows detailed styling via YAML.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration](#configuration)
  - [Core Options](#core-options)
  - [Card Appearance](#card-appearance)
  - [Profiles](#profiles)
  - [State Mapping](#state-mapping)
- [Examples](#examples)
  - [Minimal](#minimal)
  - [Media Player Profiles](#media-player-profiles)
  - [Custom Profiles](#custom-profiles)
- [How It Works](#how-it-works)
- [Limitations](#limitations)
- [License](#license)

---

## Features

✅ Animated bars using **absolute pixel heights**  
✅ Per-profile configuration:
- `minHeight`, `maxHeight`
- `amp`, `speed`
- `barColor`, `glowColor`, `glowIntensity`
- `animate` (disable animation per profile)

✅ Color formats supported:
- `#RRGGBB`, `#RGB`
- `rgb(...)`, `rgba(...)`
- `r,g,b`

✅ Entity state mapping via `stateMap`  
✅ No `card_mod` required (radius/padding/border configurable)  
✅ Works in Lovelace editor preview + runtime

---

## Installation

### 1) Copy the JS file

Create:

/config/www/bar-visualizer-card.js


Paste your `bar-visualizer-card.js` content into it.

### 2) Add as a Lovelace Resource

Home Assistant:

**Settings → Dashboards → Resources → Add Resource**

- URL: `/local/bar-visualizer-card.js`
- Type: `module`

### 3) Hard refresh

Do a hard refresh in your browser (Ctrl+F5), or add a cache-buster:

- `/local/bar-visualizer-card.js?v=1`

---

## Basic Usage

```yaml
type: custom:bar-visualizer-card
entity: media_player.spotify ```

Configuration
Core Options

|            Option | Type    | Default | Description                                         |
| ----------------: | :------ | :------ | :-------------------------------------------------- |
|          `entity` | string  | `null`  | Home Assistant entity id (e.g., `media_player.xxx`) |
|            `demo` | boolean | `false` | Run without entity (forces `playing` profile)       |
|          `height` | number  | `96`    | Container height for bars (px)                      |
|        `barCount` | number  | `20`    | Number of bars                                      |
|        `barWidth` | number  | `10`    | Bar width (px)                                      |
|             `gap` | number  | `6`     | Space between bars (px)                             |
| `inactiveProfile` | string  | `calm`  | Profile used when state is not mapped               |

