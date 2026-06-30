/* Модуль базы данных PLANT (LocalStorage) */

const DB_KEYS = {
  USER: 'plant_user',
  CATEGORIES: 'plant_categories',
  TRANSACTIONS: 'plant_transactions',
  BUDGETS: 'plant_budgets',
  PLANS: 'plant_planning',
  NOTES: 'plant_notes',
  CHECKLISTS: 'plant_checklists',
  TASKS: 'plant_tasks',
  GOALS: 'plant_goals',
  TAGS: 'plant_tags',
  ACHIEVEMENTS: 'plant_achievements'
};

const DEFAULT_CATEGORIES = [
  // Расходы
  { id: 'cat-food', name: 'Продукты', type: 'expense', color: '#f59e0b', icon: 'shopping_cart' },
  { id: 'cat-rent', name: 'Жилье', type: 'expense', color: '#3b82f6', icon: 'home' },
  { id: 'cat-transport', name: 'Транспорт', type: 'expense', color: '#06b6d4', icon: 'directions_car' },
  { id: 'cat-leisure', name: 'Развлечения', type: 'expense', color: '#8b5cf6', icon: 'sports_esports' },
  { id: 'cat-health', name: 'Здоровье', type: 'expense', color: '#ef4444', icon: 'medical_services' },
  // Доходы
  { id: 'cat-salary', name: 'Зарплата', type: 'income', color: '#84cc16', icon: 'work' },
  { id: 'cat-freelance', name: 'Фриланс', type: 'income', color: '#14b8a6', icon: 'credit_card' },
  { id: 'cat-invest', name: 'Инвестиции', type: 'income', color: '#ec4899', icon: 'payments' },
  // Накопления
  { id: 'cat-piggy', name: 'Копилка', type: 'savings', color: '#06b6d4', icon: 'savings' }
];

const PROFILE_GRADIENTS = [
  'linear-gradient(135deg, #a855f7, #3b82f6)',
  'linear-gradient(135deg, #ec4899, #f97316)',
  'linear-gradient(135deg, #14b8a6, #06b6d4)',
  'linear-gradient(135deg, #84cc16, #10b981)',
  'linear-gradient(135deg, #ef4444, #f43f5e)'
];

export const ACHIEVEMENT_DEFINITIONS = [
  { id: 'first_tx', title: 'Первый росток', desc: 'Добавьте вашу первую транзакцию', icon: 'potted_plant', maxProgress: 1, xp: 100 },
  { id: 'first_budget', title: 'Архитектор бюджетов', desc: 'Создайте ваш первый бюджет категории', icon: 'account_balance_wallet', maxProgress: 1, xp: 100 },
  { id: 'first_goal', title: 'Целеустремленный', desc: 'Создайте вашу первую цель накопления', icon: 'track_changes', maxProgress: 1, xp: 100 },
  { id: 'first_plan', title: 'Мастер планов', desc: 'Создайте первый запланированный платеж', icon: 'event_upcoming', maxProgress: 1, xp: 100 },
  { id: 'tx_count_10', title: 'Скрупулезность', desc: 'Добавьте 10 транзакций всего', icon: 'receipt_long', maxProgress: 10, xp: 250 },
  { id: 'first_task_done', title: 'Дисциплинированный', desc: 'Выполните первую задачу в Органайзере', icon: 'task_alt', maxProgress: 1, xp: 100 },
  { id: 'savings_10k', title: 'Копилка', desc: 'Отложите суммарно 10 000 ₽ в накопления', icon: 'savings', maxProgress: 10000, xp: 300 },
  { id: 'frugal_month', title: 'Экономия', desc: 'Потратьте менее 50% дохода за расчетный период', icon: 'percent', maxProgress: 1, xp: 250 },
  { id: 'rich_harvest', title: 'Богатый урожай', desc: 'Суммарный доход профиля превысил 100 000 ₽', icon: 'monetization_on', maxProgress: 100000, xp: 400 },
  { id: 'notes_count_3', title: 'Постоянство', desc: 'Создайте 3 заметки в Органайзере', icon: 'description', maxProgress: 3, xp: 200 }
];

export const db = {
  // Инициализация базы данных
  init() {
    if (!localStorage.getItem('plant_profiles')) {
      localStorage.setItem('plant_profiles', JSON.stringify([]));
    }
    // Сбрасываем активную сессию при каждом запуске приложения
    this.clearUser();
  },

  // Инициализация данных под конкретный профиль
  initProfile(profileId) {
    localStorage.setItem('plant_active_profile_id', profileId);

    const keys = {
      CATEGORIES: DEFAULT_CATEGORIES,
      TRANSACTIONS: [],
      BUDGETS: [],
      PLANS: [],
      NOTES: [],
      CHECKLISTS: [],
      TASKS: [],
      GOALS: [],
      TAGS: [],
      ACHIEVEMENTS: {}
    };

    Object.entries(keys).forEach(([keyName, defaultValue]) => {
      const key = this.getKey(keyName);
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
      }
    });

    // Инициализация настроек пользователя для этого профиля
    const userKey = this.getKey('USER');
    if (!localStorage.getItem(userKey)) {
      const profile = this.getProfiles().find(p => p.id === profileId);
      const username = profile ? (profile.login || profile.name) : 'Пользователь';
      const pin = profile ? (profile.password || profile.pin) : '';
      const user = { username, currency: 'RUB', passcode: pin, avatar: '', theme: 'lime', financialMonthStart: 1, roundAmounts: false, roundUpMode: 'none', roundUpGoalId: '' };
      localStorage.setItem(userKey, JSON.stringify(user));
    }
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  },

  // --- РАБОТА С ПРОФИЛЯМИ ---
  getProfiles() {
    return JSON.parse(localStorage.getItem('plant_profiles')) || [];
  },

  saveProfiles(profiles) {
    localStorage.setItem('plant_profiles', JSON.stringify(profiles));
  },

  createProfile(login, password) {
    const profiles = this.getProfiles();

    // Check for duplicate logins case-insensitively
    if (profiles.some(p => (p.login || p.name || '').toLowerCase() === login.toLowerCase())) {
      return null;
    }

    const id = 'prof-' + this.generateId();
    const gradient = PROFILE_GRADIENTS[profiles.length % PROFILE_GRADIENTS.length];
    const newProfile = { id, login, password, name: login, pin: password, gradient };
    profiles.push(newProfile);
    this.saveProfiles(profiles);

    // Инициализируем хранилище профиля
    this.initProfile(id);

    return newProfile;
  },

  updateProfileInList(id, updatedFields) {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === id);
    if (index !== -1) {
      profiles[index] = { ...profiles[index], ...updatedFields };
      this.saveProfiles(profiles);
    }
  },

  deleteProfile(profileId) {
    const profiles = this.getProfiles();
    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    this.saveProfiles(updatedProfiles);

    const keysToRemove = [
      `plant_${profileId}_user`,
      `plant_${profileId}_categories`,
      `plant_${profileId}_transactions`,
      `plant_${profileId}_budgets`,
      `plant_${profileId}_planning`,
      `plant_${profileId}_notes`,
      `plant_${profileId}_checklists`,
      `plant_${profileId}_tasks`,
      `plant_${profileId}_goals`,
      `plant_${profileId}_tags`,
      `plant_${profileId}_achievements`
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // Если удаляемый профиль был активным, чистим сессию
    if (this.getActiveProfileId() === profileId) {
      this.clearUser();
    }
  },

  getActiveProfileId() {
    return localStorage.getItem('plant_active_profile_id') || '';
  },

  getKey(keyName) {
    const activeId = this.getActiveProfileId();
    if (!activeId) {
      return DB_KEYS[keyName];
    }
    return `plant_${activeId}_${keyName.toLowerCase()}`;
  },

  // --- ПОЛЬЗОВАТЕЛЬ ---
  getUser() {
    if (localStorage.getItem('plant_session_active') === 'true') {
      const data = localStorage.getItem(this.getKey('USER'));
      return data ? JSON.parse(data) : null;
    }
    return null;
  },

  getProfile() {
    const data = localStorage.getItem(this.getKey('USER'));
    return data ? JSON.parse(data) : null;
  },

  setUser(username, currency, passcode, avatar, theme, financialMonthStart, roundAmounts, roundUpMode, roundUpGoalId) {
    const existing = this.getProfile();
    const finalCurrency = currency || (existing ? existing.currency : 'RUB');
    const finalPasscode = passcode !== undefined ? passcode : (existing ? existing.passcode : '');
    const finalAvatar = avatar !== undefined ? avatar : (existing ? existing.avatar : '');
    const finalTheme = theme !== undefined ? theme : (existing ? (existing.theme || 'lime') : 'lime');
    const finalFinancialMonthStart = financialMonthStart !== undefined ? parseInt(financialMonthStart) : (existing ? (existing.financialMonthStart || 1) : 1);
    const finalRoundAmounts = roundAmounts !== undefined ? !!roundAmounts : (existing ? (existing.roundAmounts || false) : false);
    const finalRoundUpMode = roundUpMode !== undefined ? roundUpMode : (existing ? (existing.roundUpMode || 'none') : 'none');
    const finalRoundUpGoalId = roundUpGoalId !== undefined ? roundUpGoalId : (existing ? (existing.roundUpGoalId || '') : '');
    
    const user = { 
      username, 
      currency: finalCurrency, 
      passcode: finalPasscode, 
      avatar: finalAvatar, 
      theme: finalTheme,
      financialMonthStart: finalFinancialMonthStart,
      roundAmounts: finalRoundAmounts,
      roundUpMode: finalRoundUpMode,
      roundUpGoalId: finalRoundUpGoalId
    };
    localStorage.setItem(this.getKey('USER'), JSON.stringify(user));
    localStorage.setItem('plant_session_active', 'true');

    // Синхронизируем с общим списком профилей
    const activeId = this.getActiveProfileId();
    if (activeId) {
      this.updateProfileInList(activeId, { name: username, login: username, pin: finalPasscode, password: finalPasscode });
    }

    return user;
  },

  clearUser() {
    localStorage.setItem('plant_session_active', 'false');
    localStorage.removeItem('plant_active_profile_id');
  },

  // --- КАТЕГОРИИ ---
  getCategories() {
    return JSON.parse(localStorage.getItem(this.getKey('CATEGORIES'))) || [];
  },

  saveCategories(categories) {
    localStorage.setItem(this.getKey('CATEGORIES'), JSON.stringify(categories));
  },

  addCategory(category) {
    const categories = this.getCategories();
    const newCategory = {
      id: 'cat-' + this.generateId(),
      ...category
    };
    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  },

  updateCategory(id, updatedFields) {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updatedFields };
      this.saveCategories(categories);
      return categories[index];
    }
    return null;
  },

  deleteCategory(id) {
    let categories = this.getCategories();
    categories = categories.filter(c => c.id !== id);
    this.saveCategories(categories);
  },

  // --- ТРАНЗАКЦИИ ---
  getTransactions() {
    return JSON.parse(localStorage.getItem(this.getKey('TRANSACTIONS'))) || [];
  },

  saveTransactions(transactions) {
    localStorage.setItem(this.getKey('TRANSACTIONS'), JSON.stringify(transactions));
  },

  addTransaction(tx) {
    const transactions = this.getTransactions();
    const newTx = {
      id: 'tx-' + this.generateId(),
      createdAt: Date.now(),
      ...tx
    };
    transactions.push(newTx);

    // Auto-Savings Copilka interceptor
    if (tx.type === 'expense') {
      const user = this.getUser();
      if (user && user.roundUpMode && user.roundUpMode !== 'none' && user.roundUpGoalId) {
        const goals = this.getGoals();
        const hasGoal = goals.some(g => g.id === user.roundUpGoalId);
        if (hasGoal) {
          let roundTo = 0;
          if (user.roundUpMode === '10') roundTo = 10;
          else if (user.roundUpMode === '50') roundTo = 50;
          else if (user.roundUpMode === '100') roundTo = 100;
          
          if (roundTo > 0) {
            const amount = tx.amount;
            const nextMultiple = Math.ceil(amount / roundTo) * roundTo;
            let remainder = nextMultiple - amount;
            
            if (remainder > 0) {
              const savingsTx = {
                id: 'tx-' + this.generateId(),
                createdAt: Date.now() + 1, // ensure chronological order
                description: `Копилка (округление: ${tx.description})`,
                type: 'savings',
                categoryId: 'cat-piggy',
                tagIds: [],
                tagId: '',
                amount: parseFloat(remainder.toFixed(2)),
                date: tx.date || new Date().toISOString().substring(0, 10),
                goalId: user.roundUpGoalId
              };
              transactions.push(savingsTx);
            }
          }
        }
      }
    }

    this.saveTransactions(transactions);
    return newTx;
  },

  updateTransaction(id, updatedFields) {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updatedFields };
      this.saveTransactions(transactions);
      return transactions[index];
    }
    return null;
  },

  deleteTransaction(id) {
    let transactions = this.getTransactions();
    transactions = transactions.filter(t => t.id !== id);
    this.saveTransactions(transactions);
  },

  // --- БЮДЖЕТЫ ---
  getBudgets() {
    return JSON.parse(localStorage.getItem(this.getKey('BUDGETS'))) || [];
  },

  saveBudgets(budgets) {
    localStorage.setItem(this.getKey('BUDGETS'), JSON.stringify(budgets));
  },

  addBudget(budget) {
    const budgets = this.getBudgets();
    const newBudget = {
      id: 'bgt-' + this.generateId(),
      ...budget
    };
    budgets.push(newBudget);
    this.saveBudgets(budgets);
    return newBudget;
  },

  updateBudget(id, updatedFields) {
    const budgets = this.getBudgets();
    const index = budgets.findIndex(b => b.id === id);
    if (index !== -1) {
      budgets[index] = { ...budgets[index], ...updatedFields };
      this.saveBudgets(budgets);
      return budgets[index];
    }
    return null;
  },

  deleteBudget(id) {
    let budgets = this.getBudgets();
    budgets = budgets.filter(b => b.id !== id);
    this.saveBudgets(budgets);
  },

  // --- ПЛАНИРОВАНИЕ ---
  getPlans() {
    return JSON.parse(localStorage.getItem(this.getKey('PLANS'))) || [];
  },

  savePlans(plans) {
    localStorage.setItem(this.getKey('PLANS'), JSON.stringify(plans));
  },

  addPlan(plan) {
    const plans = this.getPlans();
    const newPlan = {
      id: 'pln-' + this.generateId(),
      ...plan
    };
    plans.push(newPlan);
    this.savePlans(plans);
    return newPlan;
  },

  updatePlan(id, updatedFields) {
    const plans = this.getPlans();
    const index = plans.findIndex(p => p.id === id);
    if (index !== -1) {
      plans[index] = { ...plans[index], ...updatedFields };
      this.savePlans(plans);
      return plans[index];
    }
    return null;
  },

  deletePlan(id) {
    let plans = this.getPlans();
    plans = plans.filter(p => p.id !== id);
    this.savePlans(plans);
  },

  // --- ЗАМЕТКИ ---
  getNotes() {
    return JSON.parse(localStorage.getItem(this.getKey('NOTES'))) || [];
  },

  saveNotes(notes) {
    localStorage.setItem(this.getKey('NOTES'), JSON.stringify(notes));
  },

  addNote(note) {
    const notes = this.getNotes();
    const newNote = {
      id: 'nt-' + this.generateId(),
      createdAt: new Date().toISOString(),
      ...note
    };
    notes.push(newNote);
    this.saveNotes(notes);
    return newNote;
  },

  updateNote(id, updatedFields) {
    const notes = this.getNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      notes[index] = { ...notes[index], ...updatedFields };
      this.saveNotes(notes);
      return notes[index];
    }
    return null;
  },

  deleteNote(id) {
    let notes = this.getNotes();
    notes = notes.filter(n => n.id !== id);
    this.saveNotes(notes);
  },

  // --- ЧЕК-ЛИСТЫ ---
  getChecklists() {
    return JSON.parse(localStorage.getItem(this.getKey('CHECKLISTS'))) || [];
  },

  saveChecklists(lists) {
    localStorage.setItem(this.getKey('CHECKLISTS'), JSON.stringify(lists));
  },

  addChecklist(list) {
    const lists = this.getChecklists();
    const newList = {
      id: 'cl-' + this.generateId(),
      items: [], // [{ id, text, checked }]
      createdAt: new Date().toISOString(),
      ...list
    };
    lists.push(newList);
    this.saveChecklists(lists);
    return newList;
  },

  updateChecklist(id, updatedFields) {
    const lists = this.getChecklists();
    const index = lists.findIndex(l => l.id === id);
    if (index !== -1) {
      lists[index] = { ...lists[index], ...updatedFields };
      this.saveChecklists(lists);
      return lists[index];
    }
    return null;
  },

  deleteChecklist(id) {
    let lists = this.getChecklists();
    lists = lists.filter(l => l.id !== id);
    this.saveChecklists(lists);
  },

  // --- ЗАДАЧИ (KANBAN) ---
  getTasks() {
    return JSON.parse(localStorage.getItem(this.getKey('TASKS'))) || [];
  },

  saveTasks(tasks) {
    localStorage.setItem(this.getKey('TASKS'), JSON.stringify(tasks));
  },

  addTask(task) {
    const tasks = this.getTasks();
    const newTask = {
      id: 'tsk-' + this.generateId(),
      status: 'todo', // 'todo', 'in_progress', 'done'
      createdAt: new Date().toISOString(),
      ...task
    };
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  },

  updateTask(id, updatedFields) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updatedFields };
      this.saveTasks(tasks);
      return tasks[index];
    }
    return null;
  },

  deleteTask(id) {
    let tasks = this.getTasks();
    tasks = tasks.filter(t => t.id !== id);
    this.saveTasks(tasks);
  },

  // --- ЦЕЛИ НАКОПЛЕНИЯ ---
  getGoals() {
    return JSON.parse(localStorage.getItem(this.getKey('GOALS'))) || [];
  },

  saveGoals(goals) {
    localStorage.setItem(this.getKey('GOALS'), JSON.stringify(goals));
  },

  addGoal(goal) {
    const goals = this.getGoals();
    const newGoal = {
      id: 'gl-' + this.generateId(),
      createdAt: new Date().toISOString(),
      ...goal
    };
    goals.push(newGoal);
    this.saveGoals(goals);
    return newGoal;
  },

  updateGoal(id, updatedFields) {
    const goals = this.getGoals();
    const index = goals.findIndex(g => g.id === id);
    if (index !== -1) {
      goals[index] = { ...goals[index], ...updatedFields };
      this.saveGoals(goals);
      return goals[index];
    }
    return null;
  },

  deleteGoal(id) {
    let goals = this.getGoals();
    goals = goals.filter(g => g.id !== id);
    this.saveGoals(goals);
  },

  // --- ТЕГИ ---
  getTags() {
    return JSON.parse(localStorage.getItem(this.getKey('TAGS'))) || [];
  },

  saveTags(tags) {
    localStorage.setItem(this.getKey('TAGS'), JSON.stringify(tags));
  },

  addTag(tag) {
    const tags = this.getTags();
    const newTag = {
      id: 'tag-' + this.generateId(),
      ...tag
    };
    tags.push(newTag);
    this.saveTags(tags);
    return newTag;
  },

  updateTag(id, updatedFields) {
    const tags = this.getTags();
    const index = tags.findIndex(t => t.id === id);
    if (index !== -1) {
      tags[index] = { ...tags[index], ...updatedFields };
      this.saveTags(tags);
      return tags[index];
    }
    return null;
  },

  deleteTag(id) {
    let tags = this.getTags();
    tags = tags.filter(t => t.id !== id);
    this.saveTags(tags);
  },

  // --- ДОСТИЖЕНИЯ (АЧИВКИ) ---
  getAchievements() {
    const data = localStorage.getItem(this.getKey('ACHIEVEMENTS'));
    const userProgress = data ? JSON.parse(data) : {};
    
    return ACHIEVEMENT_DEFINITIONS.map(def => {
      const progressData = userProgress[def.id] || { progress: 0, unlocked: false, unlockedAt: null };
      return {
        ...def,
        progress: progressData.progress,
        unlocked: progressData.unlocked,
        unlockedAt: progressData.unlockedAt
      };
    });
  },

  updateAchievementProgress(id, value, mode = 'set') {
    const data = localStorage.getItem(this.getKey('ACHIEVEMENTS'));
    const userProgress = data ? JSON.parse(data) : {};
    
    const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === id);
    if (!def) return null;

    if (!userProgress[id]) {
      userProgress[id] = { progress: 0, unlocked: false, unlockedAt: null };
    }

    const current = userProgress[id];
    if (current.unlocked) return null;

    let oldProgress = current.progress;
    let newProgress = oldProgress;

    if (mode === 'increment') {
      newProgress = oldProgress + value;
    } else {
      newProgress = value;
    }

    // Ограничение прогресса
    newProgress = Math.max(0, Math.min(newProgress, def.maxProgress));
    current.progress = newProgress;

    let newlyUnlocked = false;
    if (newProgress >= def.maxProgress && !current.unlocked) {
      current.unlocked = true;
      current.unlockedAt = new Date().toLocaleDateString('ru-RU');
      newlyUnlocked = true;
    }

    localStorage.setItem(this.getKey('ACHIEVEMENTS'), JSON.stringify(userProgress));

    if (newlyUnlocked) {
      return {
        id,
        title: def.title,
        desc: def.desc,
        icon: def.icon,
        ...current
      };
    }

    return null;
  },

  // --- СБРОС ВСЕХ ДАННЫХ ПРОФИЛЯ ---
  resetAll() {
    const activeId = this.getActiveProfileId();
    if (activeId) {
      localStorage.removeItem(`plant_${activeId}_user`);
      localStorage.removeItem(`plant_${activeId}_categories`);
      localStorage.removeItem(`plant_${activeId}_transactions`);
      localStorage.removeItem(`plant_${activeId}_budgets`);
      localStorage.removeItem(`plant_${activeId}_planning`);
      localStorage.removeItem(`plant_${activeId}_notes`);
      localStorage.removeItem(`plant_${activeId}_checklists`);
      localStorage.removeItem(`plant_${activeId}_tasks`);
      localStorage.removeItem(`plant_${activeId}_goals`);
      localStorage.removeItem(`plant_${activeId}_tags`);
      localStorage.removeItem(`plant_${activeId}_achievements`);

      let profiles = this.getProfiles();
      profiles = profiles.filter(p => p.id !== activeId);
      this.saveProfiles(profiles);

      this.clearUser();
    }
  }
};
