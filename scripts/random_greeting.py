#!/usr/bin/env python3
"""Print a random one-line greeting (demo PR)."""
import random

GREETINGS = ("Hello", "Hi", "Hey", "Howdy")

if __name__ == "__main__":
    print(f"{random.choice(GREETINGS)}, world!")
