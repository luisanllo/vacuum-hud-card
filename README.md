<img src="https://cdn.jsdelivr.net/gh/pablopeza/vacuum-hud-card@main/images/logo.svg?v=1" alt="Vacuum HUD Card logo" width="96">

# Vacuum HUD Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/pablopeza/vacuum-hud-card/blob/main/LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/pablopeza/vacuum-hud-card)](https://github.com/pablopeza/vacuum-hud-card/releases)

An instrument-panel Lovelace card for robot vacuums in Home Assistant. State,
battery, controls, suction, mop water, last clean and consumables in a single
readable panel. It works with any `vacuum` entity: every block is optional and
hides itself when its entities aren't set.

It's the sibling of the [Weather Station Card](https://github.com/luisanllo/ecowitt-hud-card)
and shares its look, so both sit well together on a dashboard.

<img src="https://cdn.jsdelivr.net/gh/pablopeza/vacuum-hud-card@main/images/preview-light.png?v=2" alt="Light mode preview" width="380"> <img src="https://cdn.jsdelivr.net/gh/pablopeza/vacuum-hud-card@main/images/preview-dark.png?v=2" alt="Dark mode preview" width="380">

*Light and dark mode: it follows your active Home Assistant theme.*

## Features

- 🤖 Top-down robot that shows what it's doing: the side brush spins while cleaning, a ring pulses while returning, and the dock shows when it's docked
- 🔋 Battery from a battery sensor, or from the vacuum's `battery_level` attribute on older integrations
- ▶️ Start/pause, stop, return to dock and locate. Only the buttons your vacuum supports are shown
- 🌀 Suction selector from the vacuum's `fan_speed_list`
- 💧 Mop water level selector (any `select` entity)
- 📏 Last clean area and time, and a fault indicator with a banner showing the error description
- 🧽 Consumables (filter, side brush, main brush, mop) with color-coded bars and a **two-tap reset**: the first tap arms it, the second presses the reset button
- 👆 Every value opens Home Assistant's more-info dialog when tapped
- 🎨 Visual editor that **pre-fills the companion entities** of the vacuum's device (battery, faults, consumables, reset buttons…)
- 🌗 Follows Home Assistant's light/dark theme
- 🌍 UI in English or Spanish, picked from your Home Assistant language

## Installation

### Via HACS (recommended)

1. HACS → **⋮** menu (top right) → **Custom repositories**
2. URL: `https://github.com/pablopeza/vacuum-hud-card`, category **Dashboard**
3. Search for **"Vacuum HUD Card"** in HACS → Download
4. Add the resource if HACS doesn't do it for you:
   - URL: `/hacsfiles/vacuum-hud-card/vacuum-hud-card.js`
   - Type: JavaScript Module

### Manual

1. Download [`vacuum-hud-card.js`](https://github.com/pablopeza/vacuum-hud-card/blob/main/vacuum-hud-card.js) to `config/www/`
2. Settings → Dashboards → **⋮** menu → Resources → add:
   - URL: `/local/vacuum-hud-card.js`
   - Type: JavaScript Module

## Configuration

Add the card from the card picker ("Vacuum HUD Card") and the editor fills in
what it finds on your vacuum's device. Or use YAML with `type: custom:vacuum-hud-card`.
Only `entity` is required.

| Option | Required | Description |
|---|---|---|
| `entity` | ✅ | The `vacuum` entity |
| `name` | | Card title (defaults to the vacuum's name) |
| `battery` | | Battery sensor (`%`). Falls back to the vacuum's `battery_level` attribute |
| `problem` | | Fault entity: a `binary_sensor` (`device_class: problem`) or a text sensor. Its `description` attribute, if any, is shown in the banner |
| `clean_area` | | Last clean area sensor |
| `clean_time` | | Last clean time sensor |
| `water_level` | | Mop water level `select` / `input_select` |
| `filter` / `filter_reset` | | Filter life sensor (`%`) and its reset `button` (or `script`) |
| `side_brush` / `side_brush_reset` | | Side brush life sensor and its reset button |
| `main_brush` / `main_brush_reset` | | Main brush life sensor and its reset button |
| `mop` / `mop_reset` | | Mop life sensor and its reset button |
| `show_controls` | | Show the control buttons (default `true`) |
| `show_fan_speed` | | Show the suction selector (default `true`) |

### Example

```yaml
type: custom:vacuum-hud-card
entity: vacuum.conga
battery: sensor.conga_battery
problem: binary_sensor.conga_problem
clean_area: sensor.conga_clean_area
clean_time: sensor.conga_clean_time
water_level: select.conga_water_level
filter: sensor.conga_filter_life
filter_reset: button.conga_reset_filter
side_brush: sensor.conga_edge_brush_life
side_brush_reset: button.conga_reset_edge_brush
main_brush: sensor.conga_roll_brush_life
main_brush_reset: button.conga_reset_roll_brush
mop: sensor.conga_mop_life
mop_reset: button.conga_reset_mop
```

Consumable bars turn amber at 30 % and red at 10 %. The battery turns amber at
40 % and red at 20 %.

## Why

I wrote it for a Cecotec Conga 1790, a Tuya vacuum that Cecotec stopped
supporting and that now runs fully local through
[Tuya Local](https://github.com/make-all/tuya-local). Nothing in the card is
specific to it, though.

## License

[MIT](https://github.com/pablopeza/vacuum-hud-card/blob/main/LICENSE)
