# Verification record

## Automated checks

- `npm run check`, `npm run lint`, `npm test`, `npm run test:ui`, and `npm run build` pass.
- Engine tests cover authored follow-up references, choice-dependent opening branches, one-gesture response scoring, missed actions, persistent coordinates, tier-gated cosmic calls, 200 bounded emergencies, and 30 cases through President and beyond.
- The React UI simulation completes 30 cases with all five response types, promotion acknowledgement, safe refresh during a response, mute, history, reset, mobile coordinate mapping, and keyboard release.

## Chromium browser checks

- Desktop at 1440 px and mobile at 390 px and 320 px render without page errors or horizontal overflow. Screenshots were inspected.
- A desktop 20-case uninterrupted playthrough completed all five response types with no page errors. Reload preserved the resulting town and next call.
- A separate 27-case playthrough reached the President banner and continued into the moon call. That run revealed an early cosmic follow-up, which was fixed by enforcing tier limits on chained events. A browser check after the fix confirmed that President promotion leads to the moon call.
- Touchscreen taps completed a helicopter rescue on 390 px and 320 px mobile layouts. A simulated continuous touch drag collected three cars with the magnet and saved its actual release position.
- The dinosaur's successful first response removed the tree, stayed visible, and led to the house call. A deliberately missed response kept the tree and cat in place, changed the report text, and saved the dinosaur where it landed.
- Refresh during a response replayed the unanswered call. Refresh after a result preserved the next call. New Game reset the town while retaining the mute preference.
- The result view's live crop, town marker, and later flood state were inspected in rendered browser screenshots.

## Limits

- Headless Chromium confirms the audio controls and saved mute preference, but does not establish subjective audibility on a physical phone or speaker.
- Simulated touch input is not a physical device test.
- Domain and production verification are recorded in the delivery report after deployment; local checks alone do not establish a live release.
