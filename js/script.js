// ============================================================
//  Bloom by Ghea -- Expense & Budget Visualizer
//  js/script.js
// ============================================================

// ============================================================
// CONSTANTS
// ============================================================
const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];

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

const STORAGE_KEYS = {
  transactions:     'bloom-transactions',
  budgetLimit:      'bloom-budget-limit',
  customCategories: 'bloom-custom-categories',
  theme:            'bloom-theme',
};

// ============================================================
// STORAGE HELPERS
// ============================================================

/** Returns true when localStorage is accessible. */
function isStorageAvailable() {
  try {
    const t = '__bloom_test__';
    localStorage.setItem(t, t);
    localStorage.removeItem(t);
    return true;
  } catch {
    return false;
  }
}

/** Safe localStorage.getItem — returns null on error. */
function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Safe localStorage.setItem — sets storageUnavailable flag on error. */
function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    appState.storageUnavailable = true;
    showStorageWarning();
  }
}

function loadTransactions() {
  const raw = storageGet(STORAGE_KEYS.transactions);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTransactions() {
  storageSet(STORAGE_KEYS.transactions, JSON.stringify(appState.transactions));
}

function loadBudgetLimit() {
  const raw = storageGet(STORAGE_KEYS.budgetLimit);
  if (raw === null || raw === '') return 0;
  const n = Number(raw);
  return isFinite(n) && n >= 0 ? n : 0;
}

function saveBudgetLimit() {
  storageSet(STORAGE_KEYS.budgetLimit, String(appState.budgetLimit));
}

function loadCustomCategories() {
  const raw = storageGet(STORAGE_KEYS.customCategories);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomCategories() {
  storageSet(STORAGE_KEYS.customCategories, JSON.stringify(appState.customCategories));
}

function loadTheme() {
  const raw = storageGet(STORAGE_KEYS.theme);
  return (raw === 'dark' || raw === 'light') ? raw : 'light';
}

function saveTheme() {
  storageSet(STORAGE_KEYS.theme, appState.theme);
}

// ============================================================
// APPLICATION STATE
// ============================================================
const appState = {
  transactions:       [],
  budgetLimit:        0,
  customCategories:   [],
  theme:              'light',
  storageUnavailable: false,
};

function initState() {
  appState.transactions     = loadTransactions();
  appState.budgetLimit      = loadBudgetLimit();
  appState.customCategories = loadCustomCategories();
  appState.theme            = loadTheme();
}

// ============================================================
// DERIVED VALUE FUNCTIONS
// ============================================================

function computeTotalSpending(transactions) {
  return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

function computeRemainingBudget(limit, total) {
  return limit - total;
}

function computeProgressPercent(total, limit) {
  if (limit <= 0) return 0;
  return Math.min(total / limit * 100, 100);
}

// ============================================================
// FORMATTER
// ============================================================
const formatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
});

function formatCurrency(value) {
  if (!isFinite(value)) return 'Rp 0';
  const formatted = formatter.format(value);
  // Intl produces "Rp\u00A050.000" -- normalise to "Rp 50.000"
  return formatted.replace(/\u00A0/, ' ');
}

// ============================================================
// VALIDATION HELPERS
// ============================================================

function validateItemName(str) {
  if (typeof str !== 'string') return { valid: false, error: 'Nama item wajib diisi.' };
  const trimmed = str.trim();
  if (trimmed.length === 0) return { valid: false, error: 'Nama item wajib diisi.' };
  if (trimmed.length > 100) return { valid: false, error: 'Nama item maksimal 100 karakter.' };
  return { valid: true, value: trimmed };
}

function validateAmount(val) {
  const n = Number(val);
  if (!isFinite(n) || n < 1 || n > 999_999_999 || val === '') {
    return { valid: false, error: 'Masukkan jumlah antara Rp 1 dan Rp 999.999.999.' };
  }
  return { valid: true, value: Math.floor(n) };
}

function validateCustomCategory(name, existingList) {
  if (typeof name !== 'string') return { valid: false, error: 'Nama kategori tidak valid.' };
  const trimmed = name.trim();
  if (trimmed.length === 0) return { valid: false, error: 'Nama kategori tidak boleh kosong.' };
  if (trimmed.length > 30) return { valid: false, error: 'Nama kategori maksimal 30 karakter.' };
  const lower = trimmed.toLowerCase();
  const allCategories = [...DEFAULT_CATEGORIES, ...existingList];
  const duplicate = allCategories.some(c => c.toLowerCase() === lower);
  if (duplicate) return { valid: false, error: 'Kategori sudah ada.' };
  return { valid: true, value: trimmed };
}

// ============================================================
// RENDERING FUNCTIONS
// ============================================================

/** Returns color string for a category name, stable across re-renders. */
function categoryColor(categoryName) {
  const all = [...DEFAULT_CATEGORIES, ...appState.customCategories].sort();
  let idx = all.indexOf(categoryName);
  if (idx === -1) idx = 0;
  return CHART_COLORS[idx % CHART_COLORS.length];
}

function renderSummaryCard() {
  const total     = computeTotalSpending(appState.transactions);
  const remaining = computeRemainingBudget(appState.budgetLimit, total);

  document.getElementById('total-spending').textContent   = formatCurrency(total);
  document.getElementById('remaining-budget').textContent = formatCurrency(remaining);
}

function renderProgressBar() {
  const total   = computeTotalSpending(appState.transactions);
  const percent = computeProgressPercent(total, appState.budgetLimit);
  const fill    = document.getElementById('progress-bar-fill');
  const warning = document.getElementById('budget-warning');
  const track   = document.getElementById('progress-bar-track');

  fill.style.width = percent + '%';
  track.setAttribute('aria-valuenow', Math.round(percent));

  const isOver = appState.budgetLimit > 0 && total > appState.budgetLimit;
  fill.classList.toggle('over-budget', isOver);
  warning.hidden = !isOver;
}

function renderTransactionList() {
  const ul         = document.getElementById('transaction-list');
  const emptyState = document.getElementById('transaction-empty-state');
  const txns       = appState.transactions;

  ul.innerHTML = '';

  if (txns.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  // Show newest first
  [...txns].reverse().forEach(tx => {
    const li = document.createElement('li');
    li.className = 'tx-item';
    li.dataset.id = tx.id;

    const color = categoryColor(tx.category);

    li.innerHTML = `
      <div class="tx-left">
        <span class="tx-name">${escapeHtml(tx.name)}</span>
        <span class="tx-amount">${formatCurrency(tx.amount)}</span>
      </div>
      <span class="category-badge" style="background:${color}">${escapeHtml(tx.category)}</span>
      <button class="delete-btn" aria-label="Hapus ${escapeHtml(tx.name)}" data-id="${tx.id}">🗑</button>
    `;
    ul.appendChild(li);
  });
}

/** Chart.js instance — created once, then updated. */
let pieChartInstance = null;

function renderPieChart() {
  const canvas      = document.getElementById('pie-chart-canvas');
  const placeholder = document.getElementById('pie-chart-placeholder');
  const txns        = appState.transactions;

  if (txns.length === 0) {
    // Empty state
    if (pieChartInstance) {
      pieChartInstance.destroy();
      pieChartInstance = null;
    }
    canvas.hidden      = true;
    placeholder.hidden = false;
    return;
  }

  // Guard: Chart.js unavailable
  if (typeof Chart === 'undefined') {
    canvas.hidden      = true;
    placeholder.hidden = false;
    placeholder.textContent = 'Chart.js tidak tersedia. Periksa koneksi internet.';
    return;
  }

  // Build category totals
  const totalsMap = {};
  txns.forEach(tx => {
    totalsMap[tx.category] = (totalsMap[tx.category] || 0) + tx.amount;
  });
  const labels = Object.keys(totalsMap).sort();
  const data   = labels.map(l => totalsMap[l]);
  const colors = labels.map(l => categoryColor(l));

  canvas.hidden      = false;
  placeholder.hidden = true;

  if (pieChartInstance) {
    // Update existing chart to avoid canvas flicker
    pieChartInstance.data.labels              = labels;
    pieChartInstance.data.datasets[0].data    = data;
    pieChartInstance.data.datasets[0].backgroundColor = colors;
    pieChartInstance.update();
    return;
  }

  // Create fresh instance
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.hidden      = true;
    placeholder.hidden = false;
    return;
  }

  pieChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff',
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label(context) {
              const label = context.label || '';
              const value = formatCurrency(context.parsed);
              return ` ${label}: ${value}`;
            },
          },
        },
      },
    },
  });
}

/** Re-render everything after any state mutation. */
function renderAll() {
  renderSummaryCard();
  renderProgressBar();
  renderTransactionList();
  renderPieChart();
}

/** Populate the category <select> from state. */
function populateCategorySelect() {
  const select = document.getElementById('category-select');
  // Keep the three defaults, remove custom options then re-add
  while (select.options.length > 3) {
    select.remove(3);
  }
  appState.customCategories.forEach(cat => {
    const opt  = document.createElement('option');
    opt.value  = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

/** Show the storage unavailability banner (once). */
function showStorageWarning() {
  const banner = document.getElementById('storage-warning-banner');
  if (banner) banner.hidden = false;
}

/** Minimal HTML escape to prevent XSS in innerHTML. */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================
// EVENT HANDLERS
// ============================================================

/** Theme toggle */
function handleThemeToggle() {
  appState.theme = appState.theme === 'light' ? 'dark' : 'light';
  applyTheme();
  saveTheme();
}

function applyTheme() {
  document.body.className = appState.theme;
  const btn = document.getElementById('theme-toggle');
  btn.textContent = appState.theme === 'light' ? '🌙 Dark' : '🌸 Light';
}

/** Budget Limit input */
function handleBudgetLimitInput(e) {
  const errorEl = document.getElementById('budget-limit-error');
  const val     = e.target.value;
  const n       = Number(val);

  if (val === '' || !isFinite(n) || n < 0) {
    errorEl.textContent = 'Masukkan angka lebih dari atau sama dengan 0.';
    // Revert display but keep previous state
    e.target.value = appState.budgetLimit || '';
    return;
  }

  errorEl.textContent  = '';
  appState.budgetLimit = n;
  saveBudgetLimit();
  renderSummaryCard();
  renderProgressBar();
}

/** Add Transaction form submit */
function handleTransactionSubmit(e) {
  e.preventDefault();

  const nameInput   = document.getElementById('item-name-input');
  const amountInput = document.getElementById('amount-input');
  const nameError   = document.getElementById('item-name-error');
  const amountError = document.getElementById('amount-error');
  const select      = document.getElementById('category-select');

  const nameResult   = validateItemName(nameInput.value);
  const amountResult = validateAmount(amountInput.value);

  nameError.textContent   = nameResult.valid   ? '' : nameResult.error;
  amountError.textContent = amountResult.valid ? '' : amountResult.error;

  if (!nameResult.valid || !amountResult.valid) return;

  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString() + Math.random().toString(36).slice(2);

  const tx = {
    id,
    name:     nameResult.value,
    amount:   amountResult.value,
    category: select.value,
  };

  appState.transactions.push(tx);
  saveTransactions();
  renderAll();

  // Reset form
  nameInput.value   = '';
  amountInput.value = '';
  select.value      = 'Food';
}

/** Clear inline errors on input */
function handleNameInput() {
  document.getElementById('item-name-error').textContent = '';
}
function handleAmountInput() {
  document.getElementById('amount-error').textContent = '';
}

/** Delete transaction */
function handleDeleteTransaction(e) {
  const btn = e.target.closest('.delete-btn');
  if (!btn) return;
  const id = btn.dataset.id;
  appState.transactions = appState.transactions.filter(tx => tx.id !== id);
  saveTransactions();
  renderAll();
}

/** Add custom category */
function handleAddCategory() {
  const input    = document.getElementById('custom-cat-input');
  const errorEl  = document.getElementById('custom-cat-error');
  const result   = validateCustomCategory(input.value, appState.customCategories);

  if (!result.valid) {
    errorEl.textContent = result.error;
    return;
  }

  errorEl.textContent = '';
  appState.customCategories.push(result.value);
  saveCustomCategories();

  // Append to select
  const select = document.getElementById('category-select');
  const opt    = document.createElement('option');
  opt.value    = result.value;
  opt.textContent = result.value;
  select.appendChild(opt);

  input.value = '';
}

function handleCustomCatInput() {
  document.getElementById('custom-cat-error').textContent = '';
}

// ============================================================
// ENTRY POINT
// ============================================================
function init() {
  // Check storage
  if (!isStorageAvailable()) {
    appState.storageUnavailable = true;
    showStorageWarning();
  }

  // Hydrate state from localStorage
  initState();

  // Apply persisted theme
  applyTheme();

  // Populate budget limit input
  const budgetInput = document.getElementById('budget-limit-input');
  budgetInput.value = appState.budgetLimit > 0 ? appState.budgetLimit : '';

  // Populate category select with custom categories
  populateCategorySelect();

  // Initial render
  renderAll();

  // Wire event listeners
  document.getElementById('theme-toggle')
    .addEventListener('click', handleThemeToggle);

  budgetInput
    .addEventListener('input', handleBudgetLimitInput);

  document.getElementById('transaction-form')
    .addEventListener('submit', handleTransactionSubmit);

  document.getElementById('item-name-input')
    .addEventListener('input', handleNameInput);

  document.getElementById('amount-input')
    .addEventListener('input', handleAmountInput);

  document.getElementById('transaction-list')
    .addEventListener('click', handleDeleteTransaction);

  document.getElementById('add-category-btn')
    .addEventListener('click', handleAddCategory);

  document.getElementById('custom-cat-input')
    .addEventListener('input', handleCustomCatInput);
}

document.addEventListener('DOMContentLoaded', init);
