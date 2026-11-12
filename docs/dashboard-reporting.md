# Dashboard reporting and verification

The Admin and Super Admin overviews share KPI, chart, status, and audience components. The primary chart sits directly after the KPI row. Supporting tables retain their own scrolling containers.

## Reporting definitions

| Display | Population and date basis |
| --- | --- |
| Admin metrics | Records created in the selected period; lifetime counts are shown separately. Users include the roles counted by the existing endpoint. |
| Order activity and status | All orders, including cancelled/failed orders, by order creation date. Order value is the whole order total, including applicable charges. Status values are not paid-goods revenue. |
| Gross sales | Eligible order-line goods value. Existing eligibility excludes pending-payment, payment-failed, cancelled and refunded orders, cancelled lines, and refunded earnings. |
| Platform commission | Historical commission from the earning entry, falling back to the order-line snapshot. Current vendor configuration is not applied retroactively. |
| Vendor earnings | Accrued net from the earning entry, falling back to goods value when an eligible line has no earning entry yet. |
| Pending escrow | Accrued net in pending state. Without an earning entry, delivered orders are treated as available and other eligible orders as pending, following existing rules. |
| Ledger | Lifetime posted vendor earnings and balances for approved vendors. It excludes eligible lines that have not been posted to `vendor_earnings`. Rates describe current configuration. Completed withdrawals are reported separately. |
| Recent activity | Selected-period order creations/payments and withdrawal requests. Store filtering selects associated orders; amounts remain whole-order values. Payout amounts belong to the selected vendor. |
| Top products | Eligible units sold, with category and period filters; Super Admin also filters by store. Percentage share is revenue among the displayed top five, not share of units or all marketplace revenue. |
| Subscribers | All-time storefront newsletter signups from the existing newsletter stats endpoint. |

Today uses the existing server-local day boundary. Last 7/30 days are rolling periods. SQL aggregation uses the database session calendar. Bucket dates are returned as date labels without a JavaScript UTC conversion that could shift them to the preceding day. Deployment server and database timezone settings should remain aligned.

Chart aggregation (daily/weekly/monthly) is independent of reporting period. Empty buckets between returned observations are zero only because the endpoint supplies complete aggregates; missing values inside a returned observation remain gaps. No growth percentages are generated without a comparable historical series.

The ledger and subscribers remain explicitly lifetime measures. A historical wallet balance cannot be reconstructed by filtering today's wallet entries to an order-creation window. Store and search filters apply to the ledger rows and totals. KPI lifetime comparisons also respect the selected store.

## Corrections made

- Added a genuine daily order series to Admin analytics using the same order population as its status summary.
- Decoupled financial chart aggregation from its date range; all time no longer silently means only seven days for a daily chart.
- Aligned Super Admin's month filter with the displayed rolling “Last 30 days” label.
- Included every actual order status in Super Admin's breakdown, retaining the legacy aggregate fields for other consumers.
- Applied store filtering to top products and period/store filtering to recent activity.
- Scoped ledger totals to the same approved vendors and search as its rows.
- Scoped lifetime KPI comparisons, withdrawals, and active vendor counts to the selected store.
- Preserved historical financial amounts, rates, refund rules, and permissions.

## Local verification — 11 November 2026

Both production builds pass. Shared chart, KPI/status, and newsletter components pass targeted ESLint. Browser checks exercised both roles, date/category/store filters, chart measure and granularity, legend toggles, activity tabs, ledger search, order navigation, and empty/error states.

Read-only API checks across Today, Last 7 days, Last 30 days, and All time confirm:

- Admin and Super Admin order counts agree; status counts sum to total orders.
- Admin daily counts sum to the status total.
- Financial chart sums equal gross-sales KPIs and remain equal across daily/weekly/monthly aggregation.
- Selected-store charts and lifetime KPI totals agree.
- An unmatched ledger search returns no rows and zero aggregate totals.
- The local order-payment reconciliation difference is zero.

Screenshots cover desktop (1440×900), tablet (768×1024), and mobile (390×844), with additional narrow-width checks. These checks use local data and do not certify production payment-provider balances.
