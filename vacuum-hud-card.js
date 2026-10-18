/* Vacuum HUD Card — custom Lovelace card for Home Assistant
 * Instrument-panel style card for robot vacuums: state, battery, controls,
 * suction, mop water level, last clean stats and consumables (with reset)
 * in one panel. Works with any `vacuum` entity; every extra block is
 * optional and hides itself when not configured.
 *
 * Install via HACS (recommended):
 *   HACS -> three-dot menu -> Custom repositories -> add this repository
 *   with category "Dashboard", install, then add a card with
 *   type: custom:vacuum-hud-card
 *
 * Manual install (alternative):
 *   copy this file to config/www/, add as a Lovelace resource:
 *     url: /local/vacuum-hud-card.js
 *     type: module
 *
 * UI language follows Home Assistant's configured language automatically.
 * Supported languages: English (en), Spanish (es). Others fall back to
 * English.
 */

const VERSION = "0.1.1";

const STRINGS = {
  en: {
    editor: {
      general: "General",
      status: "Status",
      consumables: "Consumables",
      display: "Display",
      entity: "Vacuum",
      name: "Name (optional)",
      battery: "Battery sensor (optional, else the vacuum's battery attribute)",
      problem: "Problem / error sensor",
      cleanArea: "Clean area sensor",
      cleanTime: "Clean time sensor",
      waterLevel: "Mop water level (select)",
      filter: "Filter life (%)",
      filterReset: "Filter reset button",
      sideBrush: "Side brush life (%)",
      sideBrushReset: "Side brush reset button",
      mainBrush: "Main brush life (%)",
      mainBrushReset: "Main brush reset button",
      mop: "Mop life (%)",
      mopReset: "Mop reset button",
      showControls: "Show control buttons",
      showFanSpeed: "Show suction selector",
    },
    states: {
      cleaning: "Cleaning",
      docked: "Docked",
      idle: "Idle",
      paused: "Paused",
      returning: "Returning",
      error: "Error",
      unavailable: "Unavailable",
      unknown: "Unknown",
    },
    actions: { start: "Start", pause: "Pause", stop: "Stop", home: "Dock", locate: "Locate" },
    speeds: {
      off: "Off", quiet: "Quiet", silent: "Silent", low: "Low", eco: "Eco", standard: "Standard",
      normal: "Normal", balanced: "Balanced", medium: "Medium", high: "High", strong: "Strong",
      turbo: "Turbo", max: "Max", "max+": "Max+", very_high: "Very high", auto: "Auto",
    },
    labels: {
      battery: "Battery",
      suction: "Suction",
      water: "Mop water",
      area: "Clean area",
      time: "Clean time",
      health: "Faults",
      noFaults: "None",
      fault: "Fault",
      consumables: "Consumables",
      filter: "Filter",
      sideBrush: "Side brush",
      mainBrush: "Main brush",
      mop: "Mop",
      reset: "Reset",
      confirmReset: "Reset?",
      done: "Done",
      notFound: "Entity not found",
    },
  },
  es: {
    editor: {
      general: "General",
      status: "Estado",
      consumables: "Consumibles",
      display: "Pantalla",
      entity: "Aspirador",
      name: "Nombre (opcional)",
      battery: "Sensor de batería (opcional; si no, el atributo del aspirador)",
      problem: "Sensor de avería / error",
      cleanArea: "Sensor de área limpiada",
      cleanTime: "Sensor de tiempo de limpieza",
      waterLevel: "Agua de la mopa (select)",
      filter: "Vida del filtro (%)",
      filterReset: "Botón de reset del filtro",
      sideBrush: "Vida del cepillo lateral (%)",
      sideBrushReset: "Botón de reset del cepillo lateral",
      mainBrush: "Vida del cepillo principal (%)",
      mainBrushReset: "Botón de reset del cepillo principal",
      mop: "Vida de la mopa (%)",
      mopReset: "Botón de reset de la mopa",
      showControls: "Mostrar los botones de control",
      showFanSpeed: "Mostrar el selector de succión",
    },
    states: {
      cleaning: "Limpiando",
      docked: "En la base",
      idle: "Parado",
      paused: "En pausa",
      returning: "Volviendo",
      error: "Error",
      unavailable: "No disponible",
      unknown: "Desconocido",
    },
    actions: { start: "Empezar", pause: "Pausar", stop: "Parar", home: "Base", locate: "Localizar" },
    speeds: {
      off: "Apagado", quiet: "Silencioso", silent: "Silencioso", low: "Baja", eco: "Eco", standard: "Estándar",
      normal: "Normal", balanced: "Equilibrada", medium: "Media", high: "Alta", strong: "Fuerte",
      turbo: "Turbo", max: "Máx", "max+": "Máx+", very_high: "Muy alta", auto: "Auto",
    },
    labels: {
      battery: "Batería",
      suction: "Succión",
      water: "Agua de la mopa",
      area: "Área limpiada",
      time: "Tiempo limpiando",
      health: "Averías",
      noFaults: "Ninguna",
      fault: "Avería",
      consumables: "Consumibles",
      filter: "Filtro",
      sideBrush: "Cepillo lateral",
      mainBrush: "Cepillo principal",
      mop: "Mopa",
      reset: "Resetear",
      confirmReset: "¿Resetear?",
      done: "Hecho",
      notFound: "No se encuentra la entidad",
    },
  },
};

// Same palette as the Ecowitt HUD card, so both cards sit well together.
const COLORS = {
  info: "#3b82c4",
  low: "#2ba86a",
  moderate: "#c78a00",
  danger: "#d1481c",
  neutral: "#8a92a3",
  accent: "#f5a623",
};

const STATE_COLORS = {
  cleaning: COLORS.low,
  returning: COLORS.info,
  paused: COLORS.moderate,
  error: COLORS.danger,
};

// VacuumEntityFeature bits
const F = { PAUSE: 4, STOP: 8, RETURN_HOME: 16, FAN_SPEED: 32, LOCATE: 512, START: 8192 };

const ICONS = {
  play: "M8,5.14V19.14L19,12.14L8,5.14Z",
  pause: "M14,19H18V5H14M6,19H10V5H6V19Z",
  stop: "M18,18H6V6H18V18Z",
  home: "M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z",
  locate:
    "M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z",
  reset:
    "M13,3A9,9 0 0,0 4,12H1L4.89,15.89L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z",
  check: "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",
  alert:
    "M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",
};

const CONSUMABLES = [
  { key: "filter", reset: "filter_reset", label: "filter" },
  { key: "side_brush", reset: "side_brush_reset", label: "sideBrush" },
  { key: "main_brush", reset: "main_brush_reset", label: "mainBrush" },
  { key: "mop", reset: "mop_reset", label: "mop" },
];

const CONFIRM_MS = 3000;

function detectLang(hass) {
  const raw =
    (hass && hass.locale && hass.locale.language) ||
    (hass && hass.language) ||
    (typeof navigator !== "undefined" && navigator.language) ||
    "en";
  const lang = String(raw).toLowerCase().replace(/_/g, "-").split("-")[0];
  return Object.prototype.hasOwnProperty.call(STRINGS, lang) ? lang : "en";
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function icon(name, size = 20) {
  return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24"><path d="${ICONS[name]}"/></svg>`;
}

function levelColor(pct, warn, crit) {
  if (pct == null) return COLORS.neutral;
  if (pct <= crit) return COLORS.danger;
  if (pct <= warn) return COLORS.moderate;
  return COLORS.low;
}

function num(st) {
  if (!st) return null;
  const v = parseFloat(st.state);
  return isNaN(v) ? null : v;
}

function isOn(st) {
  return !!st && st.state !== "off" && st.state !== "unavailable" && st.state !== "unknown" && st.state !== "0" && st.state !== "ok";
}

// Top-down robot: the side brush spins while cleaning, a ring pulses while
// returning, and a dock bar shows under it when docked.
function robotSvg(state, color) {
  return `
    <svg class="robot ${esc(state)}" viewBox="0 0 72 72" style="--c:${color}">
      <rect class="dock" x="16" y="63" width="40" height="5" rx="2.5"/>
      <circle class="ring" cx="36" cy="34" r="29"/>
      <circle class="body" cx="36" cy="34" r="25"/>
      <circle class="face" cx="36" cy="34" r="18"/>
      <path class="bumper" d="M15.5 21.5A25 25 0 0 1 56.5 21.5"/>
      <rect class="eye" x="31" y="13" width="10" height="4" rx="2"/>
      <circle class="button" cx="36" cy="38" r="5"/>
      <g class="brush">
        <path d="M19 18v-9M19 18l7.8 4.5M19 18l-7.8 4.5"/>
        <circle cx="19" cy="18" r="2.2"/>
      </g>
    </svg>`;
}

// Battery glyph like the one in the Ecowitt card preview.
function batterySvg(pct, color) {
  const w = pct == null ? 0 : Math.max(1, Math.round((13 * Math.min(100, pct)) / 100));
  return `
    <svg width="22" height="12" viewBox="0 0 22 12">
      <rect x="0.7" y="0.7" width="17.6" height="10.6" rx="2" fill="none" stroke="${color}" stroke-width="1.4"/>
      <rect x="18.6" y="3.5" width="2.6" height="5" rx="0.8" fill="${color}"/>
      <rect x="2.6" y="2.6" width="${w}" height="6.8" rx="1" fill="${color}"/>
    </svg>`;
}

// Guess the companion entities of a vacuum from the other entities of the
// same device. Only used to pre-fill a new card (getStubConfig).
function guessEntities(hass, vacuumId) {
  const out = {};
  const reg = hass && hass.entities;
  const dev = reg && reg[vacuumId] && reg[vacuumId].device_id;
  if (!dev) return out;
  const siblings = Object.values(reg).filter((e) => e.device_id === dev && e.entity_id !== vacuumId);
  const text = (id) => {
    const st = hass.states[id];
    return `${id} ${(st && st.attributes.friendly_name) || ""}`.toLowerCase();
  };
  const find = (domain, test) => {
    const hit = siblings.find((e) => e.entity_id.startsWith(domain + ".") && test(hass.states[e.entity_id], text(e.entity_id)));
    return hit && hit.entity_id;
  };
  const dc = (st, cls) => !!st && st.attributes.device_class === cls;
  const set = (key, id) => {
    if (id) out[key] = id;
  };
  set("battery", find("sensor", (st) => dc(st, "battery")));
  set("problem", find("binary_sensor", (st) => dc(st, "problem")));
  set("clean_area", find("sensor", (st, t) => dc(st, "area") || /clean.?area|área/.test(t)));
  set("clean_time", find("sensor", (st, t) => /clean.?time|tiempo/.test(t)));
  set("water_level", find("select", (st, t) => /water|mop|fregad|agua|scrub/.test(t)));
  const parts = {
    filter: /filter|filtro/,
    side_brush: /side|edge|lateral/,
    main_brush: /main|roll|rodillo|principal/,
    mop: /mop|mopa/,
  };
  for (const [key, re] of Object.entries(parts)) {
    set(key, find("sensor", (st, t) => re.test(t)));
    set(`${key}_reset`, find("button", (st, t) => re.test(t)));
  }
  return out;
}

class VacuumHudCardEditor extends HTMLElement {
  _withDefaults(config) {
    return { show_controls: true, show_fan_speed: true, ...(config || {}) };
  }
  setConfig(config) {
    this._config = this._withDefaults(config);
    if (this._form) {
      this._form.data = this._config;
      return;
    }
    this._render();
  }
  set hass(hass) {
    this._hass = hass;
    if (this._form && this._builtLang === detectLang(hass)) {
      this._form.hass = hass;
      return;
    }
    this._render();
  }
  connectedCallback() {
    if (!this._form) this._render();
  }
  _schema(E) {
    const ent = (name, label, domain) => ({ name, label, selector: { entity: domain ? { domain } : {} } });
    return [
      {
        type: "expandable", name: "general", title: E.general, flatten: true, expanded: true,
        schema: [
          { ...ent("entity", E.entity, "vacuum"), required: true },
          { name: "name", label: E.name, selector: { text: {} } },
          ent("battery", E.battery, "sensor"),
        ],
      },
      {
        type: "expandable", name: "status", title: E.status, flatten: true,
        schema: [
          ent("problem", E.problem, ["binary_sensor", "sensor"]),
          ent("clean_area", E.cleanArea, "sensor"),
          ent("clean_time", E.cleanTime, "sensor"),
          ent("water_level", E.waterLevel, ["select", "input_select"]),
        ],
      },
      {
        type: "expandable", name: "consumables", title: E.consumables, flatten: true,
        schema: [
          ent("filter", E.filter, "sensor"),
          ent("filter_reset", E.filterReset, ["button", "script"]),
          ent("side_brush", E.sideBrush, "sensor"),
          ent("side_brush_reset", E.sideBrushReset, ["button", "script"]),
          ent("main_brush", E.mainBrush, "sensor"),
          ent("main_brush_reset", E.mainBrushReset, ["button", "script"]),
          ent("mop", E.mop, "sensor"),
          ent("mop_reset", E.mopReset, ["button", "script"]),
        ],
      },
      {
        type: "expandable", name: "display", title: E.display, flatten: true,
        schema: [
          { name: "show_controls", label: E.showControls, selector: { boolean: {} } },
          { name: "show_fan_speed", label: E.showFanSpeed, selector: { boolean: {} } },
        ],
      },
    ];
  }
  _render() {
    if (!this._hass || !this._config) return;
    this._builtLang = detectLang(this._hass);
    this.innerHTML = "";
    const form = document.createElement("ha-form");
    form.hass = this._hass;
    form.data = this._config;
    form.schema = this._schema(STRINGS[this._builtLang].editor);
    form.computeLabel = (s) => s.label || s.title || s.name;
    form.addEventListener("value-changed", (ev) => {
      this._config = ev.detail.value;
      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
    });
    this._form = form;
    this.appendChild(form);
  }
}
customElements.define("vacuum-hud-card-editor", VacuumHudCardEditor);

class VacuumHudCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("vacuum-hud-card-editor");
  }
  static getStubConfig(hass) {
    const entity = Object.keys((hass && hass.states) || {}).find((id) => id.startsWith("vacuum."));
    return entity ? { entity, ...guessEntities(hass, entity) } : { entity: "" };
  }
  constructor() {
    super();
    this._confirm = {}; // reset entity -> "confirm" | "done"
    this._timers = {};
  }
  setConfig(config) {
    if (!config || !config.entity) throw new Error("vacuum-hud-card: 'entity' is required");
    this._config = config;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    }
    this._sig = null;
    this._render();
  }
  set hass(hass) {
    this._hass = hass;
    // Only re-render when one of our entities (or the language) changed.
    const sig = this._signature();
    if (sig === this._sig) return;
    this._render();
  }
  getCardSize() {
    return 7;
  }
  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }
  disconnectedCallback() {
    Object.values(this._timers).forEach(clearTimeout);
    this._timers = {};
    this._confirm = {};
  }
  _ids() {
    const c = this._config;
    const keys = ["entity", "battery", "problem", "clean_area", "clean_time", "water_level"];
    CONSUMABLES.forEach((x) => keys.push(x.key, x.reset));
    return keys.map((k) => c[k]).filter(Boolean);
  }
  _signature() {
    if (!this._hass || !this._config) return null;
    // HA replaces a state object whenever it changes, so comparing
    // last_updated stamps is enough.
    const parts = this._ids().map((id) => {
      const st = this._hass.states[id];
      return st ? st.last_updated + st.state : "-";
    });
    return detectLang(this._hass) + "|" + parts.join("|") + "|" + JSON.stringify(this._confirm);
  }
  _st(key) {
    const id = this._config[key];
    return id ? this._hass.states[id] : undefined;
  }
  _call(domain, service, data) {
    this._hass.callService(domain, service, data);
  }
  _moreInfo(entityId) {
    if (!entityId || !this._hass.states[entityId]) return;
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }
  _onClick(ev) {
    const el = ev.target.closest("[data-action]");
    if (!el || !this._hass) return;
    const { action, value } = el.dataset;
    const entity_id = this._config.entity;
    switch (action) {
      case "more-info":
        this._moreInfo(value);
        break;
      case "vacuum":
        this._call("vacuum", value, { entity_id });
        break;
      case "fan":
        this._call("vacuum", "set_fan_speed", { entity_id, fan_speed: value });
        break;
      case "water": {
        const id = this._config.water_level;
        this._call(id.split(".")[0], "select_option", { entity_id: id, option: value });
        break;
      }
      case "reset":
        this._reset(value);
        break;
    }
  }
  // Resetting a consumable needs two taps: the first arms it for a few
  // seconds, the second presses the button.
  _reset(id) {
    clearTimeout(this._timers[id]);
    if (this._confirm[id] === "confirm") {
      const domain = id.split(".")[0];
      if (domain === "script") this._call("script", "turn_on", { entity_id: id });
      else this._call("button", "press", { entity_id: id });
      this._confirm[id] = "done";
    } else {
      this._confirm[id] = "confirm";
    }
    this._render();
    this._timers[id] = setTimeout(() => {
      delete this._confirm[id];
      this._render();
    }, CONFIRM_MS);
  }
  _stateLabel(st, S) {
    if (!st) return S.labels.notFound;
    if (S.states[st.state]) return S.states[st.state];
    return this._hass.formatEntityState ? this._hass.formatEntityState(st) : st.state;
  }
  _speedLabel(st, value, S) {
    const k = String(value).toLowerCase().replace(/\s+/g, "_");
    if (S.speeds[k]) return S.speeds[k];
    return this._hass.formatEntityAttributeValue ? this._hass.formatEntityAttributeValue(st, "fan_speed", value) : value;
  }
  _optionLabel(st, value, S) {
    const k = String(value).toLowerCase().replace(/\s+/g, "_");
    if (S.speeds[k]) return S.speeds[k];
    return this._hass.formatEntityState ? this._hass.formatEntityState(st, value) : value;
  }
  _fmt(st) {
    if (!st) return { v: "—", u: "" };
    const v = num(st);
    const u = st.attributes.unit_of_measurement || "";
    if (v == null) return { v: esc(st.state), u: "" };
    return { v: esc(Math.round(v * 10) / 10), u: esc(u) };
  }
  _render() {
    if (!this.shadowRoot || !this._config || !this._hass) return;
    this._sig = this._signature();
    const lang = detectLang(this._hass);
    const S = STRINGS[lang];
    const c = this._config;
    const vac = this._st("entity");
    const state = vac ? vac.state : "unavailable";
    const color = STATE_COLORS[state] || COLORS.neutral;
    const features = (vac && vac.attributes.supported_features) || 0;
    const has = (bit) => (features & bit) === bit;
    const name = c.name || (vac && vac.attributes.friendly_name) || c.entity;

    // Battery: dedicated sensor, else the (deprecated) vacuum attribute.
    const batSt = this._st("battery");
    const bat = batSt ? num(batSt) : vac && vac.attributes.battery_level != null ? Number(vac.attributes.battery_level) : null;
    const batColor = levelColor(bat, 40, 20);

    let sub = "";
    if (vac && vac.attributes.fan_speed) {
      sub = `${S.labels.suction}: ${esc(this._speedLabel(vac, vac.attributes.fan_speed, S))}`;
    }

    const hero = `
      <div class="row hero divider">
        <div class="clickable robot-wrap" data-action="more-info" data-value="${esc(c.entity)}">${robotSvg(state, color)}</div>
        <div class="hero-main clickable" data-action="more-info" data-value="${esc(c.entity)}">
          <div class="hero-state">${esc(this._stateLabel(vac, S))}</div>
          ${sub ? `<div class="hero-sub">${sub}</div>` : ""}
        </div>
        ${
          bat == null
            ? ""
            : `<div class="battery clickable" data-action="more-info" data-value="${esc(c.battery || c.entity)}">
                <div class="battery-row">${batterySvg(bat, batColor)}<span class="battery-pct">${Math.round(bat)}%</span></div>
                <div class="battery-label">${S.labels.battery}</div>
              </div>`
        }
      </div>`;

    // Problem banner
    const prob = this._st("problem");
    let banner = "";
    if (isOn(prob) || state === "error") {
      const d = prob && prob.attributes.description && prob.attributes.description !== "ok" ? prob.attributes.description : "";
      const text = d || (prob && prob.state !== "on" ? prob.state : S.labels.fault);
      banner = `<div class="banner clickable" data-action="more-info" data-value="${esc(c.problem || c.entity)}">${icon("alert", 18)}<span>${esc(text)}</span></div>`;
    }

    // Controls
    let controls = "";
    if (vac && c.show_controls !== false) {
      const btns = [];
      const cleaning = state === "cleaning";
      if (cleaning && has(F.PAUSE)) btns.push(["pause", "pause", S.actions.pause, true]);
      else if (has(F.START)) btns.push(["start", "play", S.actions.start, true]);
      if (has(F.STOP)) btns.push(["stop", "stop", S.actions.stop, false]);
      if (has(F.RETURN_HOME)) btns.push(["return_to_base", "home", S.actions.home, false]);
      if (has(F.LOCATE)) btns.push(["locate", "locate", S.actions.locate, false]);
      if (btns.length) {
        controls = `<div class="row controls divider">${btns
          .map(
            ([svc, ic, label, primary]) =>
              `<button class="ctl${primary ? " primary" : ""}" data-action="vacuum" data-value="${svc}" title="${esc(label)}">
                <span class="ctl-ic">${icon(ic, 22)}</span><span class="ctl-label">${esc(label)}</span>
              </button>`
          )
          .join("")}</div>`;
      }
    }

    // Suction + mop water pills
    const pillRow = (label, options, current, action, fmt) =>
      `<div class="pills-block">
        <div class="section-label">${esc(label)}</div>
        <div class="pills">${options
          .map((o) => `<button class="pill${o === current ? " on" : ""}" data-action="${action}" data-value="${esc(o)}">${esc(fmt(o))}</button>`)
          .join("")}</div>
      </div>`;
    let pills = "";
    const speeds = vac && vac.attributes.fan_speed_list;
    if (c.show_fan_speed !== false && has(F.FAN_SPEED) && Array.isArray(speeds) && speeds.length) {
      pills += pillRow(S.labels.suction, speeds, vac.attributes.fan_speed, "fan", (o) => this._speedLabel(vac, o, S));
    }
    const water = this._st("water_level");
    if (water && Array.isArray(water.attributes.options)) {
      pills += pillRow(S.labels.water, water.attributes.options, water.state, "water", (o) => this._optionLabel(water, o, S));
    }
    if (pills) pills = `<div class="pills-wrap divider">${pills}</div>`;

    // Stats
    const stats = [];
    const statHtml = (key, label, inner) =>
      `<div class="stat clickable" data-action="more-info" data-value="${esc(c[key])}"><div class="stat-val">${inner}</div><div class="stat-label">${esc(label)}</div></div>`;
    for (const [key, label] of [["clean_area", S.labels.area], ["clean_time", S.labels.time]]) {
      if (!c[key]) continue;
      const f = this._fmt(this._st(key));
      stats.push(statHtml(key, label, `${f.v}<span class="stat-unit"> ${f.u}</span>`));
    }
    if (prob) {
      const bad = isOn(prob);
      stats.push(
        statHtml(
          "problem",
          S.labels.health,
          `<span style="color:${bad ? COLORS.danger : COLORS.low}">${icon(bad ? "alert" : "check", 16)}</span><span class="stat-txt">${esc(bad ? S.labels.fault : S.labels.noFaults)}</span>`
        )
      );
    }
    const statsHtml = stats.length ? `<div class="grid divider">${stats.join("")}</div>` : "";

    // Consumables
    const rows = CONSUMABLES.filter((x) => c[x.key])
      .map((x) => {
        const st = this._st(x.key);
        const v = num(st);
        const pct = v == null ? null : Math.max(0, Math.min(100, v));
        const col = levelColor(pct, 30, 10);
        const rid = c[x.reset];
        const mode = rid && this._confirm[rid];
        const resetBtn = rid
          ? `<button class="reset${mode ? " " + mode : ""}" data-action="reset" data-value="${esc(rid)}" title="${esc(S.labels.reset)}">
              ${icon(mode === "done" ? "check" : "reset", 15)}${mode === "confirm" ? `<span>${esc(S.labels.confirmReset)}</span>` : ""}
            </button>`
          : "";
        return `<div class="cons">
          <div class="cons-main clickable" data-action="more-info" data-value="${esc(c[x.key])}">
            <span class="cons-pct" style="color:${col}">${pct == null ? "—" : Math.round(pct) + "%"}</span>
            <div class="track"><div class="fill" style="height:${pct || 0}%;background:${col}"></div></div>
            <span class="cons-name">${esc(S.labels[x.label])}</span>
          </div>
          ${resetBtn}
        </div>`;
      })
      .join("");
    const consHtml = rows ? `<div class="cons-wrap"><div class="section-label">${S.labels.consumables}</div><div class="cons-grid">${rows}</div></div>` : "";

    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <ha-card>
        <div class="title">${esc(name)}</div>
        ${hero}${banner}${controls}${pills}${statsHtml}${consHtml}
      </ha-card>`;
  }
}

const STYLE = `
  :host { display: block; }
  ha-card { display: block; padding: 22px 24px; background: var(--ha-card-background, var(--card-background-color, #fff)); color: var(--primary-text-color, #1c2128); font-family: -apple-system, "Segoe UI", Roboto, sans-serif; overflow: hidden; border-radius: var(--ha-card-border-radius, 12px); box-shadow: var(--ha-card-box-shadow, 0 1px 3px rgba(0,0,0,.12)); border: 1px solid var(--divider-color, rgba(0,0,0,.06)); box-sizing: border-box; height: 100%; }
  .clickable { cursor: pointer; border-radius: 6px; transition: background .15s ease; }
  .clickable:hover { background: rgba(127,127,127,.12); }
  .clickable:active { background: rgba(127,127,127,.18); }
  .title { font-size: 13px; font-weight: 600; color: var(--secondary-text-color, #70788a); margin: 0 0 14px; letter-spacing: .02em; }
  .row { display: flex; }
  .divider { border-bottom: 1px solid var(--divider-color, rgba(0,0,0,.08)); }
  .ic { fill: currentColor; display: inline-block; vertical-align: middle; flex: none; }
  .section-label { font-size: 9px; letter-spacing: .08em; color: var(--secondary-text-color, #8a92a3); margin-bottom: 7px; text-transform: uppercase; font-weight: 600; }

  .hero { align-items: center; gap: 14px; padding-bottom: 16px; }
  .robot-wrap { flex: none; padding: 2px; }
  .robot { width: 64px; height: 64px; display: block; overflow: visible; }
  .robot .body { fill: var(--card-background-color, #fff); stroke: var(--c); stroke-width: 2.4; }
  .robot .face { fill: var(--c); opacity: .12; }
  .robot .bumper { fill: none; stroke: var(--c); stroke-width: 4; stroke-linecap: round; opacity: .55; }
  .robot .eye { fill: var(--c); opacity: .7; }
  .robot .button { fill: var(--c); }
  .robot .brush { stroke: ${COLORS.accent}; stroke-width: 2; stroke-linecap: round; fill: ${COLORS.accent}; transform-box: view-box; transform-origin: 19px 18px; }
  .robot .ring { fill: none; stroke: var(--c); stroke-width: 1.5; opacity: 0; transform-box: view-box; transform-origin: 36px 34px; }
  .robot .dock { fill: var(--secondary-text-color, #8a92a3); opacity: 0; }
  .robot.cleaning .brush { animation: spin .7s linear infinite; }
  .robot.returning .ring { animation: pulse 1.6s ease-out infinite; }
  .robot.docked .dock { opacity: .45; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { from { opacity: .7; transform: scale(.85); } to { opacity: 0; transform: scale(1.15); } }
  @media (prefers-reduced-motion: reduce) { .robot .brush, .robot .ring { animation: none !important; } }

  .hero-main { flex: 1; min-width: 0; padding: 4px 6px; }
  .hero-state { font-size: 28px; font-weight: 600; line-height: 1.1; }
  .hero-sub { font-size: 12px; color: var(--secondary-text-color, #70788a); margin-top: 5px; }
  .battery { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 2px; padding: 4px 6px; flex: none; }
  .battery-row { display: flex; align-items: center; gap: 5px; }
  .battery-pct { font-size: 15px; font-weight: 600; }
  .battery-label { font-size: 9px; color: var(--secondary-text-color, #70788a); }

  .banner { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 8px 10px; background: rgba(209,72,28,.1); color: ${COLORS.danger}; font-size: 12px; font-weight: 600; }

  button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }
  .controls { justify-content: space-around; gap: 8px; padding: 16px 0; }
  .ctl { display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 56px; }
  .ctl-ic { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid var(--divider-color, rgba(0,0,0,.12)); color: var(--primary-text-color, #1c2128); transition: background .15s ease, transform .1s ease; }
  .ctl:hover .ctl-ic { background: rgba(127,127,127,.12); }
  .ctl:active .ctl-ic { transform: scale(.94); }
  .ctl.primary .ctl-ic { background: ${COLORS.low}; border-color: ${COLORS.low}; color: #fff; }
  .ctl.primary:hover .ctl-ic { background: #24935c; }
  .ctl-label { font-size: 9.5px; color: var(--secondary-text-color, #70788a); }

  .pills-wrap { display: flex; flex-direction: column; gap: 14px; padding: 16px 0; }
  .pills { display: flex; flex-wrap: wrap; gap: 6px; }
  .pill { font-size: 11.5px; padding: 5px 11px; border-radius: 999px; border: 1px solid var(--divider-color, rgba(0,0,0,.12)); color: var(--secondary-text-color, #70788a); transition: background .15s ease; }
  .pill:hover { background: rgba(127,127,127,.12); }
  .pill.on { background: ${COLORS.info}; border-color: ${COLORS.info}; color: #fff; font-weight: 600; }

  .grid { display: flex; flex-wrap: wrap; gap: 18px 28px; padding: 14px 0; }
  .stat { padding: 2px 6px; margin: 0 -6px; }
  .stat-val { font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
  .stat-unit { font-size: 12px; color: var(--secondary-text-color, #70788a); font-weight: 400; }
  .stat-txt { font-size: 14px; }
  .stat-label { font-size: 9.5px; color: var(--secondary-text-color, #70788a); margin-top: 2px; }

  .cons-wrap { padding-top: 16px; }
  .cons-grid { display: flex; justify-content: space-around; gap: 4px; }
  .cons { display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; min-width: 0; }
  .cons-main { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 4px 6px; width: 100%; box-sizing: border-box; }
  .cons-pct { font-size: 13px; font-weight: 600; }
  .cons-name { font-size: 9.5px; color: var(--secondary-text-color, #70788a); text-align: center; line-height: 1.2; }
  .track { width: 8px; height: 40px; border-radius: 4px; background: var(--divider-color, rgba(0,0,0,.07)); overflow: hidden; display: flex; align-items: flex-end; }
  .fill { width: 100%; border-radius: 4px; transition: height .4s ease; }
  .reset { display: flex; align-items: center; gap: 4px; height: 28px; min-width: 28px; justify-content: center; border-radius: 14px; color: var(--secondary-text-color, #8a92a3); font-size: 10.5px; font-weight: 600; transition: background .15s ease; }
  .reset:hover { background: rgba(127,127,127,.12); }
  .reset.confirm { background: rgba(209,72,28,.12); color: ${COLORS.danger}; padding: 0 8px; font-size: 9.5px; }
  .reset.done { color: ${COLORS.low}; }
`;

customElements.define("vacuum-hud-card", VacuumHudCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "vacuum-hud-card",
  name: "Vacuum HUD Card",
  description: "Instrument-panel robot vacuum card: state, battery, controls, suction, mop water, last clean and consumables with reset",
  preview: true,
  documentationURL: "https://github.com/pablopeza/vacuum-hud-card",
});

console.info(`%c VACUUM-HUD-CARD %c v${VERSION} `, "color:#fff;background:#3b82c4;font-weight:600", "color:#3b82c4");
