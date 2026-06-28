/* Управление интерфейсом приложения PLANT */

import { db } from './db.js';
import Chart from 'chart.js/auto';

export const ui = {
  // Экземпляры графиков
  balanceChart: null,
  expenseChart: null,

  init() {
    this.loader = document.getElementById('app-loader');
    this.authScreen = document.getElementById('auth-screen');
    this.mainScreen = document.getElementById('main-screen');
    this.loginForm = document.getElementById('login-form');
    this.logoutBtn = document.getElementById('logout-btn');
    this.navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    this.tabContents = document.querySelectorAll('.tab-content');

    // Категории DOM
    this.categoryForm = document.getElementById('category-form');
    this.categoryNameInput = document.getElementById('category-name');
    this.categoryTypeSelect = document.getElementById('category-type');
    this.selectedColorInput = document.getElementById('selected-category-color');
    this.selectedIconInput = document.getElementById('selected-category-icon');
    this.colorSwatches = document.querySelectorAll('.color-swatch');
    this.iconSwatches = document.querySelectorAll('.icon-swatch');
    this.cancelCategoryEditBtn = document.getElementById('cancel-category-edit');
    this.categoryFormTitle = document.getElementById('category-form-title');

    // Транзакции DOM
    this.txForm = document.getElementById('transaction-form');
    this.txFormTitle = document.getElementById('transaction-form-title');
    this.saveTxBtn = document.getElementById('save-transaction-btn');
    this.cancelTxEditBtn = document.getElementById('cancel-transaction-edit');
    this.txIdEdit = document.getElementById('tx-id-edit');
    this.txDescription = document.getElementById('tx-description');
    this.txType = document.getElementById('tx-type');
    this.txCategory = document.getElementById('tx-category');
    this.txAmount = document.getElementById('tx-amount');
    this.txDate = document.getElementById('tx-date');

    // Бюджеты DOM
    this.budgetForm = document.getElementById('budget-form');
    this.budgetFormTitle = document.getElementById('budget-form-title');
    this.budgetIdEdit = document.getElementById('budget-id-edit');
    this.budgetCategory = document.getElementById('budget-category');
    this.budgetLimit = document.getElementById('budget-limit');
    this.budgetsListItems = document.getElementById('budgets-list-items');
    this.cancelBudgetEditBtn = document.getElementById('cancel-budget-edit');

    // Планирование DOM
    this.planningForm = document.getElementById('planning-form');
    this.planningFormTitle = document.getElementById('planning-form-title');
    this.savePlanBtn = document.getElementById('save-planning-btn');
    this.cancelPlanEditBtn = document.getElementById('cancel-planning-edit');
    this.planIdEdit = document.getElementById('plan-id-edit');
    this.planDescription = document.getElementById('plan-description');
    this.planType = document.getElementById('plan-type');
    this.planCategory = document.getElementById('plan-category');
    this.planAmount = document.getElementById('plan-amount');
    this.planDate = document.getElementById('plan-date');
    this.planningList = document.getElementById('planning-list');
    this.planningEmptyState = document.getElementById('planning-empty-state');

    // Фильтры DOM
    this.txSearch = document.getElementById('transaction-search');
    this.filterType = document.getElementById('filter-type');
    this.filterCategory = document.getElementById('filter-category');
    this.filterDateStart = document.getElementById('filter-date-start');
    this.filterDateEnd = document.getElementById('filter-date-end');
    this.resetFiltersBtn = document.getElementById('reset-filters-btn');

    // Кнопка перехода к бюджетам с главной
    this.quickToBudgetsBtn = document.getElementById('btn-quick-to-budgets');

    // Настройки DOM
    this.settingsProfileForm = document.getElementById('settings-profile-form');
    this.settingsUsername = document.getElementById('settings-username');
    this.settingsCurrency = document.getElementById('settings-currency');
    this.settingsExportBtn = document.getElementById('settings-export-btn');
    this.settingsImportFile = document.getElementById('settings-import-file');
    this.settingsResetBtn = document.getElementById('settings-reset-btn');

    // Инициализация БД
    db.init();
    const user = db.getUser();
    
    this.bindEvents();

    setTimeout(() => {
      this.hideLoader();
      if (user) {
        this.showMainScreen(user);
      } else {
        this.showAuthScreen();
      }
    }, 800);
  },

  bindEvents() {
    // Вход
    if (this.loginForm) {
      this.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
          const username = usernameInput.value.trim();
          if (username) {
            const user = db.setUser(username);
            this.showMainScreen(user);
          }
        }
      });
    }

    // Выход
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', () => {
        db.clearUser();
        this.showAuthScreen();
        if (this.loginForm) this.loginForm.reset();
        
        // Разрушаем графики
        if (this.balanceChart) { this.balanceChart.destroy(); this.balanceChart = null; }
        if (this.expenseChart) { this.expenseChart.destroy(); this.expenseChart = null; }
      });
    }

    // Вкладки
    this.navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetTabId = item.getAttribute('data-target');
        this.switchTab(targetTabId);
      });
    });

    // Кнопка быстрого перехода к бюджетам
    if (this.quickToBudgetsBtn) {
      this.quickToBudgetsBtn.addEventListener('click', () => {
        this.switchTab('tab-budgets');
      });
    }

    // --- КАТЕГОРИИ ---
    
    this.colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        this.colorSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        this.selectedColorInput.value = swatch.getAttribute('data-color');
      });
    });

    this.iconSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        this.iconSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        this.selectedIconInput.value = swatch.getAttribute('data-icon');
      });
    });

    if (this.categoryForm) {
      this.categoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('category-id-edit').value;
        const name = this.categoryNameInput.value.trim();
        const type = this.categoryTypeSelect.value;
        const color = this.selectedColorInput.value;
        const icon = this.selectedIconInput.value;

        if (id) {
          db.updateCategory(id, { name, type, color, icon });
        } else {
          db.addCategory({ name, type, color, icon });
        }

        this.resetCategoryForm();
        this.renderCategories();
        this.renderTransactions();
        this.renderOverview();
        this.renderBudgets(); // Бюджеты зависят от списка категорий
      });
    }

    if (this.cancelCategoryEditBtn) {
      this.cancelCategoryEditBtn.addEventListener('click', () => {
        this.resetCategoryForm();
      });
    }

    // --- ТРАНЗАКЦИИ ---

    if (this.txType) {
      this.txType.addEventListener('change', () => {
        this.populateTxModalCategories();
      });
    }

    if (this.txForm) {
      this.txForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = this.txIdEdit.value;
        const description = this.txDescription.value.trim();
        const type = this.txType.value;
        const categoryId = this.txCategory.value;
        const amount = parseFloat(this.txAmount.value);
        const date = this.txDate.value;

        if (!categoryId) {
          alert('Сначала создайте категорию для выбранного типа транзакции!');
          return;
        }

        if (id) {
          db.updateTransaction(id, { description, type, categoryId, amount, date });
        } else {
          db.addTransaction({ description, type, categoryId, amount, date });
        }

        this.resetTxForm();
        this.renderTransactions();
        this.renderOverview();
        this.renderBudgets();
      });
    }

    if (this.cancelTxEditBtn) {
      this.cancelTxEditBtn.addEventListener('click', () => {
        this.resetTxForm();
      });
    }

    // --- БЮДЖЕТЫ ---

    if (this.budgetForm) {
      this.budgetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = this.budgetIdEdit.value;
        const categoryId = this.budgetCategory.value;
        const limit = parseFloat(this.budgetLimit.value);

        if (!categoryId) {
          alert('Сначала создайте категории расходов!');
          return;
        }

        // Проверка на дубликат при создании нового бюджета
        if (!id) {
          const existing = db.getBudgets().find(b => b.categoryId === categoryId);
          if (existing) {
            alert('Бюджет для этой категории уже установлен! Отредактируйте его.');
            return;
          }
        }

        if (id) {
          db.updateBudget(id, { categoryId, limit });
        } else {
          db.addBudget({ categoryId, limit });
        }

        this.resetBudgetForm();
        this.renderBudgets();
        this.renderOverview();
      });
    }

    if (this.cancelBudgetEditBtn) {
      this.cancelBudgetEditBtn.addEventListener('click', () => {
        this.resetBudgetForm();
      });
    }

    // --- ПЛАНИРОВАНИЕ ---

    if (this.planType) {
      this.planType.addEventListener('change', () => {
        this.populatePlanModalCategories();
      });
    }

    if (this.planningForm) {
      this.planningForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = this.planIdEdit.value;
        const description = this.planDescription.value.trim();
        const type = this.planType.value;
        const categoryId = this.planCategory.value;
        const amount = parseFloat(this.planAmount.value);
        const date = this.planDate.value;

        if (!categoryId) {
          alert('Сначала создайте категорию для выбранного типа платежа!');
          return;
        }

        if (id) {
          db.updatePlan(id, { description, type, categoryId, amount, date });
        } else {
          db.addPlan({ description, type, categoryId, amount, date, status: 'pending' });
        }

        this.resetPlanForm();
        this.renderPlanning();
      });
    }

    if (this.cancelPlanEditBtn) {
      this.cancelPlanEditBtn.addEventListener('click', () => {
        this.resetPlanForm();
      });
    }

    // --- ФИЛЬТРЫ ---
    const filterElements = [this.txSearch, this.filterType, this.filterCategory, this.filterDateStart, this.filterDateEnd];
    filterElements.forEach(element => {
      if (element) {
        element.addEventListener('input', () => this.renderTransactions());
        element.addEventListener('change', () => this.renderTransactions());
      }
    });

    if (this.resetFiltersBtn) {
      this.resetFiltersBtn.addEventListener('click', () => {
        if (this.txSearch) this.txSearch.value = '';
        if (this.filterType) this.filterType.value = 'all';
        if (this.filterCategory) this.filterCategory.value = 'all';
        if (this.filterDateStart) this.filterDateStart.value = '';
        if (this.filterDateEnd) this.filterDateEnd.value = '';
        this.renderTransactions();
      });
    }

    // --- НАСТРОЙКИ ---
    if (this.settingsProfileForm) {
      this.settingsProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = this.settingsUsername.value.trim();
        const currency = this.settingsCurrency.value;
        if (username) {
          db.setUser(username, currency);
          
          // Обновляем сайдбар
          const sidebarUsername = document.getElementById('sidebar-username');
          const sidebarAvatar = document.getElementById('sidebar-avatar');
          if (sidebarUsername) sidebarUsername.textContent = username;
          if (sidebarAvatar) sidebarAvatar.textContent = username.charAt(0).toUpperCase();
          
          // Полностью перерисовываем все вкладки с новыми символами валюты
          this.renderOverview();
          this.renderTransactions();
          this.renderBudgets();
          this.renderPlanning();
          
          alert('Настройки профиля сохранены!');
        }
      });
    }

    if (this.settingsExportBtn) {
      this.settingsExportBtn.addEventListener('click', () => {
        const data = {
          user: db.getUser(),
          categories: db.getCategories(),
          transactions: db.getTransactions(),
          budgets: db.getBudgets(),
          planning: db.getPlans()
        };
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `plant_backup_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      });
    }

    if (this.settingsImportFile) {
      this.settingsImportFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target.result);
            
            if (!importedData.categories || !importedData.transactions) {
              throw new Error('Неверный формат файла резервной копии. Отсутствуют обязательные поля.');
            }
            
            if (confirm('Вы уверены, что хотите импортировать данные? Это заменит все текущие транзакции, категории и настройки.')) {
              if (importedData.user) {
                db.setUser(importedData.user.username, importedData.user.currency || 'RUB');
              }
              if (importedData.categories) {
                db.saveCategories(importedData.categories);
              }
              if (importedData.transactions) {
                db.saveTransactions(importedData.transactions);
              }
              if (importedData.budgets) {
                db.saveBudgets(importedData.budgets);
              }
              if (importedData.planning) {
                db.savePlans(importedData.planning);
              }
              
              const user = db.getUser();
              if (user) {
                this.showMainScreen(user);
                if (this.settingsUsername) this.settingsUsername.value = user.username;
                if (this.settingsCurrency) this.settingsCurrency.value = user.currency || 'RUB';
              }
              alert('Данные успешно импортированы!');
            }
          } catch (err) {
            alert('Ошибка импорта: ' + err.message);
          }
          this.settingsImportFile.value = '';
        };
        reader.readAsText(file);
      });
    }

    if (this.settingsResetBtn) {
      this.settingsResetBtn.addEventListener('click', () => {
        if (confirm('ВНИМАНИЕ: Это полностью удалит все ваши данные! Восстановить их будет невозможно. Вы действительно хотите продолжить?')) {
          if (confirm('Подтвердите удаление всех данных: все транзакции, лимиты, планирование и профиль будут стерты.')) {
            db.resetAll();
            alert('Все данные были сброшены. Приложение будет перезапущено.');
            window.location.reload();
          }
        }
      });
    }
  },

  showAuthScreen() {
    if (this.loader) this.loader.style.display = 'none';
    if (this.mainScreen) this.mainScreen.classList.remove('active');
    if (this.authScreen) this.authScreen.classList.add('active');
  },

  hideLoader() {
    if (this.loader) this.loader.style.display = 'none';
  },

  showMainScreen(user) {
    if (this.authScreen) this.authScreen.classList.remove('active');
    if (this.mainScreen) this.mainScreen.classList.add('active');

    const sidebarUsername = document.getElementById('sidebar-username');
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    
    if (sidebarUsername) sidebarUsername.textContent = user.username;
    if (sidebarAvatar) {
      sidebarAvatar.textContent = user.username.charAt(0).toUpperCase();
    }

    // Заполняем настройки текущими значениями
    if (this.settingsUsername) this.settingsUsername.value = user.username;
    if (this.settingsCurrency) this.settingsCurrency.value = user.currency || 'RUB';

    // Отрисовать данные
    this.renderCategories();
    this.resetTxForm();
    this.renderTransactions();
    this.renderBudgets();
    this.resetPlanForm();
    this.renderPlanning();
    this.renderOverview();

    this.switchTab('tab-overview');
  },

  switchTab(tabId) {
    this.navItems.forEach(item => {
      const target = item.getAttribute('data-target');
      if (target === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    this.tabContents.forEach(tab => {
      if (tab.id === tabId) {
        tab.classList.add('active');
        if (tabId === 'tab-overview') {
          this.renderOverview();
        } else if (tabId === 'tab-budgets') {
          this.renderBudgets();
        } else if (tabId === 'tab-planning') {
          this.resetPlanForm();
          this.renderPlanning();
        } else if (tabId === 'tab-transactions') {
          this.resetTxForm();
          this.renderTransactions();
        }
      } else {
        tab.classList.remove('active');
      }
    });
  },

  // --- ХЕЛПЕРЫ ВАЛЮТЫ ---
  getCurrencySymbol() {
    const user = db.getUser();
    const currency = user ? user.currency : 'RUB';
    const symbols = {
      'RUB': '₽',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'BYN': 'Br',
      'KZT': '₸',
      'UAH': '₴'
    };
    return symbols[currency] || '₽';
  },

  formatAmount(amount, showSign = false, forceSignValue = '') {
    const symbol = this.getCurrencySymbol();
    let sign = '';
    if (showSign) {
      if (amount > 0) sign = '+';
      else if (amount < 0) sign = '-';
    } else if (forceSignValue) {
      sign = forceSignValue;
    }
    return `${sign}${Math.abs(amount).toFixed(2)} ${symbol}`;
  },

  formatAmountShort(amount) {
    const symbol = this.getCurrencySymbol();
    return `${amount.toFixed(0)} ${symbol}`;
  },

  // --- ЛОГИКА ОБЗОРА ---

  renderOverview() {
    const transactions = db.getTransactions();
    const categories = db.getCategories();
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthsRu = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    let totalIncome = 0;
    let totalExpense = 0;
    let totalSavings = 0;
    let totalBalance = 0;

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      const isCurrentMonth = tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;

      if (t.type === 'income') {
        totalBalance += t.amount;
        if (isCurrentMonth) totalIncome += t.amount;
      } else if (t.type === 'expense') {
        totalBalance -= t.amount;
        if (isCurrentMonth) totalExpense += t.amount;
      } else if (t.type === 'savings') {
        totalSavings += t.amount;
      }
    });

    const balanceEl = document.getElementById('overview-balance');
    const incomeEl = document.getElementById('overview-income');
    const expenseEl = document.getElementById('overview-expense');
    const savingsEl = document.getElementById('overview-savings');

    if (balanceEl) balanceEl.textContent = this.formatAmount(totalBalance);
    if (incomeEl) incomeEl.textContent = this.formatAmount(totalIncome, true);
    if (expenseEl) expenseEl.textContent = this.formatAmount(-totalExpense, true);
    if (savingsEl) savingsEl.textContent = this.formatAmount(totalSavings);

    this.renderBalanceChart(transactions);
    this.renderExpenseChart(transactions, categories);
    this.renderBudgetsPreview(transactions, categories);
  },

  renderBalanceChart(transactions) {
    const ctx = document.getElementById('balance-line-chart');
    if (!ctx) return;

    if (this.balanceChart) {
      this.balanceChart.destroy();
    }

    const dates = [];
    const labels = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().substring(0, 10);
      dates.push(dateStr);
      labels.push(d.getDate() + ' ' + ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'][d.getMonth()]);
    }

    const balancePoints = dates.map(date => {
      let bal = 0;
      transactions.forEach(t => {
        if (t.date <= date) {
          if (t.type === 'income') bal += t.amount;
          else if (t.type === 'expense') bal -= t.amount;
        }
      });
      return bal;
    });

    this.balanceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Баланс',
          data: balancePoints,
          borderColor: '#a3e635',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointBackgroundColor: '#a3e635',
          pointBorderColor: '#121212',
          pointHoverRadius: 5,
          tension: 0.15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: '#27272a' },
            ticks: { color: '#a1a1aa', font: { family: 'JetBrains Mono', size: 10 } }
          },
          y: {
            grid: { color: '#27272a' },
            ticks: { color: '#a1a1aa', font: { family: 'JetBrains Mono', size: 10 } }
          }
        }
      }
    });
  },

  renderExpenseChart(transactions, categories) {
    const ctx = document.getElementById('expense-doughnut-chart');
    if (!ctx) return;

    if (this.expenseChart) {
      this.expenseChart.destroy();
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currentExpenses = transactions.filter(t => {
      const tDate = new Date(t.date);
      return t.type === 'expense' && tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;
    });

    const group = {};
    currentExpenses.forEach(t => {
      group[t.categoryId] = (group[t.categoryId] || 0) + t.amount;
    });

    const labels = [];
    const data = [];
    const colors = [];

    Object.entries(group).forEach(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      labels.push(cat ? cat.name : 'Без категории');
      data.push(amount);
      colors.push(cat ? cat.color : '#71717b');
    });

    if (data.length === 0) {
      labels.push('Нет расходов');
      data.push(1);
      colors.push('#27272a');
    }

    this.expenseChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: '#1e1e1e',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#a1a1aa',
              font: { family: 'JetBrains Mono', size: 10 }
            }
          }
        }
      }
    });
  },

  renderBudgetsPreview(transactions, categories) {
    const container = document.getElementById('overview-budgets-preview');
    if (!container) return;

    const budgets = db.getBudgets();
    if (budgets.length === 0) {
      container.innerHTML = '<div class="empty-state">Нет активных бюджетов. Установите их во вкладке Бюджеты.</div>';
      return;
    }

    container.innerHTML = '';
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    budgets.slice(0, 3).forEach(bgt => {
      const cat = categories.find(c => c.id === bgt.categoryId);
      if (!cat) return;

      const spent = transactions
        .filter(t => t.type === 'expense' && t.categoryId === bgt.categoryId)
        .filter(t => {
          const tDate = new Date(t.date);
          return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const percent = Math.min((spent / bgt.limit) * 100, 100);
      
      let barColor = 'var(--accent-lime)';
      let statusLabel = 'В норме';
      let statusClass = 'text-accent';

      if (percent >= 100) {
        barColor = 'var(--color-danger)';
        statusLabel = 'Превышено!';
        statusClass = 'text-danger';
      } else if (percent >= 80) {
        barColor = '#f59e0b';
        statusLabel = 'Близко к лимиту';
        statusClass = 'text-success';
      }

      const card = document.createElement('div');
      card.className = 'budget-card';
      card.innerHTML = `
        <div class="budget-card-header">
          <div class="budget-card-title" style="color: ${cat.color};">
            <span class="material-symbols-outlined">${cat.icon}</span>
            <span>${cat.name}</span>
          </div>
        </div>
        <div class="budget-card-info">
          <span>Расход: ${this.formatAmount(spent)}</span>
          <span class="budget-card-limit">Лимит: ${this.formatAmount(bgt.limit)}</span>
        </div>
        <div class="budget-card-bar">
          <div class="budget-card-progress" style="width: ${percent}%; background-color: ${barColor};"></div>
        </div>
        <div class="budget-card-status ${statusClass}" style="color: ${barColor};">
          ${statusLabel} (${percent.toFixed(0)}%)
        </div>
      `;
      container.appendChild(card);
    });
  },

  // --- ЛОГИКА БЮДЖЕТОВ ---

  renderBudgets() {
    const budgets = db.getBudgets();
    const categories = db.getCategories();
    const transactions = db.getTransactions();

    // 1. Заполнить список категорий в форме (только расходы)
    if (this.budgetCategory) {
      const expenseCategories = categories.filter(c => c.type === 'expense');
      this.budgetCategory.innerHTML = '';
      if (expenseCategories.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'Нет расходных категорий';
        this.budgetCategory.appendChild(opt);
      } else {
        expenseCategories.forEach(cat => {
          const opt = document.createElement('option');
          opt.value = cat.id;
          opt.textContent = cat.name;
          this.budgetCategory.appendChild(opt);
        });
      }
    }

    // 2. Очистить и отрисовать карточки лимитов
    if (!this.budgetsListItems) return;
    this.budgetsListItems.innerHTML = '';

    if (budgets.length === 0) {
      this.budgetsListItems.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">Нет активных лимитов. Установите сумму слева.</div>';
      return;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    budgets.forEach(bgt => {
      const cat = categories.find(c => c.id === bgt.categoryId);
      if (!cat) return;

      // Суммируем расходы по категории за текущий месяц
      const spent = transactions
        .filter(t => t.type === 'expense' && t.categoryId === bgt.categoryId)
        .filter(t => {
          const tDate = new Date(t.date);
          return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const percent = Math.min((spent / bgt.limit) * 100, 100);
      
      let barColor = 'var(--accent-lime)';
      let statusLabel = 'В норме';
      let statusClass = 'text-accent';

      if (percent >= 100) {
        barColor = 'var(--color-danger)';
        statusLabel = 'Превышено!';
        statusClass = 'text-danger';
      } else if (percent >= 80) {
        barColor = '#f59e0b';
        statusLabel = 'Близко к лимиту';
        statusClass = 'text-success'; // Используем желтый/оранжевый
      }

      const card = document.createElement('div');
      card.className = 'budget-card';
      card.innerHTML = `
        <div class="budget-card-header">
          <div class="budget-card-title" style="color: ${cat.color};">
            <span class="material-symbols-outlined">${cat.icon}</span>
            <span>${cat.name}</span>
          </div>
          <div class="budget-card-actions">
            <button class="category-action-btn edit" title="Изменить лимит"><span class="material-symbols-outlined">edit</span></button>
            <button class="category-action-btn delete" title="Удалить лимит"><span class="material-symbols-outlined">delete</span></button>
          </div>
        </div>
        <div class="budget-card-info">
          <span>Расход: ${this.formatAmount(spent)}</span>
          <span class="budget-card-limit">Лимит: ${this.formatAmount(bgt.limit)}</span>
        </div>
        <div class="budget-card-bar">
          <div class="budget-card-progress" style="width: ${percent}%; background-color: ${barColor};"></div>
        </div>
        <div class="budget-card-status ${statusClass}" style="color: ${barColor};">
          ${statusLabel} (${percent.toFixed(0)}%)
        </div>
      `;

      card.querySelector('.edit').addEventListener('click', () => {
        this.editBudget(bgt);
      });

      card.querySelector('.delete').addEventListener('click', () => {
        if (confirm(`Удалить бюджет для категории "${cat.name}"?`)) {
          db.deleteBudget(bgt.id);
          this.renderBudgets();
          this.renderOverview();
        }
      });

      this.budgetsListItems.appendChild(card);
    });
  },

  editBudget(bgt) {
    this.budgetIdEdit.value = bgt.id;
    this.budgetCategory.value = bgt.categoryId;
    this.budgetLimit.value = bgt.limit;

    this.budgetFormTitle.textContent = 'Изменить лимит';
    if (this.cancelBudgetEditBtn) this.cancelBudgetEditBtn.style.display = 'inline-flex';
  },

  resetBudgetForm() {
    this.budgetIdEdit.value = '';
    if (this.budgetForm) this.budgetForm.reset();
    this.budgetFormTitle.textContent = 'Установить лимит';
    if (this.cancelBudgetEditBtn) this.cancelBudgetEditBtn.style.display = 'none';
  },

  // --- ЛОГИКА ПЛАНИРОВАНИЯ ---

  editPlan(plan) {
    this.planIdEdit.value = plan.id;
    this.planDescription.value = plan.description;
    this.planType.value = plan.type;
    this.populatePlanModalCategories(plan.categoryId);
    this.planAmount.value = plan.amount;
    this.planDate.value = plan.date;

    this.planningFormTitle.textContent = 'Редактировать платёж';
    if (this.cancelPlanEditBtn) this.cancelPlanEditBtn.style.display = 'inline-flex';
  },

  resetPlanForm() {
    this.planIdEdit.value = '';
    if (this.planningForm) this.planningForm.reset();
    this.planDate.value = new Date().toISOString().substring(0, 10);
    this.populatePlanModalCategories();
    this.planningFormTitle.textContent = 'Запланировать платёж';
    if (this.cancelPlanEditBtn) this.cancelPlanEditBtn.style.display = 'none';
  },

  populatePlanModalCategories(selectedId = null) {
    if (!this.planCategory || !this.planType) return;
    const type = this.planType.value;
    const categories = db.getCategories().filter(c => c.type === type);

    this.planCategory.innerHTML = '';
    if (categories.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Нет созданных категорий';
      this.planCategory.appendChild(opt);
    } else {
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        this.planCategory.appendChild(opt);
      });
      if (selectedId) this.planCategory.value = selectedId;
    }
  },

  renderPlanning() {
    const plans = db.getPlans();
    const categories = db.getCategories();
    if (!this.planningList) return;
    this.planningList.innerHTML = '';

    if (plans.length === 0) {
      if (this.planningEmptyState) this.planningEmptyState.style.display = 'block';
      return;
    }

    if (this.planningEmptyState) this.planningEmptyState.style.display = 'none';

    // Сортировка по дате
    plans.sort((a, b) => new Date(a.date) - new Date(b.date));

    const todayStr = new Date().toISOString().substring(0, 10);

    plans.forEach(plan => {
      const cat = categories.find(c => c.id === plan.categoryId);
      const row = document.createElement('tr');

      // Рассчитываем статус
      let statusLabel = 'Ожидает';
      let statusClass = 'pending';

      if (plan.status === 'paid') {
        statusLabel = 'Оплачен';
        statusClass = 'paid';
      } else if (plan.date < todayStr) {
        statusLabel = 'Просрочен';
        statusClass = 'overdue';
      }

      let typeClass = plan.type === 'income' ? 'income' : plan.type === 'expense' ? 'expense' : 'savings';
      let typeLabel = plan.type === 'income' ? 'Доход' : plan.type === 'expense' ? 'Расход' : 'Накопление';

      row.innerHTML = `
        <td>${plan.date.split('-').reverse().join('.')}</td>
        <td>${plan.description}</td>
        <td>
          ${cat ? `
            <div class="tx-category-badge" style="border-color: ${cat.color}; color: ${cat.color};">
              <span class="material-symbols-outlined">${cat.icon}</span>
              <span>${cat.name}</span>
            </div>
          ` : '<span class="text-muted">Без категории</span>'}
        </td>
        <td><span class="tx-type-badge ${typeClass}">${typeLabel}</span></td>
        <td class="text-right tx-amount ${typeClass}">${this.formatAmount(plan.amount)}</td>
        <td class="text-center"><span class="status-badge ${statusClass}">${statusLabel}</span></td>
        <td>
          <div class="tx-actions">
            ${plan.status !== 'paid' ? `
              <button class="tx-action-btn pay-btn" title="Отметить как оплаченный" style="color: var(--accent-lime);"><span class="material-symbols-outlined">check_circle</span></button>
            ` : ''}
            <button class="tx-action-btn edit" title="Редактировать"><span class="material-symbols-outlined">edit</span></button>
            <button class="tx-action-btn delete" title="Удалить"><span class="material-symbols-outlined">delete</span></button>
          </div>
        </td>
      `;

      // Обработчик Оплаты
      const payBtn = row.querySelector('.pay-btn');
      if (payBtn) {
        payBtn.addEventListener('click', () => {
          this.payPlannedPayment(plan);
        });
      }

      // Редактирование
      row.querySelector('.edit').addEventListener('click', () => {
        this.editPlan(plan);
      });

      // Удаление
      row.querySelector('.delete').addEventListener('click', () => {
        if (confirm(`Удалить запланированный платёж "${plan.description}"?`)) {
          db.deletePlan(plan.id);
          this.renderPlanning();
        }
      });

      this.planningList.appendChild(row);
    });
  },

  payPlannedPayment(plan) {
    if (confirm(`Оплатить платёж "${plan.description}" на сумму ${this.formatAmount(plan.amount)}? (Это создаст транзакцию в текущем месяце)`)) {
      // 1. Создать реальную транзакцию с сегодняшней датой
      const today = new Date().toISOString().substring(0, 10);
      db.addTransaction({
        description: `Оплата: ${plan.description}`,
        type: plan.type,
        categoryId: plan.categoryId,
        amount: plan.amount,
        date: today
      });

      // 2. Изменить статус планируемого платежа на 'paid'
      db.updatePlan(plan.id, { status: 'paid' });

      // 3. Обновить интерфейсы
      this.renderTransactions();
      this.renderPlanning();
      this.renderOverview();
      this.renderBudgets();
    }
  },

  // --- ЛОГИКА КАТЕГОРИЙ ---

  renderCategories() {
    const categories = db.getCategories();
    
    const grids = {
      income: document.getElementById('categories-income-list'),
      expense: document.getElementById('categories-expense-list'),
      savings: document.getElementById('categories-savings-list')
    };

    Object.values(grids).forEach(g => {
      if (g) g.innerHTML = '';
    });

    categories.forEach(cat => {
      const targetGrid = grids[cat.type];
      if (targetGrid) {
        const chip = document.createElement('div');
        chip.className = 'category-chip';
        chip.innerHTML = `
          <div class="category-chip-color" style="background-color: ${cat.color};"></div>
          <span class="material-symbols-outlined">${cat.icon}</span>
          <span class="category-chip-name">${cat.name}</span>
          <div class="category-chip-actions">
            <button class="category-action-btn edit" title="Редактировать"><span class="material-symbols-outlined">edit</span></button>
            <button class="category-action-btn delete" title="Удалить"><span class="material-symbols-outlined">delete</span></button>
          </div>
        `;

        chip.querySelector('.edit').addEventListener('click', () => {
          this.editCategory(cat);
        });

        chip.querySelector('.delete').addEventListener('click', () => {
          const txs = db.getTransactions();
          const hasLinkedTxs = txs.some(t => t.categoryId === cat.id);
          if (hasLinkedTxs) {
            alert(`Нельзя удалить категорию "${cat.name}", так как она используется в транзациях!`);
            return;
          }
          if (confirm(`Удалить категорию "${cat.name}"?`)) {
            db.deleteCategory(cat.id);
            this.renderCategories();
            this.renderTransactions();
            this.renderOverview();
            this.renderBudgets();
          }
        });

        targetGrid.appendChild(chip);
      }
    });

    this.populateFilterCategories(categories);
  },

  editCategory(category) {
    document.getElementById('category-id-edit').value = category.id;
    this.categoryNameInput.value = category.name;
    this.categoryTypeSelect.value = category.type;
    this.selectedColorInput.value = category.color;
    this.selectedIconInput.value = category.icon;

    this.colorSwatches.forEach(sw => {
      if (sw.getAttribute('data-color') === category.color) {
        sw.classList.add('active');
      } else {
        sw.classList.remove('active');
      }
    });

    this.iconSwatches.forEach(sw => {
      if (sw.getAttribute('data-icon') === category.icon) {
        sw.classList.add('active');
      } else {
        sw.classList.remove('active');
      }
    });

    this.categoryFormTitle.textContent = 'Редактировать категорию';
    if (this.cancelCategoryEditBtn) this.cancelCategoryEditBtn.style.display = 'inline-flex';
  },

  resetCategoryForm() {
    document.getElementById('category-id-edit').value = '';
    if (this.categoryForm) this.categoryForm.reset();
    
    this.colorSwatches.forEach((sw, idx) => {
      if (idx === 0) {
        sw.classList.add('active');
        this.selectedColorInput.value = sw.getAttribute('data-color');
      } else {
        sw.classList.remove('active');
      }
    });

    this.iconSwatches.forEach((sw, idx) => {
      if (idx === 0) {
        sw.classList.add('active');
        this.selectedIconInput.value = sw.getAttribute('data-icon');
      } else {
        sw.classList.remove('active');
      }
    });

    this.categoryFormTitle.textContent = 'Добавить категорию';
    if (this.cancelCategoryEditBtn) this.cancelCategoryEditBtn.style.display = 'none';
  },

  populateFilterCategories(categories) {
    if (!this.filterCategory) return;
    const currentValue = this.filterCategory.value;
    this.filterCategory.innerHTML = '<option value="all">Все категории</option>';
    categories.forEach(cat => {
      const typeLabel = cat.type === 'income' ? 'Доход' : cat.type === 'expense' ? 'Расход' : 'Накопление';
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = `${cat.name} (${typeLabel})`;
      this.filterCategory.appendChild(opt);
    });
    this.filterCategory.value = currentValue;
  },

  // --- ЛОГИКА ТРАНЗАКЦИЙ ---

  editTransaction(tx) {
    if (tx) {
      this.txIdEdit.value = tx.id;
      this.txDescription.value = tx.description;
      this.txType.value = tx.type;
      this.txAmount.value = tx.amount;
      this.txDate.value = tx.date;
      
      if (this.txFormTitle) this.txFormTitle.textContent = 'Редактировать транзакцию';
      if (this.saveTxBtn) this.saveTxBtn.textContent = 'Сохранить';
      if (this.cancelTxEditBtn) this.cancelTxEditBtn.style.display = 'inline-flex';
      
      this.populateTxModalCategories(tx.categoryId);
    }
  },

  resetTxForm() {
    this.txIdEdit.value = '';
    if (this.txForm) this.txForm.reset();
    this.txDate.value = new Date().toISOString().substring(0, 10);
    
    if (this.txFormTitle) this.txFormTitle.textContent = 'Добавить транзакцию';
    if (this.saveTxBtn) this.saveTxBtn.textContent = 'Добавить';
    if (this.cancelTxEditBtn) this.cancelTxEditBtn.style.display = 'none';
    
    this.populateTxModalCategories();
  },

  populateTxModalCategories(selectedId = null) {
    if (!this.txCategory || !this.txType) return;
    const type = this.txType.value;
    const categories = db.getCategories().filter(c => c.type === type);

    this.txCategory.innerHTML = '';
    if (categories.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Нет созданных категорий';
      this.txCategory.appendChild(opt);
    } else {
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        this.txCategory.appendChild(opt);
      });
      if (selectedId) this.txCategory.value = selectedId;
    }
  },

  renderTransactions() {
    const transactions = db.getTransactions();
    const categories = db.getCategories();
    const listBody = document.getElementById('transactions-list');
    const emptyState = document.getElementById('transactions-empty-state');

    if (!listBody) return;
    listBody.innerHTML = '';

    const searchVal = this.txSearch ? this.txSearch.value.trim().toLowerCase() : '';
    const typeVal = this.filterType ? this.filterType.value : 'all';
    const catVal = this.filterCategory ? this.filterCategory.value : 'all';
    const dateStartVal = this.filterDateStart ? this.filterDateStart.value : '';
    const dateEndVal = this.filterDateEnd ? this.filterDateEnd.value : '';

    const filtered = transactions.filter(t => {
      if (searchVal && !t.description.toLowerCase().includes(searchVal)) return false;
      if (typeVal !== 'all' && t.type !== typeVal) return false;
      if (catVal !== 'all' && t.categoryId !== catVal) return false;
      if (dateStartVal && t.date < dateStartVal) return false;
      if (dateEndVal && t.date > dateEndVal) return false;
      return true;
    });

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      
      filtered.forEach(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        const row = document.createElement('tr');
        
        let typeLabel = '';
        let typeClass = '';
        let amountSign = '';
        if (t.type === 'income') {
          typeLabel = 'Доход';
          typeClass = 'income';
          amountSign = '+';
        } else if (t.type === 'expense') {
          typeLabel = 'Расход';
          typeClass = 'expense';
          amountSign = '−';
        } else {
          typeLabel = 'Копилка';
          typeClass = 'savings';
          amountSign = '';
        }

        row.innerHTML = `
          <td>${t.date.split('-').reverse().join('.')}</td>
          <td>${t.description}</td>
          <td>
            ${cat ? `
              <div class="tx-category-badge" style="border-color: ${cat.color}; color: ${cat.color};">
                <span class="material-symbols-outlined">${cat.icon}</span>
                <span>${cat.name}</span>
              </div>
            ` : '<span class="text-muted">Без категории</span>'}
          </td>
          <td><span class="tx-type-badge ${typeClass}">${typeLabel}</span></td>
          <td class="text-right tx-amount ${typeClass}">${this.formatAmount(t.amount, false, amountSign)}</td>
          <td>
            <div class="tx-actions">
              <button class="tx-action-btn edit" title="Редактировать"><span class="material-symbols-outlined">edit</span></button>
              <button class="tx-action-btn delete" title="Удалить"><span class="material-symbols-outlined">delete</span></button>
            </div>
          </td>
        `;

        row.querySelector('.edit').addEventListener('click', () => {
          this.editTransaction(t);
        });

        row.querySelector('.delete').addEventListener('click', () => {
          if (confirm(`Удалить транзакцию "${t.description}"?`)) {
            db.deleteTransaction(t.id);
            this.renderTransactions();
            this.renderOverview();
            this.renderBudgets();
          }
        });

        listBody.appendChild(row);
      });
    }
  }
};
