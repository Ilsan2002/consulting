# Skyline Alive — design exploration

The live **Skyline** site (`production-live-snapshot/`) with its sky brought to life.
The pages, copy, layout, fonts and pixel paintings are the same, and so is the
light editorial body. What changes is that the hero is now a real-time WebGL
diorama of the same Almaty scene.

Not linked from production. Every page is `noindex`.

## What's new

- **Pixel-dither timelapse.** The four paintings (night, dawn, day, sunset) still
  follow the visitor's clock. Instead of cross-fading, they dissolve into each
  other with an ordered dither on the painting's own pixel grid. The sky turns
  first and the change sweeps down through the city. One day takes 40 seconds.
- **The city lives.** About 1,300 lights were detected in the night painting
  (`tools/bake-lights.py`):
  - Street lamps and floodlit buildings switch on one by one at dusk and off at
    dawn.
  - Windows light up through the evening, thin out after midnight and come back
    for early risers. A few flicker like a TV.
  - Stars twinkle, and a shooting star crosses the sky every few seconds at night.
  - Small flocks of birds cross the sky by day, and lamps glow after dark.
- **You control the clock.** Scrolling through the hero runs the day forward by
  up to 9 hours, and on desktop you can drag the sky left or right. The agent log
  fires each entry as the clock passes its hour.
- **Pixel-dissolve edges.** The hero dissolves into the page, and the page
  dissolves into the footer's night scene, in dithered steps instead of hard cuts.
- **The footer is alive too.** The same night scene runs there: stars, windows,
  lamps and shooting stars.
- **Small page motion:**
  - Section headings type themselves in with a block cursor, like the agent log.
  - The engagement rules draw in pixel steps.
  - The service rows arrive one after another.

## Fallbacks

- **Reduced motion:** the scene paints the visitor's actual time of day once and
  stays still. There's no timelapse, flicker or typing.
- **No WebGL2 (or a lost GPU context):** exactly the live behaviour, the four
  photos cross-fading.
- **No JS:** the day painting, like the live site.

## Files

| Path | What it is |
| --- | --- |
| `index.html`, `services.html`, `work.html`, `about.html`, `contact.html`, `ru/*.html` | Live pages, with links made relative and `noindex` added |
| `assets/skyline-2.css` | Live stylesheet, unchanged |
| `assets/alive.css` | Everything added on top of it |
| `assets/alive.js` | The WebGL sky, the clock and log, page motion, the contact form (same Web3Forms flow) |
| `assets/img/alive-*` | Baked from `sky-night-4.webp` by `tools/bake-lights.py`: the night painting with its lights removed, the lights on their own, and a per-light id/kind map |

## Preview

```sh
./serve.sh    # from the repo root
open http://localhost:8000/design-explorations/skyline-alive/
```

Flags: `?reduced` forces reduced motion and `?nogl` forces the photo fallback.
