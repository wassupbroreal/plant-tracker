import { db } from '../db.js';

export const dashboardMethods = {
  bindDashboardEvents() {
    // Кнопки быстрого перехода из Обзора
    if (this.overviewBtnToBudgets) {
      this.overviewBtnToBudgets.addEventListener('click', () => {
        this.switchTab('tab-budgets');
      });
    }
    if (this.overviewBtnToGoals) {
      this.overviewBtnToGoals.addEventListener('click', () => {
        this.switchTab('tab-savings-goals');
      });
    }
    if (this.overviewBtnToPlanning) {
      this.overviewBtnToPlanning.addEventListener('click', () => {
        this.switchTab('tab-planning');
      });
    }
    if (this.overviewBtnToTasks) {
      this.overviewBtnToTasks.addEventListener('click', () => {
        this.switchTab('tab-tasks');
      });
    }
  },

  renderOverview() {
    const transactions = db.getTransactions();
    const categories = db.getCategories();
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

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

    this.renderOverviewBudgets(transactions, categories);
    this.renderOverviewGoals(transactions);
    this.renderOverviewTasks();
    this.renderOverviewPlanning();
  },

  renderOverviewBudgets(transactions, categories) {
    const container = this.overviewBudgetsList || document.getElementById('overview-budgets-list');
    if (!container) return;

    const budgets = db.getBudgets();
    if (budgets.length === 0) {
      container.innerHTML = '<div class="empty-state">Нет лимитов. Установите их во вкладке Бюджеты.</div>';
      return;
    }

    container.innerHTML = '';
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    budgets.slice(0, 4).forEach(bgt => {
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
        </div>
        <div class="budget-card-info">
          <span>${this.formatAmount(spent)}</span>
          <span class="budget-card-limit">${this.formatAmount(bgt.limit)}</span>
        </div>
        <div class="budget-card-bar" style="--bar-base-color: ${cat.color};">
          <div class="budget-card-progress" style="width: ${percent}%;"></div>
        </div>
      `;
      container.appendChild(card);
    });
  },

  renderOverviewGoals(transactions) {
    const container = this.overviewGoalsList || document.getElementById('overview-goals-list');
    if (!container) return;

    const goals = db.getGoals();
    if (goals.length === 0) {
      container.innerHTML = '<div class="empty-state">Нет целей. Создайте их во вкладке Цели.</div>';
      return;
    }

    container.innerHTML = '';
    
    goals.slice(0, 4).forEach(goal => {
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
        </div>
        <div class="budget-card-info">
          <span>${this.formatAmount(spent)}</span>
          <span class="budget-card-limit">${this.formatAmount(goal.targetAmount)}</span>
        </div>
        <div class="budget-card-bar" style="--bar-base-color: var(--accent-color);">
          <div class="budget-card-progress" style="width: ${percent}%;"></div>
        </div>
      `;
      container.appendChild(card);
    });
  },

  renderOverviewPlanning() {
    const container = this.overviewPlanningList || document.getElementById('overview-planning-list');
    if (!container) return;

    const plans = db.getPlans();
    const unpaidPlans = plans.filter(p => p.status !== 'paid');

    if (unpaidPlans.length === 0) {
      container.innerHTML = '<div class="empty-state">Нет платежей. Добавьте их во вкладке Планирование.</div>';
      return;
    }

    container.innerHTML = '';

    // Сортировка по дате (ближайшие в начале)
    const sorted = [...unpaidPlans].sort((a, b) => new Date(a.date) - new Date(b.date));
    const todayStr = new Date().toISOString().substring(0, 10);
    const categories = db.getCategories();

    // Выводим до 4 ближайших платежей
    sorted.slice(0, 4).forEach(plan => {
      const card = document.createElement('div');
      card.className = 'budget-card';

      // Рассчитываем статус
      let statusLabel = 'Ожидает';
      let statusClass = 'pending';
      if (plan.date < todayStr) {
        statusLabel = 'Просрочен';
        statusClass = 'overdue';
      }

      const cat = categories.find(c => c.id === plan.categoryId);
      let typeClass = plan.type === 'income' ? 'income' : plan.type === 'expense' ? 'expense' : 'savings';
      let amountFormatted = this.formatAmount(plan.amount);
      if (plan.type === 'income') amountFormatted = '+' + amountFormatted;
      else if (plan.type === 'expense') amountFormatted = '-' + amountFormatted;

      const formattedDate = plan.date.split('-').reverse().join('.');

      card.innerHTML = `
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
          <span style="font-weight: 500; font-size: 13px; color: var(--text-primary); word-break: break-word;">
            ${this.formatSentenceCase(this.escapeHtml(plan.description))}
          </span>
          <span class="status-badge ${statusClass}" style="flex-shrink: 0;">${this.formatSentenceCase(statusLabel)}</span>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px; font-size: 11px;">
          <div style="display: flex; align-items: center; gap: 6px; color: ${cat ? cat.color : 'var(--text-muted)'};">
            ${cat ? `<span class="material-symbols-outlined" style="font-size: 14px;">${cat.icon}</span><span>${this.formatSentenceCase(cat.name)}</span>` : '<span>Без категории</span>'}
          </div>
          <span style="color: var(--text-muted);">${formattedDate}</span>
        </div>
        <div style="margin-top: 4px; display: flex; justify-content: flex-end;">
          <span class="tx-amount ${typeClass}" style="font-size: 13px;">${amountFormatted}</span>
        </div>
      `;
      container.appendChild(card);
    });
  },

  renderOverviewTasks() {
    if (!this.overviewTasksList) return;
    const tasks = db.getTasks();

    if (tasks.length === 0) {
      this.overviewTasksList.innerHTML = '<div class="empty-state">Нет задач. Добавьте их во вкладке Задачи.</div>';
      return;
    }

    this.overviewTasksList.innerHTML = '';

    // Сортировка: Сначала "В процессе", потом "Не начато", потом "Выполнено"
    const statusOrder = { in_progress: 1, todo: 2, done: 3 };
    const sorted = [...tasks].sort((a, b) => {
      return statusOrder[a.status] - statusOrder[b.status];
    });

    // Отображаем первые 4 задачи
    sorted.slice(0, 4).forEach(task => {
      const card = document.createElement('div');
      card.className = 'budget-card';

      card.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <span style="font-weight: 500; font-size: 13px; color: var(--text-primary); word-break: break-word;">
            ${this.formatSentenceCase(this.escapeHtml(task.title))}
          </span>
        </div>
        ${task.description ? `
          <div style="color: var(--text-secondary); font-size: 12px; line-height: 1.4; margin-top: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; word-break: break-word;">
            ${this.formatSentenceCase(this.escapeHtml(task.description))}
          </div>
        ` : ''}
      `;
      this.overviewTasksList.appendChild(card);
    });
  }
};
