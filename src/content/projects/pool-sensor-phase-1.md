---
title: Pool sensor - phase 1
description: "Knowing the pool water is too low or too high is critical info if
  you own a pool It can be the difference between  pennies to fill it or
  thousands for a new pump. "
pubDate: 2026-06-29T09:25:00.000Z
status: in-progress
heroImage: ../../assets/20260626_093940-medium-large.jpeg
---
# The initial automation

Things I thought would be helpful to measure were: Temperature both in and out of the pool, Humidity, whether the pool water level was getting too high or worse; too low. I also wanted a way to fill the pool while I was away or for convenience. I know that sounds a bit risky but I figured I would just give my self a maximum range away like at the cottage when controlling water levels knowing I can get home within a few hours and not days. All of this assumes someone from the family is checking the pool and available to shut the water off if needed.

# The build

There have been, as usual, several iterations of build. Starting it's brains with ESP8266 and now in the more current ESP32. The idea was initially to monitor pool water temp, external temp, and the upper and lower levels of pool water. Why - well I had some issues with a leak once and it almost caused the pump to run dry and that would be in the +$3,000 range to fix. I also want to know if the rain and other filling sources cause the water to go too high well before it flows over the edge and leaks in between liner causing more issues or worse the water makes it's way to the house. Temperature of course is more something my wife wants to know before she commits to a swim in the morning, reminding me that 80 F is a happy wife scenario. Finally, I wanted a display on the controller for quick viewing if I don't have my phone handy. Meanwhile I had built a second small system to power the Pool Light GFI controls - more on that in later iterations.

### First iteration

The larger design issues here were: Power safety - for the solenoid used to start/stop water flow, weather proofing the gear, corrosion resistance and distance between the pool and the controller

Sensing water depth has several possible approaches with some being "touch-less" but bulky and others being more complex like that used in water etc. tank applications. I thought I would keep things simple and just use a four channel moister sensor (using two of the channels here). The LC1BD04 board was just a few dollars at Aliexpress. The Probe Setup: You submerge raw wires into a tank at four distinct heights.Completing the Circuit: The board sends a low voltage out. When water rises and touches a wire probe, the liquid bridges the gap between the positive signal and the tank's common ground. This connection lowers the electrical resistance, allowing current to flow. Internal transistors on the board sense this flow, trigger an onboard LED, and flip the corresponding data output pin. Each wire or "electrode" pair sits at it's base along the line of what I decide is the high and low water mark. Then came the water temp sensor which I chose to use DS18B20 Temperature Sensor Probe 304 Stainless Steel. Combined, the sensors required a total of seven contacts to be able to get to the pool which is about 10 feet away. I was lucky to be able to lay a simple corrugated pipe from the area of the controller to the pool and sort of hide it next to my old-school diving-board. I used a basic 0.96 OLED to show both pool and local temp as well ar water level status. I ran a hose along with that corrugated wire pipe to the pool from the solenoid so it just sits for filling. I used a pex pipe to hold a wire probe ends and hide the thermo in it which seemed to work well and was small enough not to look too DIY.

### Automations

I had HA sense water levels and notify me and I had an critical automation that turned off the solenoid after 30 min operation no matter what turned it on.

### The experience

This is the crux of the design process - what does the user experience and what's the feedback. Well we used the system for two seasons and the Solenoid automation saved me from myself a few times as did the level indicators. My wife loved the fact I could no longer exaggerate that the pool was at a great temperature to swim.

But... after a two seasons, corrosion destroyed the level sensor wires and the system needed repair. Why? I simply did not think them through nor was I aware that salt water pool water can really corrode copper and solder ends.

### Second Iteration

The other thing I thought was a bit inefficient was the fact that the pool lights were on a separate controller and the whole pool automation entity should just be in one place. I also had Claude Code in the loop now to help. So the new plan was to build a still-well to house the sensors, make the sensor package a cartridge that can be replaced in case of severe corrosion and add the pool lights in the mix by adding another 30Amp 240V max SLA-05VDC-SL-C relay. My original design turned out to have some basic flaws as suggested by Claude so I tweaked things a bit on the main board with pull down resistors to better manage the states of contacts/electrodes. I was just powering the LC1BD04 all day but Claude's suggestion was to power it only when I am measuring in intervals since things are not happening fast and furious here. That meant powering it on measuring and then off Originally the thought was a MOSFET but the specs for the LC1BD04 allow for 3.3 V and can be simply powered using an ESP32 GPIO.

### New design features

\* Combined the pool light power source as switchable and therefor controllable via HA

\* Design a pluggable cartridge approach to the still-well that is basically a PVC pipe with a 90 degree connection sensing the pipe into the pool with all sensors inside 

\* Refined the contacts into electrodes using 301 stainless steel and stainless terminals 

\* Refined the YAML to be cleaner code, include the new power on/off of the level sensor and the pool lights

\* Added lights status to the OLED just as an indicator.

# Caveat

Probably the most critical element of this is if you are not VERY familiar with house AC power and how to connect things to it then DON'T - let and electrician do that part for you and it could even be that in your area's electrical code it is a legal requirement when it comes to pools. There are only very low 5V DC voltages in the pool sensors so that is not an issue but over at the controller and the lights, solenoid connections and relays you want be safe and certified with any power line work.

Parts

\* ESP32

\* 30Amp 240V max SLA-05VDC-SL-C relay

\* 0.96 OLED

\* DS18B20 Temperature Sensor Probe 304 Stainless Steel

\* Four channel moister sensor (using 2 here) -LC1BD04 

\* 240VAC -5VDC power converter (Modified to be a bit more safe: Original Hi-Link HLK-PM01 with fuses and thermal safty added.

\* Solinoid 

\* Hose connections

\* Wiring
