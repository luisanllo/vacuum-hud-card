# Changelog

## 0.2.0

### Added

- Map section: shows the vacuum's map from a `camera` or `image` entity (`map`)
  and refreshes it without blinking when the entity updates.
- Room cleaning: pick one or more rooms under the map and send the vacuum there
  with Home Assistant's `vacuum.clean_area` (Home Assistant 2026.3+). The rooms
  are the areas mapped to the vacuum's segments; `rooms` limits and orders them.
  Shows a hint that opens the vacuum's details when no area is mapped yet.
- Sensor cleaning consumable (`sensor_cleaning` / `sensor_cleaning_reset`).
- Consumables that report time left (Roborock, Xiaomi) are shown as time left
  instead of being read as a percentage.
- Failed actions show Home Assistant's error toast.

### Fixed

- Fault sensors that read `none` or `no_error` (Roborock, Dreame) showed a
  permanent fault banner.
- The title repeated the device name ("D20 Pro Plus D20 Pro Plus") on
  integrations that name the vacuum after its device; it now uses the device name.
- A mop water `select` that's unavailable (no mop attached) showed
  "Unavailable" as a selectable option; it now shows as a note.
- The suction block vanished when the vacuum stops offering suction for a while
  (Dreame, during a clean with per-room settings); it now says it can't be
  changed right now.
- Reset buttons that are unavailable (Dreame, with the part at 100 %) are shown
  disabled.
- A double-click on a reset button armed and confirmed it in one go; the
  confirming tap now has to come a moment later.
- Updates no longer rebuild the whole card: the robot animation doesn't restart,
  the consumable bars animate, and the map doesn't reload.
- The last section no longer leaves a divider line at the bottom of the card.
- Reset buttons line up when a consumable name wraps to two lines.
- The editor's pre-fill: matches Roborock's English names for clean area and
  time, skips totals and "time left" sensors, prefers the vacuum's error sensor,
  and no longer picks Dreame's "mop pad installed" sensor as mop life.
- Numbers and durations use Home Assistant's formatting (decimal comma,
  "1 h 12 min").

## 0.1.1

- Consumables are now compact vertical bars in a single row, with the reset button under each one.

## 0.1.0

- First release: state with an animated robot, battery, start/pause/stop/dock/locate,
  suction and mop water selectors, last clean area and time, faults, and consumables
  with two-tap reset. Visual editor that pre-fills the vacuum's companion entities.
  English and Spanish.
