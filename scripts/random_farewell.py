#!/usr/bin/env python3
"""Print a random one-line farewell (demo PR)."""
import random

FAREWELLS = ("Goodbye", "Bye", "See you", "Later", "Take care")

if __name__ == "__main__":
    print(f"{random.choice(FAREWELLS)}, world!")
