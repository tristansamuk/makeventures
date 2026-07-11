---
title: Dial Remote
description: "A convenience device loosely based on the bed-sider idea for the cottage. "
pubDate: 2026-07-11T11:22:00.000Z
status: in-progress
heroImage: ../../assets/whatsapp-image-2026-07-11-at-11.02.36.jpeg
---
## The opportunity

When people visit the cottage they will likely not have access to  the automated entities in the cottage like smart lights, fans, etc. They could certainly load an app and get authorization etc but many don't want that nor is it practice. This sounded like yet another opportunity to automate!

My thinking was a device that can be portable, is battery powered, has a display and a rotary encoder. The user can "scroll" through devices I decide they can see and manage them (on or off or where applicable also dim/brighten). I had an integrated OLED display and rotary encoder on hand and I wanted to try out the ESP32C3 I have as well. The combo turned out to be really useful in this build and the prototype is working remarkably well.

The really cool part of the ESP32C3 is the on-board BMS that allows for the battery to be recharged via the USB. I also love the fact that it's even smaller than the legacy ESP8266 format (at the cost of GPIO pins of course). 

## Build time

So with some Claude Code help I orchestrated the build such that local devices to control can be added to the YAML for portability. I also needed to know what the batter charge was and used a voltage divider setup to get that, calibrate it and show it as a status bar on the OLED.

When devices are added they have 2 profiles, on and off or dimmable and this then determines the capability for the user. You dial to the device, click the encoder to select then control the device (on/off or dim/bright) then dial to the next etc. There is a screen timeout at 60 sec to save a bit of battery. I'm also thinking in a future release maybe I can use the sleep mode option on the ESP32 to extend battery life even more but there will be trade-offs.



Here is the current yaml:

```
################################################################################
# MVdialer — a physical "dial" remote for Home Assistant devices
# File: MVdialer.yaml
#
# WHAT IT IS
#   A knob-and-OLED puck. Turn the encoder to browse a list of HA devices; push
#   to toggle an on/off device or to enter a brightness-dial mode for a light.
#   All device control happens over the ESPHome<->HA API (homeassistant.service
#   calls); the puck itself holds no relays — it is purely a controller.
#
# HARDWARE
#   Board:   DFRobot Beetle ESP32-C3 (DFR0868-A)   Device @ 192.168.1.38
#   Display: M75-1.3-OLED-bai  = 1.3" SH1106 128x64 OLED (I2C 0x3C)
#            + EC11 rotary encoder (detented) + 3 momentary buttons
#   Pin map: SDA=8 SCL=9 | ENC_A=0 ENC_B=1 | CONFIRM=6 BACK=5 PUSH=7 | 3V3/GND
#
# ── DEVICE LIST (the thing you edit most) ─────────────────────────────────────
#   The list of controllable devices is HARD-CODED in the `load_devices` script
#   further down (search for "DEVICE LIST"). It is NOT fed from Home Assistant.
#   To add / remove / rename / reorder a device:
#       1. Edit the ADD(...) lines in load_devices — ONE LINE PER DEVICE.
#       2. Recompile on the dev Pi ESPHome container.
#       3. OTA-flash to 192.168.1.38.
#   Rationale: the old HA-fed approaches (input_text helper / template sensor)
#   were painful — the input_text state is capped at 255 chars (only a handful
#   of devices) and the label/helper round-trip was fiddly. A static in-YAML
#   list has no length limit and is edited in one place. Trade-off: adding a
#   device now needs a recompile + OTA (a couple of minutes), not a live edit.
#
# ── HOW YOU DRIVE IT ──────────────────────────────────────────────────────────
#   BROWSE mode : turn  = move through the device list (wraps around, throttled
#                         so a fast spin doesn't overshoot).
#                 OLED  = device name + type + position (n/total).
#                 PUSH  = dimmable light -> enter CONTROL mode.
#                         on/off device  -> toggle it right here.
#   CONTROL mode: (dimmable lights only)
#                 turn  = adjust brightness, live preview bar on OLED, sent to
#                         HA throttled so we don't flood it with a call/detent.
#                 PUSH  = turn the light OFF and drop back to BROWSE.
#                 BACK  = keep current level, just return to BROWSE.
#   Screen brightness has 2 active tiers via OLED contrast: medium in BROWSE,
#   brightest in CONTROL. After 60 s with no input the panel POWERS OFF (a true
#   display-off, not just a dim — the big power saving for battery use). The
#   FIRST input after power-off only WAKES the screen (it is swallowed, so you
#   never accidentally change something just by waking the puck).
#
# BUILD: 
################################################################################

# ── Tunables & pin assignments ────────────────────────────────────────────────
# Substitutions are simple text macros expanded at compile time (${name}).
# Change a pin or a timing here rather than hunting through the body below.
substitutions:
  device_internal_name: mvdialer          # ESPHome node/hostname (lowercase)
  device_friendly_name: MVdialer          # name shown in the HA UI
  # --- GPIO pin map (see header) ---
  pin_sda: GPIO8                           # I2C data  -> OLED
  pin_scl: GPIO9                           # I2C clock -> OLED
  pin_enc_a: GPIO0                         # rotary encoder channel A
  pin_enc_b: GPIO1                         # rotary encoder channel B
  pin_confirm: GPIO6                       # CONFIRM button (currently spare)
  pin_back: GPIO5                          # BACK button
  pin_push: GPIO7                          # encoder PUSH (the knob click)
  # --- behaviour tuning ---
  bright_step: "1"        # % brightness change per encoder detent in CONTROL
  browse_ms: "250"        # min ms between BROWSE steps (caps scroll speed)
  push_ms: "150"          # min ms between brightness sends to HA (anti-flood)

esphome:
  name: ${device_internal_name}
  friendly_name: ${device_friendly_name}
  # Runs once, late in boot (priority -100 = after hardware/components are up).
  # Order matters: load the device list first, then point the cursor at the
  # first entry, set the screen contrast, and arm the idle-dim timer.
  on_boot:
    priority: -100
    then:
      - script.execute: load_devices       # fill the device vectors from YAML
      - script.execute: select_device      # cur_* = list[sel_index]
      - script.execute: refresh_contrast    # set OLED brightness for the mode
      - script.execute: sleep_timer         # start the 60 s idle countdown

# Target chip / build framework. ESP32-C3 (RISC-V) on the ESP-IDF framework.
esp32:
  board: esp32-c3-devkitm-1
  variant: esp32c3
  framework:
    type: esp-idf

# Serial log over the C3's built-in USB-JTAG (no external UART needed).
logger:
  level: DEBUG
  hardware_uart: USB_SERIAL_JTAG

# Native API connection to Home Assistant (encrypted). This is also the channel
# the homeassistant.service calls below travel over.
api:
  encryption:
    key: !secret api_encryption_key

# Over-the-air update endpoint (how we reflash without USB after first flash).
ota:
  - platform: esphome
    password: !secret web_server_password

wifi:
  networks:
    - ssid: !secret wifi_ssid
      password: !secret wifi_password
  # Fallback hotspot if it can't join the network — connect to configure Wi-Fi.
  ap:
    ssid: "MVdialer Setup"
    password: !secret ap_password

captive_portal:   # serves the Wi-Fi setup page when the fallback AP is active

# I2C bus for the OLED. scan disabled (we know the address); 400 kHz fast mode
# keeps the 128x64 redraw smooth.
i2c:
  sda: ${pin_sda}
  scl: ${pin_scl}
  scan: false
  frequency: 400kHz

# ── Runtime state (in-RAM globals) ────────────────────────────────────────────
# These hold the live UI/device state. Most reset on reboot; the device list and
# brightness memory are (re)built at runtime.
globals:
  - id: ui_mode        # which screen we're on: 0 = BROWSE, 1 = CONTROL
    type: int
    initial_value: '0'
  - id: sel_index      # cursor position within the device list (0-based)
    type: int
    initial_value: '0'
  - id: bright         # working brightness 0-100 while in CONTROL
    type: int
    initial_value: '0'
  - id: is_idle        # true once the 60 s no-input timer has fired (panel off)
    type: bool
    initial_value: 'false'
  - id: cur_entity     # HA entity_id of the currently selected device
    type: std::string
    initial_value: '""'
  - id: cur_name       # friendly name of the currently selected device
    type: std::string
    initial_value: '""'
  - id: cur_dimmable   # is the selected device a dimmable light?
    type: bool
    initial_value: 'false'
  - id: last_browse_ms # millis() of the last accepted BROWSE step (throttle)
    type: uint32_t
    initial_value: '0'
  - id: last_push_ms   # millis() of the last brightness send to HA (throttle)
    type: uint32_t
    initial_value: '0'
  # ---- the device list itself, stored as three PARALLEL vectors (index i in
  #      each describes one device). Filled once by load_devices on boot. ----
  - id: dev_names      # display names,  e.g. "3D Printer Lamp"
    type: std::vector<std::string>
  - id: dev_entities   # HA entity_ids,  e.g. "light.esphome_web_..._lamp"
    type: std::vector<std::string>
  - id: dev_dim        # per-device: true = dimmable light, false = on/off
    type: std::vector<bool>
  # ---- brightness memory: entity_id -> last level. Lets a light resume at the
  #      level you left it at when you turn it back on (keyed by entity). ----
  - id: last_bright
    type: std::map<std::string, int>

# Two Roboto sizes: big for the device name, small for status lines.
font:
  - file: "gfonts://Roboto"
    id: font_big
    size: 16
  - file: "gfonts://Roboto"
    id: font_small
    size: 11

# ── Input: the rotary encoder ─────────────────────────────────────────────────
# resolution: 4 = one logical step per physical detent. Each direction just
# fires on_turn with dir +1 / -1; all the meaning (browse vs dim) lives there.
sensor:
  - platform: rotary_encoder
    id: enc
    pin_a:
      number: ${pin_enc_a}
      mode: { input: true, pullup: true }
    pin_b:
      number: ${pin_enc_b}
      mode: { input: true, pullup: true }
    resolution: 4
    on_clockwise:
      - script.execute: { id: on_turn, dir: 1 }
    on_anticlockwise:
      - script.execute: { id: on_turn, dir: -1 }

  # ── Battery voltage (external 100k/100k divider on GPIO4) ───────────────────────
  # The Beetle C3 has NO onboard BAT sense trace, so a 100k/100k divider from the
  # BAT pad feeds GPIO4 (ADC1_CH4). The pin sees ~half the cell voltage; multiply
  # by 2. Reads garbage until that divider is soldered.
  - platform: adc
    pin: GPIO4
    id: batt_v
    name: "MVdialer Battery Voltage"
    attenuation: 12db          # full-scale ~3.3 V at the pin
    update_interval: 30s
    samples: 16                # oversample to cut ADC noise
    accuracy_decimals: 2
    unit_of_measurement: "V"
    device_class: voltage
    filters:
      - multiply: 2.032        # /2 divider + C3 ADC trim (meter 4.119 V vs raw 4.054 V, 2026-07-10)
      - sliding_window_moving_average: { window_size: 3, send_every: 1 }

  # Battery % from the LiPo voltage (interpolated resting discharge curve).
  - platform: template
    name: "MVdialer Battery"
    id: batt_pct
    device_class: battery
    unit_of_measurement: "%"
    accuracy_decimals: 0
    update_interval: 30s
    lambda: |-
      float v = id(batt_v).state;
      if (isnan(v)) return {};
      // Resting 1S LiPo discharge curve (voltage -> SoC %), interpolated.
      // MVdialer is low-draw so under-load sag is minimal.  Trimmed 2026-07-10.
      static const float vt[] = {3.27f,3.61f,3.69f,3.71f,3.73f,3.75f,3.77f,3.79f,3.80f,3.82f,3.84f,3.85f,3.87f,3.91f,3.95f,3.98f,4.02f,4.08f,4.11f,4.15f,4.20f};
      static const float pc[] = {0,   5,   10,  15,  20,  25,  30,  35,  40,  45,  50,  55,  60,  65,  70,  75,  80,  85,  90,  95,  100};
      const int n = sizeof(vt) / sizeof(vt[0]);
      if (v <= vt[0])   return 0;
      if (v >= vt[n-1]) return 100;
      for (int i = 1; i < n; i++) {
        if (v < vt[i]) {
          float f = (v - vt[i-1]) / (vt[i] - vt[i-1]);
          return pc[i-1] + f * (pc[i] - pc[i-1]);
        }
      }
      return 100;

# ── Output: the OLED ──────────────────────────────────────────────────────────
# Redraws ~8x/sec. The lambda paints ONE of three screens depending on state:
# empty list, BROWSE, or CONTROL. It only reads state — never changes it.
display:
  - platform: ssd1306_i2c
    model: "SH1106 128x64"
    address: 0x3C
    id: oled
    update_interval: 120ms
    lambda: |-
      int n = id(dev_names).size();
      if (n == 0) {
        // No devices compiled in — remind the user to edit load_devices.
        it.printf(0, 0, id(font_big), "MVdialer");
        it.printf(0, 28, id(font_small), "no devices in YAML");
        return;
      }
      if (id(ui_mode) == 0) {
        // ---- BROWSE: name, type + position, and what a push will do ----
        it.printf(0, 0, id(font_big), "%s", id(cur_name).c_str());
        it.printf(0, 24, id(font_small), "%s   (%d/%d)",
                  id(cur_dimmable) ? "dimmable" : "on/off",
                  id(sel_index) + 1, n);
        it.printf(0, 38, id(font_small),
                  id(cur_dimmable) ? "push = select" : "push = toggle");
        // ---- battery gauge across the bottom:  Bat: 0[####     ]100% ----
        float bp = id(batt_pct).state;
        int bx = 34, by = 54, bw = 62, bh = 8;      // bar outline geometry
        it.printf(0, 51, id(font_small), "Bat:");                              // label
        it.printf(bx - 2, 51, id(font_small), TextAlign::TOP_RIGHT, "0");      // left end
        it.printf(bx + bw + 3, 51, id(font_small), "100%%");                   // right end
        it.rectangle(bx, by, bw, bh);                                         // empty gauge
        if (!isnan(bp)) {                                                     // fill = level
          int fill = (int) (bw * bp / 100.0f);
          if (fill > 0) it.filled_rectangle(bx, by, fill, bh);
        }
      } else {
        // ---- CONTROL: name + a brightness bar + % + hint (dimmable only) ----
        it.printf(0, 0, id(font_big), "%s", id(cur_name).c_str());
        int x = 4, y = 28, w = 120, h = 13;    // bar outline geometry
        it.rectangle(x, y, w, h);
        int fill = (int)(w * id(bright) / 100); // filled width = current level
        if (fill > 0) it.filled_rectangle(x, y, fill, h);
        it.printf(124, 45, id(font_small), TextAlign::TOP_RIGHT, "%d%%", id(bright));
        it.printf(0, 50, id(font_small), "turn=dim  push=off");
      }

# ── Scripts (the behaviour) ───────────────────────────────────────────────────
script:
  # ==========================================================================
  # DEVICE LIST  —  THIS IS THE PART YOU EDIT TO ADD/REMOVE DEVICES.
  #
  #   Add one ADD(...) line per device, then recompile + OTA (see file header).
  #     ADD("Friendly Name", "domain.entity_id", dimmable);
  #       arg 1  name     : text shown on the OLED (keep it short, ~1 line)
  #       arg 2  entity_id: the exact HA entity, e.g. light.desk_lamp
  #       arg 3  dimmable : true  -> a light with brightness; push enters the
  #                                  dim-control screen (turn = brightness)
  #                         false -> plain on/off; push just toggles it
  #   The order of the lines below is the order you scroll through on the dial.
  #   Names/entities are free text here — no 255-char limit, no HA helper.
  # ==========================================================================
  - id: load_devices
    then:
      - lambda: |-
          // Start from empty so a re-run can't duplicate entries.
          id(dev_names).clear();
          id(dev_entities).clear();
          id(dev_dim).clear();
          // Local helper: appends one device across the three parallel vectors.
          auto ADD = [](const char* name, const char* entity, bool dimmable) {
            id(dev_names).push_back(name);
            id(dev_entities).push_back(entity);
            id(dev_dim).push_back(dimmable);
          };
          // ---- add devices below, one line each ----
          ADD("3D Print Lamp", "light.esphome_Light1test", true);
          ADD("Solder Fan",      "light.esphome_Light2test",   true);
          ADD("Desk Spot",    "switch.nondimmertest1",      false);
          ADD("Bench Lamps",    "light.esphome_Light3test",      true);
          ADD("Office Uppers",    "switch.nondimmertest2",      false);
          // ---- end device list ----
          ESP_LOGI("devices", "loaded %d devices", (int) id(dev_names).size());

  # Copy the device at sel_index into the cur_* globals the OLED/buttons read.
  # Also clamps sel_index into range and handles the empty-list case.
  - id: select_device
    then:
      - lambda: |-
          int n = id(dev_names).size();
          if (n == 0) {
            id(cur_name) = "(no devices)"; id(cur_entity) = ""; id(cur_dimmable) = false;
            return;
          }
          if (id(sel_index) < 0)  id(sel_index) = 0;
          if (id(sel_index) >= n) id(sel_index) = n - 1;
          id(cur_name)     = id(dev_names)[id(sel_index)];
          id(cur_entity)   = id(dev_entities)[id(sel_index)];
          id(cur_dimmable) = id(dev_dim)[id(sel_index)];

  # Set OLED contrast for the current ACTIVE state: brightest in CONTROL, medium
  # in BROWSE. Idle is no longer a contrast tier — on timeout the panel is
  # powered off entirely (see sleep_timer), so this only runs while awake.
  - id: refresh_contrast
    then:
      - lambda: |-
          float c = (id(ui_mode) == 1) ? 1.0f     // CONTROL: brightest
                                       : 0.55f;    // BROWSE:  medium
          id(oled).set_contrast(c);

  # Called on any input. Clears idle, powers the panel back on, redraws, and
  # RESTARTS the idle timer. mode: restart = each wake resets the countdown.
  - id: wake
    mode: restart
    then:
      - lambda: 'id(is_idle) = false;'
      - lambda: 'id(oled).turn_on();'      # undo the timeout power-off
      - script.execute: refresh_contrast
      - component.update: oled
      - script.execute: sleep_timer

  # The 60 s idle countdown. mode: restart so a fresh wake cancels the pending
  # timeout and starts over. When it elapses: go idle + POWER THE PANEL OFF (a
  # true display-off for battery savings; the next input is swallowed by wake).
  - id: sleep_timer
    mode: restart
    then:
      - delay: 60s
      - lambda: 'id(is_idle) = true;'
      - lambda: 'id(oled).turn_off();'

  # BROWSE push on a dimmable light: recall its last level (default 100%), turn
  # it on at that level, and switch to CONTROL so the knob now dims it.
  - id: activate
    then:
      - lambda: |-
          int lv = 100;                              // default if never seen
          auto it = id(last_bright).find(id(cur_entity));
          if (it != id(last_bright).end()) lv = it->second;   // resume level
          id(bright) = lv;
          if (id(bright) > 100) id(bright) = 100;
          if (id(bright) < 1)   id(bright) = 1;      // never "activate" to 0
          id(ui_mode) = 1;                           // enter CONTROL
      - script.execute: send_brightness
      - script.execute: refresh_contrast

  # Return to the browse list (used by BACK, and by PUSH-off in CONTROL).
  - id: go_browse
    then:
      - lambda: 'id(ui_mode) = 0;'
      - script.execute: refresh_contrast

  # Push the working brightness to HA and remember it for this entity.
  # Stamps last_push_ms first so the throttle in brightness_out measures from
  # the send.
  - id: send_brightness
    then:
      - lambda: 'id(last_push_ms) = millis();'
      - homeassistant.service:
          service: light.turn_on
          data:
            entity_id: !lambda 'return id(cur_entity);'
            brightness_pct: !lambda 'return id(bright);'
      - lambda: 'id(last_bright)[id(cur_entity)] = id(bright);'   # remember level

  # Throttled brightness emit while turning: send immediately if enough time
  # has passed since the last send, and ALWAYS (re)arm a trailing send so the
  # final resting value lands even if the last detents were rate-limited.
  - id: brightness_out
    then:
      - if:
          condition:
            lambda: 'return (millis() - id(last_push_ms)) >= ${push_ms};'
          then:
            - script.execute: send_brightness
      - script.execute: brightness_trailing

  # The trailing send. mode: restart so each new detent pushes it out; it only
  # fires once turning stops for push_ms — that's the guaranteed final value.
  - id: brightness_trailing
    mode: restart
    then:
      - delay: ${push_ms}ms
      - script.execute: send_brightness

  # Turn the selected device fully off (works for lights and switches).
  - id: turn_off_active
    then:
      - homeassistant.service:
          service: homeassistant.turn_off
          data:
            entity_id: !lambda 'return id(cur_entity);'

  # Flip an on/off device (used by a BROWSE push on a non-dimmable device).
  - id: toggle_device
    then:
      - homeassistant.service:
          service: homeassistant.toggle
          data:
            entity_id: !lambda 'return id(cur_entity);'

  # Central handler for an encoder detent. dir = +1 (CW) or -1 (CCW).
  #   If idle -> just wake (input swallowed).
  #   Else in CONTROL -> nudge brightness (clamped 0-100).
  #        in BROWSE  -> move the cursor with wrap-around, throttled by browse_ms.
  # Then emit (CONTROL: throttled brightness) or refresh the selection (BROWSE),
  # and wake the screen.
  - id: on_turn
    parameters:
      dir: int
    then:
      - if:
          condition:
            lambda: 'return id(is_idle);'
          then:
            - script.execute: wake            # first turn after idle: wake only
          else:
            - lambda: |-
                int n = id(dev_names).size();
                if (id(ui_mode) == 1) {
                  // CONTROL: change brightness by bright_step per detent.
                  id(bright) += dir * ${bright_step};
                  if (id(bright) > 100) id(bright) = 100;
                  if (id(bright) < 0)   id(bright) = 0;
                } else if (n > 0) {
                  // BROWSE: move cursor, wrapping, but no faster than browse_ms.
                  uint32_t now = millis();
                  if (now - id(last_browse_ms) >= ${browse_ms}) {
                    id(sel_index) = (id(sel_index) + dir + n) % n;
                    id(last_browse_ms) = now;
                  }
                }
            - if:
                condition:
                  lambda: 'return id(ui_mode) == 1;'
                then:
                  - script.execute: brightness_out    # CONTROL: push new level
                else:
                  - script.execute: select_device     # BROWSE: reload cur_*
            - script.execute: wake

# ── Input: the three buttons ──────────────────────────────────────────────────
# All active-low with pull-ups; debounced 20 ms on / 50 ms off. Every button's
# first job when idle is just to WAKE (the press is swallowed).
binary_sensor:
  # PUSH = the encoder click. The main action button.
  #   CONTROL       : turn the light off, return to BROWSE.
  #   BROWSE + dim  : enter CONTROL for this light.
  #   BROWSE + on/off: toggle the device.
  - platform: gpio
    id: b_push
    pin:
      number: ${pin_push}
      inverted: true
      mode: { input: true, pullup: true }
    filters:
      - delayed_on: 20ms
      - delayed_off: 50ms
    on_press:
      - if:
          condition:
            lambda: 'return id(is_idle);'
          then:
            - script.execute: wake
          else:
            - if:
                condition:
                  lambda: 'return id(ui_mode) == 1;'
                then:
                  # In CONTROL: push = off + back to browse.
                  - script.execute: turn_off_active
                  - script.execute: go_browse
                else:
                  # In BROWSE: dimmable -> activate; on/off -> toggle.
                  - if:
                      condition:
                        lambda: 'return id(cur_dimmable);'
                      then:
                        - script.execute: activate
                      else:
                        - script.execute: toggle_device
            - script.execute: wake

  # BACK = leave CONTROL keeping the current level (no off). No-op in BROWSE.
  - platform: gpio
    id: b_back
    pin:
      number: ${pin_back}
      inverted: true
      mode: { input: true, pullup: true }
    filters:
      - delayed_on: 20ms
      - delayed_off: 50ms
    on_press:
      - if:
          condition:
            lambda: 'return id(is_idle);'
          then:
            - script.execute: wake
          else:
            - if:
                condition:
                  lambda: 'return id(ui_mode) == 1;'
                then:
                  - script.execute: go_browse
            - script.execute: wake

  # CONFIRM = reserved for a future feature; today it only logs + wakes.
  - platform: gpio
    id: b_confirm
    pin:
      number: ${pin_confirm}
      inverted: true
      mode: { input: true, pullup: true }
    filters:
      - delayed_on: 20ms
      - delayed_off: 50ms
    on_press:
      - logger.log: "CONFIRM pressed (spare)"
      - script.execute: wake

```
