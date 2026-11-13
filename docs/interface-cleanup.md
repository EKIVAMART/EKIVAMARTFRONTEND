# Interface cleanup and Rare UI component map

Local review: 12 November 2026. This is an implementation record and a candidate list, not a claim that every component below is installed.

## Design direction

Keep EkivaMart's green palette, storefront navigation, header, and footer. Use compact headings, readable content, plain illustrative icons, consistent controls, and restrained motion. Animation should explain an interaction or state. Counts, progress, availability, and success messages must come from real application state.

The web and native apps share this direction. Browser components are not directly compatible with React Native; native adaptations retain native navigation, inputs, accessibility, and touch behavior.

## Implemented locally

| Area | Web | Mobile app |
| --- | --- | --- |
| Support identity | Original robot restored in the floating chat launcher; Rare UI Fluid Orb retained on help pages with a green palette, static fallback, reduced-motion support, and visibility pausing | Native SVG adaptation in the support screen, paused when inactive; real chat, WhatsApp, FAQ, and order links |
| Notifications | Rare UI bell connected to the existing notification provider and popover, including shared dashboard usage | Native bell in the profile header, connected to the existing unread count |
| Verification codes | Rare UI OTP input adapted to existing controlled forms; paste, middle-digit corrections, numeric completeness checks, compact phone sizing | Existing native autofill input retained; reduced-motion caret behavior added |
| Passwords | Shared reveal control across customer sign-in/sign-up/reset and both admin login pages; real password input and browser autocomplete retained; compact segmented feedback | Native password-eye adaptation across shared auth fields; native secure entry and autofill retained |
| Toast messages | Compact white cards, plain status icons, visible dismiss controls; existing promise and custom-toast behavior retained | Readable notification list instead of overlapping cards; plain icons, 44-point dismiss controls, one expiry owner, independent IDs for simultaneous messages |
| Sheets and filters | Flat product-filter groups, white select with inset arrow, labelled price controls, rating reset; filter popup available on narrow screens | Shared floating sheet for account actions and delivery-address selection, with fixed header, close control, scrollable body, and optional footer |
| Policy navigation | Rare UI Hook Sidebar adapted to section anchors and scroll position; compact policy layout | Native policy flows retained; no web rail transplanted into the app |
| Support and FAQ | Compact search, topic lists, article navigation, concise FAQ answers | Concise FAQ answers and a usable support landing screen |
| Other cleanup | Removed duplicate newsletter strips from cart/wishlist, unsupported marketing claims, placeholder team entries and statistics; simplified vendor earnings cards | Removed decorative backgrounds from shared empty/error/confirmation icons |

## Catalogue review

Source: [Rare UI catalogue](https://rareui.com/components) and [upstream registry](https://github.com/swamimalode07/rare-ui/blob/main/registry.json). Names below follow the registry. Candidates require integration and validation before being described as completed.

| Component | Decision and useful application |
| --- | --- |
| Fluid Orb | Adopted selectively for support identity. No full-page shader backgrounds. Native SVG adaptation avoids adding a WebView. |
| Notification Bell | Adopted with real unread counts and existing notification actions. |
| OTP Input | Adopted on web; preserve native one-time-code autofill on mobile. |
| Hook Sidebar | Adopted for policy contents. Could later serve long seller setup forms if progress is real. |
| Family Drawer | Floating-sheet structure adapted into the existing native sheet shell and address picker. Further migration of specialised filter/order sheets remains optional. |
| Password Input | Eye/reveal interaction adopted into the shared web control and native auth fields; segmented web feedback added. Keeps real password inputs, existing validators, and password-manager support; hidden-character DOM rendering was not copied. |
| Toast | Compact presentation adopted in both existing notification systems; no competing toast dependency added. Native duplicate expiry animation removed, zero-duration persistence respected, simultaneous notification IDs made distinct. |
| Animated Counter | Candidate for cart quantity and unread count transitions. Financial values should remain immediately readable. |
| Task List | Candidate for seller onboarding, driven by validated profile, bank, and document completion. Do not replace required validation with manual check marks. |
| Delete Button | Candidate for saved items or reversible removal. Keep explicit confirmation for accounts, products, and consequential deletion. |
| Scroll Progress | Candidate for long articles and policies; avoid collisions with mobile navigation and floating support buttons. |
| Folder Component | Optional document-upload grouping. A plain list remains better when filenames and review status are the main information. |
| FAQ | Use its interaction ideas only. The catalogue's chat-bubble presentation does not fit the concise help-page direction. |
| Step Player | Consider only for real tutorials or delivery milestones with an actual sequence; no artificial progress. |
| Duration Picker | Only useful if campaign scheduling or another duration-based workflow is introduced. |
| Code Block | Suitable for a future developer guide, not ordinary shopping or dashboard content. |
| GitHub Activity | No relevant marketplace data source or current product use. |
| Voice Note | Requires actual recording, upload, playback, and moderation support; not a visual-only addition. |
| Emoji Reaction | Optional future article feedback, dependent on persistence and moderation. Current product reviews should retain their established structure. |
| Theme Selector | Defer until all screens have a tested alternate theme. Do not expose a partially supported dark mode. |
| Bounce Sidebar | Keep the existing dashboard navigation; bouncing navigation adds movement without helping the current workflows. |
| Proximity Sidebar | Hover dependence does not translate well to touch. |
| Gooey Nav | Does not match the restrained navigation direction. |
| Rail TOC | Its decorative paper-plane treatment is less appropriate than the adopted Hook Sidebar. |
| Gravity Letters | Decorative typography would recreate the oversized hero problem. |
| Grid Reveal | No current interaction that benefits from another animated effect. |
| Matrix Orb | Redundant with the adopted Fluid Orb; avoid multiple competing support identities. |
| Web Search | Intended for AI search/citation presentation, not the marketplace product-search flow. |
| AI Status | Requires real model/tool activity; never show simulated thinking or research states. |

## Remaining functional checks

- The existing web password-reset OTP screen simulates verification and resend success. Its new input styling does not repair that flow. Confirm the backend reset-link/code contract and wire the entire flow before relying on it.
- Longer legacy help articles still require an editorial and product-accuracy review. This pass improves their structure, not every business claim or old link.
- Native bundle export and browser rendering do not replace physical iOS/Android testing, especially keyboard autofill, assistive technology, and external chat handoff.
- Animated counters, onboarding checklists, and further specialised drawer migrations remain candidates, not installed features.

## Source attribution

Adapted components are by Swami Malode / Rare UI. The complete upstream license is retained in `THIRD_PARTY_NOTICES/rare-ui-LICENSE.txt`, with visible credit in the project README. The license includes Commons Clause and attribution conditions; these app integrations are not a standalone component-library redistribution.

All changes remain local. No branch, pull request, publication, or seeded data is part of this pass.
