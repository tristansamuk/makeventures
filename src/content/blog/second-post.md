---
title: 'Building a Home Server from Spare Parts'
description: 'I had an old gaming PC collecting dust, a free weekend, and a copy of Proxmox. Here is what happened.'
pubDate: 'Jul 15 2022'
heroImage: '../../assets/blog-placeholder-4.jpg'
tags: ['home-lab', 'hardware']
author: 'Igor Samuk'
---

The catalyst was simple: I needed somewhere to run Home Assistant that wasn't a Raspberry Pi. The Pi is great, but SD cards fail, it runs warm in an enclosure, and I wanted to start experimenting with virtual machines without buying dedicated hardware. I had a five-year-old gaming rig with an i7-8700K and 32GB of RAM that had been largely replaced by my newer machine. It was time to put it to work.

My first instinct was to slap Ubuntu Server on it and call it a day. But after a few weeks reading about Proxmox, I went that route instead. Proxmox is a bare-metal hypervisor built on Debian — you install it directly on the machine and run everything else (Linux installs, containers, appliances) as virtual machines or LXC containers. The management interface is a web UI you access from another machine on the network, which is a surprisingly comfortable way to work.

Getting the hardware set up took an afternoon. I added a spare HDD alongside the existing SSD, giving me somewhere to store backups and larger files separately from the OS drives. Proxmox installed cleanly, and within an hour I had Home Assistant running as a dedicated VM — which meant I could snapshot it, back it up, and restore it in minutes if something went wrong. That alone was worth the whole migration.

From there things escalated quickly. A TrueNAS Scale VM now handles storage and serves files over Samba to the rest of the network. A Pi-hole container handles DNS and blocks ads for every device in the house. A Tailscale node means I can reach all of this from anywhere. What started as "I have a spare PC" has become something I actively enjoy managing. I'm currently looking at adding a used 10GbE card so NAS transfers stop saturating the network switch.
