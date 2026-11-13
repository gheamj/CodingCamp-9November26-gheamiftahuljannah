# Design Document

## Overview

Bloom by Ghea — Expense & Budget Visualizer is a fully client-side, single-page web application (SPA) built with pure HTML5, CSS3, and Vanilla JavaScript (ES6+). It targets a florist business owner who needs to log daily expenses, view category-based spending distributions, and monitor a self-set budget limit — all without any backend service.

The application stores every piece of state in `localStorage` under four fixed keys and renders entirely in one file (`index.html`). External dependencies are intentionally minimised: only Chart.js (loaded from a CDN) is used for the pie chart. The UI supports both a light (soft-blush) and dark theme, toggleable at runtime, with the preference persisted across sessions.

**Key design goals:**
- Zero-server architecture — the app must work over `file://` and GitHub Pages alike.
- Deterministic, synchronous rendering — every user action updates the DOM within the timeout budgets stated in the requirements (100 ms for theme/progress-bar, 300 ms for transaction list/chart).
- Clear separation between Storage helpers, rendering functions, and event handlers (enforced by block-comment section headers in `js/script.js`).

---

## Architecture

The application follows a **unidirectional data-flow** pattern adapted for a plain-JS environment.

```
User Action
    │
    ▼
Event Handler (js/script.js — Event Handlers section)
    │  reads / writes
    ▼
Application State (in-memory JS object)  ◄──────────────────┐
    │  persists via                                           │
    ▼                                                         │
localStorage (4 keys)                                        │
    │  on init: hydrates state                               │
    ▼                                                         │
Render Functions (js/script.js — Rendering section)          │
    │  update DOM + Chart.js instance                        │
    ▼                                                         │
DOM / Chart.js ──────── user interacts again ────────────────┘
```

### Module Boundaries (single-file, comment-delimited)

| Logical Section | Responsibility |
|---|---|
| **Storage Helpers** | Read/write each of the four `localStorage` keys; deserialise JSON; guard against unavailable storage |
| **Rendering Functions** | Compute derived values (Total_Spending, Remaining_Budget, Progress_Bar %); update DOM nodes; rebuild Chart.js instance |
| **Event Handlers** | Listen for form submissions, button clicks, input changes; validate inputs; call storage helpers then rendering functions |

### File Layout

```
root/
├── index.html          ← single HTML page; loads CDN Chart.js then js/script.js
├── Logo.png            ← circular brand badge
├── css/
│   └── style.css       ← all styling, CSS custom properties for themes
└── js/
    └── script.js       ← all application logic (3 comment-delimited sections)
```

---

## Components and Interfaces

### 1. Header

- Renders `Logo.png` as a 56 × 56 px circular badge (border-radius 50%, 2px champagne-gold border, drop-shadow).
- Displays heading "Bloom by Ghea" and subtitle "Expense & Budget Visualizer" in Quicksand font.
- Contains the **Theme Toggle Button** — a pill-shaped two-state control.
  - On click: flips `appState.theme`, writes to `localStorage["bloom-theme"]`, applies the matching CSS class to `<body>` (or `<html>`), updates the button icon/label.

### 2. Summary Card (Hero)

- Reads from `appState` (derived values): `totalSpending`, `remainingBudget`, `budgetLimit`.
- Exposes a `<input type="number">` labeled "Budget Limit (Rp)".
- **Budget Limit input interface:**
  - `input` event: validates ≥ 0 and numeric; on success persists to `localStorage["bloom-budget-limit"]` and triggers `renderSummaryCard()` + `renderProgressBar()`.
  - Invalid values: retains previous value, shows inline error.

### 3. Progress Bar

- A `<div>` whose `width` style is set to `clamp(0%, ratio * 100%, 100%)`.
- Color: primary accent token when ≤ 100 %; soft coral-red + visible warning message when > 100 %.
- Recalculates on every `renderProgressBar()` call.

### 4. Add Transaction Form

- Fields: `itemName` (text, 1–100 non-whitespace chars), `amount` (number, 1–999,999,999), `category` (select).
- On submit: validates both fields → creates a Transaction object → pushes to `appState.transactions` → persists → calls `renderTransactionList()`, `renderSummaryCard()`, `renderProgressBar()`, `renderPieChart()`.
- On success: clears `itemName` and `amount`, resets `category` to "Food".

### 5. Transaction List

- Maps `appState.transactions` array (reverse-chronological or insertion order) to `<li>` rows.
- Each row: item name | Formatter amount | pastel Category badge | Delete button.
- Delete button: removes item from `appState.transactions`, persists, calls all render functions.
- Container has `max-height: 400px; overflow-y: auto`.

### 6. Pie Chart

- Instantiated once as `window.pieChart = new Chart(ctx, config)` and **updated** (not recreated) via `pieChart.data = …; pieChart.update()` on every render call to avoid canvas flicker.
- Each category slice color is drawn from the fixed 6-color pastel palette (cycling).
- Tooltip: Category name + Formatter total.
- Empty state: destroys / hides the canvas and shows a placeholder `<p>` message; recreates the Chart instance on the next add.

### 7. Custom Category Control

- Text input (1–30 chars) + "Add Category" button in its own `<div>` below the Add Transaction form or alongside it.
- On add: validates non-empty, non-whitespace, ≤ 30 chars, case-insensitive uniqueness → pushes to `appState.customCategories` → persists to `localStorage["bloom-custom-categories"]` → appends `<option>` to the category `<select>`.

---

## Data Models

### Application State Object (`appState`)

The in-memory singleton that all render functions read from.

```javascript
const appState = {
  transactions: [],       // Transaction[]  — source of truth for spending
  budgetLimit: 0,         // number         — user-set Rp limit
  customCategories: [],   // string[]       — user-added category names
  theme: 'light',         // 'light' | 'dark'
};
```

### Transaction

```javascript
{
  id:       string,   // crypto.randomUUID() or Date.now().toString()
  name:     string,   // trimmed item name (1–100 chars)
  amount:   number,   // integer Rp, 1–999_999_999
  category: string,   // one of DEFAULT_CATEGORIES ∪ appState.customCategories
}
```

### localStorage Schema

| Key | Type stored | Default if missing |
|---|---|---|
| `"bloom-transactions"` | JSON array of Transaction | `[]` |
| `"bloom-budget-limit"` | Numeric string | `0` |
| `"bloom-custom-categories"` | JSON array of strings | `[]` |
| `"bloom-theme"` | `"light"` \| `"dark"` | `"light"` |

### Derived Values (computed at render time, never stored)

```
totalSpending     = sum of transaction.amount for all transactions
remainingBudget   = budgetLimit - totalSpending
progressPercent   = budgetLimit > 0 ? clamp(totalSpending / budgetLimit * 100, 0, 100) : 0
categoryTotals    = Map<string, number>  — category → sum of amounts
```

### CSS Custom Properties (Theme Tokens)

```css
/* Light theme — applied to :root or body.light */
--color-bg:           #FDF6F2;
--color-card-bg:      #FFFFFF;
--color-card-border:  #F5E1DA;
--color-accent:       #E28588;
--color-accent-hover: #D36E72;
--color-text:         #3D2C2C;
--color-sage:         #9CAF88;
--color-gold:         #C9A25B;

/* Dark theme — applied to body.dark */
--color-bg:           #1F191A;
--color-card-bg:      #2B2224;
--color-text:         #F9ECE8;
--color-accent:       #E89B9E;
```

### Pie Chart Palette (fixed ordered set)

```javascript
const CHART_COLORS = [
  '#F4A7B9', // blush pink
  '#9CAF88', // sage green
  '#C9A25B', // champagne gold
  '#F7C59F', // soft peach
  '#C9A7C8', // lavender rose
  '#B8A0A0', // dusty mauve
  '#A8D5BA', // mint
  '#F9E0AE', // butter yellow
];
```

Index is assigned per unique category name on first appearance; the index is derived deterministically by sorting categories alphabetically so colors remain stable across re-renders.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Transaction storage round-trip

*For any* valid Transaction (non-empty name, amount in [1, 999 999 999], valid category), serializing the full transactions array to localStorage and then deserializing it must produce an array where the transaction is present and all its fields are identical to the originals.

**Validates: Requirements 9.1, 9.2**

### Property 2: Total spending equals sum of transaction amounts

*For any* non-empty array of transactions, the computed `totalSpending` must equal the arithmetic sum of every `transaction.amount` in that array.

**Validates: Requirements 6.1, 6.3**

### Property 3: Remaining budget is always budgetLimit minus totalSpending

*For any* `budgetLimit` ≥ 0 and any set of transactions, `remainingBudget` must equal `budgetLimit − totalSpending` for all combinations, including when `totalSpending > budgetLimit` (producing a negative value).

**Validates: Requirements 6.2, 13.4**

### Property 4: Progress bar percentage is clamped to [0, 100]

*For any* `totalSpending` ≥ 0 and any `budgetLimit` ≥ 0, the computed `progressPercent` must be in the closed interval [0, 100]; it must be 0 when `budgetLimit` is 0.

**Validates: Requirements 7.3, 7.4**

### Property 5: Whitespace-only or empty item names are rejected

*For any* string composed entirely of whitespace characters (or the empty string), submitting it as an item name must leave the transactions array unchanged.

**Validates: Requirements 8.4**

### Property 6: Amounts outside [1, 999 999 999] are rejected

*For any* numeric value ≤ 0 or > 999 999 999, submitting it as an amount must leave the transactions array unchanged.

**Validates: Requirements 8.5**

### Property 7: Category pie slice proportions sum to 1

*For any* non-empty transactions array, the sum of all category slice proportions (each category total divided by `totalSpending`) must equal exactly 1.0.

**Validates: Requirements 11.1**

### Property 8: Duplicate or invalid custom categories are rejected

*For any* category name that is empty, whitespace-only, exceeds 30 characters, or already exists in the category list (case-insensitive comparison), attempting to add it must leave `appState.customCategories` unchanged.

**Validates: Requirements 12.3**

### Property 9: Formatter always produces a valid Rupiah string

*For any* finite JavaScript number (including 0 and negative values), the Formatter must produce a non-empty string beginning with "Rp" and must never return `"NaN"` or an empty string.

**Validates: Requirements 13.1, 13.3, 13.4**

### Property 10: Deleting a transaction removes exactly that transaction

*For any* transactions array and any valid transaction id present in that array, deleting by that id must produce an array where exactly that transaction is absent and all other transactions are present and unmodified.

**Validates: Requirements 10.3**

---

## Error Handling

### Storage Unavailability

`localStorage` can be unavailable (private browsing on some browsers, quota exceeded, security policy). The Storage helpers must wrap all read/write calls in a `try/catch`:

- **Read failure**: return the safe default (`[]`, `0`, `[]`, `"light"`) and set a flag `appState.storageUnavailable = true`.
- **Write failure**: the in-memory `appState` continues to be the source of truth for the current session; a dismissible inline banner ("⚠ Data won't be saved — storage unavailable") is shown once.

### JSON Parse Errors

When reading `"bloom-transactions"` or `"bloom-custom-categories"`, if `JSON.parse` throws:
- Discard the malformed value.
- Initialise the respective array as `[]`.
- Do not propagate the error to the user; operate normally.

### Invalid Budget Limit Input

- Non-numeric or value < 0: retain previous `budgetLimit`, show inline error message directly below the input, clear the error after the next valid input.

### Form Validation Errors

- Item name empty / whitespace-only: inline error below item name field; block form submission.
- Amount empty / ≤ 0 / > 999,999,999: inline error below amount field; block form submission.
- Both errors may be shown simultaneously if both fields fail.
- Errors are cleared as soon as the field is re-validated (on `input` event or on next submit attempt).

### Chart.js Errors

- If Chart.js fails to load from CDN, `window.Chart` will be `undefined`. A guard in `renderPieChart()` checks for this and renders a text fallback message in the chart card area.
- If the canvas context cannot be obtained, the same fallback applies.

### Pie Chart Empty State

When `appState.transactions` is empty:
- Destroy any existing Chart.js instance (call `.destroy()` if it exists).
- Hide the canvas element.
- Display a `<p>` placeholder: "No spending data yet. Add a transaction to see your chart."

---

## Testing Strategy

This feature is a pure client-side UI application with no server, no build step, and no test runner configured by default. Testing is split across three levels.

### Unit Tests (example-based)

Target: pure functions isolated from the DOM and localStorage.

| Function | What to test |
|---|---|
| `computeTotalSpending(transactions)` | Empty array → 0; single item; multiple items; large amounts |
| `computeRemainingBudget(limit, total)` | Zero limit; negative result; exact equality |
| `computeProgressPercent(total, limit)` | Zero limit → 0; > limit → 100; midpoint |
| `formatCurrency(value)` | 0, positive, negative, large value |
| `validateItemName(str)` | Empty, whitespace-only, 1 char, 100 chars, 101 chars |
| `validateAmount(val)` | 0, 1, 999 999 999, 1 000 000 000, negative, NaN |
| `validateCustomCategory(name, existing)` | Duplicate case-insensitive, too long, empty, valid |
| `serializeTransactions(arr)` / `deserializeTransactions(str)` | Round-trip; malformed JSON; empty array |

Recommended framework: **Vitest** (or plain `<script type="module">` test harness if zero tooling is desired, since the project uses no build tools). Run with `vitest --run` for single execution.

### Property-Based Tests

Target: universal properties defined in the Correctness Properties section above.

Recommended library: **[fast-check](https://github.com/dubzzz/fast-check)** (browser-compatible via CDN or npm).

Each test must run a minimum of **100 iterations**. Tag each test with a comment:

```javascript
// Feature: bloom-expense-budget-visualizer, Property N: <property_text>
```

| Property | Generator strategy |
|---|---|
| P1 — Storage round-trip | Arbitrary `{name, amount, category}` triples; amount in [1, 999 999 999] |
| P2 — Total spending = sum | Arrays of 1–50 random Transaction amounts |
| P3 — Remaining budget identity | Random limit ≥ 0, random transaction arrays |
| P4 — Progress bar clamped [0, 100] | Arbitrary non-negative integers for total and limit |
| P5 — Whitespace names rejected | `fc.string()` filtered to whitespace-only + empty |
| P6 — Invalid amounts rejected | Integers < 1 and > 999 999 999 |
| P7 — Pie proportions sum to 1 | Arrays of transactions with varied category distributions |
| P8 — Duplicate categories rejected | Existing category list + case-insensitive variant of an existing name |
| P9 — Formatter never NaN/empty | `fc.double({ noNaN: true })` including 0 and negatives |
| P10 — Delete removes exactly one | Arrays with ≥ 1 transaction; random valid id selection |

### Integration / Smoke Tests

Manual or automated browser-level checks (e.g., Playwright) for:

1. **Page load** — app renders without JS errors; Summary_Card shows "Rp 0" values; Transaction_List is empty; pie chart shows placeholder.
2. **Add transaction** — filling the form and submitting adds a row to the list, updates totals, and renders a pie slice.
3. **Delete transaction** — removing the last item hides pie chart, resets totals to zero.
4. **Budget limit** — entering a limit updates the progress bar; exceeding it shows the warning color and message.
5. **Custom category** — adding a custom category appends it to the dropdown and appears as a pie slice after a matching transaction.
6. **Theme toggle** — toggling applies the dark theme tokens; refreshing the page restores the saved theme.
7. **Page refresh persistence** — all four localStorage keys restore correctly after a hard refresh.
8. **Responsive layout** — at ≤ 600 px viewport the two-column grid stacks to single column.
9. **Storage unavailability** — simulating `localStorage` being unavailable shows the warning banner and the app still functions.
