#!/usr/bin/env python3
"""Print a random one-word mood (demo PR)."""
import random

MOODS = ("chipper", "sleepy", "curious", "focused", "playful")

if __name__ == "__main__":
    print(f"Today's vibe: {random.choice(MOODS)}.")
