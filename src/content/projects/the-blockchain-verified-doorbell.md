---
title: The Blockchain-Verified Doorbell
description: "Why ring a doorbell like it's 1995? "
pubDate: 2026-04-26
status: in-progress
heroImage: ../../assets/doorbell.jpg
---
When pressed, the button triggers a Raspberry Pi to mint an NFT of the doorbell event on a testnet blockchain. Your phone receives a push notification only after three nodes confirm the transaction. By then, your visitor has already left.

Here is the core loop:



```python
def ring_doorbell(visitor_name):
    print(f"Minting doorbell NFT for {visitor_name}...")
    time.sleep(8)  # simulate block confirmation
    print("Transaction confirmed on 3 nodes.")
    time.sleep(3)  # simulate push notification delay
    print(f"Notification: Someone named {visitor_name} was here 11 seconds ago.")
    print("They have walked away.")
```

The real beauty is the dashboard. It tracks every ring forever on-chain, creating a permanent public record of your social life. Perfect for proving to your mom that people do visit you.

Build this to remind yourself that not everything needs blockchain. But also, everything deserves blockchain.

{{< video "https://youtu.be/IlcMRq3gb1s?si=Dcdlpzyq3aAZTAtG&t=37" >}}
