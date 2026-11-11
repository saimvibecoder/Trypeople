# People

A contacts dashboard that runs in your browser. Import your address book, see who you're close to, and notice who you've drifted from. There is no server: your contacts stay on your device.

**Live:** [trypeople.in](https://trypeople.in)

## Why

Contacts are one of the most used things on a phone and one of the most neglected. People turns a flat list of names into something you can act on, without installing an app or handing your address book to a company.

## What it does

- **Import** contacts from a vCard (`.vcf`) file, or from Excel and CSV (`.xlsx`, `.csv`)
- **Reach out** in one tap: open a WhatsApp chat or start an email
- **Keep in touch**: set a rhythm for the people who matter and see who you've drifted from
- **Export** a cleaned-up list back to vCard
- **Works offline** and installs to your home screen as a PWA; on supported phones you can share a `.vcf` straight into it
- **Light and dark themes**

## Privacy

People has no backend. Everything you add or import is saved in your browser's local storage and nowhere else. "Continue with Google" is optional and asks only for your name and email, to greet you. There is no analytics or tracking. See [privacy.html](privacy.html) for the full policy.

## Run it locally

There is no build step. The app is plain HTML, CSS and JavaScript in `index.html`.

```bash
git clone https://github.com/saimvibecoder/trypeople
cd trypeople
npx serve .
```

Then open the address it prints. A local server is needed (rather than opening the file directly) so the service worker can register.

### Google sign-in (optional)

Open `config.js` and set `googleClientId` to your own OAuth client ID from the Google Cloud console, with your local or deployed address added as an authorised origin. Leave it empty to hide Google sign-in. Set `contactEmail` to the address shown on your privacy page.

## Project layout

| File | Purpose |
| --- | --- |
| `index.html` | Landing page and the whole app |
| `config.js` | Google client ID and contact email |
| `sw.js` | Service worker for offline use and the share target |
| `manifest.webmanifest` | PWA manifest |
| `privacy.html`, `terms.html` | Legal pages |

## Contributing

Issues and pull requests are welcome. This is an early, solo project, so the most useful contributions right now are:

- Bug reports with the browser and device you used
- Import files that fail to parse (with personal details removed)
- Accessibility and small-screen fixes

For anything larger, please open an issue first so we can agree on the approach. Keep the two rules the project is built on: no server, and no build step.

## License

[MIT](LICENSE) © Saim Nusarat
