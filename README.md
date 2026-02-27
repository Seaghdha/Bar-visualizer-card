# 🎵 Bar Visualizer Card

A custom Lovelace card for **Home Assistant** that displays an animated,
audio-style bar visualizer driven by an entity state (typically a
`media_player`).

The card uses **absolute pixel heights** (no scale transforms), supports
**profile-based behavior** (`playing`, `calm`, `freeze`, or custom
profiles), and allows detailed styling via YAML.

------------------------------------------------------------------------

## ✨ Features

-   Animated bars using absolute pixel heights
-   Per-profile configuration:
    -   `minHeight`, `maxHeight`
    -   `amp`, `speed`
    -   `barColor`, `glowColor`, `glowIntensity`
    -   `animate`
-   Supports color formats:
    -   `#RRGGBB`
    -   `#RGB`
    -   `rgb(...)`
    -   `rgba(...)`
    -   `r,g,b`
-   State mapping via `stateMap`
-   Animation can be disabled per profile
-   No `card_mod` required
-   Fully customizable layout (radius, padding, border)

------------------------------------------------------------------------

# 📦 Installation

## 1. Copy the JS file

Create:

    /config/www/bar-visualizer-card.js

Paste the contents of `bar-visualizer-card.js` into it.

------------------------------------------------------------------------

## 2. Add as a Lovelace Resource

In Home Assistant:

**Settings → Dashboards → Resources → Add Resource**

-   URL:

        /local/bar-visualizer-card.js

-   Type:

        module

------------------------------------------------------------------------

## 3. Hard Refresh

Perform a hard refresh (Ctrl+F5), or add a cache-buster:

    /local/bar-visualizer-card.js?v=1

------------------------------------------------------------------------

# 🚀 Basic Usage

``` yaml
type: custom:bar-visualizer-card
entity: media_player.spotify
```

------------------------------------------------------------------------

# ⚙️ Configuration

## 🔹 Core Options

| Option            | Type    | Default | Description                                                   |
|------------------|---------|---------|---------------------------------------------------------------|
| `entity`         | string  | `null`  | Target entity (e.g. `media_player.xxx`)                      |
| `demo`           | boolean | `false` | Runs card without entity (forces `playing` profile)          |
| `height`         | number  | `96`    | Height of bar container (px)                                 |
| `barCount`       | number  | `20`    | Number of bars                                               |
| `barWidth`       | number  | `10`    | Width of bars (px)                                           |
| `gap`            | number  | `6`     | Space between bars (px)                                      |
| `inactiveProfile`| string  | `calm`  | Fallback profile if entity state is not mapped               |
  -------------------------------------------------------------------------------

## 🎨 Card Appearance

| Option            | Type    | Default        | Description                         |
|------------------|---------|---------------|-------------------------------------|
| `backgroundColor`| string  | `transparent` | Inner wrapper background            |
| `cardRadius`     | number  | `0`           | `ha-card` border radius (px)        |
| `innerRadius`    | number  | `0`           | Inner wrapper border radius (px)    |
| `cardPadding`    | number  | `0`           | Padding inside `ha-card` (px)       |
| `wrapperPadding` | number  | `0`           | Padding around bars (px)            |
| `cardBorder`     | boolean | `false`       | Enables subtle border               |
  ---------------------------------------------------------------------------

# 🎛 Profiles

Profiles define how the visualizer behaves for different states.

Default profiles:

-   `playing`
-   `calm`
-   `freeze` (animation disabled)

## 🎛 Profile Options

Each profile supports the following options:

| Option           | Type    | Default (if omitted) | Description |
|------------------|---------|----------------------|------------|
| `minHeight`      | number  | `12` (profile dependent) | Minimum bar height in pixels. Bars never drop below **3px** (safety floor). |
| `maxHeight`      | number  | `90` (profile dependent) | Maximum bar height in pixels. |
| `amp`            | number  | `0.25–1.0` (profile dependent) | Intensity multiplier controlling vertical movement. Higher = stronger animation. |
| `speed`          | number  | `1.0` | Animation speed. **Higher = faster**. |
| `barColor`       | string  | `#ffffff` | Bar color. Supports hex, rgb(), rgba(), or `r,g,b`. |
| `glowColor`      | string  | `#ffffff` | Glow color. Same formats as `barColor`. |
| `glowIntensity`  | number  | `0` | Glow strength from `0` to `1`. |
| `animate`        | boolean | `true` (except freeze) | Set to `false` to disable animation for this profile. |
  -----------------------------------------------------------------------

Bars will never drop below **3px** even if `minHeight` is set lower.

------------------------------------------------------------------------

# 🔁 State Mapping

Maps Home Assistant entity states to profiles.

Default mapping:

``` yaml
stateMap:
  playing: playing
  buffering: playing
  paused: calm
  idle: calm
  off: freeze
  standby: freeze
  unavailable: freeze
  unknown: freeze
```

If a state is not mapped: - `inactiveProfile` is used - otherwise
defaults to `calm`

------------------------------------------------------------------------

# 🧩 Example Configuration

``` yaml
type: custom:bar-visualizer-card
entity: media_player.spotify

height: 100
barCount: 28
barWidth: 6
gap: 5

backgroundColor: rgba(0,0,0,0.2)
cardRadius: 12
innerRadius: 12
cardPadding: 8
wrapperPadding: 12
cardBorder: false

inactiveProfile: calm

stateMap:
  playing: playing
  paused: calm
  idle: calm
  off: freeze

profiles:
  playing:
    minHeight: 12
    maxHeight: 90
    amp: 1.1
    speed: 1.6
    barColor: "#cbd5e1"
    glowIntensity: 0.08
    glowColor: "#78c8ff"
    animate: true

  calm:
    minHeight: 8
    maxHeight: 40
    amp: 0.25
    speed: 1.0
    barColor: "#94a3b8"
    glowIntensity: 0
    animate: true

  freeze:
    minHeight: 8
    maxHeight: 40
    amp: 0
    barColor: "#64748b"
    glowIntensity: 0
    animate: false
```

------------------------------------------------------------------------

# 🧠 How It Works

-   Uses CSS keyframes (`bounceHeight`)
-   Animates real pixel heights
-   `speed` shortens animation duration (2.0 ≈ twice as fast as 1.0)
-   `amp` controls vertical intensity
-   Animation is deterministic (not connected to real audio FFT)
-   `animate: false` disables animation and lowers opacity

------------------------------------------------------------------------

# ⚠️ Limitations

-   Not connected to real audio spectrum (no FFT)
-   High `barCount` values increase CSS animation load

------------------------------------------------------------------------

# 📄 License

MIT License
