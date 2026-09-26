# Skyline Alive — design exploration

The live **Skyline** site (`production-live-snapshot/`) with its sky brought to life.
The pages, copy, layout, fonts and pixel paintings are the same, and so is the
light editorial body. What changes is that the hero is now a real-time WebGL
diorama of the same Almaty scene.

Not linked from production. Every page is `noindex`.

## What's new

- **The whole scene moves.** The paintings were split into layers
  (`tools/bake-scene.py`): sky, a depth map from the ridge down to the square,
  and the foreground trees.
  - **The sky is drawn live on the painting's pixel grid.** It uses dithered
    colour bands taken from each painting. Two layers of pixel clouds drift on
    the wind. The sun sets and rises over the peaks, the crescent moon crosses
    the night sky, stars twinkle and shooting stars fall.
  - **Depth.** Moving the mouse lets you look around the scene, and scrolling
    lifts the near trees faster than the city or the peaks.
  - **Wind in the trees.** The foreground trees sway in stepped, hand-drawn-style
    frames.
  - **Morning mist** settles over the city at the foot of the mountains.
  - **People cross the square** from morning until late evening.
- **Pixel-dither timelapse.** The four paintings (night, dawn, day, sunset)
  follow the visitor's clock. They dissolve into each other with an ordered
  dither: the sky turns first, then the change sweeps down through the city.
  One day takes 40 seconds.
- **The city lights.** About 1,300 lights were detected in the night painting
  (`tools/bake-lights.py`):
  - Lamps and floodlit buildings switch on one by one at dusk.
  - Windows fill the evening and thin out after midnight. A few flicker like a TV.
  - Lamps glow after dark, and birds cross the sky by day.
- **You control the clock.** Scrolling runs the day forward, and on desktop you
  can drag the sky. The agent log fires each entry as the clock passes its hour.
- **Pixel-dissolve edges** between the hero, the page and the footer. The
  footer's night scene is animated too.
- **Small page motion:**
  - Section headings type themselves in.
  - The engagement rules draw in steps.
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
| `assets/img/alive-night-off.webp`, `alive-lights.png`, `alive-meta.png` | Baked by `tools/bake-lights.py`: the night painting with its lights removed, the lights on their own, and a per-light id/kind map |
| `assets/img/alive-scene.png`, `alive-sky.png` | Baked by `tools/bake-scene.py`: depth, sky mask and tree weight; the sky gradients and cloud colours of each painting |

## Preview

```sh
./serve.sh    # from the repo root
open http://localhost:8000/design-explorations/skyline-alive/
```

Flags: `?reduced` forces reduced motion and `?nogl` forces the photo fallback.
