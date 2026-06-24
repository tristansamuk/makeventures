---
title: The Cottage - a canvas for things IOT
description: "What better place than a cottage to build a second whole new IOT ecosystem. "
pubDate: 2026-06-01T11:29:00.000Z
status: in-progress
heroImage: ../../assets/cottage1.jpg
---
Ten  years ago, I found a spot that I just had to buy in the woods and on a lake. Once I had it in decent and livable condition (a story by it-self) I realized I had a whole canvas to build IOT devices and of course, monitoring. 

Just like at home this was a great candidate for a centralized controller: Home Assistant. HA had me from "it works offline" and without internet which is always an intermittent possibility in the north country. 

I started to ponder a bunch of ideas and this calls for specific projects which I'll prefix with Cottage but to give you an idea this is the start of my list:

\- Landscape lighting system 

\- Pump Pressure Monitor

\- Cameras

\- Temperature monitoring and alert

Those are just the start. 

The bigger issue is deciding on a cheap but robust network infrastructure up there and knowing the gear will be subjected to -30 degree celsius in the winter as well. 

### `Connectivity`

The problem in a very remote cottage context is often the lac of connectivity. For some that is a good thing. My journey started with using LTE from providers like Rogers and Bell in Canada and fortunatley that worked for basic coms but was not a sustainable nor a flexible solution for larger networking needs. In 2018, while SpaceX was still crashing and exploding rockets, there was an option here from Xplornet that offerered rural satellite TV and internet. We  had that installed and a dish mounted on the shed. It looked like a research station. That worked ok not fast but ok. When Starlink started to become more ubiquitous here I thought I would try it out in 2023 and they had a free equipment promo. So in paralel with Xplornet, I gave it a try and fount it crazy fast for the 5 min it stayed on and off. The issue was ofcourse trees - I could just not get past the many tree obstructions so I gave up refusing to get into building an expensive tower etc. Then in 2025 the folks at Xplornet told me they were decommissioning their service to my location so I was going to be stuck out of luck. Meanwhile in 2024 the government of Canada was busy aligning funding to telcos to get fiber to remote Canadians <https://ised-isde.canada.ca/site/high-speed-internet-canada/en/high-speed-internet-funding-programs>

To our amazement (our lake is very remote) there was a wire loop and distribution box on our shore by the spring of 2026 and a brochure from Bell on my door when I went to open about letting them hook up to the cottage.  I would have bet money that was not going to happen at least that fast. Cable is one matter and while not trivial in a lake context, it's really the infrastructure (the switching gear and comms setup) that will matter for timing. As I writhe this that part is a ways away. So back to dealing with NO connectivity. When I called Starlink again they were so helpfull and actually apologetic that I was out of service with them for so long (3 years) They also had a promo whoich I had signed up top at 50% off for 2 years. To top it all off they sent me brand new gear all for free. I hooked it up and again saw some obstructions but I did manage to find a little spot in the heveans that it seemed OK in. Ok is about 1000% better than I had before though.  Now when Bell finally comes knocking, I will at least have a choice and some not 0 negotiating power which they may be banking on.

### `Internal setups`

In the cottage I chose TP links AX5400 router mainly due to good reviews "cottage level" pricing and future proofing like wifi6. for the bunky about 10 meters away I thought I would try the TP link Omada EAP603 Outdoor solution so its rugged and maybe I can share with my dear friends and neighbours as well. Finally I added a Home Assistant Green to complete the tapestry needed to do HA projects. To help with brownout and short power issues I also added a Bluetti Power controller to hold up Starlink, the router and HA or at least give them a fighting chance when power flicks on and off or when it goes for a while I can get HA to sense that and shut itself down properly.
