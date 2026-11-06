# Kerege background and animation review — 6 November 2026

The hero now uses an original, small SVG repeat based on the crossed wooden slats and joined intersections of a yurt's kerege. It keeps the burgundy and ivory palette, with a radial fade behind the central illustration. No external reference photograph is copied into the site.

References consulted:
- KyrgyzCraft / ICHCAP, field record for uuk: describes the roof poles joining the tunduk and the upper ends of the kerege lattice walls. https://kyrgyzcraft.ichlinks.com/archive/elements/elementsV.do?contentsI18NCd=en-US&elementsUid=13980574583560023519&mode=grid&nation=KG&orderCd=D&page=3
- UNESCO, traditional yurt-making: collapsible wooden circular frame and associated craft. https://ich.unesco.org/en/RL/traditional-knowledge-and-skills-in-making-kyrgyz-kazakh-and-karakalpak-yurts-turkic-nomadic-dwellings-02284
- Interview with yurt maker Urmat Badachy uulu, 3 August 2023; visual references to construction and interior. https://im.kg/biznes-maek/2023/08/03/kyrghyz-uidu-tighip-any-priezientatsiia-kyluu-da-ozuncho-iskusstvo-boz-ui-bizniesi-mienien-aliektienghien-urmat-badachy-uulu-mienien-maiek/

Animation changes:
- Reversing a gesture can interrupt the automatic flight.
- Motion blur follows movement rather than being permanently tied to camera position; the amount is capped for clearer architecture and ridgelines.
- Corrected the intro label selector so its fade actually runs.
- Pointer easing uses elapsed time rather than a fixed per-frame increment.
- Horizontal wheel gestures, pinch zoom, and non-cancelable events retain native behavior.
- Animation starts if reduced motion is later disabled, without reloading. Enabling reduced motion restores the static scene and its labels.
- Rendering stops when the document is hidden or the hero is offscreen.

Verification:
- Browser review of the homepage and both service pages, with responsive checks at 320, 390, 768, and 1440 pixel widths across the reviewed pages. No horizontal overflow in these checks. These are browser viewport tests, not physical-device coverage.
- Forward/reverse flight, return to ordinary scrolling, skip link, menu opening and Escape/focus restoration, mobile menu section navigation, and service-page anchors.
- Static hero inspected in a temporary page without hero.js; temporary page removed before publication.
- No browser errors observed during the checked flow.
- 63 local page references resolve; SVG files parse successfully.
- 10 Node regression checks pass: forward flight, reversal, blur, native gestures, initial and changing motion preference, paused rendering, navigation, touch input, and failed WebGL/image loading. WebGL is stubbed in these logic tests; real rendering was checked in the browser.
- The contact links still open the existing kenius.us/contact form. The destination renders and responds successfully; no form was submitted and email delivery was not tested.

## Timber refinement

After visual feedback that the outlined version read as thin diamonds, replaced the repeat with solid red-brown laths. The SVG now has broad faces, slightly uneven edges, fine grain, separate front and rear lath layers, contact shadows, and small leather-like joint details. The repeat is tighter on phones and fades more strongly behind the central artwork. The asset is an original vector interpretation, not a photograph or an exact construction drawing.

Additional references:
- KyrgyzCraft / ICHCAP field record for kerege, including wall panels, intersections, and different mesh sizes: https://kyrgyzcraft.ichlinks.com/archive/elements/elementsV.do?contentsI18NCd=en-US&elementsUid=13980574583529023458&page=&searchText=sun
- Little Foot Yurts, firsthand visit to a Kyrgyz yurt maker's completed yurt, noting the red frame and bentwood roof poles: https://littlefootyurts.ca/kyrgyzstan-blog/the-most-beautiful-yurt
- Visual close-up of red wooden kerege, front/rear intersections and tied roof connections: https://www.etsy.com/listing/941528407/small19-kyrgyz-yurt-4-lattice-wall

Checked the refined background at 1440×900 and 390×844, and during the mobile-size fly-through. SVG parses and all internal references resolve; no console errors or horizontal overflow in the checked view. No animation logic changed in this refinement.
