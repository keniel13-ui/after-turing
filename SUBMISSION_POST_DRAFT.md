---
title: After Turing — teach a machine to judge, then watch it act alone
published: false
tags: devchallenge, gamechallenge, gamedev
---

*This is a submission for the [June Solstice Game Jam](https://dev.to/challenges/june-game-jam-2026-06-03)*

## What I Built

**After Turing** asks a different question than the one Turing is usually remembered for. Not *"can a machine imitate a human?"* — but *"can a machine learn judgment?"*

You don't break a cipher in this game. You **train a machine** to decide which instructions are safe to act on and which to refuse. It begins by watching you make calls. Then it starts suggesting. Then it gets tested by instructions that *sound* harmless but hide a trap — an external address, a credential leak, a paraphrased request with no real authority behind it. And in the final level, the buttons disappear. The machine acts alone, judging a fresh set of instructions based entirely on what you taught it.

If you taught it well, the board floods with light. If you let the traps through, it carries your blind spots into the dark.

The arc is the solstice itself — from dark to light — and the move beyond imitation is the ode to Turing: a machine that doesn't mimic, but *judges*.

## Video Demo

<!-- EMBED VIDEO HERE. Script the demo so the climax is Level 5: buttons gone, machine deciding alone, board flooding with light. Add a voiceover explaining the teach→corrupt→autonomy loop. ~90 seconds. -->

## Live Demo

Play it here: https://after-turing-rho.vercel.app

## How It Plays

Five levels, 5–8 minutes:

1. **The Machine Watches** — you decide everything. Clean baseline examples. 4-second window.
2. **First Suggestions** — the machine starts helping. Mostly right. One mistake you must catch.
3. **The Paraphrase Arrives** — instructions that read as routine but aren't. The machine is confident and wrong. 3 seconds.
4. **Trust Built** — the machine leads. One subtle slip hides in the flow. 2 seconds.
5. **The Solstice** — no buttons. The machine judges alone, on what you taught it.

Every instruction belongs to a *doctrine* — internal, sensitive, credentials, external, paraphrase. Teaching a doctrine correctly reinforces it; teaching it wrong visibly **corrupts** the machine. The doctrine panel shows each rule as active, mixed, or corrupted, with a confidence score. Level 5's autonomous decisions are computed directly from that history — so the ending is literally a mirror of how you raised it.

## The Thesis Is Real, Not Narrative

The part I care about most: the machine genuinely learns from you. Its final-level judgments are derived from your per-doctrine teaching record — not a script. To prove it, I ran the actual game logic through a headless simulator across different teaching strategies:

- **Taught well:** the machine scores 5/5 in the autonomous finale — full light.
- **Waved the traps through:** 2/5 — it inherits your blind spots and fails the handoff.
- **One early mistake, corrected later:** recovers to 5/5 — a single slip doesn't doom you, but neglect does.

That mirror — *you are watching what you built* — is the whole game.

## Why This Is an Ode to Turing

The Turing Test framed intelligence as imitation — can the machine *pass* as human? After Turing moves to the harder, more current question: can a machine be **taught to judge** — to refuse the wrong command, not because a rule said so, but because it learned discernment under pressure? That's the real frontier of machine intelligence now, and it's the question this game makes playable.

## Code

<!-- EMBED GITHUB REPO HERE -->

Single-page web game. No backend, no dependencies — pure HTML/CSS/JS. Desktop and mobile. The learning loop, doctrine tracking, and autonomous finale all run client-side.

## How I Built It

This game grew out of real research I do on AI-agent authority and memory — the question of *when an autonomous agent should refuse an instruction.* After Turing is that research made playable: the doctrines, the paraphrase attacks, and the corruption-on-bad-teaching are simplified versions of problems I work on for real. I built the five instruction sets first as plain-language scenarios, then wired the doctrine-confidence model that drives the machine's autonomous judgment, and balanced it by simulation so the finale feels earned rather than arbitrary.

## Prize Category

**Best Ode to Alan Turing** — honored in the game's core mechanic and narrative: moving past imitation to machine *judgment*, with the solstice dark-to-light arc as the measure of how well the machine was taught.

<!-- Team credits: list DEV usernames here if applicable. -->
