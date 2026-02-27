// bar-visualizer-card.js
// Absolute-height animated bars (per-profile min/max), 3px safety floor,
// speed: higher = faster, animate: false supported, hex colors supported.

const LitElement = customElements.get("ha-panel-lovelace")
  ? Object.getPrototypeOf(customElements.get("ha-panel-lovelace"))
  : HTMLElement;

const html =
  LitElement.prototype.html ||
  ((strings, ...values) =>
    strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), ""));

const css = LitElement.prototype.css || ((strings) => strings.join(""));

class BarVisualizerCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: {},
      _rawState: {},
      _profileName: {},
    };
  }

  setConfig(config) {
    const defaultProfiles = {
      playing: {
        amp: 1.0,
        speed: 1.0, // higher = faster
        minHeight: 12,
        maxHeight: 90,
        glowIntensity: 0.12,
        glowColor: "#ffffff",
        barColor: "#ffffff",
        animate: true,
      },
      calm: {
        amp: 0.25,
        speed: 1.0,
        minHeight: 8,
        maxHeight: 40,
        glowIntensity: 0,
        glowColor: "#ffffff",
        barColor: "#ffffff",
        animate: true,
      },
      freeze: {
        amp: 0,
        speed: 1.0,
        minHeight: 8,
        maxHeight: 40,
        glowIntensity: 0,
        glowColor: "#ffffff",
        barColor: "#ffffff",
        animate: false, // animate: false = stop
      },
    };

    this._config = {
      entity: null,
      demo: false,

      // Layout (frame)
      height: 96,
      gap: 6,
      barWidth: 10,
      barCount: 20,

      // Background / universal look
      backgroundColor: "transparent",
      cardRadius: 0,
      innerRadius: 0,
      cardPadding: 0,
      wrapperPadding: 0,
      cardBorder: false,

      // Profile control
      inactiveProfile: "calm",
      stateMap: {
        playing: "playing",
        buffering: "playing",
        paused: "calm",
        idle: "calm",
        off: "freeze",
        standby: "freeze",
        unavailable: "freeze",
        unknown: "freeze",
      },

      profiles: defaultProfiles,

      ...config,
    };

    // Deep-merge profiles
    this._config.profiles = this._mergeProfiles(
      defaultProfiles,
      config?.profiles || {}
    );

    if (!this._config.demo && !this._config.entity) {
      throw new Error("bar-visualizer-card: Set 'entity' or 'demo: true'.");
    }

    this._syncState();
  }

  _mergeProfiles(base, override) {
    const out = { ...base };
    for (const [name, obj] of Object.entries(override || {})) {
      out[name] = { ...(base[name] || {}), ...(obj || {}) };
    }
    return out;
  }

  set hass(hass) {
    this._hass = hass;
    this._syncState();
    this.requestUpdate();
  }

  get hass() {
    return this._hass;
  }

  _syncState() {
    const c = this._config || {};

    if (c.demo) {
      this._rawState = "playing";
      this._profileName = "playing";
      return;
    }

    const ent = c.entity && this._hass?.states?.[c.entity];
    const raw = ent?.state ?? "unknown";
    this._rawState = raw;

    const mapped = c.stateMap?.[raw] ?? null;
    if (mapped && c.profiles[mapped]) {
      this._profileName = mapped;
      return;
    }

    if (c.profiles[raw]) {
      this._profileName = raw;
      return;
    }

    if (raw === "playing" && c.profiles.playing) {
      this._profileName = "playing";
      return;
    }

    this._profileName =
      c.inactiveProfile in c.profiles ? c.inactiveProfile : "calm";
  }

  _num(v, fallback) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  _clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
  }

  // Accepts:
  // - "#RRGGBB" / "#RGB"
  // - "r,g,b"
  // - "rgb(r,g,b)" / "rgba(r,g,b,a)" -> extracts r,g,b
  // Returns "r,g,b" or null if not parseable.
  _toRgbTriplet(value) {
    if (value == null) return null;
    const s = String(value).trim();

    // HEX
    if (s.startsWith("#")) {
      let hex = s.slice(1).trim();
      if (hex.length === 3) hex = hex.split("").map((ch) => ch + ch).join("");
      if (hex.length === 6 && /^[0-9a-fA-F]{6}$/.test(hex)) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `${r},${g},${b}`;
      }
      return null;
    }

    // rgb()/rgba()
    const rgbFn = s.match(
      /rgba?\s*\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)/i
    );
    if (rgbFn) {
      const r = this._clamp(Math.round(Number(rgbFn[1])), 0, 255);
      const g = this._clamp(Math.round(Number(rgbFn[2])), 0, 255);
      const b = this._clamp(Math.round(Number(rgbFn[3])), 0, 255);
      return `${r},${g},${b}`;
    }

    // "r,g,b"
    const parts = s.split(",").map((p) => p.trim());
    if (
      parts.length === 3 &&
      parts.every((p) => p !== "" && !Number.isNaN(Number(p)))
    ) {
      const r = this._clamp(Math.round(Number(parts[0])), 0, 255);
      const g = this._clamp(Math.round(Number(parts[1])), 0, 255);
      const b = this._clamp(Math.round(Number(parts[2])), 0, 255);
      return `${r},${g},${b}`;
    }

    return null;
  }

  static get styles() {
    return css`
      :host { display: block; }

      .bars {
        display: flex;
        align-items: flex-end;
        justify-content: center;
        width: 100%;
      }

      .bar {
        border-radius: 999px;
        will-change: height, opacity, box-shadow;
        opacity: 0.85;
      }

      /* Height-based animation (absolute px), driven by CSS vars */
      @keyframes bounceHeight {
        0%   { height: var(--h1); opacity: 0.55; }
        35%  { height: var(--h2); opacity: 0.75; }
        70%  { height: var(--h3); opacity: 0.95; }
        100% { height: var(--h1); opacity: 0.60; }
      }
    `;
  }

  render() {
    if (!this._config) return html``;

    const c = this._config;
    const raw = this._rawState || "unknown";
    const profileName = this._profileName || "calm";
    const profile = c.profiles[profileName] || c.profiles.calm;

    const barCount = this._num(c.barCount, 20);
    const frameH = this._num(c.height, 96);
    const gap = this._num(c.gap, 6);
    const barW = this._num(c.barWidth, 10);

    // Universal look
    const cardRadius = this._num(c.cardRadius, 0);
    const innerRadius = this._num(c.innerRadius, 0);
    const cardPadding = this._num(c.cardPadding, 0);
    const wrapperPadding = this._num(c.wrapperPadding, 0);
    const cardBorder = !!c.cardBorder;

    // Background supports rgba() directly, or hex/rgb triplet -> rgb()
    let bg = String(c.backgroundColor ?? "transparent").trim();
    const bgTriplet = this._toRgbTriplet(bg);
    if (bgTriplet) bg = `rgb(${bgTriplet})`;

    // Profile params
    const amp = this._num(profile.amp, 0.25);
    const speed = Math.max(0.05, this._num(profile.speed, 1.0)); // higher = faster
    const animate = profile.animate !== false;

    // Per-profile absolute bar heights + 3px safety floor
    const minH = Math.max(3, this._num(profile.minHeight, 12));
    const maxH = Math.max(minH, this._num(profile.maxHeight, 90));

    const glowIntensity = this._num(profile.glowIntensity, 0);
    const glowColorTriplet =
      this._toRgbTriplet(profile.glowColor) ?? "255,255,255";
    const barColorTriplet =
      this._toRgbTriplet(profile.barColor) ?? "255,255,255";

    // Fixed glow blur (since radius was removed)
    const GLOW_BLUR_PX = 10;

    const bars = Array.from({ length: barCount }, (_, i) => {
      // deterministic per-index “random”
      const base = 0.25 + ((i * 37) % 100) / 250;

      // v is the per-bar "energy" (0..1-ish), influenced by amp
      const v = this._clamp(base * amp, 0, 1.2);

      // Define absolute heights for keyframes (px)
      // These are intentionally different to create the "audio" bounce.
      const h1 = minH + (maxH - minH) * this._clamp(0.20 * v, 0, 1);
      const h2 = minH + (maxH - minH) * this._clamp(0.55 * v, 0, 1);
      const h3 = minH + (maxH - minH) * this._clamp(1.00 * v, 0, 1);

      // Higher speed = faster -> shorter duration
      const dur = (0.9 + (i % 7) * 0.07) / speed;
      const delay = (i % 10) * 0.03;

      const boxShadow =
        glowIntensity > 0
          ? `0 0 ${GLOW_BLUR_PX}px rgba(${glowColorTriplet}, ${glowIntensity})`
          : "none";

      const style = `
        width:${barW}px;
        margin-left:${i === 0 ? 0 : gap}px;
        background: rgba(${barColorTriplet}, 0.90);
        box-shadow: ${boxShadow};
        --h1:${Math.round(h1)}px;
        --h2:${Math.round(h2)}px;
        --h3:${Math.round(h3)}px;
        height:${Math.round(h1)}px; /* initial */
        animation:${animate ? `bounceHeight ${dur}s ease-in-out ${delay}s infinite` : "none"};
        ${animate ? "" : `opacity:0.45;`}
      `;

      return html`<div class="bar" style="${style}"></div>`;
    });

    const wrapStyle = `
      background:${bg};
      border:${cardBorder ? "1px solid rgba(255,255,255,0.08)" : "none"};
      border-radius:${innerRadius}px;
      padding:${wrapperPadding}px;
      overflow:hidden;
    `;

    const cardStyle = `
      border-radius:${cardRadius}px;
      overflow:hidden;
    `;

    return html`
      <ha-card style="${cardStyle}">
        <div style="padding:${cardPadding}px;">
          <div class="wrap" style="${wrapStyle}"
               title="${c.entity ?? "demo"} • ha_state: ${raw} • profile: ${profileName}">
            <div class="bars" style="height:${frameH}px;">
              ${bars}
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    return 2;
  }
}

customElements.define("bar-visualizer-card", BarVisualizerCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "bar-visualizer-card",
  name: "Bar Visualizer Card",
  description:
    "Absolute-height animated bar visualizer with per-profile min/max, hex colors, animate:false, and speed> = faster.",
});
