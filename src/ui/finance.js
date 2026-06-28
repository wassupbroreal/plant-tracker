import { db } from '../db.js';

export const financeMethods = {
  bindFinanceEvents() {
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
        const name = this.formatSentenceCase(this.categoryNameInput.value.trim());
        const type = this.categoryTypeSelect.value;
        const color = this.selectedColorInput.value;
        const icon = this.selectedIconInput.value;

        let newCat;
        if (id) {
          db.updateCategory(id, { name, type, color, icon });
          newCat = { id };
        } else {
          newCat = db.addCategory({ name, type, color, icon });
        }

        this.resetCategoryForm();
        this.renderCategories(newCat ? newCat.id : null);
        this.renderTransactions();
        this.renderOverview();
        this.renderBudgets();
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
        this.toggleTxGoalGroup();
      });
    }

    if (this.txForm) {
      this.txForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = this.txIdEdit.value;
        const description = this.formatSentenceCase(this.txDescription.value.trim());
        const type = this.txType.value;
        const categoryId = this.txCategory.value;
        const amount = parseFloat(this.txAmount.value);
        const date = this.txDate.value;
        const goalId = (type === 'savings' && this.txGoal) ? this.txGoal.value : '';

        if (!categoryId) {
          alert('Сначала создайте категорию для выбранного типа транзакции!');
          return;
        }

        let newTxId = null;
        if (id) {
          db.updateTransaction(id, { description, type, categoryId, amount, date, goalId });
        } else {
          const newTx = db.addTransaction({ description, type, categoryId, amount, date, goalId });
          newTxId = newTx.id;
        }

        this.resetTxForm();
        this.renderTransactions(newTxId);
        this.renderOverview();
        this.renderBudgets();
        this.renderSavingsGoals();
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

        if (!id) {
          const existing = db.getBudgets().find(b => b.categoryId === categoryId);
          if (existing) {
            alert('Бюджет для этой категории уже установлен! Отредактируйте его.');
            return;
          }
        }

        let newBudgetId = null;
        if (id) {
          db.updateBudget(id, { categoryId, limit });
        } else {
          const newBgt = db.addBudget({ categoryId, limit });
          newBudgetId = newBgt.id;
        }

        this.resetBudgetForm();
        this.renderBudgets(newBudgetId);
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
        const description = this.formatSentenceCase(this.planDescription.value.trim());
        const type = this.planType.value;
        const categoryId = this.planCategory.value;
        const amount = parseFloat(this.planAmount.value);
        const date = this.planDate.value;

        if (!categoryId) {
          alert('Сначала создайте категорию для выбранного типа платежа!');
          return;
        }

        let newPlanId = null;
        if (id) {
          db.updatePlan(id, { description, type, categoryId, amount, date });
        } else {
          const newPlan = db.addPlan({ description, type, categoryId, amount, date, status: 'pending' });
          newPlanId = newPlan.id;
        }

        this.resetPlanForm();
        this.renderPlanning(newPlanId);
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

    // --- ФИЛЬТРЫ БЮДЖЕТОВ ---
    if (this.budgetSearch) {
      this.budgetSearch.addEventListener('input', () => this.renderBudgets());
      this.budgetSearch.addEventListener('change', () => this.renderBudgets());
    }

    if (this.budgetResetBtn) {
      this.budgetResetBtn.addEventListener('click', () => {
        if (this.budgetSearch) this.budgetSearch.value = '';
        this.renderBudgets();
      });
    }

    // --- ФИЛЬТРЫ ЦЕЛЕЙ НАКОПЛЕНИЯ ---
    if (this.goalSearch) {
      this.goalSearch.addEventListener('input', () => this.renderSavingsGoals());
      this.goalSearch.addEventListener('change', () => this.renderSavingsGoals());
    }

    if (this.goalResetBtn) {
      this.goalResetBtn.addEventListener('click', () => {
        if (this.goalSearch) this.goalSearch.value = '';
        this.renderSavingsGoals();
      });
    }

    // --- ЦЕЛИ НАКОПЛЕНИЯ ---
    if (this.goalForm) {
      this.goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = this.goalIdEdit.value;
        const title = this.formatSentenceCase(this.goalTitle.value.trim());
        const description = this.formatSentenceCase(this.goalDescription.value.trim());
        const targetAmount = parseFloat(this.goalTargetAmount.value);

        let newGoalId = null;
        if (id) {
          db.updateGoal(id, { title, description, targetAmount });
        } else {
          const newGoal = db.addGoal({ title, description, targetAmount });
          newGoalId = newGoal.id;
        }

        this.resetGoalForm();
        this.renderSavingsGoals(newGoalId);
      });
    }

    if (this.cancelGoalEditBtn) {
      this.cancelGoalEditBtn.addEventListener('click', () => {
        this.resetGoalForm();
      });
    }
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

  // --- ЛОГИКА БЮДЖЕТОВ ---
  renderBudgets(highlightId = null) {
    const budgets = db.getBudgets();
    const categories = db.getCategories();
    const transactions = db.getTransactions();

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
          opt.textContent = this.formatSentenceCase(cat.name);
          this.budgetCategory.appendChild(opt);
        });
      }
    }

    if (!this.budgetsListItems) return;
    this.budgetsListItems.innerHTML = '';

    if (budgets.length === 0) {
      this.budgetsListItems.innerHTML = '<div class="empty-state">Нет активных лимитов. Установите сумму слева.</div>';
      return;
    }

    const searchVal = this.budgetSearch ? this.budgetSearch.value.trim().toLowerCase() : '';
    const filtered = budgets.filter(bgt => {
      const cat = categories.find(c => c.id === bgt.categoryId);
      if (!cat) return false;
      if (searchVal && !cat.name.toLowerCase().includes(searchVal)) return false;
      return true;
    });

    if (filtered.length === 0) {
      this.budgetsListItems.innerHTML = '<div class="empty-state">Тут ничего нет</div>';
      return;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    filtered.forEach(bgt => {
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
      
      let barColor = 'var(--accent-color)';
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
            <span>${this.formatSentenceCase(cat.name)}</span>
          </div>
          <div class="budget-card-actions">
            <button class="category-action-btn edit"><span class="material-symbols-outlined">edit</span></button>
            <button class="category-action-btn delete"><span class="material-symbols-outlined">delete</span></button>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; margin-bottom: 6px;">
          <span style="color: ${cat.color}; font-size: 12px;">${this.formatAmount(spent)}</span>
          <span style="color: var(--text-muted); font-size: 12px;">${percent.toFixed(0)}%</span>
          <span style="color: var(--text-muted); font-size: 12px;">${this.formatAmount(bgt.limit)}</span>
        </div>
        <div class="budget-card-bar" style="--bar-base-color: ${cat.color}; height: 6px; margin: 0; width: 100%;">
          <div class="budget-card-progress" style="width: ${percent}%;"></div>
        </div>
      `;

      card.querySelector('.edit').addEventListener('click', () => {
        this.editBudget(bgt);
      });

      card.querySelector('.delete').addEventListener('click', async () => {
        if (await this.showConfirm(`Удалить бюджет для категории "${this.formatSentenceCase(cat.name)}"?`)) {
          db.deleteBudget(bgt.id);
          this.renderBudgets();
          this.renderOverview();
        }
      });

      this.budgetsListItems.appendChild(card);
    });

    if (highlightId && this.budgetsListItems) {
      this.animateBlock(this.budgetsListItems);
    }
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
        opt.textContent = this.formatSentenceCase(cat.name);
        this.planCategory.appendChild(opt);
      });
      if (selectedId) this.planCategory.value = selectedId;
    }
  },

  renderPlanning(highlightId = null) {
    const plans = db.getPlans().filter(p => p.status !== 'paid');
    const categories = db.getCategories();
    if (!this.planningList) return;
    this.planningList.innerHTML = '';

    const groups = {};
    plans.forEach(plan => {
      if (!groups[plan.date]) {
        groups[plan.date] = [];
      }
      groups[plan.date].push(plan);
    });

    const sortedDates = Object.keys(groups).sort((a, b) => new Date(a) - new Date(b));
    const todayStr = new Date().toISOString().substring(0, 10);

    if (sortedDates.length === 0) {
      if (this.planningEmptyState) this.planningEmptyState.style.display = 'block';
    } else {
      if (this.planningEmptyState) this.planningEmptyState.style.display = 'none';

      sortedDates.forEach(dateStr => {
        const datePlans = groups[dateStr];
        const card = document.createElement('div');
        card.className = 'budget-card';
        card.style.gap = '12px';

        let rowsHtml = '';
        datePlans.forEach((plan, index) => {
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
          let amountSign = '';
          if (plan.type === 'income') amountSign = '+';
          else if (plan.type === 'expense') amountSign = '−';

          const formattedDate = plan.date.split('-').reverse().join('.');
          const isLastRow = index === datePlans.length - 1;
          const borderStyle = isLastRow ? '' : 'border-bottom: 1px solid var(--border-color); padding-bottom: 12px;';
          const marginTopStyle = index === 0 ? '' : 'margin-top: 4px;';

          rowsHtml += `
            <div class="planning-row-item" data-id="${plan.id}" style="display: flex; justify-content: space-between; align-items: center; ${borderStyle} ${marginTopStyle}">
              <div style="display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; margin-right: 16px;">
                <span style="font-size: 12px; color: var(--text-muted); font-family: var(--font-main); flex-shrink: 0;">${formattedDate}</span>
                <span style="font-weight: 500; font-size: 13px; color: var(--text-primary); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                  ${this.formatSentenceCase(this.escapeHtml(plan.description))}
                </span>
                <span class="status-badge ${statusClass}" style="font-size: 11px; padding: 2px 6px; flex-shrink: 0; margin-left: 4px;">${this.formatSentenceCase(statusLabel)}</span>
              </div>
              
              <div style="display: flex; align-items: center; gap: 16px; flex-shrink: 0;">
                <span class="tx-amount ${typeClass}" style="font-size: 14px; font-weight: 500;">
                  ${this.formatAmount(plan.amount, false, amountSign)}
                </span>
                <div class="budget-card-actions" style="display: flex; gap: 8px;">
                  ${plan.status !== 'paid' ? `
                    <button class="category-action-btn pay-btn"><span class="material-symbols-outlined">check</span></button>
                  ` : ''}
                  <button class="category-action-btn edit"><span class="material-symbols-outlined">edit</span></button>
                  <button class="category-action-btn delete"><span class="material-symbols-outlined">delete</span></button>
                </div>
              </div>
            </div>
          `;
        });

        card.innerHTML = rowsHtml;

        datePlans.forEach(plan => {
          const rowEl = card.querySelector(`[data-id="${plan.id}"]`);
          if (rowEl) {
            const payBtn = rowEl.querySelector('.pay-btn');
            if (payBtn) {
              payBtn.addEventListener('click', async () => {
                await this.payPlannedPayment(plan);
              });
            }

            rowEl.querySelector('.edit').addEventListener('click', () => {
              this.editPlan(plan);
            });

            rowEl.querySelector('.delete').addEventListener('click', async () => {
              if (await this.showConfirm(`Удалить запланированный платёж "${this.formatSentenceCase(plan.description)}"?`)) {
                db.deletePlan(plan.id);
                this.renderPlanning();
              }
            });
          }
        });

        this.planningList.appendChild(card);
      });
    }

    if (highlightId && this.planningList) {
      this.animateBlock(this.planningList);
    }
  },

  async payPlannedPayment(plan) {
    if (await this.showConfirm(`Оплатить платёж "${this.formatSentenceCase(plan.description)}" на сумму ${this.formatAmount(plan.amount)}? (Это создаст транзакцию в текущем месяце)`)) {
      const today = new Date().toISOString().substring(0, 10);
      const newTx = db.addTransaction({
        description: this.formatSentenceCase(`Оплата: ${plan.description}`),
        type: plan.type,
        categoryId: plan.categoryId,
        amount: plan.amount,
        date: today
      });

      db.deletePlan(plan.id);

      this.renderTransactions(newTx.id);
      this.renderPlanning();
      this.renderOverview();
      this.renderBudgets();
      this.renderSavingsGoals();
      this.showToast('Транзакция добавлена');
    }
  },

  // --- ЛОГИКА КАТЕГОРИЙ ---
  renderCategories(highlightId = null) {
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
      if (!targetGrid) return;

      if (highlightId && cat.id === highlightId) {
        this.animateBlock(targetGrid);
      }

      const chip = document.createElement('div');
      chip.className = 'budget-card';
      chip.style.flexDirection = 'row';
      chip.style.justifyContent = 'space-between';
      chip.style.alignItems = 'center';
      chip.style.padding = '8px 12px';
      chip.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; color: ${cat.color};">
          <span class="material-symbols-outlined">${cat.icon}</span>
          <span style="font-weight: 500;">${this.formatSentenceCase(cat.name)}</span>
        </div>
        <div class="category-chip-actions">
          <button class="category-action-btn edit"><span class="material-symbols-outlined">edit</span></button>
          <button class="category-action-btn delete"><span class="material-symbols-outlined">delete</span></button>
        </div>
      `;

      chip.querySelector('.edit').addEventListener('click', () => {
        this.editCategory(cat);
      });

      chip.querySelector('.delete').addEventListener('click', async () => {
        const txs = db.getTransactions();
        const hasLinkedTxs = txs.some(t => t.categoryId === cat.id);
        if (hasLinkedTxs) {
          alert(`Нельзя удалить категорию "${cat.name}", так как она используется в транзациях!`);
          return;
        }
        if (await this.showConfirm(`Удалить категорию "${cat.name}"?`)) {
          db.deleteCategory(cat.id);
          this.renderCategories();
          this.renderTransactions();
          this.renderOverview();
          this.renderBudgets();
        }
      });

      targetGrid.appendChild(chip);
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
    if (this.filterCategory) {
      const currentValue = this.filterCategory.value;
      this.filterCategory.innerHTML = '<option value="all">Все категории</option>';
      categories.forEach(cat => {
        const typeLabel = cat.type === 'income' ? 'Доход' : cat.type === 'expense' ? 'Расход' : 'Накопление';
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = `${this.formatSentenceCase(cat.name)} (${this.formatSentenceCase(typeLabel)})`;
        this.filterCategory.appendChild(opt);
      });
      this.filterCategory.value = currentValue;
    }
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
      this.toggleTxGoalGroup(tx.goalId || null);
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
    this.toggleTxGoalGroup();
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
        opt.textContent = this.formatSentenceCase(cat.name);
        this.txCategory.appendChild(opt);
      });
      if (selectedId) this.txCategory.value = selectedId;
    }
  },

  renderTransactions(highlightId = null) {
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

    filtered.sort((a, b) => {
      const dateDiff = new Date(b.date) - new Date(a.date);
      if (dateDiff !== 0) return dateDiff;
      if (a.createdAt && b.createdAt) return b.createdAt - a.createdAt;
      const idxA = transactions.findIndex(t => t.id === a.id);
      const idxB = transactions.findIndex(t => t.id === b.id);
      return idxB - idxA;
    });

    if (filtered.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      
      filtered.forEach(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        const card = document.createElement('div');
        card.className = 'budget-card';
        
        let typeClass = '';
        let amountSign = '';
        if (t.type === 'income') {
          typeClass = 'income';
          amountSign = '+';
        } else if (t.type === 'expense') {
          typeClass = 'expense';
          amountSign = '−';
        } else {
          typeClass = 'savings';
          amountSign = '';
        }

        card.innerHTML = `
          <div class="budget-card-header">
            <div class="budget-card-title" style="color: ${cat ? cat.color : 'var(--text-muted)'};">
              <span class="material-symbols-outlined">${cat ? cat.icon : 'help_outline'}</span>
              <span>${cat ? this.formatSentenceCase(cat.name) : 'Без категории'}</span>
              <span style="font-size: 11px; color: var(--text-muted); font-weight: normal; margin-left: 8px;">${t.date.split('-').reverse().join('.')}</span>
            </div>
            <div class="budget-card-actions">
              <button class="category-action-btn edit"><span class="material-symbols-outlined">edit</span></button>
              <button class="category-action-btn delete"><span class="material-symbols-outlined">delete</span></button>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
            <div style="color: var(--text-secondary); font-size: 13px;">
              ${this.formatSentenceCase(this.escapeHtml(t.description))}
            </div>
            <div class="tx-amount ${typeClass}" style="font-size: 14px;">
              ${this.formatAmount(t.amount, false, amountSign)}
            </div>
          </div>
        `;

        card.querySelector('.edit').addEventListener('click', () => {
          this.editTransaction(t);
        });

        card.querySelector('.delete').addEventListener('click', async () => {
          if (await this.showConfirm(`Удалить транзакцию "${this.formatSentenceCase(t.description)}"?`)) {
            db.deleteTransaction(t.id);
            this.renderTransactions();
            this.renderOverview();
            this.renderBudgets();
          }
        });

        listBody.appendChild(card);
      });
    }

    if (highlightId && listBody) {
      this.animateBlock(listBody);
    }
  },

  toggleTxGoalGroup(selectedGoalId = null) {
    if (!this.txGoalGroup || !this.txGoal || !this.txType) return;
    if (this.txType.value === 'savings') {
      this.txGoalGroup.style.display = 'flex';
      this.populateTxGoals(selectedGoalId);
    } else {
      this.txGoalGroup.style.display = 'none';
      this.txGoal.value = '';
      
      const event = new Event('change', { bubbles: true });
      this.txGoal.dispatchEvent(event);
    }
  },

  populateTxGoals(selectedGoalId = null) {
    if (!this.txGoal) return;
    const goals = db.getGoals();
    this.txGoal.innerHTML = '<option value="">Без цели</option>';
    goals.forEach(goal => {
      const opt = document.createElement('option');
      opt.value = goal.id;
      opt.textContent = this.formatSentenceCase(goal.title);
      this.txGoal.appendChild(opt);
    });
    if (selectedGoalId) {
      this.txGoal.value = selectedGoalId;
    } else {
      this.txGoal.value = '';
    }
    
    const event = new Event('change', { bubbles: true });
    this.txGoal.dispatchEvent(event);
  },

  // --- ЛОГИКА ЦЕЛЕЙ НАКОПЛЕНИЯ ---
  renderSavingsGoals(highlightId = null) {
    const goals = db.getGoals();
    const transactions = db.getTransactions();
    
    if (!this.goalsListItems) return;
    this.goalsListItems.innerHTML = '';

    if (goals.length === 0) {
      this.goalsListItems.innerHTML = '<div class="empty-state">Нет активных целей. Создайте цель слева.</div>';
      return;
    }

    const searchVal = this.goalSearch ? this.goalSearch.value.trim().toLowerCase() : '';
    const filtered = goals.filter(goal => {
      if (searchVal && !goal.title.toLowerCase().includes(searchVal) && !(goal.description && goal.description.toLowerCase().includes(searchVal))) return false;
      return true;
    });

    if (filtered.length === 0) {
      this.goalsListItems.innerHTML = '<div class="empty-state">Тут ничего нет</div>';
      return;
    }

    filtered.forEach(goal => {
      const spent = transactions
        .filter(t => t.type === 'savings' && t.goalId === goal.id)
        .reduce((sum, t) => sum + t.amount, 0);

      const percent = Math.min((spent / goal.targetAmount) * 100, 100);
      
      const card = document.createElement('div');
      card.className = 'budget-card';
      card.innerHTML = `
        <div class="budget-card-header">
          <div class="budget-card-title" style="color: var(--accent-color);">
            <span class="material-symbols-outlined">track_changes</span>
            <span>${this.formatSentenceCase(this.escapeHtml(goal.title))}</span>
          </div>
          <div class="budget-card-actions">
            <button class="category-action-btn edit"><span class="material-symbols-outlined">edit</span></button>
            <button class="category-action-btn delete"><span class="material-symbols-outlined">delete</span></button>
          </div>
        </div>
        ${goal.description ? `<div style="color: var(--text-secondary); font-size: 13px; margin-top: 8px; margin-bottom: 4px;">${this.formatSentenceCase(this.escapeHtml(goal.description))}</div>` : ''}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; margin-bottom: 6px;">
          <span style="color: var(--accent-color); font-size: 12px;">${this.formatAmount(spent)}</span>
          <span style="color: var(--text-muted); font-size: 12px;">${percent.toFixed(0)}%</span>
          <span style="color: var(--text-muted); font-size: 12px;">${this.formatAmount(goal.targetAmount)}</span>
        </div>
        <div class="budget-card-bar" style="--bar-base-color: var(--accent-color); height: 6px; margin: 0; width: 100%;">
          <div class="budget-card-progress" style="width: ${percent}%;"></div>
        </div>
      `;

      card.querySelector('.edit').addEventListener('click', () => {
        this.editGoal(goal);
      });

      card.querySelector('.delete').addEventListener('click', async () => {
        if (await this.showConfirm(`Удалить цель "${this.formatSentenceCase(goal.title)}"?`)) {
          db.deleteGoal(goal.id);
          this.renderSavingsGoals();
        }
      });

      this.goalsListItems.appendChild(card);
    });

    if (highlightId && this.goalsListItems) {
      this.animateBlock(this.goalsListItems);
    }
  },

  editGoal(goal) {
    this.goalIdEdit.value = goal.id;
    this.goalTitle.value = goal.title;
    this.goalDescription.value = goal.description || '';
    this.goalTargetAmount.value = goal.targetAmount;

    this.goalFormTitle.textContent = 'Редактировать цель';
    const saveBtn = document.getElementById('save-goal-btn');
    if (saveBtn) saveBtn.textContent = 'Сохранить';
    if (this.cancelGoalEditBtn) this.cancelGoalEditBtn.style.display = 'inline-flex';
  },

  resetGoalForm() {
    this.goalIdEdit.value = '';
    if (this.goalForm) this.goalForm.reset();
    this.goalFormTitle.textContent = 'Создать цель';
    const saveBtn = document.getElementById('save-goal-btn');
    if (saveBtn) saveBtn.textContent = 'Создать';
    if (this.cancelGoalEditBtn) this.cancelGoalEditBtn.style.display = 'none';
  }
};
