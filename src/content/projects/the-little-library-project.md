---
title: The Little Library Project
description: Modernize and expand on data collection of a front-lawn Library
  Exchange with ESPHOME and Home Assistant
status: in-progress
---
# In the Beginning

My friend Bob and his son Timmy are enthusiasts of the Little Free Library System. The idea is a network of DIY prefab  cabinet kits in various models that sit on the front lawn adjacent to the sidewalk.  The idea is to promote literature by sharing books for free.  Passers-by can "borrow" a book and swap or return it when read.  [Read about the system here](https://littlefreelibrary.org/). We decided to use this project as an opportunity to automate. Of course. 



> Bob is quite technical and likes data and his 10 year old is the kind of kid who plays with Lego including building Lego machines that are programmed to for example solve rubics cubes.



B's Library door has a contact switch and manual counter that increments to indicate number of times the door is opened.  Our thinking was to work with T and build a system that does the counting, reports it as well as other data like temperature and humidity and make it expandable to more data. We chose to use docker on a rasperry pi and [**ESPHOME**](https://esphome.io/) and [**HomeAssistant**](https://www.home-assistant.io/). in containers. 

####  Highlights of the journey

This turned out to be a build happening at the same time I finally decided to dive into using a pay-per-use AI (Claude code). The experience was kind of mind-blowing. I had no idea these tools could be this powerful even for this small project. I spend allot of time in the typical trial and error of coding in ESPHOME yaml,  making devices. Those earlier days of learning were very fun but it also often felt daunting to revisit the knowledge after long time gaps between builds. Now I can conceptualize and get some amazing code that both get's me to the end result faster and enhances my learning.  Allot less grunt, allot more results, allot faster. Once the code was in a reasonable state I even began to experiment with Claude to see if it could build a PCB schematic for Kicad ( an open source pcb design tool set). It came close but I know it was a tall order and I do think over-time it would have through iterations got the job done. I just was getting a bit ahead of myself as I wanted the build to be solid and tested in prototype mode first.  

#### The build

Like many early users of ESP8266, I had a few ESP8266 around which for a while were the goto Espressive boards but are now out of vogue and support for that matter. ESP32 is the new king. That said I am using up the ones I have and this project seemed a good use-case. We only needed GPIO's for the DH11 (temperature, humidity), the OLED display, a contact switch, a wake switch. A0 is tapped into with voltage dividing resistors for monitoring battery voltage. The board runs ESPHOME yaml code and the monitoring and automation is through home assistant.  For power it made sense to use solar and to do that we need a battery and BMS (battery management system). An excellent option is the [**DFRobot DFR0559**](https://www.dfrobot.com/product-1712.html?srsltid=AfmBOoqJyJt-d-YF9ZNY2zpTonmNGLzWV0Gnc6AEbHqQPmHUa69qR4IG)   - with a boost converter from 3.7V to 5V, usb and direct power connections, solar charging and more. 





#### Future thinking

We have all kinds of ideas of how to make the system even more useful including possibly knowing what titles are being swapped back and forth in the Library. That seems like it might include  image recognition and AI. But alas that may throw us into the cloud which is a bit of a controversy in the HA world.
