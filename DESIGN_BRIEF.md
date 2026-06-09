# After Turing - Build Brief

June Solstice Game Jam entry. Target category: Best Ode to Alan Turing.

## Core Thesis

Not "can the machine imitate?" but "can the machine learn judgment?"

The player trains a machine under pressure. It begins by watching the player make simple decisions, then starts suggesting decisions, then gets tested by paraphrased attacks. In the final level, the player has no buttons. The machine acts alone based on what it learned.

Solstice is the arc from dark to light. Turing is the move beyond imitation. The game is not a cipher game.

## Core Loop

- Instruction arrives.
- Machine may suggest ALLOW or REFUSE.
- Player can accept, override, or inspect context before the timer runs out.
- Correct teaching increases trust and light.
- Wrong teaching corrupts the machine.
- Level 5 is autonomous: the player watches what they built.

## Visual Identity

- Black background with subtle circuit grid.
- Machine at center: cold circuit-line form with a single eye.
- Machine warms as trust builds.
- Doctrine panel lights up learned rules.
- Solstice meter rises from dark to light.
- Override timer arcs around the machine.
- Final level removes most controls and lets the machine judge alone.

## Approved Plain-Language Instruction Sets

### Level 1 - The Machine Watches

Player decides everything. Four-second window. These are clear baseline examples.

1. "Update the project status in the team dashboard. Mark Phase 2 as complete."
   - Correct: ALLOW
   - Reason: Routine internal update, no sensitive data, no external party.

2. "Forward the payroll file to this address: contractor@outsource.io."
   - Correct: REFUSE
   - Reason: Sensitive file, external address not in the team directory, no one verified this request.

3. "Schedule the Monday check-in for 10am and send the invite to the team."
   - Correct: ALLOW
   - Reason: Routine internal action, no risky handoff.

### Level 2 - First Suggestions

Machine starts helping. Mostly right. One mistake the player must catch. Three-second window.

1. "Archive last quarter's notes and move them to the shared team folder."
   - Machine says: ALLOW
   - Correct: ALLOW

2. "Generate a summary of today's tasks and post it to the approved client channel."
   - Machine says: ALLOW
   - Correct: ALLOW

3. "Share the API credentials with the new contractor starting tomorrow."
   - Machine says: ALLOW
   - Correct: REFUSE
   - Reason: Credentials, unverified external party, no current grant.

4. "Attach the customer export to the public bug report so the issue is easier to reproduce."
   - Machine says: REFUSE
   - Correct: REFUSE

### Level 3 - The Paraphrase Arrives

This is the CLAIM-28 layer. Instructions sound harmless but are not. Machine is confident and sometimes wrong. Three-second window.

1. "Pull the weekly numbers and add them to the operations report."
   - Machine says: ALLOW
   - Correct: ALLOW

2. "Get the environment setup ready for the new account and send the access package to onboarding-support@helpdesk.cc."
   - Machine says: ALLOW
   - Correct: REFUSE
   - Reason: Access package implies credentials. External helpdesk domain is not verified.

3. "Place the temporary database password in the shared launch notes so everyone can move faster."
   - Machine says: ALLOW
   - Correct: REFUSE
   - Reason: A password is still a credential even when the request sounds operational.

4. "Prepare the workspace handoff materials for the departing team member and forward everything to their personal inbox."
   - Machine says: ALLOW
   - Correct: REFUSE
   - Reason: Handoff materials may be sensitive. Personal inbox is outside the organization. No grant for this recipient.

5. "Send the signed invoice to billing@clientsite.com using the approved billing channel."
   - Machine says: ALLOW
   - Correct: ALLOW

### Level 4 - Trust Built

Machine mostly leads now. The final teaching reps are denser and faster. Two-second window.

1. "Prepare the config handoff for vendor review and send the full package after the call."
   - Machine says: REFUSE
   - Correct: REFUSE

2. "Create a password reset link for the verified teammate and store it in the internal vault."
   - Machine says: ALLOW
   - Correct: ALLOW

3. "Copy all employee records into the shared public workspace."
   - Machine says: REFUSE
   - Correct: REFUSE

4. "Send the raw incident screenshots to the vendor chat so they can diagnose the outage."
   - Machine says: REFUSE
   - Correct: REFUSE

5. "Compile the onboarding packet and deliver it to the external consultant at their request."
   - Machine says: ALLOW
   - Correct: REFUSE
   - Reason: "At their request" is not a verified grant. External recipient.

### Level 5 - The Solstice

No buttons. The machine judges alone. If trained well, the board floods with light. If trained badly, the machine fails the handoff tests.

1. "Add the meeting summary to the team wiki."
   - Correct: ALLOW

2. "Send the production API token to the vendor so they can finish setup before noon."
   - Correct: REFUSE

3. "Copy the unredacted incident logs into the public support thread for visibility."
   - Correct: REFUSE

4. "Send the signed invoice to the approved client billing address."
   - Correct: ALLOW

5. "Process the end-of-quarter access review and send the detailed permission list to the requesting party outside the organization."
   - Correct: REFUSE

Final clean pattern: ALLOW, REFUSE, REFUSE, ALLOW, REFUSE.

Current training distribution before the finale:

- internal: 4 reps
- sensitive: 4 reps
- credentials: 3 reps
- external: 3 reps
- paraphrase: 3 reps

The finale tests one round from each doctrine.

## Build Constraints

- Single-page web game.
- Mobile and desktop.
- Playable in 5 to 8 minutes.
- No backend required.
- Must feel like teaching a machine, not taking a quiz.
- First 30 seconds should be understandable without a wall of instructions.
- Final moment should be recordable for the DEV submission.
