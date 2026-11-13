# Implementation Plan: Bloom by Ghea — Expense & Budget Visualizer

## Overview

Build a fully client-side, single-page expense tracker using pure HTML5, CSS3, and Vanilla JavaScript (ES6+). The implementation follows the unidirectional data-flow architecture defined in the design: event handlers → appState mutation → localStorage persistence → render functions → DOM update. All 15 areas are covered in dependency order so each task compiles on the previous one.

## Tasks

- [ ] 1. Scaffold project structure and core HTML skeleton
  - [x] 1.1 Create folder structure and static files
    - Create `css/style.css` and `js/script.js` as empty files in the correct directories
    - Create `index.html` in the root with `<!DOCTYPE html>`, `<html lang="id">`, `<head>` (charset, viewport, title "Bloom by Ghea"), and an empty `<body>`
    - Add the Chart.js CDN `<script>` tag and the `<link>` to `css/style.css` and the `<script src="js/script.js" defer>` tag in the correct load order (Chart.js first, then `js/script.js`)
    - _Requirements: 1.1, 1.5, 1.6, 15.2_

  - [-] 1.2 Build the HTML page structure
    - Add `<header>` section, hero `<section id="summary-card">`, `<section id="add-transaction">`, and the bottom `<div class="grid-layout">` containing `<div id="transaction-list-card">` (left) and `<div id="pie-chart-card">` (right)
    - Verify all IDs and class names match what `js/script.js` will query
    - _Requirements: 1.1, 1.2, 15.1_

- [ ] 2. Implement CSS custom properties, theme tokens, and base styles
  - [-] 2.1 Define CSS custom properties for light and dark themes
    - Declare all light-theme tokens on `:root` / `body.light`: `--color-bg`, `--color-card-bg`, `--color-card-border`, `--color-accent`, `--color-accent-hover`, `--color-text`, `--color-sage`, `--color-gold`
    - Declare dark-theme token overrides on `body.dark`
    - _Requirements: 3.1–3.6, 4.1–4.5_

  - [~] 2.2 Add Google Fonts import and base typography
    - Import `Quicksand` and `Plus Jakarta Sans` from Google Fonts via `@import` at the top of `style.css`
    - Apply `Quicksand` to all `h1`–`h6` and numeric/price display elements; apply `Plus Jakarta Sans` to all labels and body text
    - _Requirements: 2.3, 3.5_

  - [~] 2.3 Style card components and global layout
    - Apply `background: var(--color-bg)` to `body`; apply card styles (`background: var(--color-card-bg)`, `border-radius: 18px`, `1px solid var(--color-card-border)`, box-shadow) to all four cards
    - Set the bottom grid to `display: grid; grid-template-columns: 1fr 1fr; gap: 1rem`
    - Add the responsive breakpoint: `@media (max-width: 600px)` → `grid-template-columns: 1fr` so Transaction_List stacks above Pie_Chart
    - _Requirements: 1.3, 1.4, 3.2_

- [ ] 3. Implement the Header component
  - [~] 3.1 Build header markup and logo styles
    - Add `<img src="Logo.png" alt="Bloom by Ghea logo" class="logo-badge">` inside `<header>`, followed by the brand text `<h1>Bloom by Ghea</h1>` and `<p class="subtitle">Expense & Budget Visualizer</p>`
    - Add CSS for `.logo-badge`: `width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid #C9A25B; box-shadow: 0 2px 6px rgba(0,0,0,0.15)`
    - _Requirements: 2.1, 2.2, 2.3_

  - [~] 3.2 Build the theme toggle button markup and styles
    - Add `<button id="theme-toggle" aria-label="Toggle theme">` inside `<header>` with a pill shape via `border-radius: 999px` and appropriate padding
    - Display a sun/moon icon or "Light / Dark" label that updates to reflect the current theme state
    - _Requirements: 5.1_

- [ ] 4. Implement localStorage Storage helpers (`js/script.js` — Storage Helpers section)
  - [~] 4.1 Write the Storage helper module
    - Define `STORAGE_KEYS` constant: `{ TRANSACTIONS: 'bloom-transactions', BUDGET: 'bloom-budget-limit', CATEGORIES: 'bloom-custom-categories', THEME: 'bloom-theme' }`
    - Implement `readStorage(key, fallback)`: wraps `localStorage.getItem` in `try/catch`; returns `fallback` and sets `appState.storageUnavailable = true` on failure
    - Implement `writeStorage(key, value)`: wraps `localStorage.setItem` in `try/catch`; sets `appState.storageUnavailable = true` and shows the storage warning banner on failure
    - Implement `loadTransactions()`: reads `bloom-transactions`, `JSON.parse`s it, falls back to `[]` on parse error or missing value (Requirement 9.4)
    - Implement `loadBudgetLimit()`: reads `bloom-budget-limit`, parses to number, falls back to `0`
    - Implement `loadCustomCategories()`: reads `bloom-custom-categories`, `JSON.parse`s it, falls back to `[]`
    - Implement `loadTheme()`: reads `bloom-theme`, validates "light" | "dark", falls back to `"light"`
    - _Requirements: 9.1–9.4, 14.1–14.4_

  - [~] 4.2 Implement appState initialization and hydration
    - Define `const appState = { transactions: [], budgetLimit: 0, customCategories: [], theme: 'light', storageUnavailable: false }`
    - Implement `hydrateState()`: calls all four `load*` helpers and assigns results to `appState`; call it once at script load
    - _Requirements: 5.4, 6.7, 9.2, 12.4, 14.2_

- [ ] 5. Implement Currency Formatter and pure computation helpers (`js/script.js` — Storage Helpers section)
  - [~] 5.1 Implement the Formatter and derived-value functions
    - Define `const Formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })`
    - Implement `formatCurrency(value)`: returns `Formatter.format(value)`; guard: if `value` is `NaN` or not finite, return `Formatter.format(0)`
    - Implement `computeTotalSpending(transactions)`: returns `transactions.reduce((sum, t) => sum + t.amount, 0)`
    - Implement `computeRemainingBudget(budgetLimit, totalSpending)`: returns `budgetLimit - totalSpending`
    - Implement `computeProgressPercent(totalSpending, budgetLimit)`: returns `budgetLimit > 0 ? Math.min(totalSpending / budgetLimit * 100, 100) : 0`
    - _Requirements: 13.1–13.4_

  - [ ]* 5.2 Write property tests for computation helpers (Property 2, 3, 4, 9)
    - **Property 2: Total spending equals sum of transaction amounts** — generate arrays of 1–50 random Transaction amounts; assert `computeTotalSpending` matches `array.reduce` sum
    - **Validates: Requirements 6.1, 6.3**
    - **Property 3: Remaining budget identity** — arbitrary `budgetLimit ≥ 0` and transaction arrays; assert `computeRemainingBudget` equals `budgetLimit - computeTotalSpending`
    - **Validates: Requirements 6.2, 13.4**
    - **Property 4: Progress bar clamped [0, 100]** — arbitrary non-negative integers; assert result ∈ [0, 100] and equals 0 when `budgetLimit` is 0
    - **Validates: Requirements 7.3, 7.4**
    - **Property 9: Formatter never returns NaN or empty** — `fc.double({ noNaN: true })` including 0 and negatives; assert result starts with "Rp" and is non-empty
    - **Validates: Requirements 13.1, 13.3, 13.4**
    - _Tag each test: `// Feature: bloom-expense-budget-visualizer, Property N: <text>`_

  - [ ]* 5.3 Write unit tests for Formatter and computation helpers
    - `computeTotalSpending`: empty array → 0; single item; multiple items
    - `computeRemainingBudget`: zero limit; negative result; exact equality
    - `computeProgressPercent`: zero limit → 0; total > limit → 100; midpoint
    - `formatCurrency`: 0 → "Rp 0"; 50000 → "Rp 50.000"; negative; large value

- [~] 6. Checkpoint — verify storage helpers and computation functions
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement Rendering functions (`js/script.js` — Rendering Functions section)
  - [~] 7.1 Implement `renderSummaryCard()`
    - Query DOM elements for total-spending and remaining-budget display nodes
    - Compute `totalSpending` and `remainingBudget` from `appState`; format with `formatCurrency`; write to DOM
    - Populate the Budget Limit `<input>` with `appState.budgetLimit` on first render; do not overwrite while user is typing
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [~] 7.2 Implement `renderProgressBar()`
    - Compute `progressPercent`; set `progressBarFill.style.width = progressPercent + '%'`
    - If `totalSpending > budgetLimit && budgetLimit > 0`: set fill color to soft coral-red (`#E06C75`) and show warning message element
    - Else: set fill color to `var(--color-accent)` and hide the warning message
    - _Requirements: 7.1–7.5_

  - [~] 7.3 Implement `renderTransactionList()`
    - Clear the transaction list container; iterate `appState.transactions` (reverse insertion order)
    - For each transaction create an `<li>` with: item name, `formatCurrency(amount)`, a `<span class="category-badge">` (background from `CHART_COLORS[categoryIndex]`), and a `<button class="delete-btn" data-id="...">Delete</button>`
    - If `appState.transactions` is empty, show an empty-state message
    - _Requirements: 10.1, 10.2_

  - [~] 7.4 Implement `renderPieChart()`
    - Compute `categoryTotals` as a `Map<string, number>` from `appState.transactions`
    - If the map is empty: destroy any existing `window.pieChart` instance, hide the `<canvas>`, show the `<p>` placeholder "No spending data yet. Add a transaction to see your chart."
    - Otherwise: show the canvas, hide the placeholder; if `window.pieChart` exists call `pieChart.data.labels = [...]; pieChart.data.datasets[0].data = [...]; pieChart.data.datasets[0].backgroundColor = [...]; pieChart.update()` (avoid recreating to prevent flicker); if no instance exists, create `window.pieChart = new Chart(ctx, config)` with the tooltip callback using `formatCurrency`
    - Assign slice colors by sorting category names alphabetically and indexing into `CHART_COLORS` (cycling)
    - Guard against `window.Chart` being undefined (CDN load failure): render text fallback
    - _Requirements: 11.1–11.5_

  - [ ]* 7.5 Write property test for Pie Chart proportions (Property 7)
    - **Property 7: Category pie slice proportions sum to 1** — generate arrays of transactions with varied category distributions; compute `categoryTotals`; assert all proportions sum to 1.0 (within floating-point epsilon)
    - **Validates: Requirements 11.1**

  - [ ]* 7.6 Write unit tests for rendering helpers
    - `renderTransactionList`: empty transactions → empty-state message rendered; single transaction → list row present with correct text
    - `renderProgressBar`: 50% fill → width is 50%; 150% → width capped at 100% and warning visible; 0 budget → 0% fill

- [ ] 8. Implement the Theme Toggle (`js/script.js` — Event Handlers section)
  - [~] 8.1 Wire theme toggle event and CSS class swap
    - Add `click` listener on `#theme-toggle`
    - Handler: toggle `appState.theme` between `"light"` and `"dark"`; remove old class from `<body>`, add new class; call `writeStorage(STORAGE_KEYS.THEME, appState.theme)`; update button icon/label
    - On `hydrateState()`: after loading theme, apply `document.body.classList.add(appState.theme)` and set initial button label
    - _Requirements: 5.2, 5.3, 5.4_

- [ ] 9. Implement the Summary Card and Budget Limit event handler
  - [~] 9.1 Wire Budget Limit input event handler
    - Add `input` event listener on the Budget Limit `<input type="number">`
    - Validate: value must be numeric and ≥ 0; on failure retain `appState.budgetLimit`, show inline error below the input
    - On success: update `appState.budgetLimit`, call `writeStorage(STORAGE_KEYS.BUDGET, appState.budgetLimit)`, call `renderSummaryCard()`, `renderProgressBar()`
    - _Requirements: 6.5, 6.6, 6.7, 6.8_

- [ ] 10. Implement the Add Transaction Form (`js/script.js` — Event Handlers section)
  - [~] 10.1 Implement transaction validation helpers
    - `validateItemName(str)`: returns `true` if `str.trim().length` is between 1 and 100
    - `validateAmount(val)`: returns `true` if `val` is a finite integer between 1 and 999,999,999 inclusive
    - _Requirements: 8.3, 8.4, 8.5_

  - [ ]* 10.2 Write property tests for transaction validation (Property 5, 6)
    - **Property 5: Whitespace-only or empty item names are rejected** — generate whitespace-only and empty strings; assert `validateItemName` returns false and transaction array is unchanged after attempted add
    - **Validates: Requirements 8.4**
    - **Property 6: Amounts outside [1, 999 999 999] are rejected** — generate integers < 1 and > 999,999,999; assert `validateAmount` returns false
    - **Validates: Requirements 8.5**

  - [~] 10.3 Wire Add Transaction form submit handler
    - Add `submit` listener (or `click` on "Add Transaction" button, with `preventDefault`)
    - Run `validateItemName` and `validateAmount`; if either fails show the respective inline error message and return
    - On success: create `{ id: crypto.randomUUID(), name: itemName.trim(), amount: Number(amount), category: selectedCategory }`; push to `appState.transactions`; call `writeStorage(STORAGE_KEYS.TRANSACTIONS, appState.transactions)`; call `renderTransactionList()`, `renderSummaryCard()`, `renderProgressBar()`, `renderPieChart()`; clear fields and reset category to "Food"
    - _Requirements: 8.1–8.6_

  - [ ]* 10.4 Write unit tests for form validation and transaction creation
    - `validateItemName`: empty string → false; "  " → false; "a" → true; 100-char string → true; 101-char string → false
    - `validateAmount`: 0 → false; 1 → true; 999999999 → true; 1000000000 → false; negative → false; NaN → false

- [ ] 11. Implement the Transaction List delete handler
  - [~] 11.1 Wire delete button event handler
    - Use event delegation on the transaction list container: listen for `click` events, check `event.target.matches('.delete-btn')`, read `data-id`
    - Remove matching transaction from `appState.transactions`; call `writeStorage(STORAGE_KEYS.TRANSACTIONS, appState.transactions)`; call `renderTransactionList()`, `renderSummaryCard()`, `renderProgressBar()`, `renderPieChart()`
    - _Requirements: 10.3_

  - [ ]* 11.2 Write property test for delete correctness (Property 10)
    - **Property 10: Deleting a transaction removes exactly that transaction** — generate arrays with ≥ 1 transaction; pick a random valid id; apply delete logic; assert the array contains no entry with that id and all other entries are identical and unmodified
    - **Validates: Requirements 10.3**

- [ ] 12. Implement the Custom Category control (`js/script.js` — Event Handlers section)
  - [~] 12.1 Build the Custom Category UI markup
    - Add a `<div id="custom-category-control">` containing `<input id="custom-cat-input" maxlength="30">`, `<button id="add-category-btn">Add Category</button>`, and `<span id="custom-cat-error" class="error-msg">` for inline errors
    - Place the control below the Add Transaction form card or alongside it in `index.html`
    - _Requirements: 12.1_

  - [~] 12.2 Implement custom category validation and add handler
    - `validateCustomCategory(name, existingList)`: returns `true` if `name.trim().length` is 1–30 AND `existingList` does not already contain `name.trim()` (case-insensitive)
    - Add `click` listener on `#add-category-btn`
    - On validation failure: show inline error message; do not modify state
    - On success: push `name.trim()` to `appState.customCategories`; call `writeStorage(STORAGE_KEYS.CATEGORIES, appState.customCategories)`; append a new `<option>` to the category `<select>`; clear the input
    - On `hydrateState()`: after loading custom categories, populate the category `<select>` with default options (Food, Transport, Fun) followed by all custom categories
    - _Requirements: 12.2–12.5_

  - [ ]* 12.3 Write property test for duplicate category rejection (Property 8)
    - **Property 8: Duplicate or invalid custom categories are rejected** — generate an existing category list and a case-insensitive variant of one of its entries; assert `validateCustomCategory` returns false and `appState.customCategories` is unchanged
    - **Validates: Requirements 12.3**

  - [ ]* 12.4 Write unit tests for custom category validation
    - Empty string → false; whitespace only → false; 1 char → true; 30 chars → true; 31 chars → false; exact duplicate → false; case-insensitive duplicate → false; unique name → true

- [ ] 13. Implement localStorage round-trip and persistence property tests
  - [ ]* 13.1 Write property test for storage round-trip (Property 1)
    - **Property 1: Transaction storage round-trip** — generate arbitrary valid `{name, amount, category}` triples (amount in [1, 999,999,999]); serialize and deserialize using the Storage helper; assert the recovered transaction has identical fields
    - **Validates: Requirements 9.1, 9.2**

- [~] 14. Checkpoint — verify all event handlers and integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Wire full initialization on `DOMContentLoaded`
  - [~] 15.1 Implement the `init()` entry point
    - Register a `DOMContentLoaded` listener that calls `hydrateState()` then calls all four render functions (`renderSummaryCard()`, `renderProgressBar()`, `renderTransactionList()`, `renderPieChart()`) and applies the saved theme class to `<body>`
    - Display the storage unavailability banner if `appState.storageUnavailable` is true after hydration
    - _Requirements: 5.4, 6.7, 9.2, 9.3, 12.4, 14.2, 14.4_

- [~] 16. Final checkpoint — full integration pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP build
- Property-based tests require **fast-check** (`npm install fast-check` or CDN import); unit tests are written with **Vitest** (`vitest --run` for single execution)
- All four `localStorage` keys (`bloom-transactions`, `bloom-budget-limit`, `bloom-custom-categories`, `bloom-theme`) must be written and read exclusively via the Storage helpers defined in Task 4
- CSS custom properties ensure the entire theme swap happens without a page reload (Requirement 4.5)
- Chart.js is never recreated on updates — only `.update()` is called to avoid canvas flicker (design decision)
- `crypto.randomUUID()` is used for transaction IDs; it is available in all modern browsers and over `file://` without a polyfill

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.1"] },
    { "id": 3, "tasks": ["3.2", "4.1"] },
    { "id": 4, "tasks": ["4.2", "5.1"] },
    { "id": 5, "tasks": ["5.2", "5.3", "7.1", "7.2", "7.3", "8.1"] },
    { "id": 6, "tasks": ["7.4", "7.5", "7.6", "9.1", "10.1", "12.1"] },
    { "id": 7, "tasks": ["10.2", "10.3", "11.1", "12.2"] },
    { "id": 8, "tasks": ["10.4", "11.2", "12.3", "12.4", "13.1"] },
    { "id": 9, "tasks": ["15.1"] }
  ]
}
```
