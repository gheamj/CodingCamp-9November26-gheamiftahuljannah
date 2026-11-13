# Requirements Document

## Introduction

Bloom by Ghea — Expense & Budget Visualizer is a client-side web application designed for a florist business owner to track daily expenses, visualize spending by category, and manage a personal budget limit. The app runs entirely in the browser using pure HTML5, CSS3, and Vanilla JavaScript, persists all data in localStorage, and is published on GitHub Pages. It features a cute, branded florist aesthetic with full Light/Dark mode support and Indonesian Rupiah (Rp) currency formatting.

## Glossary

- **App**: The Bloom by Ghea — Expense & Budget Visualizer single-page web application.
- **Transaction**: A single expense entry consisting of an item name, a monetary amount in Rupiah, and a category.
- **Budget_Limit**: The user-defined maximum total spending amount in Rupiah stored in localStorage.
- **Total_Spending**: The running sum of all Transaction amounts currently stored in localStorage.
- **Remaining_Budget**: The value computed as Budget_Limit minus Total_Spending.
- **Category**: A label assigned to a Transaction, either from the default set (Food, Transport, Fun) or a user-defined Custom_Category.
- **Custom_Category**: A user-created category name stored in localStorage and available in the category dropdown and Pie Chart.
- **Pie_Chart**: The Chart.js pie chart displaying spending distribution across categories.
- **Summary_Card**: The hero section of the dashboard displaying Total_Spending, Remaining_Budget, Budget_Limit input, and the budget progress bar.
- **Transaction_List**: The scrollable list of all logged Transactions shown in the bottom-left card.
- **Progress_Bar**: The visual bar inside Summary_Card indicating the ratio of Total_Spending to Budget_Limit.
- **Theme**: The active color scheme of the App, either "light" or "dark", persisted in localStorage.
- **Formatter**: The `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })` instance used to render all monetary values.
- **Storage**: The browser's localStorage used for all client-side data persistence.

---

## Requirements

### Requirement 1: Page Layout and Structure

**User Story:** As a florist business owner, I want a clean, single-page dashboard layout, so that I can quickly navigate all features without scrolling through unrelated content.

#### Acceptance Criteria

1. THE App SHALL render a single HTML page (`index.html`) containing a top header section, a hero Summary_Card section, an Add Transaction form section, and a bottom two-column grid section.
2. THE App SHALL place the Transaction_List card in the left column and the Pie_Chart card in the right column of the bottom grid.
3. WHEN the viewport width is 600px or less, THE App SHALL stack the bottom two-column grid into a single column so Transaction_List appears above the Pie_Chart card.
4. WHEN the viewport width is greater than 600px, THE App SHALL display the bottom grid as a two-column layout with Transaction_List in the left column and Pie_Chart in the right column.
5. THE App SHALL load all styles exclusively from `css/style.css` and all scripts exclusively from `js/script.js`.
6. THE App SHALL load the Chart.js library from `https://cdn.jsdelivr.net/npm/chart.js` by placing its `<script>` tag before the `<script>` tag for `js/script.js` in `index.html`.

---

### Requirement 2: Brand Header

**User Story:** As a florist business owner, I want a branded header with the shop logo and name, so that the app feels like my own professional tool.

#### Acceptance Criteria

1. THE App SHALL display the image file `Logo.png` from the root folder inside the header as a circular badge with dimensions 56px × 56px, `border-radius: 50%`, `object-fit: cover`, a 2px solid champagne-gold (`#C9A25B`) border, and a drop shadow with 0px horizontal offset, 2px vertical offset, 6px blur radius, and rgba(0,0,0,0.15) color.
2. THE App SHALL display the heading "Bloom by Ghea" to the right of the logo and the subtitle "Expense & Budget Visualizer" directly below the heading, within the same header row.
3. THE App SHALL render the header typography using the `Quicksand` font family imported from Google Fonts, falling back to `sans-serif` if the import fails.

---

### Requirement 3: Light Mode Visual Theme

**User Story:** As a florist business owner, I want a soft, feminine light color palette, so that the app matches my florist brand identity.

#### Acceptance Criteria

1. WHILE the Theme is "light", THE App SHALL apply a page background color of `#FDF6F2` (soft blush cream).
2. WHILE the Theme is "light", THE App SHALL render all card components (including the Summary_Card, Add Transaction form card, Transaction_List card, and Pie_Chart card) with background color `#FFFFFF`, `border-radius: 18px`, a 1px solid border of `#F5E1DA` (delicate blush), and a box-shadow of `0 6px 20px rgba(226, 149, 152, 0.12)`.
3. WHILE the Theme is "light", THE App SHALL use `#E28588` (dusty rose pink) as the primary accent color for the "Add Transaction" button and all monetary figure displays (Total_Spending and Remaining_Budget), with hover state `#D36E72` applied to the button.
4. WHILE the Theme is "light", THE App SHALL use `#9CAF88` (sage green) as the background color for category badge components and `#C9A25B` (champagne gold) for secondary icon and label accents.
5. THE App SHALL import `Quicksand` from Google Fonts and apply it to all heading elements (h1–h6) and numeric/price display elements, and import `Plus Jakarta Sans` from Google Fonts and apply it to all label and body text elements.
6. WHILE the Theme is "light", THE App SHALL render the primary text content within card components in `#3D2C2C` (deep rosewood) to maintain legible contrast against the `#FFFFFF` card background.

---

### Requirement 4: Dark Mode Visual Theme

**User Story:** As a florist business owner, I want a dark mode option, so that I can use the app comfortably in low-light environments.

#### Acceptance Criteria

1. WHILE the Theme is "dark", THE App SHALL apply the dark-theme page background color token (`#1F191A`) to the page background.
2. WHILE the Theme is "dark", THE App SHALL apply the dark-theme card background color token (`#2B2224`) to all card backgrounds.
3. WHILE the Theme is "dark", THE App SHALL apply the dark-theme primary text color token (`#F9ECE8`) to all primary text elements.
4. WHILE the Theme is "dark", THE App SHALL apply the dark-theme primary accent color token (`#E89B9E`) to all primary accent elements, including buttons, active borders, and highlighted interactive controls.
5. THE App SHALL implement all theme colors using CSS custom properties so that switching the Theme changes all themed colors without a page reload.

---

### Requirement 5: Light/Dark Mode Toggle

**User Story:** As a florist business owner, I want a toggle button in the header to switch between light and dark mode, so that I can choose my preferred appearance at any time.

#### Acceptance Criteria

1. THE App SHALL display a toggle button in the header, visually distinguishable as a two-state pill-shaped control, to switch between the "light" and "dark" Theme values.
2. WHEN the toggle button is clicked or activated via keyboard, THE App SHALL switch the Theme from "light" to "dark" or from "dark" to "light" and apply the corresponding CSS variable set within 100 milliseconds without a page reload.
3. WHEN the Theme changes, THE App SHALL save the new Theme value to Storage under the key `"bloom-theme"`.
4. WHEN the App initializes, THE App SHALL read the Theme value from Storage; IF the stored value is "light" or "dark", THEN THE App SHALL apply it; IF no stored value exists or the stored value is not a recognized Theme value, THEN THE App SHALL default to the "light" Theme.

---

### Requirement 6: Hero Summary Card

**User Story:** As a florist business owner, I want a prominent summary card showing my spending and remaining budget, so that I always know my financial status at a glance.

#### Acceptance Criteria

1. THE Summary_Card SHALL display Total_Spending formatted by the Formatter as the visually dominant figure within the card, rendered in a font weight of 700 or greater.
2. THE Summary_Card SHALL display Remaining_Budget formatted by the Formatter.
3. WHEN a Transaction is added or deleted, THE Summary_Card SHALL recalculate and re-render Total_Spending and Remaining_Budget immediately.
4. WHEN Budget_Limit changes, THE Summary_Card SHALL recalculate and re-render Remaining_Budget immediately.
5. THE Summary_Card SHALL contain a numeric input field, labeled "Budget Limit (Rp)", for the user to set or update Budget_Limit.
6. WHEN the Budget_Limit input field is changed, THE App SHALL save the new Budget_Limit value to Storage under the key `"bloom-budget-limit"`.
7. WHEN the App initializes, THE App SHALL read Budget_Limit from Storage and populate the Budget_Limit input field; IF no stored value exists, THEN THE App SHALL default Budget_Limit to 0.
8. IF the Budget_Limit input field contains a non-numeric value or a value less than 0, THEN THE App SHALL reject the input, retain the previous valid Budget_Limit value, and display an error message indicating the input must be a number greater than or equal to 0.

---

### Requirement 7: Budget Progress Bar

**User Story:** As a florist business owner, I want a visual progress bar showing how much of my budget I have used, so that I can quickly assess my spending at a glance.

#### Acceptance Criteria

1. THE Progress_Bar SHALL display inside the Summary_Card and visually represent the ratio of Total_Spending to Budget_Limit as a filled horizontal bar.
2. WHEN Total_Spending changes or Budget_Limit changes, THE Progress_Bar SHALL update its fill width to reflect the current ratio within 100 milliseconds.
3. WHEN Budget_Limit is 0, THE Progress_Bar SHALL display at 0% fill width to avoid division-by-zero display errors.
4. WHEN Total_Spending exceeds Budget_Limit and Budget_Limit is greater than 0, THE Progress_Bar SHALL cap its fill width at 100%, apply the warning fill color (soft coral-red), and THE App SHALL display a warning message below the Progress_Bar indicating that spending has exceeded the budget.
5. WHEN Total_Spending is less than or equal to Budget_Limit, THE Progress_Bar SHALL display its fill color using the primary accent color token for the current Theme and THE App SHALL hide the warning message.

---

### Requirement 8: Add Transaction Form

**User Story:** As a florist business owner, I want a simple form to log my daily expenses, so that I can quickly record purchases without friction.

#### Acceptance Criteria

1. THE App SHALL display a form containing a text input for Item Name, a numeric input for Amount (Rp), a Category dropdown, and an "Add Transaction" button, all stacked vertically at 100% of the form container's width.
2. THE Category dropdown SHALL include the default options Food, Transport, and Fun (in that order) as the first entries, followed by all Custom_Category entries stored in Storage.
3. WHEN the "Add Transaction" button is activated and the Item Name field contains between 1 and 100 non-whitespace characters and the Amount field contains a numeric value between 1 and 999,999,999 inclusive, THE App SHALL create a new Transaction with a unique identifier, the trimmed item name, the entered amount, and the selected category, then add it to Storage and re-render the Transaction_List and Pie_Chart within 300 milliseconds.
4. WHEN the "Add Transaction" button is activated and the Item Name field is empty or contains only whitespace characters, THE App SHALL display an inline error message indicating the item name is required directly below the Item Name input field and SHALL NOT create a Transaction.
5. WHEN the "Add Transaction" button is activated and the Amount field is empty or contains a value less than or equal to 0 or greater than 999,999,999, THE App SHALL display an inline error message indicating a valid amount between Rp 1 and Rp 999,999,999 is required directly below the Amount input field and SHALL NOT create a Transaction.
6. WHEN a Transaction is successfully added, THE App SHALL clear the Item Name and Amount fields and reset the Category dropdown to "Food".

---

### Requirement 9: Transaction Storage

**User Story:** As a florist business owner, I want my transactions to be saved between sessions, so that I do not lose my expense records when I close the browser.

#### Acceptance Criteria

1. WHEN a Transaction is added or deleted, THE App SHALL serialize all current Transactions as a JSON array and save it to Storage under the key `"bloom-transactions"`.
2. WHEN the App initializes, THE App SHALL read the value stored under `"bloom-transactions"` from Storage and render all stored Transactions in the Transaction_List.
3. WHEN the App initializes and no Transactions are stored under `"bloom-transactions"`, THE App SHALL render an empty Transaction_List without errors.
4. IF the value read from Storage under `"bloom-transactions"` is not a valid JSON array, THEN THE App SHALL discard the malformed data, initialize with an empty Transactions array, and render an empty Transaction_List without errors.

---

### Requirement 10: Transaction List Display

**User Story:** As a florist business owner, I want to see all my logged expenses in a scrollable list, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display each Transaction as a row containing the item name, the amount formatted by the Formatter, a pastel-colored Category badge using the same color palette defined for the Pie_Chart, and a Delete button.
2. THE Transaction_List SHALL apply a fixed maximum height of 400 pixels and enable vertical scrolling when the total height of all Transaction rows exceeds that maximum height.
3. WHEN the Delete button for a Transaction is activated, THE App SHALL remove that Transaction from Storage and re-render the Transaction_List, Summary_Card, and Pie_Chart within 300 milliseconds.

---

### Requirement 11: Spending by Category Pie Chart

**User Story:** As a florist business owner, I want a pie chart showing my spending by category, so that I can understand where my money is going visually.

#### Acceptance Criteria

1. THE Pie_Chart SHALL display one slice per Category that has at least one Transaction, with each slice's arc angle proportional to that Category's total amount divided by Total_Spending.
2. THE Pie_Chart SHALL assign colors to Category slices by cycling through a pastel palette of exactly six colors in order: blush pink (`#F4A7B9`), sage green (`#9CAF88`), champagne gold (`#C9A25B`), soft peach (`#F7C59F`), lavender rose (`#C9A7C8`), and dusty mauve (`#B8A0A0`), repeating from the first color when more than six categories are present.
3. WHEN a Transaction is added or deleted, THE Pie_Chart SHALL re-render to reflect the updated category spending distribution within 300 milliseconds.
4. WHEN a user hovers a pointer device over a Pie_Chart slice, THE App SHALL display a tooltip containing the Category name and the category total formatted by the Formatter (e.g., "Food: Rp 50.000"), and SHALL hide the tooltip when the pointer leaves the slice.
5. WHEN no Transactions exist, THE Pie_Chart SHALL display a placeholder message indicating no spending data is available and SHALL NOT render any slices or throw a JavaScript error.

---

### Requirement 12: Custom Categories

**User Story:** As a florist business owner, I want to add custom expense categories like Flowers, Packaging, and Supplies, so that I can track spending specific to my florist business.

#### Acceptance Criteria

1. THE App SHALL provide a UI control (input field and button labeled "Add Category") to allow the user to enter and add a Custom_Category name.
2. WHEN the add Custom_Category control is activated and the input contains a non-empty, non-whitespace-only string of 1–30 characters not already present in the Category list (case-insensitive), THE App SHALL add the Custom_Category to Storage under the key `"bloom-custom-categories"` and append it to the Category dropdown in the Add Transaction form before the next user interaction is processed.
3. WHEN the add Custom_Category control is activated and the input is empty, contains only whitespace, exceeds 30 characters, or duplicates an existing Category (case-insensitive), THE App SHALL display an inline error message adjacent to the input field and SHALL NOT add the category.
4. WHEN the App initializes, THE App SHALL read Custom_Category entries from Storage under the key `"bloom-custom-categories"` and add them to the Category dropdown.
5. WHEN a Transaction is assigned to a Custom_Category, THE Pie_Chart SHALL render a slice for that Custom_Category using the next available color from a fixed ordered set of at least 8 distinct pastel colors, cycling back to the first color when all colors have been assigned.

---

### Requirement 13: Currency Formatting

**User Story:** As a florist business owner, I want all monetary values displayed in Indonesian Rupiah format, so that the app feels local and familiar.

#### Acceptance Criteria

1. THE Formatter SHALL format all monetary values using `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })` to produce output such as "Rp 50.000" or "Rp 1.250.000" with no trailing decimal places.
2. THE App SHALL use the Formatter for every monetary display: Total_Spending in Summary_Card, Remaining_Budget in Summary_Card, Transaction amounts in Transaction_List, Budget_Limit display, and Pie_Chart tooltip values.
3. THE App SHALL display "Rp 0" (not an empty string or NaN) when Total_Spending is zero and when no Budget_Limit has been set.
4. WHEN Remaining_Budget is negative (Total_Spending exceeds Budget_Limit), THE Formatter SHALL format it as a negative Rupiah value (e.g., "-Rp 50.000") consistent with the same `Intl.NumberFormat` locale settings.

---

### Requirement 14: Client-Side Data Persistence

**User Story:** As a florist business owner, I want all my settings and data saved in my browser, so that the app works offline without any server.

#### Acceptance Criteria

1. THE App SHALL store Transactions under the key `"bloom-transactions"`, Budget_Limit under `"bloom-budget-limit"`, Theme preference under `"bloom-theme"`, and Custom_Category entries under `"bloom-custom-categories"` exclusively in Storage (browser localStorage) with no server-side calls.
2. WHEN the App page is refreshed, THE App SHALL restore Transactions, Budget_Limit, Custom_Category entries, and Theme from their respective Storage keys so that all data and settings visible before the refresh are present and identical after the refresh.
3. THE App SHALL function as a static site with no backend dependencies, requiring only a browser to serve `index.html` directly (e.g., via GitHub Pages or the `file://` protocol).
4. IF Storage is unavailable or a write operation fails, THEN THE App SHALL continue operating using the in-memory application state for the current session and display an inline warning message indicating that data will not be saved.

---

### Requirement 15: Code Quality and Folder Structure

**User Story:** As a developer and business owner, I want the codebase to be clean, modular, and well-commented, so that I can maintain it easily and publish it on GitHub Pages.

#### Acceptance Criteria

1. THE App SHALL use exclusively pure HTML5, CSS3, and Vanilla JavaScript (ES6+) with no frameworks, component libraries, or CSS utility toolkits (no React, Vue, Angular, Tailwind, or Bootstrap).
2. THE App SHALL follow the exact folder structure: `index.html` and `Logo.png` in the root folder, all styles in `css/style.css`, and all scripts in `js/script.js`.
3. THE App SHALL include block comments in `js/script.js` demarcating at minimum the following logical sections: Storage helpers, rendering functions, and event handlers, with each section marked by a distinct comment header identifying the section name.
