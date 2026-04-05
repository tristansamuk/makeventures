---
layout: blog
title: Test
navTitle: test
status: complete
completedDate: 2026-04-05T14:22:00.000-04:00
heroImage: /src/assets/log-cabin.jpg
---

The cottage is four hours from home, has no cellular coverage inside, and has a well-documented history of frozen pipes. The combination of remote location, unreliable power, and expensive failure modes makes it a perfect candidate for remote monitoring — if you can get reliable connectivity at all.

## The connectivity problem

Rural Ontario is not well-served by municipal broadband. The options at the cottage are:

1. Starlink (monthly cost, requires power)
2. LTE cellular router (spotty coverage, monthly cost)
3. LoRa radio mesh (no monthly cost, requires infrastructure)

I went with option 2 for now — a cellular router with a SIM that costs about $15/month. The coverage is weak but workable. LoRa is the long-term plan.

## Deployed sensors

**Water temperature sensor:** A DS18B20 waterproof probe in the pump house. If it drops below 4°C, I get a notification. This alone justified the entire project — frozen pipes at a cottage are a multi-thousand dollar problem.

**Indoor temperature and humidity:** Two sensors in the main cabin to monitor whether the propane heater is holding temperature in winter.

**Well water level:** Float switch in the well that alerts when water level drops unexpectedly — useful for detecting pump failures before the tank runs dry.

## Power

Everything runs off a small solar panel and battery pack. The sensors are low-power ESPHome devices with deep sleep between readings — battery life is measured in months, not days.

This project is ongoing. Next phase is adding a camera for visual confirmation and a door sensor on the main entrance.
