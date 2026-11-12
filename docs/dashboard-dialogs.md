# Dashboard dialogs

Admin and Super Admin dialogs share `app/dashboard-dialogs.css`, scoped to dashboard pages, including portalled dialogs.

Use `dashboard-dialog-overlay` on the full-screen backdrop/container and `dashboard-dialog` on the panel. Choose one content width: `--compact` (480px) for confirmations, `--form` (640px) for forms, `--wide` (960px) for editors, or `--large` (1120px) for detailed records. All use 12px corners, a white surface/header, a fine border, matching shadow, and a viewport-bounded height. Height follows content; do not enforce an aspect ratio that produces blank space or clips forms.

Use `dashboard-dialog-header`, `dashboard-dialog-close`, `dashboard-dialog-body`, and `dashboard-dialog-footer` for shared spacing. `dashboard-dialog--padded` supports compact dialogs whose contents already share outer padding. Header icons use `dashboard-dialog-icon` with no colored tile. Close buttons stay in the upper-right corner with 44px targets. Dense content scrolls within the dialog.

Use `useDashboardConfirmation` for async confirmations. It manages focus, Escape/backdrop cancellation, and a boolean result; the caller retains the existing action, permission checks, and error handling. Do not introduce browser-native `confirm()` calls.

## Audit coverage

47 existing panels were standardized across vendor detail/review/assignment/bank/payout/document workflows, product detail/editor/images/categories/subcategories, orders, user/admin profiles and invitations, tax rules, vendor specialists, delivery routes, waitlist/email dialogs, broadcasts, blog preview/publishing/confirmations, engagement, review moderation, session expiry and sign-out. Seven native confirmation call sites were migrated to the shared confirmation hook.

The full-page article editor remains a route, not an overlay dialog. Navigation backdrops and anchored action menus are not modal panels.

Verification includes production build/type checks; desktop and mobile browser checks of the major dialogs in both roles; vendor detail tabs; nested category, assignment, rejection, sign-out and broadcast-review dialogs; and cancellation/confirmation behavior with mutation requests intercepted by the test browser. Visual checks cover the previously green vendor and broadcast headers. No live broadcast or destructive action is needed for this verification.
