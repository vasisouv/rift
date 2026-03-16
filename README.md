# Rift

**A Hearthstone-style card game roguelite. Every run ends in death — but death makes you stronger.**

## Gameplay

Deploy cards to a 5-slot battlefield, spend mana to play them, and attack the enemy hero to win. Each level you pick a perk and spend gold in the shop. When you die, void shards carry over to the Void Shop for permanent upgrades that persist across all runs.

## How to Play

- **Play a card** — click it in your hand (or drag it to the board) to spend mana and deploy it
- **Attack** — click a board card to select it, then click an enemy card or the enemy hero; or drag the card directly onto a target
- **Summoning sickness** — cards played this turn can't attack until next turn
- **Mana** — starts at 1/1, gains +1 max crystal each turn (cap 10); refills at the start of your turn
- **Win** — reduce the enemy hero to 0 HP
- **End Turn** — pass to the enemy; they draw, play, and attack automatically

## Features

- 14 card definitions across 7 tiers (cost 1–7, scaling ATK/HP)
- Simultaneous card combat — both cards deal damage at the same time
- Enemy AI with paced delays: draws, plays affordable cards, attacks lowest-HP targets
- Perks and in-run gold shop for build customization
- Meta-progression Void Shop with 8 permanent upgrades (HP, draw, ATK, defense, crit, lifesteal, deck bonuses)
- Card deploy animation and attack lunge animations
- Drag-and-drop: drag from hand to deploy, drag board cards to attack
- Sound effects for attacks, crits, deaths, card plays, and turn ends

## Meta Upgrades

| Upgrade | Effect |
|---|---|
| Reinforced Hull | +20 starting max HP |
| Extra Draw | Start with 1 extra card in hand |
| Void Calibration | +1 ATK to all cards played |
| Nano Armor | Hero takes -2 damage from attacks |
| Targeting System | +5% chance to deal double damage |
| Vampiric | Heal 1 HP when a friendly card destroys an enemy |
| Overclock Module | Start with 1 extra tier-2 card in deck |
| Void Memory | Start each run with a random perk |

## Run Locally

```bash
npm install
npm run dev
```

## Stack

- Vue 3
- Pinia
- Tailwind CSS
- Vite

## Screenshot

<!-- Add screenshot here -->
