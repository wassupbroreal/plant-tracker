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

    // Сбор урожая
    if (this.overviewBtnHarvest) {
      this.overviewBtnHarvest.addEventListener('click', () => {
        this.showHarvestReport();
      });
    }
    if (this.closeHarvestModal) {
      this.closeHarvestModal.addEventListener('click', () => {
        if (this.harvestModal) this.harvestModal.classList.remove('active');
      });
    }
    if (this.btnHarvestOk) {
      this.btnHarvestOk.addEventListener('click', () => {
        if (this.harvestModal) this.harvestModal.classList.remove('active');
      });
    }
    if (this.harvestModal) {
      this.harvestModal.addEventListener('click', (e) => {
        if (e.target === this.harvestModal) {
          this.harvestModal.classList.remove('active');
        }
      });
    }

    // Редактирование профиля из Обзора
    if (this.overviewBtnEditProfile) {
      this.overviewBtnEditProfile.addEventListener('click', () => {
        const user = db.getUser();
        if (user) {
          if (this.modalProfileUsername) this.modalProfileUsername.value = user.username;
          if (this.modalProfilePassword) {
            this.modalProfilePassword.value = '';
            this.modalProfilePassword.type = 'password';
          }
          if (this.toggleModalProfilePassword) {
            const icon = this.toggleModalProfilePassword.querySelector('span');
            if (icon) icon.textContent = 'visibility';
          }
          if (this.modalRoundUpGoal) {
            const goals = db.getGoals();
            this.modalRoundUpGoal.innerHTML = '<option value="">Не выбрано</option>' + 
              goals.map(g => `<option value="${g.id}">${this.escapeHtml(g.title)}</option>`).join('');
            this.modalRoundUpGoal.value = user.roundUpGoalId || '';
          }
          if (this.modalRoundUpMode) {
            this.modalRoundUpMode.value = user.roundUpMode || 'none';
          }
          if (this.editProfileModal) this.editProfileModal.classList.add('active');
        }
      });
    }

    const closeProfileModal = () => {
      if (this.editProfileModal) this.editProfileModal.classList.remove('active');
    };

    if (this.closeEditProfileModal) {
      this.closeEditProfileModal.addEventListener('click', closeProfileModal);
    }
    if (this.btnEditProfileCancel) {
      this.btnEditProfileCancel.addEventListener('click', closeProfileModal);
    }
    if (this.editProfileModal) {
      this.editProfileModal.addEventListener('click', (e) => {
        if (e.target === this.editProfileModal) closeProfileModal();
      });
    }

    if (this.toggleModalProfilePassword) {
      this.toggleModalProfilePassword.addEventListener('click', () => {
        if (!this.modalProfilePassword) return;
        const iconEl = this.toggleModalProfilePassword.querySelector('span');
        if (!iconEl) return;
        if (this.modalProfilePassword.type === 'password') {
          this.modalProfilePassword.type = 'text';
          iconEl.textContent = 'visibility_off';
        } else {
          this.modalProfilePassword.type = 'password';
          iconEl.textContent = 'visibility';
        }
      });
    }

    if (this.editProfileModalForm) {
      this.editProfileModalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!this.modalProfileUsername) return;
        const username = this.modalProfileUsername.value.trim();
        if (username) {
          const user = db.getUser();
          const currency = user ? user.currency : 'RUB';
          const avatar = user ? user.avatar : '';
          const theme = user ? user.theme : 'lime';
          const finMonth = user ? user.financialMonthStart : 1;
          const round = user ? user.roundAmounts : false;
          
          let passcode = user ? user.passcode : '';
          if (this.modalProfilePassword && this.modalProfilePassword.value.trim()) {
            passcode = this.modalProfilePassword.value.trim();
          }

          const roundUpMode = this.modalRoundUpMode ? this.modalRoundUpMode.value : 'none';
          const roundUpGoalId = this.modalRoundUpGoal ? this.modalRoundUpGoal.value : '';

          db.setUser(username, currency, passcode, avatar, theme, finMonth, round, roundUpMode, roundUpGoalId);

          // Синхронизация с UI
          const sidebarUsername = document.getElementById('sidebar-username');
          if (sidebarUsername) sidebarUsername.textContent = this.formatSentenceCase(username);

          if (this.profileUsername) this.profileUsername.value = username;

          this.renderOverview();
          closeProfileModal();
          this.showToast('Профиль успешно обновлен!', 'success');
        }
      });
    }
  },

  renderOverview() {
    const transactions = db.getTransactions();
    const categories = db.getCategories();
    
    const user = db.getUser();
    if (user && this.overviewProfileUsername) {
      this.overviewProfileUsername.textContent = this.formatSentenceCase(user.username);
    }

    const startDay = user ? (user.financialMonthStart || 1) : 1;

    let totalIncome = 0;
    let totalExpense = 0;
    let totalSavings = 0;
    let totalBalance = 0;

    transactions.forEach(t => {
      const isCurrentMonth = this.isDateInCurrentFinancialMonth(t.date, startDay);

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
    
    const achievements = db.getAchievements();
    this.renderOverviewLevel(achievements);
    this.renderOverviewAchievements(achievements);

    this.renderGardenerInsights(transactions);
    this.renderBloomCalendar(transactions);

    // Проверка финансовых достижений
    this.checkFinanceAchievements();
  },

  renderOverviewBudgets(transactions, categories) {
    const container = this.overviewBudgetsList || document.getElementById('overview-budgets-list');
    if (!container) return;

    const budgets = db.getBudgets();
    if (budgets.length === 0) {
      container.innerHTML = '<div class="empty-state">Нет лимитов. Установите их во вкладке Бюджеты.</div>';
      const summaryEl = document.getElementById('overview-budgets-summary');
      if (summaryEl) summaryEl.textContent = '0.00 ' + this.getCurrencySymbol() + ' / 0.00 ' + this.getCurrencySymbol();
      return;
    }

    container.innerHTML = '';
    const user = db.getUser();
    const startDay = user ? (user.financialMonthStart || 1) : 1;

    let totalSpent = 0;
    let totalLimit = 0;

    budgets.forEach(bgt => {
      const cat = categories.find(c => c.id === bgt.categoryId);
      if (!cat) return;

      const spent = transactions
        .filter(t => t.type === 'expense' && t.categoryId === bgt.categoryId)
        .filter(t => this.isDateInCurrentFinancialMonth(t.date, startDay))
        .reduce((sum, t) => sum + t.amount, 0);

      totalSpent += spent;
      totalLimit += bgt.limit;

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

    const summaryEl = document.getElementById('overview-budgets-summary');
    if (summaryEl) {
      summaryEl.textContent = `${this.formatAmount(totalSpent)} / ${this.formatAmount(totalLimit)}`;
    }
  },

  renderOverviewGoals(transactions) {
    const container = this.overviewGoalsList || document.getElementById('overview-goals-list');
    if (!container) return;

    const goals = db.getGoals().filter(g => !g.completed);
    if (goals.length === 0) {
      container.innerHTML = '<div class="empty-state">Нет целей. Создайте их во вкладке Цели.</div>';
      const summaryEl = document.getElementById('overview-goals-summary');
      if (summaryEl) summaryEl.textContent = '0.00 ' + this.getCurrencySymbol() + ' / 0.00 ' + this.getCurrencySymbol();
      return;
    }

    container.innerHTML = '';
    
    let totalSpent = 0;
    let totalTarget = 0;

    goals.forEach(goal => {
      const spent = transactions
        .filter(t => t.type === 'savings' && t.goalId === goal.id)
        .reduce((sum, t) => sum + t.amount, 0);

      totalSpent += spent;
      totalTarget += goal.targetAmount;

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

    const summaryEl = document.getElementById('overview-goals-summary');
    if (summaryEl) {
      summaryEl.textContent = `${this.formatAmount(totalSpent)} / ${this.formatAmount(totalTarget)}`;
    }
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
    sorted.forEach(plan => {
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
          ${statusLabel !== 'Ожидает' ? `<span class="status-badge ${statusClass}" style="flex-shrink: 0;">${this.formatSentenceCase(statusLabel)}</span>` : ''}
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
    sorted.forEach(task => {
      const card = document.createElement('div');
      card.className = 'budget-card';

      let statusColor = '#94a3b8'; // Grey for todo
      if (task.status === 'in_progress') {
        statusColor = '#38bdf8'; // Blue for in_progress
      } else if (task.status === 'done') {
        statusColor = '#22c55e'; // Green for done
      }

      card.innerHTML = `
        <div class="budget-card-header">
          <div class="budget-card-title" style="color: ${statusColor};">
            <span class="material-symbols-outlined">assignment</span>
            <span>${this.formatSentenceCase(this.escapeHtml(task.title))}</span>
          </div>
        </div>
        ${task.description ? `
          <div style="color: var(--text-secondary); font-size: 12px; line-height: 1.4; margin-top: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; word-break: break-word;">
            ${this.formatSentenceCase(this.escapeHtml(task.description))}
          </div>
        ` : ''}
      `;
      this.overviewTasksList.appendChild(card);
    });
  },

  renderOverviewLevel(achievements) {
    const totalXp = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + (a.xp || 100), 0);
    
    const levels = [
      { level: 1, name: 'Семечко', minXp: 0, maxXp: 200 },
      { level: 2, name: 'Росток', minXp: 200, maxXp: 500 },
      { level: 3, name: 'Листик', minXp: 500, maxXp: 900 },
      { level: 4, name: 'Цветок', minXp: 900, maxXp: 1400 },
      { level: 5, name: 'Дерево', minXp: 1400, maxXp: 99999 }
    ];
    
    let current = levels[0];
    for (let i = 0; i < levels.length; i++) {
      if (totalXp >= levels[i].minXp) {
        current = levels[i];
      }
    }
    
    const isMax = current.level === 5;
    const range = current.maxXp - current.minXp;
    const progress = totalXp - current.minXp;
    const percent = isMax ? 100 : Math.min(100, Math.round((progress / range) * 100));

    const badgeEl = document.getElementById('overview-level-badge');
    const nameEl = document.getElementById('overview-level-name');
    const textEl = document.getElementById('overview-xp-text');
    const fillEl = document.getElementById('overview-xp-fill');

    if (badgeEl) badgeEl.textContent = `Ур. ${current.level}`;
    if (nameEl) nameEl.textContent = current.name;
    
    if (textEl) {
      if (isMax) {
        textEl.textContent = `${totalXp} XP (Максимум)`;
      } else {
        textEl.textContent = `${totalXp} / ${current.maxXp} XP`;
      }
    }
    
    if (fillEl) {
      fillEl.style.width = `${percent}%`;
    }

    // Рендеринг интерактивного растения SVG в зависимости от уровня и превышения бюджетов
    const budgets = db.getBudgets();
    const transactions = db.getTransactions();
    const user = db.getUser();
    const startDay = user ? (user.financialMonthStart || 1) : 1;
    let anyExceeded = false;
    budgets.forEach(bgt => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.categoryId === bgt.categoryId)
        .filter(t => this.isDateInCurrentFinancialMonth(t.date, startDay))
        .reduce((sum, t) => sum + t.amount, 0);
      if (spent > bgt.limit) {
        anyExceeded = true;
      }
    });

    const leafColor = anyExceeded ? '#eab308' : 'var(--accent-color)'; // увядшие желтые листья против зеленых
    const stemColor = anyExceeded ? '#ca8a04' : '#84cc16';
    const flowerColor = anyExceeded ? '#f97316' : '#ec4899';
    const potColor = '#3b3b3b';
    const potRimColor = '#555555';

    let svgContent = '';
    const potSvg = `
      <ellipse cx="50" cy="78" rx="22" ry="5" fill="#5c4033" />
      <polygon points="32,78 68,78 62,94 38,94" fill="${potColor}" stroke="${potRimColor}" stroke-width="1.5" />
      <ellipse cx="50" cy="78" rx="18" ry="4" fill="#3e2723" />
    `;

    if (current.level === 1) {
      // Семечко
      svgContent = `
        <svg viewBox="0 0 100 100" class="plant-svg" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="50" cy="78" rx="22" ry="5" fill="#5c4033" />
          <polygon points="32,78 68,78 62,94 38,94" fill="${potColor}" stroke="${potRimColor}" stroke-width="1.5" />
          <ellipse cx="50" cy="78" rx="18" ry="4" fill="#3e2723" />
          <path d="M48 74 C 48 74, 50 68, 52 74 C 52 74, 52 78, 50 78 C 48 78, 48 74, 48 74" fill="#d2b48c" stroke="#8b5a2b" stroke-width="1" />
        </svg>
      `;
    } else if (current.level === 2) {
      // Росток
      svgContent = `
        <svg viewBox="0 0 100 100" class="plant-svg" xmlns="http://www.w3.org/2000/svg">
          ${potSvg}
          <path d="M50 78 Q 48 64, 51 54" stroke="${stemColor}" stroke-width="3" fill="none" stroke-linecap="round" />
          <path d="M51 54 Q 60 48, 58 58 Q 50 58, 51 54" fill="${leafColor}" />
        </svg>
      `;
    } else if (current.level === 3) {
      // Листик
      svgContent = `
        <svg viewBox="0 0 100 100" class="plant-svg" xmlns="http://www.w3.org/2000/svg">
          ${potSvg}
          <path d="M50 78 Q 46 54, 50 38" stroke="${stemColor}" stroke-width="4" fill="none" stroke-linecap="round" />
          <path d="M47 56 Q 36 52, 40 64 Q 47 60, 47 56" fill="${leafColor}" />
          <path d="M49 42 Q 62 36, 59 48 Q 50 48, 49 42" fill="${leafColor}" />
        </svg>
      `;
    } else if (current.level === 4) {
      // Цветок
      svgContent = `
        <svg viewBox="0 0 100 100" class="plant-svg" xmlns="http://www.w3.org/2000/svg">
          ${potSvg}
          <path d="M50 78 L 50 42" stroke="${stemColor}" stroke-width="4" fill="none" stroke-linecap="round" />
          <path d="M50 62 Q 36 58, 40 70 Q 50 66, 50 62" fill="${leafColor}" />
          <path d="M50 50 Q 64 46, 60 58 Q 50 54, 50 50" fill="${leafColor}" />
          <circle cx="50" cy="30" r="6" fill="${flowerColor}" class="plant-petal" />
          <circle cx="50" cy="46" r="6" fill="${flowerColor}" class="plant-petal" />
          <circle cx="42" cy="38" r="6" fill="${flowerColor}" class="plant-petal" />
          <circle cx="58" cy="38" r="6" fill="${flowerColor}" class="plant-petal" />
          <circle cx="50" cy="38" r="5" fill="#facc15" />
        </svg>
      `;
    } else {
      // Дерево
      const treeTrunkColor = anyExceeded ? '#a16207' : '#8b4513';
      svgContent = `
        <svg viewBox="0 0 100 100" class="plant-svg" xmlns="http://www.w3.org/2000/svg">
          ${potSvg}
          <path d="M50 78 L 50 50" stroke="${treeTrunkColor}" stroke-width="7" fill="none" stroke-linecap="round" />
          <path d="M50 60 Q 38 52, 34 54" stroke="${treeTrunkColor}" stroke-width="4.5" fill="none" stroke-linecap="round" />
          <path d="M50 55 Q 62 46, 66 48" stroke="${treeTrunkColor}" stroke-width="4.5" fill="none" stroke-linecap="round" />
          <circle cx="50" cy="36" r="16" fill="${leafColor}" />
          <circle cx="36" cy="44" r="11" fill="${leafColor}" />
          <circle cx="64" cy="42" r="13" fill="${leafColor}" />
        </svg>
      `;
    }

    if (this.overviewPlantSvgContainer) {
      this.overviewPlantSvgContainer.innerHTML = svgContent;
    }
  },

  renderOverviewAchievements(achievements) {
    const listContainer = document.getElementById('overview-achievements-list');
    const counterEl = document.getElementById('overview-achievements-counter');
    if (!listContainer) return;

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    if (counterEl) {
      counterEl.textContent = `${unlockedCount} / ${achievements.length}`;
    }

    listContainer.innerHTML = achievements.map(ach => {
      const isUnlocked = ach.unlocked;
      const icon = ach.icon || 'star';
      
      let progressHTML = '';
      if (!isUnlocked && ach.maxProgress > 1) {
        const percent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));
        progressHTML = `
          <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
            <div class="overview-ach-progress-bar">
              <div class="overview-ach-progress-fill" style="width: ${percent}%;"></div>
            </div>
            <span style="font-size: 9px; color: var(--text-muted); font-family: monospace;">${ach.progress}/${ach.maxProgress}</span>
          </div>
        `;
      }

      const dateHTML = isUnlocked ? `<span class="overview-ach-date">Открыто ${ach.unlockedAt}</span>` : '';
      const lockHTML = !isUnlocked ? `<span class="material-symbols-outlined" style="font-size: 11px; position: absolute; bottom: -2px; right: -2px; color: var(--color-danger);">lock</span>` : '';

      return `
        <div class="overview-achievement-row ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="overview-ach-icon">
            <span class="material-symbols-outlined" style="font-size: 20px;">${icon}</span>
            ${lockHTML}
          </div>
          <div class="overview-ach-details">
            <div class="overview-ach-title">${ach.title}</div>
            <div class="overview-ach-desc">${ach.desc}</div>
            ${progressHTML}
          </div>
          <div class="overview-ach-meta">
            <span class="overview-ach-xp">+${ach.xp} XP</span>
            ${dateHTML}
          </div>
        </div>
      `;
    }).join('');
  },

  renderGardenerInsights(transactions) {
    const adviceEl = document.getElementById('overview-gardener-advice');
    if (!adviceEl) return;

    const user = db.getUser();
    const startDay = user ? (user.financialMonthStart || 1) : 1;
    const { startDate } = this.getFinancialMonthRange(new Date(), startDay);
    const today = new Date();
    const timePassed = Math.max(1, today.getTime() - startDate.getTime());
    const daysPassed = Math.max(1, Math.ceil(timePassed / (1000 * 60 * 60 * 24)));

    const currentMonthExpenses = transactions
      .filter(t => t.type === 'expense' && this.isDateInCurrentFinancialMonth(t.date, startDay))
      .reduce((sum, t) => sum + t.amount, 0);

    const averageSpentPerDay = currentMonthExpenses / daysPassed;

    const budgets = db.getBudgets();
    const totalBudgetsLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
    const budgetsExceededCount = budgets.filter(bgt => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.categoryId === bgt.categoryId)
        .filter(t => this.isDateInCurrentFinancialMonth(t.date, startDay))
        .reduce((sum, t) => sum + t.amount, 0);
      return spent > bgt.limit;
    }).length;

    const tasks = db.getTasks ? db.getTasks() : [];
    const activeTasksCount = tasks.filter(t => t.status !== 'done').length;

    let adviceText = '';
    const percentSpent = totalBudgetsLimit > 0 ? (currentMonthExpenses / totalBudgetsLimit) * 100 : 0;
    const daysPercent = Math.min(100, (daysPassed / 30) * 100);

    if (budgetsExceededCount > 0) {
      adviceText = `Внимание! Превышен лимит по ${budgetsExceededCount} ${this.getPluralNoun(budgetsExceededCount, 'бюджету', 'бюджетам', 'бюджетам')}. Советую сократить траты в этих категориях, чтобы дать вашему саду зацвести снова!`;
    } else if (totalBudgetsLimit > 0 && percentSpent > daysPercent + 15) {
      adviceText = `Темп трат опережает календарь! Вы израсходовали ${Math.round(percentSpent)}% лимитов бюджетов всего за ${daysPassed} ${this.getPluralNoun(daysPassed, 'день', 'дня', 'дней')}. Постарайтесь притормозить в ближайшие дни.`;
    } else if (activeTasksCount > 2) {
      adviceText = `В вашем саду скопилось ${activeTasksCount} невыполненных ${this.getPluralNoun(activeTasksCount, 'задач', 'задачи', 'задач')}. Выполнение дел приносит опыт (XP) и продвигает вас к новому уровню!`;
    } else {
      adviceText = `Твой сад выглядит прекрасно! Расходы под контролем, а все дела идут по плану. Продолжай в том же духе!`;
    }

    adviceEl.textContent = adviceText;
  },

  renderBloomCalendar(transactions) {
    if (!this.overviewBloomCalendar) return;

    const user = db.getUser();
    const startDay = user ? (user.financialMonthStart || 1) : 1;
    const { startDate } = this.getFinancialMonthRange(new Date(), startDay);
    const today = new Date();
    const timePassed = Math.max(1, today.getTime() - startDate.getTime());
    const daysPassed = Math.max(1, Math.ceil(timePassed / (1000 * 60 * 60 * 24)));

    const currentMonthExpenses = transactions
      .filter(t => t.type === 'expense' && this.isDateInCurrentFinancialMonth(t.date, startDay))
      .reduce((sum, t) => sum + t.amount, 0);

    const averageSpentPerDay = currentMonthExpenses / daysPassed;

    // Сгенерируем последние 14 дней
    const datesList = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      datesList.push(d.toISOString().substring(0, 10));
    }

    this.overviewBloomCalendar.innerHTML = '';
    datesList.forEach(dateStr => {
      const dayExpenses = transactions
        .filter(t => t.type === 'expense' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);

      let statusClass = 'empty';
      let titleText = '';
      let label = '•';

      const dObj = new Date(dateStr);
      const displayDate = dObj.getDate() + '.' + (dObj.getMonth() + 1);

      if (dayExpenses === 0) {
        statusClass = 'green';
        label = '🌸';
        titleText = `День без трат (${displayDate}). Сад расцветает!`;
      } else if (dayExpenses <= averageSpentPerDay) {
        statusClass = 'yellow';
        label = '🌿';
        titleText = `Умеренные траты: ${this.formatAmount(dayExpenses)} (${displayDate}). Ниже среднего.`;
      } else {
        statusClass = 'red';
        label = '🍂';
        titleText = `Повышенные траты: ${this.formatAmount(dayExpenses)} (${displayDate}). Выше среднего!`;
      }

      const dot = document.createElement('div');
      dot.className = `habit-day-dot ${statusClass}`;
      dot.title = titleText;
      dot.innerHTML = `<span style="font-size: 10px;">${label}</span>`;
      this.overviewBloomCalendar.appendChild(dot);
    });
  },

  showHarvestReport() {
    const transactions = db.getTransactions();
    const budgets = db.getBudgets();
    const tasks = db.getTasks ? db.getTasks() : [];
    const user = db.getUser();
    const startDay = user ? (user.financialMonthStart || 1) : 1;

    const monthlySavings = transactions
      .filter(t => t.type === 'savings' && this.isDateInCurrentFinancialMonth(t.date, startDay))
      .reduce((sum, t) => sum + t.amount, 0);

    const completedTasksCount = tasks.filter(t => t.status === 'done' && (!t.createdAt || this.isDateInCurrentFinancialMonth(t.createdAt, startDay))).length;

    const budgetsExceededCount = budgets.filter(bgt => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.categoryId === bgt.categoryId)
        .filter(t => this.isDateInCurrentFinancialMonth(t.date, startDay))
        .reduce((sum, t) => sum + t.amount, 0);
      return spent > bgt.limit;
    }).length;

    const savingsValEl = document.getElementById('harvest-savings-val');
    if (savingsValEl) {
      savingsValEl.textContent = this.formatAmount(monthlySavings);
    }

    const tasksValEl = document.getElementById('harvest-tasks-val');
    if (tasksValEl) {
      tasksValEl.textContent = `${completedTasksCount} шт.`;
    }

    const budgetsValEl = document.getElementById('harvest-budgets-val');
    if (budgetsValEl) {
      budgetsValEl.textContent = `${budgetsExceededCount} превышено`;
      if (budgetsExceededCount > 0) {
        budgetsValEl.style.color = 'var(--color-danger)';
      } else {
        budgetsValEl.style.color = 'var(--color-success)';
      }
    }

    const verdictBoxEl = document.getElementById('harvest-verdict-box');
    if (verdictBoxEl) {
      let verdictText = '';
      if (budgetsExceededCount === 0 && monthlySavings > 0) {
        verdictText = `🌱 Великолепный урожай! Вы сохранили все лимиты бюджетов под контролем и отложили ${this.formatAmount(monthlySavings)} в копилку. Ваши финансовые привычки приносят плоды!`;
      } else if (budgetsExceededCount > 0) {
        verdictText = `🍂 Неплохой результат, но есть над чем поработать. Превышено ${budgetsExceededCount} ${this.getPluralNoun(budgetsExceededCount, 'лимит бюджетов', 'лимита бюджетов', 'лимитов бюджетов')}. Попробуйте уделить больше внимания контролю расходов в следующем месяце!`;
      } else if (monthlySavings === 0 && completedTasksCount === 0) {
        verdictText = `🌾 Спокойный месяц. Вы не превысили бюджеты, но и накоплений пока нет. Попробуйте поставить финансовую цель или активировать автоокругление трат!`;
      } else {
        verdictText = `🌸 Хороший урожай! Вы успешно продвигаетесь вперед. Выполнено ${completedTasksCount} ${this.getPluralNoun(completedTasksCount, 'задача', 'задачи', 'задач')}, продолжайте заботиться о своем финансовом саде!`;
      }
      verdictBoxEl.textContent = verdictText;
    }

    if (this.harvestModal) {
      this.harvestModal.classList.add('active');
    }
  },

  getPluralNoun(number, one, two, many) {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
      return many;
    }
    n %= 10;
    if (n === 1) {
      return one;
    }
    if (n >= 2 && n <= 4) {
      return two;
    }
    return many;
  }
};
