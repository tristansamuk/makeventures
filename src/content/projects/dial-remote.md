---
title: Dial Remote
description: "A convenience device loosely based on the bed-sider idea for the cottage. "
pubDate: 2026-07-11T11:22:00.000Z
status: in-progress
heroImage: ../../assets/whatsapp-image-2026-07-11-at-11.02.36.jpeg
---
## The Setup

Up at the lake I have setup a Home Assistant Green to power all automations. Things like a growing array of landscape lighting (ESP32 and MOSFITS powering and controlling 12V lights ). and bedroom lights are all coming together in that new HA setup. 

When people visit the cottage they will likely not have access to  these entities like smart lights, fans, etc. They could certainly load the HA app and get authorization etc but many don't want that nor should they have to. This sounded like yet another opportunity to automate!

My thinking was a device that is like a remote, is battery powered, has a display and a rotary encoder. The user can "scroll" through devices that I decide they can see and manage them (on or off or where applicable also dim/brighten). I had an integrated OLED display and rotary encoder on hand and I wanted to try out the ESP32C3 I have as well. The combo turned out to be really useful in this build and the prototype is working remarkably well.

The really cool part of the ESP32C3 is the on-board BMS that allows for the battery to be recharged via the USB. I also love the fact that it's even smaller than the legacy ESP8266 format (at the cost of GPIO pins of course). 

## Build time

The Claude suggested approach was to create helpers in HA which is fine but I found a bit cumbersome so next I put the device array (those devices the ESP will scroll through and allow to be controlled) right in the esphome YAML. This was ok and easier but it did mean I had recompile each time I added or removed a device so we settled on having a text file in the HA www directory that the user can update.

When devices are added to the devices file they have 2 profiles, on and off or dimmable and this then determines the capability for the user. You dial to the device with the encoder, click the encoder to select then control the device (on/off or dim/bright) then dial to the next etc. There is a screen timeout at 60 sec to save a bit of battery. We also decide to see how the deep sleep can help us with the battery life and it turned out to REALLY help from alive for 2-3 days to more than a week which was a design goal as it relates the cottage being idle for a week at a time.

Here is the outline I asked Claude to build on the design:

## What it is

MVdialer is a battery-powered **rotary "dial-a-device" remote** for Home Assistant. You turn a knob to scroll a list of HA devices on a small OLED, push the knob to act on the one you've landed on, and — for a dimmable light — keep turning to set its brightness on a live progress bar. The puck holds **no relays and no automation logic**; it is purely a controller. Every action is a Home Assistant service call sent over the encrypted ESPHome↔HA native API.

It is meant to sit on a table or counter, run for weeks on a single charge, and let anyone control the room's lights with one thumb and no phone.

- - -

## Design principles

These are the fundamentals every decision was measured against.

**P1 — Controller, not a hub.** The puck never owns device state or truth. Home Assistant is the source of truth; the puck sends commands and reflects state. This keeps the firmware small, keeps behaviour consistent with the rest of the home, and means a puck failure never strands a device.

**P2 — Smart client, HA-provided device list.** The puck owns the *fast* parts (screen drawing, selection, live brightness) locally so the UI never feels laggy. The *slow-changing* part — which devices appear on the dial — lives outside the firmware as data. Adding or renaming a device is a data edit, never a code change.

**P3 — One thumb, one knob.** The primary interaction is the encoder: turn to choose, push to act. The design deliberately collapses onto the knob rather than spreading across side buttons, so the puck is usable without looking and without instruction.

**P4 — Battery life is a first-class feature, not an afterthought.** The device spends almost all of its life asleep. The architecture is shaped around sleeping hard, waking fast, and showing correct information the instant it wakes.

**P5 — Always degrade gracefully.** A network hiccup, an HA reboot, or a bad edit to the device list must never leave the puck useless or blank. Every external dependency has a local fallback.

**P6 — Portable and re-homeable.** The puck is built and tested on the dev bench but lives at the cottage. Moving it between homes is a one-value change, and it can be re-provisioned onto a new Wi-Fi network without a computer.

**P7 — Type-generic device model.** Lights (dimmable and on/off) come first, but the internal model treats a "device" abstractly so switches, fans, and scenes can join later without reworking the core.

- - -

## How it operates

### Two modes

The UI is a small state machine with two screens:

| Mode                          | Turn the knob                                              | Push the knob                                            |
| ----------------------------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| **BROWSE**                    | Move through the device list (wraps around, speed-limited) | Dimmable → enter CONTROL; on/off → toggle it right there |
| **CONTROL** *(dimmable only)* | Adjust brightness 0–100 %, live bar on screen              | Turn the light **off** and return to BROWSE              |

BROWSE shows the device name, its type, and an **ON/OFF badge** so you can see a device's state before touching it. CONTROL shows a brightness bar and percentage.

### The lifecycle of a session

1. **Wake** — a knob turn wakes the puck (≈1–2 s to reconnect Wi-Fi). The first input after sleep only wakes the screen; it is *swallowed* so you never change something by accident just by rousing the puck.
2. **Browse** — turning moves the cursor; the screen is at a medium brightness.
3. **Activate** — pushing a dimmable turns it on at its last-used level, briefly confirms "ON", then reveals the brightness bar and brightens the screen to its highest tier.
4. **Control** — turning dims live; values are sent to HA throttled so a fast spin doesn't flood it, with a guaranteed final send when you stop.
5. **Auto-release** — after a short idle in CONTROL the puck drops itself back to BROWSE (screen still on, light left at its level), so the next thing you do is pick another device — no button press needed.
6. **Sleep** — after a longer idle the panel powers fully off and, if armed, the puck deep-sleeps until the next knob turn.

### The timers that shape the feel

| Timer                      | Default                     | Purpose                                                      |
| -------------------------- | --------------------------- | ------------------------------------------------------------ |
| Browse step throttle       | 250 ms                      | Caps scroll speed so a flick doesn't overshoot               |
| Brightness send throttle   | 150 ms (leading + trailing) | Smooth dimming without flooding HA; final value always lands |
| **CONTROL auto-release**   | **20 s**                    | Idle in CONTROL → back to BROWSE, screen still on            |
| **Panel-off / deep-sleep** | **60 s**                    | Idle anywhere → screen off; deep-sleep if armed              |
| Battery heartbeat          | 12 h                        | Self-wake to report battery, then sleep again                |

The 20 s release and the 60 s sleep are deliberately **independent**: control is handed back quickly while you're still looking at the screen, but the panel keeps its own longer clock before going dark.

### Memory that makes it feel considerate

The puck remembers, per device, the **last brightness** you set (so a light resumes where you left it) and the **last on/off state** (so the badge is right). These live in RAM keyed by entity, rebuilt as the device list loads.

- - -

## The device list: data, not code

The list of controllable devices is a **plain text file served by Home Assistant** at `http://<ha>/local/mvdialer.txt`, one device per line:

```
# Name | type | entity_id      (type = dimmable | onoff)
3D Print Lamp | dimmable | light.esphome_web_be7938_3dprinter_lamp
Desk Spot     | onoff    | switch.tuya_2_desk_spot
```

To add, rename, or reorder a device you edit that file and wake the puck. **No recompile, no OTA.**

**Why a file, and why on HA.** Earlier options each had a wall: a compiled-in list needs a reflash for every change; an HA `input_text` helper is capped at 255 characters; a label-driven template is invisible in a plain editor. A text file on HA has no length limit, is trivially editable, updates live, and — importantly — lives on the *same* Home Assistant the puck already depends on for control. That means **no new point of failure**: if HA is reachable, so is the list; if it isn't, the puck couldn't control anything anyway.

**Why a hard LAN IP in the URL.** The address is pinned to Home Assistant's local IP on purpose — no DNS, no remote/VPN path. The fetch is therefore always a plain local read. (The puck is an ordinary Wi-Fi device with no VPN client, so it *can* only reach HA locally; the pinned IP simply makes that explicit and reliable.)

**How a failure is handled (principle P5 in action):**

1. On boot the puck loads the **last list it successfully fetched**, cached in flash, so the dial is populated *instantly* — before Wi-Fi is even up.
2. Once Wi-Fi connects it fetches the file; if the content changed, it re-parses and re-caches.
3. If the fetch fails for any reason, it simply keeps the last-known list. The dial is never blank.

On a brand-new puck that has never fetched successfully, a small **compiled-in default list** covers that first boot.

**Re-homing.** Moving to the cottage is a single change: point the URL at the HA Yellow's IP. Because the Yellow serves files the same way and needs no extra software, nothing else changes — and there is no build machine required at the cottage at all.

- - -

## Power & battery model

The puck's battery strategy is built entirely around **deep sleep**:

* After 60 s of no input the ESP32 enters deep sleep, drawing microamps. It stays there until you **turn the knob**, or until a 12-hour heartbeat wakes it just long enough to report its battery level and sleep again.
* Waking on a *turn* (rather than a button) is deliberate: it needs no reach for a side control, and the encoder's A channel sits on a wake-capable pin.
* In practice, sleep draw is dominated not by the CPU but by the battery-sense divider, and everyday use (a handful of interactions a day, otherwise asleep) yields multi-week runtime per charge.

**Instant, correct battery readout on wake.** Because RAM is wiped by deep sleep, a freshly woken puck would show a blank battery gauge for a few seconds while its ADC settles. To avoid that, the **last measured voltage is persisted to flash** and painted immediately on wake, then overwritten the moment a fresh reading arrives. The gauge is therefore never blank and never stale for long.

**Dev-safe sleeping.** Deep sleep is gated behind a Home Assistant switch ("Sleep Mode"), which defaults **off**. On the bench the puck stays awake and reachable for iteration and OTA; sleeping is armed only for deployment. This guarantees an update path can never be locked out by a sleeping device.

- - -

## ESP32-C3 features we take advantage of

The controller is a **DFRobot Beetle ESP32-C3 (DFR0868-A)** — a 25 × 20.5 mm RISC-V board — built on the **ESP-IDF** framework. The design leans on several chip and board features directly:

* **Native USB Serial/JTAG.** The C3 exposes a USB peripheral, so the first flash and all debug logging go straight over USB-C with no external UART adapter. As a bonus, this frees the hardware UART pins for future use.
* **Deep sleep with RTC-domain GPIO wake.** Only a few pins on the C3 can wake the chip from deep sleep; the encoder's A channel is wired to one of them (an RTC GPIO), giving true "turn-to-wake" for microamp standby. A timer wake provides the 12-hour battery heartbeat.
* **Non-volatile storage (NVS) via the preferences API.** Both the persisted battery voltage and the cached device list survive deep sleep *and* power loss because they're written to flash. The device list is stored as a single binary **blob**, which sidesteps the small size limit that applies to persisted strings and comfortably holds the whole list.
* **ADC1 for battery sensing.** A resistor divider from the battery feeds an ADC1 channel; the firmware applies input attenuation for the full-scale range, oversamples to cut noise, and maps voltage to a state-of-charge percentage through a LiPo discharge curve.
* **Wi-Fi modem sleep + fast reconnect.** The radio is set to nap hard between beacons, and `fast_connect` skips the network scan on wake so reconnection after sleep is quick and cheap — the puck mostly *sends* commands, so a little inbound latency is invisible.
* **On-board LiPo charging.** The Beetle's built-in charger and battery connector make the puck genuinely cordless — charge over the same USB-C used to flash it.
* **Hardware I²C at 400 kHz.** The OLED is driven on the fast-mode I²C bus for a smooth ~8 fps redraw of the 128 × 64 panel.
* **GPIO interrupts with input filtering.** The encoder and buttons use interrupt-driven inputs with internal pull-ups and short debounce filters, so detents and presses are caught reliably without polling.
* **HTTP client (ESP-IDF).** The device-list fetch uses the framework's HTTP client with a short timeout, so a slow or absent server never stalls a wake.
* **Strapping-pin-aware pin map.** Pins that double as boot-strapping controls are either avoided or used only where their boot behaviour is harmless, so the board always boots cleanly.

- - -

## Why the key decisions went the way they did

| Decision                                         | Why                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------ |
| Controller-only; HA owns state                   | Small firmware, consistent behaviour, no device stranded by a puck fault (P1)  |
| Device list as an HA-hosted text file            | Live edits, no length limit, no reflash, reuses an existing dependency (P2)    |
| Pinned local IP for the list URL                 | Always a local read; explicit and reliable; the puck has no remote path anyway |
| Flash-cached list + compiled default             | Dial is instant on wake and never blanks on a failure (P5)                     |
| Encoder push as the primary action; BACK retired | One-thumb operation; fewer controls to explain (P3)                            |
| Auto-release CONTROL after 20 s                  | Hands the device back quickly so you can pick another, with no button (P3)     |
| Deep sleep with turn-to-wake                     | Multi-week battery life without a power button (P4)                            |
| Persist battery voltage to flash                 | Correct gauge the instant the screen lights up (P4)                            |
| Sleep gated behind a default-off switch          | The update path can never be locked out by a sleeping puck                     |
| Type-generic device model                        | Fans, scenes, and RF devices can be added without a core rewrite (P7)          |

- - -

## Where it can grow

The type-generic device model (P7) is the seam for future capability. The nearest planned extension is a **433 MHz RF fan**: a sub-GHz transceiver on the board's reserved SPI pins, captured-and-replayed to Home Assistant's RF platform, then added to the dial like any other device (turn = speed, push = off). The pin map already reserves the pins for it, and the OLED, control loop, and device list need no structural change to accommodate it.

So far the little idea is working well and I even encased it so it's a little more durable. Maybe this will become a future candidate for a PCB design as well.

Sorry its a bit crude but it is just a prototype also the screen draw vs the OLED screen is a bit off but is not visible in real life.

{{< video "https://vimeo.com/1210323175?share=copy&fl=sv&fe=ci" >}}
