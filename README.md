📘 README.md (English Version)
Bar Visualizer Card

A custom Lovelace card for Home Assistant that displays an animated audio-style bar visualizer driven by an entity state (typically a media_player).

The card uses absolute pixel heights (no scale hacks), supports per-profile configuration (playing, calm, freeze, etc.), and allows detailed visual customization via YAML.

✨ Features

Animated bars using absolute pixel heights

Per-profile configuration:

minHeight

maxHeight

amp

speed

barColor

glowColor

glowIntensity

animate

Color format support:

#RRGGBB

#RGB

rgb(...)

rgba(...)

r,g,b

Entity state mapping via stateMap

Ability to disable animation (animate: false)

No card_mod required

Fully customizable layout (radius, padding, border)

📦 Installation

Create the file:

/config/www/bar-visualizer-card.js

Paste the contents of bar-visualizer-card.js into it.

In Home Assistant:

Settings → Dashboards → Resources

Add:

URL: /local/bar-visualizer-card.js
Type: module

Perform a hard refresh (Ctrl+F5).

🧱 Basic Usage
type: custom:bar-visualizer-card
entity: media_player.spotify
⚙️ Configuration
🔹 Core Options
Parameter	Type	Default	Description
entity	string	null	Target entity (e.g., media_player)
demo	boolean	false	Runs card without an entity
height	number	96	Height of bar container (px)
barCount	number	20	Number of bars
barWidth	number	10	Width of bars (px)
gap	number	6	Spacing between bars (px)
🔹 Card Appearance
Parameter	Type	Default	Description
backgroundColor	string	transparent	Wrapper background
cardRadius	number	0	ha-card border radius
innerRadius	number	0	Inner wrapper radius
cardPadding	number	0	Padding inside ha-card
wrapperPadding	number	0	Padding around bars
cardBorder	boolean	false	Enables subtle border
🎛️ Profiles

Profiles define how the visualizer behaves under different states.

Each profile supports:

Parameter	Type	Description
minHeight	number	Minimum bar height (px)
maxHeight	number	Maximum bar height (px)
amp	number	Intensity multiplier (0–1+)
speed	number	Animation speed (higher = faster)
barColor	string	Bar color
glowColor	string	Glow color
glowIntensity	number	Glow intensity (0–1)
animate	boolean	false = disables animation
⚠️ minHeight Behavior

minHeight is the real minimum height in pixels.

A built-in safety floor of 3px prevents bars from collapsing visually.

maxHeight is the true maximum height in pixels.

🔁 State Mapping (stateMap)

Maps Home Assistant entity states to profiles.

stateMap:
  playing: playing
  paused: calm
  idle: calm
  off: freeze

If a state is not mapped:

inactiveProfile is used

or defaults to calm

🧩 Full Example
type: custom:bar-visualizer-card
entity: media_player.spotify

height: 100
barCount: 28
barWidth: 6
gap: 5

backgroundColor: "rgba(0,0,0,0.2)"
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
🧠 How Animation Works

Uses CSS keyframes (bounceHeight)

Heights are absolute pixel values

speed shortens animation duration (2.0 = twice as fast as 1.0)

Animation is deterministic (not connected to real audio FFT)

animate: false disables animation and lowers opacity

📄 License

MIT License
