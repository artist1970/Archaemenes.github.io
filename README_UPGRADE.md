# Archaemenes Public Home — Interactive Upgrade

This package is a replacement front-end for:

`artist1970/Archaemenes.github.io`

It keeps the repository a **public home**, not a private AI Core and not a learner-record system.

## What changes

- Gives Archaemenes a warmer, more interactive public presence.
- Adds visitor-specific welcomes for students, parents, educators and curious visitors.
- Adds public, prewritten examples of Archaemenes' mentoring character.
- Adds a rotating "Question from Archaemenes."
- Adds a local-only message desk.
- Adds Copy & Open Mentor so a visitor can carry a note into the Academy-hosted Mentor without placing the note in a URL.
- Preserves learning-level routing.
- Adds Principal's Office explanation and Academy/Family/Student links.
- Adds ecosystem doorways.
- Adds calm colors, larger text and reduced-motion controls.
- Reads `archaemenes_persona.json` from the same repository when available so the public description and motto stay aligned with the public persona file.

## Privacy boundary

The message desk uses browser `localStorage` only.

It does **not**:
- send notes to a server;
- expose private learner records;
- read the Academy Family Registry across origins;
- expose Noema;
- contain NAIB internals;
- fetch private CORE;
- transmit passwords, grades, health information or student records.

The interface explicitly tells visitors that their note remains on their device. "Copy & Open Mentor" copies the note to the clipboard and opens the Academy Mentor, where the visitor may choose to paste it.

## Files

Replace:
- `index.html`
- `app.js`

Keep the existing:
- `archaemenes_persona.json`
- `specialist-manifest.json`
- other public assets

## CSP

The previous page used `connect-src 'none'`.

This upgrade uses:

`connect-src 'self'`

only so `app.js` can read the repository's own public `archaemenes_persona.json`. It does not authorize third-party API calls.

## Recommended next integration

Later, when the canonical Archaemenes/NAIB adapter is ready, the public page can keep this exact presentation and change only the "Talk with Archaemenes" handoff target or messaging bridge. The public home should remain separate from private CORE and hidden governance.
