# localpraxis

Source for [localpraxis.com](https://localpraxis.com), the marketing site for Local Praxis, a one-person custom-software practice in Port Aransas, TX. Built for clarity, not for tracking.

## Stack

Vanilla HTML, CSS, and JavaScript. No frameworks, no build step, no dependencies.

- Hosted on GitHub Pages.
- Blog pipeline runs through GitHub Actions.
- Single-file architecture: most pages keep their CSS in `<style>` and JS in `<script>` tags.
- No analytics, no third-party trackers.

## Design

Swiss-brutalist / Unimark-descended visual language. Two-tier typography (Archivo Black for display, IBM Plex Mono for everything else), `border-radius: 0` everywhere, paper + ink + a single red accent. References include Vignelli's Piccolo Teatro posters, the NPS Unigrid system, and Müller-Brockmann grids. The full design brief lives at `.claude/design-brief.md`.

## Local development

```bash
git clone https://github.com/orphicaxiom/localpraxis.git
cd localpraxis
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## License

Site copy and design © James Johnson / Local Praxis. Code structure is unlicensed but freely inspectable.
