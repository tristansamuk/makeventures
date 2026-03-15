---
title: 'Monitoring My Home Lab with Grafana and Prometheus'
description: 'Setting up a proper metrics stack to finally understand what my home server is actually doing at any given moment.'
pubDate: 'Jun 19 2024'
heroImage: '../../assets/blog-placeholder-1.jpg'
tags: ['home-lab', 'monitoring']
author: 'Igor Samuk'
---

For a long time, my approach to home lab monitoring was opening the Proxmox web UI and eyeballing the built-in graphs when something felt slow. That worked until it didn't. After a frustrating week where I couldn't tell whether my NAS performance issues were caused by disk contention, network saturation, or VM overhead, I decided to set up proper observability.

The stack I landed on is the one everyone lands on: Prometheus for metrics collection, Grafana for dashboards, and `node_exporter` running on each machine to expose system stats as HTTP endpoints. All three run as lightweight containers on Proxmox. Prometheus scrapes each `node_exporter` endpoint every fifteen seconds and stores the results in a local time-series database. Grafana then queries Prometheus and renders the data into dashboards with configurable time ranges and alerting.

Setup took most of a Saturday, but nothing was particularly difficult. The Prometheus config is a short YAML file — you define a list of scrape targets and it handles the rest. Grafana has a large library of community-built dashboards, and the Node Exporter Full dashboard (ID 1860, worth bookmarking) gave me a comprehensive system overview in minutes: CPU, memory, disk I/O, network throughput, filesystem usage, all graphed over time with configurable retention.

The practical upside has been immediate. I can now see exactly when my backup jobs run and how much they impact disk I/O. I spotted a misconfigured cron job hammering a single CPU core at 3am. I can compare this week's network usage against last week with two clicks. There's also a psychological effect that's hard to quantify: when everything is measured and visible, you trust your setup more. My home lab feels less like a collection of boxes I hope keep running and more like something I actually understand.
