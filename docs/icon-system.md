# Platform icons

Use Phosphor Duotone for interface and category icons. Inherit the control’s colour; use the existing status colours for errors, warnings and success. Keep small controls at their existing size, usually 16–24 px. Marketing illustrations may use larger icons.

Use the fill weight for selected hearts, filled ratings and selected navigation states. Keep accessible labels on the interactive control; decorative web SVGs use `aria-hidden`. Do not add coloured icon containers by default.

Brand logos, charts, product photography and decorative artwork are separate from the interface icon system. Keep their original artwork and attribution.

## Web

Import icons from `@/components/ui/platform-icons`. The module defaults to duotone and retains familiar existing export names so each screen can keep its layout. It uses the Phosphor server-compatible components in both server and client trees. Explicit `weight` takes precedence; legacy non-empty fills and `fill-current` classes select the fill weight. Lucide stroke-width props are ignored because Phosphor uses filled paths.

For a new icon, add a direct per-icon SSR import and a themed export to this module. Preserve semantic distinctions when choosing equivalents.
