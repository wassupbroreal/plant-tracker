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

    // --- ТЕГИ ---
    if (this.tagColorSwatches) {
      this.tagColorSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
          this.tagColorSwatches.forEach(s => s.classList.remove('active'));
          swatch.classList.add('active');
          this.selectedTagColorInput.value = swatch.getAttribute('data-color');
        });
      });
    }

    if (this.tagForm) {
      this.tagForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('tag-id-edit').value;
        const name = this.formatSentenceCase(this.tagNameInput.value.trim());
        const color = this.selectedTagColorInput.value;

        let newTag;
        if (id) {
          db.updateTag(id, { name, color });
          newTag = { id };
        } else {
          newTag = db.addTag({ name, color });
        }

        this.resetTagForm();
        this.renderTags(newTag ? newTag.id : null);
        this.populateTxModalTags();
        this.populatePlanModalTags();
        this.populateFilterTags(db.getTags());
        this.renderTransactions();
      });
    }

    if (this.cancelTagEditBtn) {
      this.cancelTagEditBtn.addEventListener('click', () => {
        this.resetTagForm();
      });
    }

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
        const activeChips = this.txTagsSelector ? this.txTagsSelector.querySelectorAll('.tx-tag-choice-chip.active') : [];
        const tagIds = Array.from(activeChips).map(chip => chip.getAttribute('data-tag-id'));
        if (id) {
          db.updateTransaction(id, { description, type, categoryId, tagIds, tagId: '', amount, date, goalId });
        } else {
          const newTx = db.addTransaction({ description, type, categoryId, tagIds, tagId: '', amount, date, goalId });
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

        const activeChips = this.planTagsSelector ? this.planTagsSelector.querySelectorAll('.tx-tag-choice-chip.active') : [];
        const tagIds = Array.from(activeChips).map(chip => chip.getAttribute('data-tag-id'));

        let newPlanId = null;
        if (id) {
          db.updatePlan(id, { description, type, categoryId, tagIds, tagId: '', amount, date });
        } else {
          const newPlan = db.addPlan({ description, type, categoryId, tagIds, tagId: '', amount, date, status: 'pending' });
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
    const filterElements = [this.txSearch, this.filterType, this.filterCategory, this.filterTag, this.filterDateStart, this.filterDateEnd];
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
        if (this.filterTag) this.filterTag.value = 'all';
        if (this.filterDateStart) this.filterDateStart.value = '';
        if (this.filterDateEnd) this.filterDateEnd.value = '';
        
        const changeEvt = new Event('change', { bubbles: true });
        if (this.filterType) this.filterType.dispatchEvent(changeEvt);
        if (this.filterCategory) this.filterCategory.dispatchEvent(changeEvt);
        if (this.filterTag) this.filterTag.dispatchEvent(changeEvt);
        if (this.filterDateStart) this.filterDateStart.dispatchEvent(changeEvt);
        if (this.filterDateEnd) this.filterDateEnd.dispatchEvent(changeEvt);

        this.renderTransactions();
      });
    }

    // --- ФИЛЬТРЫ ПЛАНИРОВАНИЯ ---
    const planFilterElements = [this.planSearch, this.planFilterType, this.planFilterCategory, this.planFilterTag, this.planFilterDateStart, this.planFilterDateEnd];
    planFilterElements.forEach(element => {
      if (element) {
        element.addEventListener('input', () => this.renderPlanning());
        element.addEventListener('change', () => this.renderPlanning());
      }
    });

    if (this.planResetFiltersBtn) {
      this.planResetFiltersBtn.addEventListener('click', () => {
        if (this.planSearch) this.planSearch.value = '';
        if (this.planFilterType) this.planFilterType.value = 'all';
        if (this.planFilterCategory) this.planFilterCategory.value = 'all';
        if (this.planFilterTag) this.planFilterTag.value = 'all';
        if (this.planFilterDateStart) this.planFilterDateStart.value = '';
        if (this.planFilterDateEnd) this.planFilterDateEnd.value = '';

        const changeEvt = new Event('change', { bubbles: true });
        if (this.planFilterType) this.planFilterType.dispatchEvent(changeEvt);
        if (this.planFilterCategory) this.planFilterCategory.dispatchEvent(changeEvt);
        if (this.planFilterTag) this.planFilterTag.dispatchEvent(changeEvt);
        if (this.planFilterDateStart) this.planFilterDateStart.dispatchEvent(changeEvt);
        if (this.planFilterDateEnd) this.planFilterDateEnd.dispatchEvent(changeEvt);

        this.renderPlanning();
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

    if (this.analyticsPeriod) {
      this.analyticsPeriod.addEventListener('change', () => {
        this.renderAnalytics();
      });
    }

    // Закрытие контекстных меню категорий и тегов при клике вне их
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.category-menu-wrapper')) {
        document.querySelectorAll('.category-menu-wrapper.open').forEach(w => {
          w.classList.remove('open');
        });
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
          <div class="category-menu-wrapper">
            <button class="category-action-btn menu-trigger" type="button">
              <span class="material-symbols-outlined">more_vert</span>
            </button>
            <div class="category-context-menu">
              <div class="custom-option edit-opt">
                <span class="material-symbols-outlined">edit</span>
                <span>Редактировать</span>
              </div>
              <div class="custom-option delete-opt" style="color: var(--color-danger);">
                <span class="material-symbols-outlined">delete</span>
                <span>Удалить</span>
              </div>
            </div>
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

      const wrapper = card.querySelector('.category-menu-wrapper');
      const trigger = card.querySelector('.menu-trigger');

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = wrapper.classList.contains('open');
        document.querySelectorAll('.category-menu-wrapper.open').forEach(w => {
          w.classList.remove('open');
        });
        if (!isOpen) {
          wrapper.classList.add('open');
        }
      });

      card.querySelector('.edit-opt').addEventListener('click', (e) => {
        e.stopPropagation();
        wrapper.classList.remove('open');
        this.editBudget(bgt);
      });

      card.querySelector('.delete-opt').addEventListener('click', async (e) => {
        e.stopPropagation();
        wrapper.classList.remove('open');
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

  editPlan(plan) {
    this.planIdEdit.value = plan.id;
    this.planDescription.value = plan.description;
    this.planType.value = plan.type;
    this.populatePlanModalCategories(plan.categoryId);
    this.planAmount.value = plan.amount;
    this.planDate.value = plan.date;

    const tagIds = plan.tagIds || (plan.tagId ? [plan.tagId] : []);
    this.populatePlanModalTags(tagIds);

    this.planningFormTitle.textContent = 'Редактировать платёж';
    if (this.cancelPlanEditBtn) this.cancelPlanEditBtn.style.display = 'inline-flex';
  },

  resetPlanForm() {
    this.planIdEdit.value = '';
    if (this.planningForm) this.planningForm.reset();
    this.planDate.value = new Date().toISOString().substring(0, 10);
    this.populatePlanModalCategories();
    this.populatePlanModalTags([]);
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
    const tags = db.getTags();
    
    // Проверка планировочных достижений
    this.checkPlanningAchievements();
    
    if (!this.planningList) return;
    this.planningList.innerHTML = '';

    const searchVal = this.planSearch ? this.planSearch.value.trim().toLowerCase() : '';
    const typeVal = this.planFilterType ? this.planFilterType.value : 'all';
    const catVal = this.planFilterCategory ? this.planFilterCategory.value : 'all';
    const tagVal = this.planFilterTag ? this.planFilterTag.value : 'all';
    const dateStartVal = this.planFilterDateStart ? this.planFilterDateStart.value : '';
    const dateEndVal = this.planFilterDateEnd ? this.planFilterDateEnd.value : '';

    const filtered = plans.filter(p => {
      if (searchVal && !p.description.toLowerCase().includes(searchVal)) return false;
      if (typeVal !== 'all' && p.type !== typeVal) return false;
      if (catVal !== 'all' && p.categoryId !== catVal) return false;
      if (tagVal !== 'all') {
        const planTagsList = p.tagIds || (p.tagId ? [p.tagId] : []);
        if (!planTagsList.includes(tagVal)) return false;
      }
      if (dateStartVal && p.date < dateStartVal) return false;
      if (dateEndVal && p.date > dateEndVal) return false;
      return true;
    });

    const groups = {};
    filtered.forEach(plan => {
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
        card.className = 'budget-card planning-date-card';

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
          const cat = categories.find(c => c.id === plan.categoryId);

          const planTagsList = plan.tagIds || (plan.tagId ? [plan.tagId] : []);
          const planTags = planTagsList.map(id => tags.find(tg => tg.id === id)).filter(Boolean);
          const tagsContainerHtml = planTags.length > 0 ? `
            <div class="tx-card-tags-block">
              ${planTags.map(tag => `
                <span class="tag-badge" style="background-color: ${tag.color}15; color: ${tag.color}; border: 1px solid ${tag.color}35;">
                  <span class="material-symbols-outlined">label</span>${this.formatSentenceCase(tag.name)}
                </span>
              `).join('')}
            </div>
          ` : '';

          const statusBadgeHtml = statusLabel !== 'Ожидает' ? `
            <span class="status-badge ${statusClass}">${this.formatSentenceCase(statusLabel)}</span>
          ` : '';

          rowsHtml += `
            <div class="planning-row-item" data-id="${plan.id}">
              <div class="tx-card-main-content">
                <div class="tx-card-row">
                  <!-- Category Block -->
                  <div class="tx-card-col tx-card-category" style="color: ${cat ? cat.color : 'var(--text-muted)'};">
                    <span class="material-symbols-outlined" style="font-size: 18px; flex-shrink: 0;">${cat ? cat.icon : 'help_outline'}</span>
                    <span style="font-weight: 500; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${cat ? this.formatSentenceCase(cat.name) : 'Без категории'}</span>
                  </div>

                  <!-- Description Block (with status badge) -->
                  <div class="tx-card-col tx-card-desc">
                    <span style="font-weight: 500; font-size: 13px; color: var(--text-primary); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                      ${this.formatSentenceCase(this.escapeHtml(plan.description))}
                    </span>
                    ${statusBadgeHtml}
                  </div>

                  <!-- Date Block -->
                  <div class="tx-card-col tx-card-date">
                    <span>${formattedDate}</span>
                  </div>

                  <!-- Amount Block -->
                  <div class="tx-card-col tx-card-amount">
                    <span class="tx-amount ${typeClass}">${this.formatAmount(plan.amount, false, amountSign)}</span>
                  </div>
                </div>
                ${tagsContainerHtml}
              </div>

              <!-- Action Menu Block -->
              <div class="tx-card-actions">
                <div class="category-menu-wrapper">
                  <button class="category-action-btn menu-trigger" type="button">
                    <span class="material-symbols-outlined">more_vert</span>
                  </button>
                  <div class="category-context-menu" style="top: 100%; right: 0;">
                    ${plan.status !== 'paid' ? `
                      <div class="custom-option pay-opt" style="color: var(--color-success);">
                        <span class="material-symbols-outlined">check</span>
                        <span>Провести</span>
                      </div>
                    ` : ''}
                    <div class="custom-option edit-opt">
                      <span class="material-symbols-outlined">edit</span>
                      <span>Редактировать</span>
                    </div>
                    <div class="custom-option delete-opt" style="color: var(--color-danger);">
                      <span class="material-symbols-outlined">delete</span>
                      <span>Удалить</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        });

        card.innerHTML = rowsHtml;

        datePlans.forEach(plan => {
          const rowEl = card.querySelector(`[data-id="${plan.id}"]`);
          if (rowEl) {
            const wrapper = rowEl.querySelector('.category-menu-wrapper');
            const trigger = rowEl.querySelector('.menu-trigger');

            if (trigger && wrapper) {
              trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = wrapper.classList.contains('open');
                document.querySelectorAll('.category-menu-wrapper.open').forEach(w => {
                  w.classList.remove('open');
                });
                if (!isOpen) {
                  wrapper.classList.add('open');
                }
              });
            }

            const payOpt = rowEl.querySelector('.pay-opt');
            if (payOpt) {
              payOpt.addEventListener('click', async (e) => {
                e.stopPropagation();
                wrapper.classList.remove('open');
                await this.payPlannedPayment(plan);
              });
            }

            rowEl.querySelector('.edit-opt').addEventListener('click', (e) => {
              e.stopPropagation();
              wrapper.classList.remove('open');
              this.editPlan(plan);
            });

            rowEl.querySelector('.delete-opt').addEventListener('click', async (e) => {
              e.stopPropagation();
              wrapper.classList.remove('open');
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
        tagIds: plan.tagIds || (plan.tagId ? [plan.tagId] : []),
        tagId: '',
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
        <div class="category-menu-wrapper">
          <button class="category-action-btn menu-trigger" type="button">
            <span class="material-symbols-outlined">more_vert</span>
          </button>
          <div class="category-context-menu">
            <div class="custom-option edit-opt">
              <span class="material-symbols-outlined">edit</span>
              <span>Редактировать</span>
            </div>
            <div class="custom-option delete-opt" style="color: var(--color-danger);">
              <span class="material-symbols-outlined">delete</span>
              <span>Удалить</span>
            </div>
          </div>
        </div>
      `;

      const wrapper = chip.querySelector('.category-menu-wrapper');
      const trigger = chip.querySelector('.menu-trigger');

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = wrapper.classList.contains('open');
        document.querySelectorAll('.category-menu-wrapper.open').forEach(w => {
          w.classList.remove('open');
        });
        if (!isOpen) {
          wrapper.classList.add('open');
        }
      });

      chip.querySelector('.edit-opt').addEventListener('click', (e) => {
        e.stopPropagation();
        wrapper.classList.remove('open');
        this.editCategory(cat);
      });

      chip.querySelector('.delete-opt').addEventListener('click', async (e) => {
        e.stopPropagation();
        wrapper.classList.remove('open');
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
    if (this.planFilterCategory) {
      const currentValue = this.planFilterCategory.value;
      this.planFilterCategory.innerHTML = '<option value="all">Все категории</option>';
      categories.forEach(cat => {
        const typeLabel = cat.type === 'income' ? 'Доход' : cat.type === 'expense' ? 'Расход' : 'Накопление';
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = `${this.formatSentenceCase(cat.name)} (${this.formatSentenceCase(typeLabel)})`;
        this.planFilterCategory.appendChild(opt);
      });
      this.planFilterCategory.value = currentValue;
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
      const tagIds = tx.tagIds || (tx.tagId ? [tx.tagId] : []);
      this.populateTxModalTags(tagIds);
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
    this.populateTxModalTags([]);
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

  populateTxModalTags(selectedId = null) {
    if (!this.txTag) return;
    const tags = db.getTags();

    this.txTag.innerHTML = '<option value="">Без тега</option>';
    tags.forEach(tag => {
      const opt = document.createElement('option');
      opt.value = tag.id;
      opt.textContent = this.formatSentenceCase(tag.name);
      this.txTag.appendChild(opt);
    });
    if (selectedId) this.txTag.value = selectedId;
    else this.txTag.value = '';
  },

  renderTransactions(highlightId = null) {
    const transactions = db.getTransactions();
    const categories = db.getCategories();
    const tags = db.getTags();
    const listBody = document.getElementById('transactions-list');
    const emptyState = document.getElementById('transactions-empty-state');

    if (!listBody) return;
    listBody.innerHTML = '';

    const searchVal = this.txSearch ? this.txSearch.value.trim().toLowerCase() : '';
    const typeVal = this.filterType ? this.filterType.value : 'all';
    const catVal = this.filterCategory ? this.filterCategory.value : 'all';
    const tagVal = this.filterTag ? this.filterTag.value : 'all';
    const dateStartVal = this.filterDateStart ? this.filterDateStart.value : '';
    const dateEndVal = this.filterDateEnd ? this.filterDateEnd.value : '';

    const filtered = transactions.filter(t => {
      if (searchVal && !t.description.toLowerCase().includes(searchVal)) return false;
      if (typeVal !== 'all' && t.type !== typeVal) return false;
      if (catVal !== 'all' && t.categoryId !== catVal) return false;
      if (tagVal !== 'all') {
        const txTagsList = t.tagIds || (t.tagId ? [t.tagId] : []);
        if (!txTagsList.includes(tagVal)) return false;
      }
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
        const txTagsList = t.tagIds || (t.tagId ? [t.tagId] : []);
        const txTags = txTagsList.map(id => tags.find(tg => tg.id === id)).filter(Boolean);
        const card = document.createElement('div');
        card.className = 'budget-card tx-card';
        
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
          amountSign = t.amount < 0 ? '−' : '';
        }

        const tagsContainerHtml = txTags.length > 0 ? `
          <div class="tx-card-tags-block">
            ${txTags.map(tag => `
              <span class="tag-badge" style="background-color: ${tag.color}15; color: ${tag.color}; border: 1px solid ${tag.color}35;">
                <span class="material-symbols-outlined">label</span>${this.formatSentenceCase(tag.name)}
              </span>
            `).join('')}
          </div>
        ` : '';

        card.innerHTML = `
          <div class="tx-card-main-content">
            <div class="tx-card-row">
              <!-- Category Block -->
              <div class="tx-card-col tx-card-category" style="color: ${cat ? cat.color : 'var(--text-muted)'};">
                <span class="material-symbols-outlined" style="font-size: 18px; flex-shrink: 0;">${cat ? cat.icon : 'help_outline'}</span>
                <span style="font-weight: 500; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${cat ? this.formatSentenceCase(cat.name) : 'Без категории'}</span>
              </div>

              <!-- Description Block -->
              <div class="tx-card-col tx-card-desc">
                <span style="font-size: 13px; color: var(--text-primary); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                  ${this.formatSentenceCase(this.escapeHtml(t.description)) || '—'}
                </span>
              </div>

              <!-- Date Block -->
              <div class="tx-card-col tx-card-date">
                <span>${t.date.split('-').reverse().join('.')}</span>
              </div>

              <!-- Amount Block -->
              <div class="tx-card-col tx-card-amount">
                <span class="tx-amount ${typeClass}">${this.formatAmount(t.amount, false, amountSign)}</span>
              </div>
            </div>
            ${tagsContainerHtml}
          </div>

          <!-- Action Menu Block -->
          <div class="tx-card-actions">
            <div class="category-menu-wrapper">
              <button class="category-action-btn menu-trigger" type="button">
                <span class="material-symbols-outlined">more_vert</span>
              </button>
              <div class="category-context-menu" style="top: 100%; right: 0;">
                <div class="custom-option edit-opt">
                  <span class="material-symbols-outlined">edit</span>
                  <span>Редактировать</span>
                </div>
                <div class="custom-option delete-opt" style="color: var(--color-danger);">
                  <span class="material-symbols-outlined">delete</span>
                  <span>Удалить</span>
                </div>
              </div>
            </div>
          </div>
        `;

        const wrapper = card.querySelector('.category-menu-wrapper');
        const trigger = card.querySelector('.menu-trigger');

        trigger.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = wrapper.classList.contains('open');
          document.querySelectorAll('.category-menu-wrapper.open').forEach(w => {
            w.classList.remove('open');
          });
          if (!isOpen) {
            wrapper.classList.add('open');
          }
        });

        card.querySelector('.edit-opt').addEventListener('click', (e) => {
          e.stopPropagation();
          wrapper.classList.remove('open');
          this.editTransaction(t);
        });

        card.querySelector('.delete-opt').addEventListener('click', async (e) => {
          e.stopPropagation();
          wrapper.classList.remove('open');
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
    const goals = db.getGoals().filter(g => !g.completed);
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
    const goals = db.getGoals().filter(g => !g.completed);
    const transactions = db.getTransactions();
    
    // Проверка достижений целей
    this.checkSavingsGoalsAchievements();
    
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
          <div class="category-menu-wrapper">
            <button class="category-action-btn menu-trigger" type="button">
              <span class="material-symbols-outlined">more_vert</span>
            </button>
            <div class="category-context-menu">
              <div class="custom-option edit-opt">
                <span class="material-symbols-outlined">edit</span>
                <span>Редактировать</span>
              </div>
              <div class="custom-option delete-opt" style="color: var(--color-danger);">
                <span class="material-symbols-outlined">delete</span>
                <span>Удалить</span>
              </div>
            </div>
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
        ${percent >= 100 ? `
          <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
            <button type="button" class="btn btn-primary btn-sm btn-complete-goal" style="padding: 4px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px;">
              <span class="material-symbols-outlined" style="font-size: 14px;">check_circle</span>Выполнить
            </button>
          </div>
        ` : ''}
      `;

      const wrapper = card.querySelector('.category-menu-wrapper');
      const trigger = card.querySelector('.menu-trigger');

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = wrapper.classList.contains('open');
        document.querySelectorAll('.category-menu-wrapper.open').forEach(w => {
          w.classList.remove('open');
        });
        if (!isOpen) {
          wrapper.classList.add('open');
        }
      });

      card.querySelector('.edit-opt').addEventListener('click', (e) => {
        e.stopPropagation();
        wrapper.classList.remove('open');
        this.editGoal(goal);
      });

      card.querySelector('.delete-opt').addEventListener('click', async (e) => {
        e.stopPropagation();
        wrapper.classList.remove('open');
        if (await this.showConfirm(`Удалить цель "${this.formatSentenceCase(goal.title)}"?`)) {
          db.deleteGoal(goal.id);
          this.renderSavingsGoals();
        }
      });

      const completeBtn = card.querySelector('.btn-complete-goal');
      if (completeBtn) {
        completeBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (await this.showConfirm(`Выполнить цель "${this.formatSentenceCase(goal.title)}" и списать накопленные ${this.formatAmount(spent)} из накоплений?`)) {
            db.updateGoal(goal.id, { completed: true });
            
            db.addTransaction({
              description: `Выполнение цели: ${goal.title}`,
              type: 'savings',
              categoryId: 'cat-piggy',
              tagIds: [],
              tagId: '',
              amount: -spent,
              date: new Date().toISOString().substring(0, 10),
              goalId: goal.id
            });

            const user = db.getUser();
            if (user && user.roundUpGoalId === goal.id) {
              db.setUser(user.username, user.currency, user.passcode, user.avatar, user.theme, user.financialMonthStart, user.roundAmounts, user.roundUpMode, '');
            }

            this.showToast('Цель выполнена! Средства списаны.', 'success');
            this.renderSavingsGoals();
            this.renderOverview();
            this.renderTransactions();
          }
        });
      }

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
  },

  // --- ЛОГИКА ТЕГОВ ---
  renderTags(highlightId = null) {
    if (!this.tagsList) return;
    const tags = db.getTags();
    this.tagsList.innerHTML = '';

    if (tags.length === 0) {
      this.tagsList.innerHTML = '<div class="empty-state" style="grid-column: 1 / span 3;">Нет созданных тегов. Добавьте тег слева.</div>';
      return;
    }

    tags.forEach(tag => {
      if (highlightId && tag.id === highlightId) {
        this.animateBlock(this.tagsList);
      }

      const chip = document.createElement('div');
      chip.className = 'budget-card';
      chip.style.flexDirection = 'row';
      chip.style.justifyContent = 'space-between';
      chip.style.alignItems = 'center';
      chip.style.padding = '8px 12px';
      chip.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; color: ${tag.color};">
          <span class="material-symbols-outlined">label</span>
          <span style="font-weight: 500;">${this.formatSentenceCase(tag.name)}</span>
        </div>
        <div class="category-menu-wrapper">
          <button class="category-action-btn menu-trigger" type="button">
            <span class="material-symbols-outlined">more_vert</span>
          </button>
          <div class="category-context-menu">
            <div class="custom-option edit-opt">
              <span class="material-symbols-outlined">edit</span>
              <span>Редактировать</span>
            </div>
            <div class="custom-option delete-opt" style="color: var(--color-danger);">
              <span class="material-symbols-outlined">delete</span>
              <span>Удалить</span>
            </div>
          </div>
        </div>
      `;

      const wrapper = chip.querySelector('.category-menu-wrapper');
      const trigger = chip.querySelector('.menu-trigger');

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = wrapper.classList.contains('open');
        document.querySelectorAll('.category-menu-wrapper.open').forEach(w => {
          w.classList.remove('open');
        });
        if (!isOpen) {
          wrapper.classList.add('open');
        }
      });

      chip.querySelector('.edit-opt').addEventListener('click', (e) => {
        e.stopPropagation();
        wrapper.classList.remove('open');
        this.editTag(tag);
      });

      chip.querySelector('.delete-opt').addEventListener('click', async (e) => {
        e.stopPropagation();
        wrapper.classList.remove('open');
        const txs = db.getTransactions();
        const hasLinkedTxs = txs.some(t => (t.tagIds || (t.tagId ? [t.tagId] : [])).includes(tag.id));
        if (hasLinkedTxs) {
          alert(`Нельзя удалить тег "${tag.name}", так как он используется в транзациях!`);
          return;
        }
        if (await this.showConfirm(`Удалить тег "${tag.name}"?`)) {
          db.deleteTag(tag.id);
          this.renderTags();
          this.populateTxModalTags();
          const currentTags = db.getTags();
          this.populateFilterTags(currentTags);
          this.renderTransactions();
        }
      });

      this.tagsList.appendChild(chip);
    });

    this.populateFilterTags(tags);
  },

  editTag(tag) {
    document.getElementById('tag-id-edit').value = tag.id;
    this.tagNameInput.value = tag.name;
    this.selectedTagColorInput.value = tag.color;

    this.tagColorSwatches.forEach(sw => {
      if (sw.getAttribute('data-color') === tag.color) {
        sw.classList.add('active');
      } else {
        sw.classList.remove('active');
      }
    });

    this.tagFormTitle.textContent = 'Редактировать тег';
    if (this.cancelTagEditBtn) this.cancelTagEditBtn.style.display = 'inline-flex';
  },

  resetTagForm() {
    const editIdInput = document.getElementById('tag-id-edit');
    if (editIdInput) editIdInput.value = '';
    if (this.tagForm) this.tagForm.reset();
    
    this.tagColorSwatches.forEach((sw, idx) => {
      if (idx === 0) {
        sw.classList.add('active');
        this.selectedTagColorInput.value = sw.getAttribute('data-color');
      } else {
        sw.classList.remove('active');
      }
    });

    this.tagFormTitle.textContent = 'Добавить тег';
    if (this.cancelTagEditBtn) this.cancelTagEditBtn.style.display = 'none';
  },

  populateTxModalTags(selectedIds = []) {
    if (!this.txTagsSelector) return;
    const tags = db.getTags();

    this.txTagsSelector.innerHTML = '';
    if (tags.length === 0) {
      this.txTagsSelector.innerHTML = '<div class="empty-state" style="font-size: 12px; padding: 4px 0;">Нет созданных тегов</div>';
      return;
    }

    tags.forEach(tag => {
      const chip = document.createElement('div');
      chip.className = 'tx-tag-choice-chip';
      chip.setAttribute('data-tag-id', tag.id);
      
      const isActive = selectedIds.includes(tag.id);
      if (isActive) {
        chip.classList.add('active');
      }

      chip.innerHTML = `
        <span class="material-symbols-outlined" style="font-size: 14px; color: ${tag.color};">label</span>
        <span>${this.formatSentenceCase(tag.name)}</span>
      `;

      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
      });

      this.txTagsSelector.appendChild(chip);
    });
  },

  populatePlanModalTags(selectedIds = []) {
    if (!this.planTagsSelector) return;
    const tags = db.getTags();

    this.planTagsSelector.innerHTML = '';
    if (tags.length === 0) {
      this.planTagsSelector.innerHTML = '<div class="empty-state" style="font-size: 12px; padding: 4px 0;">Нет созданных тегов</div>';
      return;
    }

    tags.forEach(tag => {
      const chip = document.createElement('div');
      chip.className = 'tx-tag-choice-chip';
      chip.setAttribute('data-tag-id', tag.id);
      
      const isActive = selectedIds.includes(tag.id);
      if (isActive) {
        chip.classList.add('active');
      }

      chip.innerHTML = `
        <span class="material-symbols-outlined" style="font-size: 14px; color: ${tag.color};">label</span>
        <span>${this.formatSentenceCase(tag.name)}</span>
      `;

      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
      });

      this.planTagsSelector.appendChild(chip);
    });
  },

  populateFilterTags(tags) {
    if (this.filterTag) {
      const currentValue = this.filterTag.value;
      this.filterTag.innerHTML = '<option value="all">Все теги</option>';
      tags.forEach(tag => {
        const opt = document.createElement('option');
        opt.value = tag.id;
        opt.textContent = this.formatSentenceCase(tag.name);
        this.filterTag.appendChild(opt);
      });
      this.filterTag.value = currentValue;
    }
    if (this.planFilterTag) {
      const currentValue = this.planFilterTag.value;
      this.planFilterTag.innerHTML = '<option value="all">Все теги</option>';
      tags.forEach(tag => {
        const opt = document.createElement('option');
        opt.value = tag.id;
        opt.textContent = this.formatSentenceCase(tag.name);
        this.planFilterTag.appendChild(opt);
      });
      this.planFilterTag.value = currentValue;
    }
  },

  // --- ЛОГИКА АНАЛИТИКИ ---
  renderAnalytics() {
    const transactions = db.getTransactions();
    const period = this.analyticsPeriod ? this.analyticsPeriod.value : 'current-month';

    const today = new Date();
    const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const currentYear = `${today.getFullYear()}`;

    const filteredTxs = transactions.filter(t => {
      if (period === 'current-month') {
        return t.date.startsWith(currentYearMonth);
      } else if (period === 'current-year') {
        return t.date.startsWith(currentYear);
      }
      return true;
    });

    this.renderAnalyticsStats(filteredTxs);
    this.renderAnalyticsPie(filteredTxs);
    this.renderAnalyticsTags(filteredTxs);
    this.renderAnalyticsInsights(filteredTxs, period);
    this.renderAnalyticsLine();
  },

  renderAnalyticsStats(filteredTxs) {
    if (!this.analyticsStatsIncome || !this.analyticsStatsExpense || !this.analyticsStatsBalance || !this.analyticsStatsSavings) return;

    let income = 0;
    let expense = 0;
    let savings = 0;

    filteredTxs.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else if (t.type === 'expense') {
        expense += t.amount;
      } else if (t.type === 'savings') {
        savings += t.amount;
      }
    });

    const balance = income - expense;

    this.analyticsStatsIncome.textContent = this.formatAmount(income);
    this.analyticsStatsExpense.textContent = this.formatAmount(expense);
    this.analyticsStatsSavings.textContent = this.formatAmount(savings);

    this.analyticsStatsBalance.textContent = this.formatAmount(balance, true);
    if (balance > 0) {
      this.analyticsStatsBalance.style.color = 'var(--color-success)';
    } else if (balance < 0) {
      this.analyticsStatsBalance.style.color = 'var(--color-danger)';
    } else {
      this.analyticsStatsBalance.style.color = 'var(--text-primary)';
    }
  },

  renderAnalyticsPie(filteredTxs) {
    if (!this.analyticsPieChart || !this.analyticsPieTotal || !this.analyticsPieLegend) return;
    
    const categories = db.getCategories();
    
    // Фильтруем только расходы
    const expenses = filteredTxs.filter(t => t.type === 'expense');
    
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);
    this.analyticsPieTotal.textContent = this.formatAmount(total);
    
    this.analyticsPieChart.innerHTML = '';
    this.analyticsPieLegend.innerHTML = '';
    
    if (total === 0) {
      this.analyticsPieChart.innerHTML = `
        <svg viewBox="-1.1 -1.1 2.2 2.2" style="transform: rotate(-90deg); width: 100%; height: 100%;">
          <circle cx="0" cy="0" r="0.9" fill="none" stroke="var(--border-color)" stroke-width="0.2" />
        </svg>
      `;
      this.analyticsPieLegend.innerHTML = '<div class="empty-state" style="font-size: 13px; color: var(--text-muted); text-align: left; padding: 12px 0;">Нет расходов за выбранный период.</div>';
      return;
    }
    
    // Группируем по категории
    const categorySums = {};
    expenses.forEach(t => {
      categorySums[t.categoryId] = (categorySums[t.categoryId] || 0) + t.amount;
    });
    
    // Сортируем по убыванию суммы
    const sortedCategories = Object.entries(categorySums)
      .map(([catId, amount]) => {
        const cat = categories.find(c => c.id === catId) || { name: 'Без категории', color: 'var(--text-muted)', icon: 'help_outline' };
        return {
          catId,
          amount,
          percent: amount / total,
          name: cat.name,
          color: cat.color,
          icon: cat.icon
        };
      })
      .sort((a, b) => b.amount - a.amount);
      
    // Рисуем круговую диаграмму (donut chart)
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '-1.1 -1.1 2.2 2.2');
    svg.setAttribute('style', 'transform: rotate(-90deg); width: 100%; height: 100%;');
    
    const R = 0.9;
    const C = 2 * Math.PI * R; // 5.6548
    let cumulativePercent = 0;
    
    sortedCategories.forEach(item => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '0');
      circle.setAttribute('cy', '0');
      circle.setAttribute('r', String(R));
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', item.color);
      circle.setAttribute('stroke-width', '0.2');
      circle.setAttribute('stroke-dasharray', `${item.percent * C} ${C}`);
      circle.setAttribute('stroke-dashoffset', `${-cumulativePercent * C}`);
      
      // Подсказка при наведении
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${this.formatSentenceCase(item.name)}: ${this.formatAmount(item.amount)} (${(item.percent * 100).toFixed(0)}%)`;
      circle.appendChild(title);
      
      svg.appendChild(circle);
      cumulativePercent += item.percent;
    });
    
    this.analyticsPieChart.appendChild(svg);
    
    // Рисуем легенду
    sortedCategories.forEach(item => {
      const legendItem = document.createElement('div');
      legendItem.className = 'analytics-legend-item';
      legendItem.style.display = 'flex';
      legendItem.style.alignItems = 'center';
      legendItem.style.gap = '8px';
      legendItem.style.width = '100%';
      
      legendItem.innerHTML = `
        <span style="width: 10px; height: 10px; border-radius: 2px; background-color: ${item.color}; flex-shrink: 0;"></span>
        <span class="material-symbols-outlined" style="font-size: 14px; color: var(--text-secondary); flex-shrink: 0;">${item.icon}</span>
        <span style="font-size: 12px; font-weight: 500; color: var(--text-primary); text-overflow: ellipsis; white-space: nowrap; overflow: hidden; flex-grow: 1;">
          ${this.formatSentenceCase(item.name)}
        </span>
        <span style="font-size: 12px; color: var(--text-muted); flex-shrink: 0;">
          ${this.formatAmount(item.amount)} (${(item.percent * 100).toFixed(0)}%)
        </span>
      `;
      
      this.analyticsPieLegend.appendChild(legendItem);
    });
  },

  renderAnalyticsTags(filteredTxs) {
    if (!this.analyticsTagsList) return;
    this.analyticsTagsList.innerHTML = '';
    
    const tags = db.getTags();
    const expenses = filteredTxs.filter(t => t.type === 'expense');
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

    const tagSums = {};
    expenses.forEach(t => {
      const txTagsList = t.tagIds || (t.tagId ? [t.tagId] : []);
      txTagsList.forEach(tagId => {
        tagSums[tagId] = (tagSums[tagId] || 0) + t.amount;
      });
    });

    const sortedTags = Object.entries(tagSums)
      .map(([tagId, amount]) => {
        const tag = tags.find(tg => tg.id === tagId) || { name: 'Без тега', color: 'var(--text-muted)' };
        return {
          tagId,
          amount,
          name: tag.name,
          color: tag.color
        };
      })
      .sort((a, b) => b.amount - a.amount);

    if (sortedTags.length === 0) {
      this.analyticsTagsList.innerHTML = '<div class="empty-state" style="font-size: 13px; color: var(--text-muted); text-align: left; padding: 12px 0;">Нет расходов с тегами за выбранный период.</div>';
      return;
    }

    sortedTags.forEach(item => {
      const percent = totalExpense > 0 ? (item.amount / totalExpense * 100) : 0;
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.flexDirection = 'column';
      row.style.gap = '6px';
      row.style.width = '100%';
      
      row.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
          <span style="display: inline-flex; align-items: center; gap: 6px; font-weight: 500;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${item.color};"></span>
            ${this.formatSentenceCase(item.name)}
          </span>
          <span style="color: var(--text-secondary); font-weight: 500;">
            ${this.formatAmount(item.amount)} <span style="color: var(--text-muted); font-size: 11px;">(${percent.toFixed(0)}%)</span>
          </span>
        </div>
        <div style="height: 6px; background-color: var(--bg-input); border-radius: 3px; overflow: hidden; width: 100%;">
          <div style="height: 100%; width: ${percent}%; background-color: ${item.color}; border-radius: 3px; transition: width var(--transition-fast);"></div>
        </div>
      `;
      this.analyticsTagsList.appendChild(row);
    });
  },

  renderAnalyticsInsights(filteredTxs, period) {
    if (!this.analyticsInsightsContainer) return;
    this.analyticsInsightsContainer.innerHTML = '';

    const expenses = filteredTxs.filter(t => t.type === 'expense');
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = filteredTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

    // 1. Вычисляем количество дней
    const today = new Date();
    let days = 30; 
    let periodText = 'за последние 30 дней';

    if (period === 'current-month') {
      days = today.getDate();
      if (days < 1) days = 1;
      periodText = 'в текущем месяце';
    } else if (period === 'current-year') {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const diffTime = Math.abs(today - startOfYear);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      days = diffDays || 1;
      periodText = 'в текущем году';
    } else {
      if (filteredTxs.length > 0) {
        const dates = filteredTxs.map(t => new Date(t.date)).filter(d => !isNaN(d));
        if (dates.length > 0) {
          const minDate = new Date(Math.min(...dates));
          const diffTime = Math.abs(today - minDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          days = diffDays || 1;
        }
      }
      periodText = 'за всё время';
    }

    const dailyAvg = totalExpense / days;

    // 2. Крупнейшая трата
    let largestExpense = null;
    expenses.forEach(t => {
      if (!largestExpense || t.amount > largestExpense.amount) {
        largestExpense = t;
      }
    });

    const formatDateStr = (dateStr) => {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
      return dateStr;
    };

    // 3. Коэффициент покрытия
    const ratioPercent = totalIncome > 0 ? (totalExpense / totalIncome * 100) : 0;
    let ratioComment = '';
    if (totalIncome === 0) {
      ratioComment = 'Нет доходов за период для сравнения.';
    } else if (ratioPercent < 50) {
      ratioComment = 'Превосходно! Вы тратите менее половины своих доходов.';
    } else if (ratioPercent <= 80) {
      ratioComment = 'Хорошо. Ваши расходы находятся под контролем.';
    } else if (ratioPercent <= 100) {
      ratioComment = 'Внимание! Вы тратите почти все заработанные средства.';
    } else {
      ratioComment = 'Осторожно! Расходы превышают ваши доходы.';
    }

    // 4. Активность операций
    const totalCount = filteredTxs.length;
    const incomeCount = filteredTxs.filter(t => t.type === 'income').length;
    const expenseCount = expenses.length;
    const savingsCount = filteredTxs.filter(t => t.type === 'savings').length;

    // Сборка верстки инсайтов
    this.analyticsInsightsContainer.innerHTML = `
      <div class="analytics-insight-item">
        <span class="material-symbols-outlined">today</span>
        <div class="analytics-insight-content">
          <div class="analytics-insight-title">Среднедневной расход</div>
          <div class="analytics-insight-value">${this.formatAmount(dailyAvg)} в день</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Рассчитано за ${days} дн. ${periodText}</div>
        </div>
      </div>

      <div class="analytics-insight-item">
        <span class="material-symbols-outlined">local_mall</span>
        <div class="analytics-insight-content">
          <div class="analytics-insight-title">Наибольшая трата</div>
          <div class="analytics-insight-value">
            ${largestExpense ? `${this.formatSentenceCase(largestExpense.description)} (${this.formatAmount(largestExpense.amount)})` : 'Нет операций'}
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
            ${largestExpense ? `Дата покупки: ${formatDateStr(largestExpense.date)}` : 'Добавьте расходы за выбранный период'}
          </div>
        </div>
      </div>

      <div class="analytics-insight-item" style="width: 100%;">
        <span class="material-symbols-outlined">balance</span>
        <div class="analytics-insight-content" style="width: 100%;">
          <div class="analytics-insight-title">Индекс покрытия</div>
          <div class="analytics-insight-value">${ratioPercent.toFixed(0)}% от ваших доходов</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px; line-height: 1.3;">${ratioComment}</div>
          ${totalIncome > 0 ? `
          <div style="height: 4px; background-color: var(--bg-input); border-radius: 2px; overflow: hidden; margin-top: 6px; width: 100%;">
            <div style="height: 100%; width: ${Math.min(ratioPercent, 100)}%; background-color: ${ratioPercent > 100 ? 'var(--color-danger)' : 'var(--accent-color)'}; border-radius: 2px;"></div>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  renderAnalyticsLine() {
    if (!this.analyticsLineChart) return;
    this.analyticsLineChart.innerHTML = '';
    
    const transactions = db.getTransactions();
    
    // Генерируем последние 6 месяцев
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const today = new Date();
    const monthsData = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const label = monthNames[month];
      const yearMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
      
      monthsData.push({
        label,
        yearMonthStr,
        income: 0,
        expense: 0
      });
    }
    
    // Суммируем транзакции по месяцам
    transactions.forEach(t => {
      const tMonthStr = t.date.substring(0, 7); // "YYYY-MM"
      const monthObj = monthsData.find(m => m.yearMonthStr === tMonthStr);
      if (monthObj) {
        if (t.type === 'income') {
          monthObj.income += t.amount;
        } else if (t.type === 'expense') {
          monthObj.expense += t.amount;
        }
      }
    });
    
    // Параметры SVG
    const width = 500;
    const height = 240;
    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;
    
    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;
    
    // Ищем максимум для масштабирования
    let maxVal = 0;
    monthsData.forEach(m => {
      if (m.income > maxVal) maxVal = m.income;
      if (m.expense > maxVal) maxVal = m.expense;
    });
    
    if (maxVal === 0) {
      maxVal = 1000;
    }
    
    // Округляем maxVal для красивых подписей
    const order = Math.pow(10, Math.floor(Math.log10(maxVal)));
    const roundedMax = Math.ceil(maxVal / (order / 2)) * (order / 2);
    maxVal = roundedMax || maxVal;
    
    // Начинаем строить SVG
    const svgNamespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNamespace, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('style', 'width: 100%; height: 100%; font-family: var(--font-main); overflow: visible;');
    
    // Градиенты для заливки под линиями
    const defs = document.createElementNS(svgNamespace, 'defs');
    
    const incomeGrad = document.createElementNS(svgNamespace, 'linearGradient');
    incomeGrad.setAttribute('id', 'income-area-grad');
    incomeGrad.setAttribute('x1', '0');
    incomeGrad.setAttribute('y1', '0');
    incomeGrad.setAttribute('x2', '0');
    incomeGrad.setAttribute('y2', '1');
    
    incomeGrad.innerHTML = `
      <stop offset="0%" stop-color="var(--accent-color, #84cc16)" stop-opacity="0.25"></stop>
      <stop offset="100%" stop-color="var(--accent-color, #84cc16)" stop-opacity="0.00"></stop>
    `;
    defs.appendChild(incomeGrad);
    
    const expenseGrad = document.createElementNS(svgNamespace, 'linearGradient');
    expenseGrad.setAttribute('id', 'expense-area-grad');
    expenseGrad.setAttribute('x1', '0');
    expenseGrad.setAttribute('y1', '0');
    expenseGrad.setAttribute('x2', '0');
    expenseGrad.setAttribute('y2', '1');
    
    expenseGrad.innerHTML = `
      <stop offset="0%" stop-color="#ef4444" stop-opacity="0.25"></stop>
      <stop offset="100%" stop-color="#ef4444" stop-opacity="0.00"></stop>
    `;
    defs.appendChild(expenseGrad);
    svg.appendChild(defs);
    
    // Отрисовка горизонтальной сетки
    const gridLines = 4;
    for (let g = 0; g < gridLines; g++) {
      const val = (maxVal / (gridLines - 1)) * g;
      const y = height - paddingBottom - (val / maxVal) * plotHeight;
      
      // Линия сетки
      const line = document.createElementNS(svgNamespace, 'line');
      line.setAttribute('x1', String(paddingLeft));
      line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(width - paddingRight));
      line.setAttribute('y2', String(y));
      line.setAttribute('stroke', 'var(--border-color)');
      line.setAttribute('stroke-dasharray', '4 4');
      line.setAttribute('opacity', '0.3');
      svg.appendChild(line);
      
      // Подпись Y
      const text = document.createElementNS(svgNamespace, 'text');
      text.setAttribute('x', String(paddingLeft - 8));
      text.setAttribute('y', String(y + 3));
      text.setAttribute('font-size', '9');
      text.setAttribute('fill', 'var(--text-muted)');
      text.setAttribute('text-anchor', 'end');
      
      let formattedVal = val.toFixed(0);
      if (val >= 1000000) {
        formattedVal = (val / 1000000).toFixed(1) + 'M';
      } else if (val >= 1000) {
        formattedVal = (val / 1000).toFixed(0) + 'k';
      }
      text.textContent = formattedVal;
      svg.appendChild(text);
    }
    
    // Вычисляем координаты точек
    const pointsIncome = [];
    const pointsExpense = [];
    
    monthsData.forEach((m, idx) => {
      const x = paddingLeft + (idx / (monthsData.length - 1)) * plotWidth;
      const yInc = height - paddingBottom - (m.income / maxVal) * plotHeight;
      const yExp = height - paddingBottom - (m.expense / maxVal) * plotHeight;
      
      pointsIncome.push({ x, y: yInc, val: m.income, label: m.label });
      pointsExpense.push({ x, y: yExp, val: m.expense, label: m.label });
      
      // Подпись X
      const text = document.createElementNS(svgNamespace, 'text');
      text.setAttribute('x', String(x));
      text.setAttribute('y', String(height - paddingBottom + 18));
      text.setAttribute('font-size', '10');
      text.setAttribute('fill', 'var(--text-muted)');
      text.setAttribute('text-anchor', 'middle');
      text.textContent = m.label;
      svg.appendChild(text);
    });
    
    const buildPathData = (points) => points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const buildAreaPathData = (points) => {
      if (points.length === 0) return '';
      const linePath = buildPathData(points);
      const first = points[0];
      const last = points[points.length - 1];
      const bottomY = height - paddingBottom;
      return `${linePath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
    };
    
    // --- Доходы ---
    if (pointsIncome.length > 0) {
      const area = document.createElementNS(svgNamespace, 'path');
      area.setAttribute('d', buildAreaPathData(pointsIncome));
      area.setAttribute('fill', 'url(#income-area-grad)');
      svg.appendChild(area);
      
      const path = document.createElementNS(svgNamespace, 'path');
      path.setAttribute('d', buildPathData(pointsIncome));
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'var(--accent-color, #84cc16)');
      path.setAttribute('stroke-width', '2');
      svg.appendChild(path);
      
      pointsIncome.forEach(p => {
        const c = document.createElementNS(svgNamespace, 'circle');
        c.setAttribute('cx', String(p.x));
        c.setAttribute('cy', String(p.y));
        c.setAttribute('r', '4');
        c.setAttribute('fill', 'var(--accent-color, #84cc16)');
        c.setAttribute('stroke', 'var(--bg-panel)');
        c.setAttribute('stroke-width', '1.5');
        
        const title = document.createElementNS(svgNamespace, 'title');
        title.textContent = `Доход (${p.label}): ${this.formatAmount(p.val)}`;
        c.appendChild(title);
        
        svg.appendChild(c);
      });
    }
    
    // --- Расходы ---
    if (pointsExpense.length > 0) {
      const area = document.createElementNS(svgNamespace, 'path');
      area.setAttribute('d', buildAreaPathData(pointsExpense));
      area.setAttribute('fill', 'url(#expense-area-grad)');
      svg.appendChild(area);
      
      const path = document.createElementNS(svgNamespace, 'path');
      path.setAttribute('d', buildPathData(pointsExpense));
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#ef4444');
      path.setAttribute('stroke-width', '2');
      svg.appendChild(path);
      
      pointsExpense.forEach(p => {
        const c = document.createElementNS(svgNamespace, 'circle');
        c.setAttribute('cx', String(p.x));
        c.setAttribute('cy', String(p.y));
        c.setAttribute('r', '4');
        c.setAttribute('fill', '#ef4444');
        c.setAttribute('stroke', 'var(--bg-panel)');
        c.setAttribute('stroke-width', '1.5');
        
        const title = document.createElementNS(svgNamespace, 'title');
        title.textContent = `Расход (${p.label}): ${this.formatAmount(p.val)}`;
        c.appendChild(title);
        
        svg.appendChild(c);
      });
    }
    
    this.analyticsLineChart.appendChild(svg);
  }
};
