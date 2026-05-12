---
title: The bedsider
description: "A device that controls dimmable lights. Like those typically
  beside the bed and both lights can be controlled (dim and on/off) "
pubDate: 2026-05-11T21:17:00.000Z
heroImage: ""
tags:
  - Lighting
author: Igor Samuk
---
I've had this light control idea brewing for a while and I finally thought I would just build it to see if it's just me being lazy or the the device will be useful.  The basic premise is a small box with a rotary encoder, a switch and 2 leds. Each Led represents one of the two possible lights to control. Think your bedside light and that of your partner (assuming you sleep with one) Control means you can turn it on/off or dim it. 

The two lights in my room are z-wave controlled so I needed to integrate that into the design. 

What I came up with is an esphome device that has 2 LEDs, a rotary encoder and a momentary switch. On boot the system toggle the LEDs and settles on the active light represented by the LED. When I rotate the encoded it acts like a dimmer switch - I can hit the momentary and do the same with the second light. I can also press the encoder to toggle the light (at its' dimmed percent). 

The integration talks to HomeAssistant to control the lights.

You may be thinking why not just use the phone app to control the light? Well for one I may not have my phone handy.  I may not want to be awakened by the bright screen and have to go looking for the app. The analogish feel of just manually dimming the selected light has a comfortable feel to it.  I realized in testing it the bright LEDs are not ideal in pitch darkness so I am letting the active LED stay on only for 60s when it goes dark.

Its difficult to describe but I like having the simple control of the lights and it feels like one of my better creations with a little help as well from Claude Code.
