/* Управление интерфейсом приложения PLANT */

import { db } from './db.js';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export const ui = {

  formatSentenceCase(str) {
    if (!str) return '';
    str = str.trim();
    if (str.length === 0) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  animateEditorFade(element) {
    if (!element) return;
    element.classList.remove('screen-fade-in', 'screen-fade-out');
    void element.offsetWidth; // force reflow
    element.classList.add('screen-fade-in');
  },
 
  autoResizeTextarea(textarea) {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  },

  init() {
    this.initTitlebar();
    this.loader = document.getElementById('app-loader');
    this.authScreen = document.getElementById('auth-screen');
    this.mainScreen = document.getElementById('main-screen');
    this.logoutBtn = document.getElementById('logout-btn');
    
    // Элементы входа и профилей
    this.authContainer = document.getElementById('auth-container');
    this.loginView = document.getElementById('auth-login-view');
    this.registerView = document.getElementById('auth-register-view');
    this.registerBackBtn = document.getElementById('register-back-btn');
    this.loginForm = document.getElementById('login-form');
    this.registerForm = document.getElementById('register-form');
    this.loginUsernameInput = document.getElementById('login-username');
    this.loginPasswordInput = document.getElementById('login-password');
    this.registerUsernameInput = document.getElementById('register-username');
    this.registerPasswordInput = document.getElementById('register-password');
    this.loginErrorMsg = document.getElementById('login-error-msg');
    this.registerErrorMsg = document.getElementById('register-error-msg');
    this.switchToRegisterBtn = document.getElementById('switch-to-register-btn');
    
    this.navItems = document.querySelectorAll('.sidebar .nav-item');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.titlebarTabs = document.querySelectorAll('.titlebar-tab');

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



    // Фильтры Бюджетов DOM
    this.budgetSearch = document.getElementById('budget-search');
    this.budgetResetBtn = document.getElementById('budget-reset-filters-btn');

    // Фильтры Целей DOM
    this.goalSearch = document.getElementById('goal-search');
    this.goalResetBtn = document.getElementById('goal-reset-filters-btn');

    // Новые элементы Обзора
    this.overviewBudgetsList = document.getElementById('overview-budgets-list');
    this.overviewGoalsList = document.getElementById('overview-goals-list');
    this.overviewTasksList = document.getElementById('overview-tasks-list');
    this.overviewPlanningList = document.getElementById('overview-planning-list');

    this.overviewBtnToBudgets = document.getElementById('overview-btn-to-budgets');
    this.overviewBtnToGoals = document.getElementById('overview-btn-to-goals');
    this.overviewBtnToTasks = document.getElementById('overview-btn-to-tasks');
    this.overviewBtnToPlanning = document.getElementById('overview-btn-to-planning');

    // Настройки DOM
    this.settingsProfileForm = document.getElementById('settings-profile-form');
    this.settingsUsername = document.getElementById('settings-username');
    this.settingsCurrency = document.getElementById('settings-currency');
    this.settingsExportBtn = document.getElementById('settings-export-btn');
    this.settingsImportFile = document.getElementById('settings-import-file');
    this.settingsResetBtn = document.getElementById('settings-reset-btn');
    this.settingsCurrencyForm = document.getElementById('settings-currency-form');

    // Профиль DOM
    this.profileEditForm = document.getElementById('profile-edit-form');
    this.profileUsername = document.getElementById('profile-username');

    // Заметки DOM
    this.notesSidebarList = document.getElementById('notes-sidebar-list');
    this.noteSearch = document.getElementById('note-search');
    this.noteResetSearchBtn = document.getElementById('note-reset-search-btn');
    this.noteAddBtn = document.getElementById('note-add-btn');
    this.noteSaveBtn = document.getElementById('note-save-btn');
    this.noteDeleteBtn = document.getElementById('note-delete-btn');

    // Текстовый редактор заметок (правый блок)
    this.noteEditorForm = document.getElementById('note-editor-form');
    this.noteEditorId = document.getElementById('note-editor-id');
    this.noteTitleEditor = document.getElementById('note-title-editor');
    this.noteContentEditor = document.getElementById('note-content-editor');
    this.noteEditorEmptyState = document.getElementById('note-editor-empty-state');

    // Активная заметка
    this.activeNoteId = null;
    this.lastActiveNoteId = null;

    // Чек-листы DOM
    this.checklistsSidebarList = document.getElementById('checklists-sidebar-list');
    this.checklistSearch = document.getElementById('checklist-search');
    this.checklistResetSearchBtn = document.getElementById('checklist-reset-search-btn');
    this.checklistAddBtn = document.getElementById('checklist-add-btn');
    this.checklistAddItemBtn = document.getElementById('checklist-add-item-btn');
    this.checklistSaveBtn = document.getElementById('checklist-save-btn');
    this.checklistDeleteBtn = document.getElementById('checklist-delete-btn');

    // Редактор чек-листа
    this.checklistEditorForm = document.getElementById('checklist-editor-form');
    this.checklistEditorId = document.getElementById('checklist-editor-id');
    this.checklistTitleEditor = document.getElementById('checklist-title-editor');
    this.checklistItemsEditorContainer = document.getElementById('checklist-items-editor-container');
    this.checklistEditorEmptyState = document.getElementById('checklist-editor-empty-state');

    // Активный чек-лист
    this.activeChecklistId = null;
    this.lastActiveChecklistId = null;

    // Задачи DOM
    this.taskSearch = document.getElementById('task-search');
    this.taskResetSearchBtn = document.getElementById('task-reset-search-btn');
    this.taskAddBtn = document.getElementById('task-add-btn');

    // Модальное окно задач
    this.addTaskModal = document.getElementById('add-task-modal');
    this.closeAddTaskModal = document.getElementById('close-add-task-modal');
    this.addTaskModalForm = document.getElementById('add-task-modal-form');
    this.modalTaskTitle = document.getElementById('modal-task-title');
    this.modalTaskDesc = document.getElementById('modal-task-desc');
    this.btnAddTaskCancel = document.getElementById('btn-add-task-cancel');
    this.modalTaskId = document.getElementById('modal-task-id');
    this.addTaskModalTitle = document.getElementById('add-task-modal-title');
    this.btnAddTaskSubmit = document.getElementById('btn-add-task-submit');

    // Цели DOM
    this.goalForm = document.getElementById('goal-form');
    this.goalFormTitle = document.getElementById('goal-form-title');
    this.goalIdEdit = document.getElementById('goal-id-edit');
    this.goalTitle = document.getElementById('goal-title');
    this.goalDescription = document.getElementById('goal-description');
    this.goalTargetAmount = document.getElementById('goal-target-amount');
    this.goalsListItems = document.getElementById('goals-list-items');
    this.cancelGoalEditBtn = document.getElementById('cancel-goal-edit');

    // Связь транзакций с целями
    this.txGoalGroup = document.getElementById('tx-goal-group');
    this.txGoal = document.getElementById('tx-goal');

    // Инициализация БД
    db.init();
    const user = db.getUser();
    
    this.bindEvents();
    this.initCustomSelects();

    setTimeout(() => {
      this.hideLoader();
      if (user) {
        this.showMainScreen(user);
      } else {
        this.showAuthScreen();
      }
    }, 800);
  },

  initTitlebar() {
    const minBtn = document.getElementById('titlebar-minimize');
    const maxBtn = document.getElementById('titlebar-maximize');
    const closeBtn = document.getElementById('titlebar-close');

    if (window.__TAURI_INTERNALS__) {
      const appWindow = getCurrentWindow();
      appWindow.maximize().catch(err => console.error("Maximize on startup error:", err));

      if (minBtn) {
        minBtn.addEventListener('click', () => {
          appWindow.minimize().catch(err => console.error("Minimize error:", err));
        });
      }

      if (maxBtn) {
        maxBtn.addEventListener('click', () => {
          appWindow.isMaximized().then(maximized => {
            if (maximized) {
              appWindow.unmaximize().catch(err => console.error("Unmaximize error:", err));
            } else {
              appWindow.maximize().catch(err => console.error("Maximize error:", err));
            }
          }).catch(err => console.error("isMaximized error:", err));
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          appWindow.close().catch(err => console.error("Close error:", err));
        });
      }
    } else {
      if (minBtn) {
        minBtn.addEventListener('click', () => console.log('Minimize window (browser fallback)'));
      }
      if (maxBtn) {
        maxBtn.addEventListener('click', () => console.log('Maximize window (browser fallback)'));
      }
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          console.log('Close window (browser fallback)');
          alert("Закрыть окно (в браузере недоступно)");
        });
      }
    }
  },

  async checkAppUpdates(manual = false) {
    if (!window.__TAURI_INTERNALS__) {
      if (manual) {
        this.showToast('Проверка обновлений доступна только в десктоп-приложении PLANT', 'info');
      }
      return;
    }

    try {
      const update = await check();
      if (update) {
        const confirmMsg = `Доступно новое обновление!\n\nВерсия: v${update.version}\n\nХотите скачать и установить обновление сейчас? Приложение будет перезапущено автоматически.`;
        if (await this.showConfirm(confirmMsg)) {
          this.showToast('Загрузка обновления...', 'info');
          await update.downloadAndInstall();
          await relaunch();
        }
      } else {
        if (manual) {
          this.showToast('У вас установлена последняя версия PLANT', 'success');
        }
      }
    } catch (error) {
      console.error('Ошибка проверки обновлений:', error);
      if (manual) {
        this.showToast('Не удалось проверить наличие обновлений', 'error');
      }
    }
  },

  bindEvents() {
    // Кнопка проверки обновлений
    const checkUpdatesBtn = document.getElementById('check-updates-btn');
    if (checkUpdatesBtn) {
      checkUpdatesBtn.addEventListener('click', () => {
        this.checkAppUpdates(true);
      });
    }

    // События профилей и входа
    if (this.switchToRegisterBtn) {
      this.switchToRegisterBtn.addEventListener('click', () => {
        this.switchAuthView(this.registerView);
        if (this.registerUsernameInput) {
          this.registerUsernameInput.value = '';
          this.registerUsernameInput.focus();
        }
        if (this.registerPasswordInput) this.registerPasswordInput.value = '';
        if (this.registerErrorMsg) this.registerErrorMsg.textContent = '';
      });
    }

    if (this.registerBackBtn) {
      this.registerBackBtn.addEventListener('click', () => {
        this.switchAuthView(this.loginView);
        if (this.loginUsernameInput) {
          this.loginUsernameInput.focus();
        }
        if (this.loginErrorMsg) this.loginErrorMsg.textContent = '';
      });
    }

    if (this.loginForm) {
      this.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const login = this.loginUsernameInput.value.trim();
        const password = this.loginPasswordInput.value.trim();
        if (!login || !password) return;

        const profile = db.getProfiles().find(p => 
          (p.login || p.name || '').toLowerCase() === login.toLowerCase() && 
          (p.password || p.pin || '') === password
        );

        if (profile) {
          db.initProfile(profile.id);
          localStorage.setItem('plant_session_active', 'true');
          const user = db.getUser();
          this.showMainScreen(user);
        } else {
          if (this.loginErrorMsg) {
            this.loginErrorMsg.textContent = 'Неверный логин или пароль!';
          }
          if (this.loginPasswordInput) {
            this.loginPasswordInput.value = '';
            this.loginPasswordInput.focus();
          }
        }
      });
    }

    if (this.registerForm) {
      this.registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const login = this.registerUsernameInput.value.trim();
        const password = this.registerPasswordInput.value.trim();
        if (!login || !password) return;

        const newProf = db.createProfile(login, password);
        if (newProf) {
          db.initProfile(newProf.id);
          localStorage.setItem('plant_session_active', 'true');
          const user = db.getUser();
          this.showMainScreen(user);
        } else {
          if (this.registerErrorMsg) {
            this.registerErrorMsg.textContent = 'Профиль с таким логином уже существует!';
          }
        }
      });
    }

    // Выход
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', () => {
        db.clearUser();
        this.showAuthScreen();
      });
    }

    // Удаление профиля
    const deleteProfileBtn = document.getElementById('btn-delete-profile');
    if (deleteProfileBtn) {
      deleteProfileBtn.addEventListener('click', async () => {
        const activeId = db.getActiveProfileId();
        if (!activeId) return;

        const currentProfile = db.getProfiles().find(p => p.id === activeId);
        const name = currentProfile ? currentProfile.name : '';

        if (await this.showConfirm(`Вы действительно хотите безвозвратно удалить профиль "${this.formatSentenceCase(name)}" и ВСЕ его данные?\n\nЭто удалит все транзакции, бюджеты, категории, заметки, чек-листы и задачи этого профиля.`)) {
          if (await this.showConfirm(`Подтвердите удаление: это действие полностью очистит данные для профиля "${this.formatSentenceCase(name)}". Восстановить их будет невозможно. Продолжить?`)) {
            db.deleteProfile(activeId);
            this.showToast('Профиль и все его данные успешно удалены');
            db.clearUser();
            this.showAuthScreen();
          }
        }
      });
    }


    // Вкладки Titlebar (верхний уровень)
    this.titlebarTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTabId = tab.getAttribute('data-target');
        this.switchTopTab(targetTabId);
      });
    });

    // Вкладки
    this.navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetTabId = item.getAttribute('data-target');
        this.switchTopTab('screen-home');
        this.switchTab(targetTabId);
      });
    });

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

        // Проверка на дубликат при создании нового бюджета
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

    // --- ПРОФИЛЬ ---
    if (this.profileEditForm) {
      this.profileEditForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = this.profileUsername.value.trim();
        if (username) {
          const user = db.getUser();
          const currency = user ? user.currency : 'RUB';
          const avatar = user ? user.avatar : '';
          
          let passcode = user ? user.passcode : '';
          const passcodeField = document.getElementById('profile-passcode');
          if (passcodeField && passcodeField.value.trim()) {
            passcode = passcodeField.value.trim();
          }

          const updatedUser = db.setUser(username, currency, passcode, avatar);

          // Обновляем сайдбар
          const sidebarUsername = document.getElementById('sidebar-username');
          if (sidebarUsername) sidebarUsername.textContent = username;
          this.updateAvatarDisplay(avatar, username);

          // Синхронизируем значение во вкладке настроек
          if (this.settingsUsername) this.settingsUsername.value = username;

          this.renderProfile();
          alert('Профиль сохранен!');
        }
      });
    }

    // Загрузка аватарки и ограничение на размер 512x512
    const avatarUploadDiv = document.getElementById('profile-avatar-upload');
    const avatarFileInput = document.getElementById('profile-avatar-file-input');
    if (avatarUploadDiv && avatarFileInput) {
      avatarUploadDiv.addEventListener('click', () => {
        avatarFileInput.click();
      });

      avatarFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
          alert('Пожалуйста, выберите файл изображения.');
          avatarFileInput.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            if (img.width > 512 || img.height > 512) {
              alert(`Размер изображения (${img.width}x${img.height}px) не должен превышать 512x512px!`);
              avatarFileInput.value = '';
              return;
            }

            const user = db.getUser();
            if (user) {
              const updatedUser = db.setUser(user.username, user.currency, user.passcode, event.target.result);
              this.updateAvatarDisplay(updatedUser.avatar, updatedUser.username);
            }
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    // --- НАСТРОЙКИ ---
    if (this.settingsCurrencyForm) {
      this.settingsCurrencyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const currency = this.settingsCurrency.value;
        const user = db.getUser();
        const username = user ? user.username : 'Пользователь';
        db.setUser(username, currency);

        // Полностью перерисовываем все вкладки с новыми символами валюты
        this.renderOverview();
        this.renderTransactions();
        this.renderBudgets();
        this.renderPlanning();

        alert('Валюта приложения успешно изменена!');
      });
    }

    // --- ЗАМЕТКИ ---
    if (this.noteSearch) {
      this.noteSearch.addEventListener('input', () => this.renderNotes());
    }

    if (this.noteResetSearchBtn) {
      this.noteResetSearchBtn.addEventListener('click', () => {
        if (this.noteSearch) {
          this.noteSearch.value = '';
          this.renderNotes();
        }
      });
    }

    if (this.noteAddBtn) {
      this.noteAddBtn.addEventListener('click', () => {
        const newNote = db.addNote({ title: 'Новая заметка', content: '' });
        this.activeNoteId = newNote.id;
        this.renderNotes(newNote.id);
        this.renderOverview();
        if (this.noteTitleEditor) {
          this.noteTitleEditor.focus();
          this.noteTitleEditor.select();
        }
      });
    }

    if (this.noteDeleteBtn) {
      this.noteDeleteBtn.addEventListener('click', async () => {
        const id = this.noteEditorId.value;
        if (id) {
          const notes = db.getNotes();
          const note = notes.find(n => n.id === id);
          if (note && await this.showConfirm(`Удалить заметку "${this.formatSentenceCase(note.title)}"?`)) {
            db.deleteNote(id);
            this.activeNoteId = null;
            this.renderNotes();
            this.renderOverview();
          }
        }
      });
    }

    if (this.noteEditorForm) {
      this.noteEditorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = this.noteEditorId.value;
        const title = this.formatSentenceCase(this.noteTitleEditor.value.trim());
        const content = this.noteContentEditor.value.trim();
        if (id) {
          db.updateNote(id, { title, content });
          alert('Заметка сохранена!');
          this.renderNotes();
          this.renderOverview();
        }
      });
    }

    if (this.noteTitleEditor) {
      this.noteTitleEditor.addEventListener('input', () => {
        const id = this.noteEditorId.value;
        const title = this.formatSentenceCase(this.noteTitleEditor.value.trim());
        if (id && title) {
          db.updateNote(id, { title });
          this.renderNotes(null, false);
        }
      });
    }

    if (this.noteContentEditor) {
      this.noteContentEditor.addEventListener('input', () => {
        this.autoResizeTextarea(this.noteContentEditor);
      });
    }

    // --- ЧЕК-ЛИСТЫ ---
    if (this.checklistSearch) {
      this.checklistSearch.addEventListener('input', () => this.renderChecklists(null, false));
    }

    if (this.checklistResetSearchBtn) {
      this.checklistResetSearchBtn.addEventListener('click', () => {
        if (this.checklistSearch) {
          this.checklistSearch.value = '';
          this.renderChecklists();
        }
      });
    }

    if (this.checklistAddBtn) {
      this.checklistAddBtn.addEventListener('click', () => {
        const newList = db.addChecklist({ title: 'Новый список' });
        this.activeChecklistId = newList.id;
        this.renderChecklists(newList.id);
        if (this.checklistTitleEditor) {
          this.checklistTitleEditor.focus();
          this.checklistTitleEditor.select();
        }
      });
    }

    if (this.checklistAddItemBtn) {
      this.checklistAddItemBtn.addEventListener('click', () => {
        const id = this.checklistEditorId.value;
        if (id) {
          const lists = db.getChecklists();
          const list = lists.find(l => l.id === id);
          if (list) {
            const newItem = {
              id: 'cli-' + db.generateId(),
              text: 'Новый пункт',
              checked: false
            };
            const updatedItems = [...list.items, newItem];
            db.updateChecklist(id, { items: updatedItems });
            this.renderChecklists(null, true);
            
            // Focus the newly added text input
            setTimeout(() => {
              const inputs = this.checklistItemsEditorContainer.querySelectorAll('.checklist-edit-item-text-input');
              if (inputs.length > 0) {
                const lastInput = inputs[inputs.length - 1];
                lastInput.focus();
                lastInput.select();
              }
            }, 50);
          }
        }
      });
    }

    if (this.checklistDeleteBtn) {
      this.checklistDeleteBtn.addEventListener('click', async () => {
        const id = this.checklistEditorId.value;
        if (id) {
          const lists = db.getChecklists();
          const list = lists.find(l => l.id === id);
          if (list && await this.showConfirm(`Удалить чек-лист "${this.formatSentenceCase(list.title)}"?`)) {
            db.deleteChecklist(id);
            this.activeChecklistId = null;
            this.renderChecklists();
          }
        }
      });
    }

    if (this.checklistEditorForm) {
      this.checklistEditorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = this.checklistEditorId.value;
        const title = this.formatSentenceCase(this.checklistTitleEditor.value.trim());
        if (id) {
          const itemRows = this.checklistItemsEditorContainer.querySelectorAll('.checklist-edit-item-row');
          const items = Array.from(itemRows).map(row => {
            const cbIcon = row.querySelector('.checklist-edit-item-checkbox-icon');
            const txt = row.querySelector('.checklist-edit-item-text-input');
            return {
              id: cbIcon.getAttribute('data-item-id'),
              text: this.formatSentenceCase(txt.value.trim()) || 'Пункт',
              checked: cbIcon.getAttribute('data-checked') === 'true'
            };
          });
          db.updateChecklist(id, { title, items });
          alert('Чек-лист сохранен!');
          this.renderChecklists();
        }
      });
    }

    if (this.checklistTitleEditor) {
      this.checklistTitleEditor.addEventListener('input', () => {
        const id = this.checklistEditorId.value;
        const title = this.formatSentenceCase(this.checklistTitleEditor.value.trim());
        if (id && title) {
          db.updateChecklist(id, { title });
          this.renderChecklists(null, false);
        }
      });
    }

    // --- ЗАДАЧИ (KANBAN) ---
    if (this.taskSearch) {
      this.taskSearch.addEventListener('input', () => this.renderTasks());
    }

    if (this.taskResetSearchBtn) {
      this.taskResetSearchBtn.addEventListener('click', () => {
        if (this.taskSearch) {
          this.taskSearch.value = '';
          this.renderTasks();
        }
      });
    }

    if (this.taskAddBtn) {
      this.taskAddBtn.addEventListener('click', () => {
        if (this.addTaskModal) {
          if (this.modalTaskId) this.modalTaskId.value = '';
          if (this.addTaskModalTitle) this.addTaskModalTitle.textContent = 'Добавить задачу';
          if (this.btnAddTaskSubmit) this.btnAddTaskSubmit.textContent = 'Добавить';
          this.addTaskModal.classList.add('active');
          if (this.addTaskModalForm) this.addTaskModalForm.reset();
          if (this.modalTaskTitle) this.modalTaskTitle.focus();
        }
      });
    }

    if (this.closeAddTaskModal) {
      this.closeAddTaskModal.addEventListener('click', () => {
        if (this.addTaskModal) this.addTaskModal.classList.remove('active');
      });
    }

    if (this.btnAddTaskCancel) {
      this.btnAddTaskCancel.addEventListener('click', () => {
        if (this.addTaskModal) this.addTaskModal.classList.remove('active');
      });
    }

    if (this.addTaskModal) {
      this.addTaskModal.addEventListener('click', (e) => {
        if (e.target === this.addTaskModal) {
          this.addTaskModal.classList.remove('active');
        }
      });
    }

    if (this.addTaskModalForm) {
      this.addTaskModalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = this.modalTaskId ? this.modalTaskId.value : '';
        const title = this.formatSentenceCase(this.modalTaskTitle.value.trim());
        const description = this.formatSentenceCase(this.modalTaskDesc.value.trim());
        
        if (title) {
          if (id) {
            db.updateTask(id, { title, description });
            if (this.addTaskModal) this.addTaskModal.classList.remove('active');
            if (this.addTaskModalForm) this.addTaskModalForm.reset();
            this.renderTasks(id);
          } else {
            const newTask = db.addTask({ title, description, status: 'todo' });
            if (this.addTaskModal) this.addTaskModal.classList.remove('active');
            if (this.addTaskModalForm) this.addTaskModalForm.reset();
            this.renderTasks(newTask.id);
          }
        }
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

    // --- ИМПОРТ / ЭКСПОРТ JSON ---
    if (this.settingsExportBtn) {
      this.settingsExportBtn.addEventListener('click', () => {
        const data = {
          user: db.getUser(),
          categories: db.getCategories(),
          transactions: db.getTransactions(),
          budgets: db.getBudgets(),
          planning: db.getPlans(),
          notes: db.getNotes(),
          checklists: db.getChecklists(),
          tasks: db.getTasks(),
          goals: db.getGoals()
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
        reader.onload = async (event) => {
          try {
            const importedData = JSON.parse(event.target.result);
            
            if (!importedData.categories || !importedData.transactions) {
              throw new Error('Неверный формат файла резервной копии. Отсутствуют обязательные поля.');
            }
            
            if (await this.showConfirm('Вы уверены, что хотите импортировать данные? Это заменит все текущие транзакции, категории, заметки, задачи и настройки.')) {
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
              if (importedData.notes) {
                db.saveNotes(importedData.notes);
              }
              if (importedData.checklists) {
                db.saveChecklists(importedData.checklists);
              }
              if (importedData.tasks) {
                db.saveTasks(importedData.tasks);
              }
              if (importedData.goals) {
                db.saveGoals(importedData.goals);
              }
              
              const user = db.getUser();
              if (user) {
                this.showMainScreen(user);
                if (this.profileUsername) this.profileUsername.value = user.username;
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
      this.settingsResetBtn.addEventListener('click', async () => {
        if (await this.showConfirm('ВНИМАНИЕ: Это полностью удалит все ваши данные! Восстановить их будет невозможно. Вы действительно хотите продолжить?')) {
          if (await this.showConfirm('Подтвердите удаление всех данных: все транзакции, лимиты, планирование, заметки, чек-листы, задачи и профиль будут стерты.')) {
            db.resetAll();
            alert('Все данные были сброшены. Приложение будет перезапущено.');
            window.location.reload();
          }
        }
      });
    }
  },

  updateSidebarSlimState() {
    const profileBtn = document.getElementById('sidebar-profile-btn');
    const user = db.getUser();
    
    if (profileBtn) {
      if (user) {
        profileBtn.classList.add('show');
      } else {
        profileBtn.classList.remove('show');
      }
    }
  },

  showAuthScreen() {
    this.updateSidebarSlimState();
    if (this.loader) this.loader.style.display = 'none';

    if (this.titlebarTabs) {
      this.titlebarTabs.forEach(t => {
        if (t.getAttribute('data-target') === 'screen-home') t.classList.add('active');
        else t.classList.remove('active');
      });
    }
    const activeScreen = [
      this.mainScreen,
      document.getElementById('about-screen'),
      document.getElementById('updates-screen'),
      document.getElementById('profile-screen'),
      document.getElementById('settings-screen')
    ].find(el => el && el.classList.contains('active'));
    
    if (activeScreen && activeScreen !== this.authScreen) {
      this.resetAuthForms();
      activeScreen.classList.remove('screen-fade-in');
      activeScreen.classList.add('screen-fade-out');
      
      setTimeout(() => {
        activeScreen.classList.remove('active', 'screen-fade-out');
        if (this.authScreen) {
          this.authScreen.classList.remove('screen-fade-out');
          this.authScreen.classList.add('active', 'screen-fade-in');
        }
      }, 300);
    } else {
      this.resetAuthForms();
      if (this.authScreen) {
        this.authScreen.classList.remove('screen-fade-out');
        this.authScreen.classList.add('active', 'screen-fade-in');
      }
      [this.mainScreen, document.getElementById('about-screen'), document.getElementById('updates-screen'), document.getElementById('profile-screen'), document.getElementById('settings-screen')].forEach(el => {
        if (el) el.classList.remove('active');
      });
    }
  },

  hideLoader() {
    if (this.loader) this.loader.style.display = 'none';
  },

  showMainScreen(user) {
    this.updateSidebarSlimState();
    if (this.titlebarTabs) {
      this.titlebarTabs.forEach(t => {
        if (t.getAttribute('data-target') === 'screen-home') t.classList.add('active');
        else t.classList.remove('active');
      });
    }

    const performShowMain = () => {
      if (this.mainScreen) {
        this.mainScreen.classList.remove('screen-fade-out');
        this.mainScreen.classList.add('active', 'screen-fade-in');
      }

      const sidebarUsername = document.getElementById('sidebar-username');
      if (sidebarUsername) sidebarUsername.textContent = this.formatSentenceCase(user.username);
      this.updateAvatarDisplay(user.avatar, user.username);

      // Заполняем настройки текущими значениями
      if (this.settingsUsername) this.settingsUsername.value = user.username;
      if (this.settingsCurrency) this.settingsCurrency.value = user.currency || 'RUB';
      if (this.profileUsername) this.profileUsername.value = user.username;

      // Отрисовать данные
      this.renderCategories();
      this.resetTxForm();
      this.renderTransactions();
      this.renderBudgets();
      this.resetPlanForm();
      this.renderPlanning();
      this.renderOverview();
      this.resetGoalForm();
      this.renderSavingsGoals();
      
      this.switchTab('tab-overview', true);
      this.checkAppUpdates(false);
    };

    const activeScreen = [
      this.authScreen,
      document.getElementById('about-screen'),
      document.getElementById('updates-screen'),
      document.getElementById('profile-screen'),
      document.getElementById('settings-screen')
    ].find(el => el && el.classList.contains('active'));

    if (activeScreen && activeScreen !== this.mainScreen) {
      activeScreen.classList.remove('screen-fade-in');
      activeScreen.classList.add('screen-fade-out');
      
      setTimeout(() => {
        activeScreen.classList.remove('active', 'screen-fade-out');
        performShowMain();
      }, 300);
    } else {
      if (this.authScreen) this.authScreen.classList.remove('active');
      [document.getElementById('about-screen'), document.getElementById('updates-screen'), document.getElementById('profile-screen'), document.getElementById('settings-screen')].forEach(el => {
        if (el) el.classList.remove('active');
      });
      performShowMain();
    }
  },

  switchTab(tabId, immediate = false) {
    this.navItems.forEach(item => {
      const target = item.getAttribute('data-target');
      if (target === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    const activeTab = Array.from(this.tabContents).find(tab => tab.classList.contains('active'));
    
    const performShowTab = (tab) => {
      tab.scrollTop = 0; // Скроллим страницу наверх при переходе на вкладку
      tab.classList.remove('screen-fade-out');
      tab.classList.add('active', 'screen-fade-in');
      
      if (tabId === 'tab-overview') {
        this.renderOverview();
      } else if (tabId === 'tab-budgets') {
        this.renderBudgets();
      } else if (tabId === 'tab-savings-goals') {
        this.resetGoalForm();
        this.renderSavingsGoals();
      } else if (tabId === 'tab-planning') {
        this.resetPlanForm();
        this.renderPlanning();
      } else if (tabId === 'tab-transactions') {
        this.resetTxForm();
        this.renderTransactions();

      } else if (tabId === 'tab-notes') {
        this.resetNoteForm();
        this.renderNotes();
      } else if (tabId === 'tab-checklists') {
        this.renderChecklists();
      } else if (tabId === 'tab-tasks') {
        this.renderTasks();
      }
    };

    if (immediate) {
      this.tabContents.forEach(tab => {
        if (tab.id === tabId) {
          performShowTab(tab);
        } else {
          tab.classList.remove('active', 'screen-fade-in', 'screen-fade-out');
        }
      });
    } else {
      if (activeTab && activeTab.id !== tabId) {
        activeTab.classList.remove('screen-fade-in');
        activeTab.classList.add('screen-fade-out');
        
        setTimeout(() => {
          activeTab.classList.remove('active', 'screen-fade-out');
          const targetTab = Array.from(this.tabContents).find(tab => tab.id === tabId);
          if (targetTab) {
            performShowTab(targetTab);
          }
        }, 300); // 300ms transition matching screen transition
      } else {
        const targetTab = Array.from(this.tabContents).find(tab => tab.id === tabId);
        if (targetTab) {
          if (!targetTab.classList.contains('active')) {
            performShowTab(targetTab);
          }
        }
      }
    }
  },

  switchTopTab(tabId) {
    if (this.titlebarTabs) {
      this.titlebarTabs.forEach(tab => {
        if (tab.getAttribute('data-target') === tabId) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
    }

    const topScreens = [
      this.authScreen,
      this.mainScreen,
      document.getElementById('about-screen'),
      document.getElementById('updates-screen'),
      document.getElementById('profile-screen'),
      document.getElementById('settings-screen')
    ].filter(el => el && el.classList.contains('active'));

    const activeScreen = topScreens[0];

    let targetScreen = null;
    if (tabId === 'screen-home') {
      const user = db.getUser();
      targetScreen = user ? this.mainScreen : this.authScreen;
    } else if (tabId === 'screen-about') {
      targetScreen = document.getElementById('about-screen');
    } else if (tabId === 'screen-updates') {
      targetScreen = document.getElementById('updates-screen');
    } else if (tabId === 'screen-profile') {
      targetScreen = document.getElementById('profile-screen');
      this.renderProfile();
    } else if (tabId === 'screen-settings') {
      targetScreen = document.getElementById('settings-screen');
    }

    if (!targetScreen) return;

    const performShowScreen = (screen) => {
      screen.classList.remove('screen-fade-out');
      screen.classList.add('active', 'screen-fade-in');
    };

    if (activeScreen && activeScreen !== targetScreen) {
      activeScreen.classList.remove('screen-fade-in');
      activeScreen.classList.add('screen-fade-out');
      
      setTimeout(() => {
        activeScreen.classList.remove('active', 'screen-fade-out');
        performShowScreen(targetScreen);
      }, 300);
    } else {
      if (targetScreen && !targetScreen.classList.contains('active')) {
        performShowScreen(targetScreen);
      }
    }
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const accentColor = type === 'success'
      ? 'var(--color-success)'
      : (type === 'error' ? 'var(--color-danger)' : 'var(--accent-color)');

    toast.style.cssText = `
      background-color: var(--bg-panel);
      border: 1px solid var(--border-color);
      border-left: 4px solid ${accentColor};
      color: var(--text-primary);
      padding: 12px 18px;
      border-radius: 4px;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
      pointer-events: auto;
      transform: translateY(20px);
      opacity: 0;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
      min-width: 250px;
    `;

    const iconName = type === 'success' ? 'check_circle' : (type === 'error' ? 'error' : 'info');

    toast.innerHTML = `
      <span class="material-symbols-outlined" style="color: ${accentColor}; font-size: 18px;">${iconName}</span>
      <span style="font-weight: 500; font-family: var(--font-main);">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    }, 10);

    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      toast.addEventListener('transitionend', () => {
        toast.remove();
      });
    }, 3000);
  },

  showConfirm(message) {
    return new Promise((resolve) => {
      const modal = document.getElementById('confirm-modal');
      const msgEl = document.getElementById('confirm-modal-message');
      const okBtn = document.getElementById('btn-confirm-ok');
      const cancelBtn = document.getElementById('btn-confirm-cancel');
      const closeBtn = document.getElementById('close-confirm-modal');

      if (!modal || !msgEl || !okBtn || !cancelBtn || !closeBtn) {
        resolve(confirm(message));
        return;
      }

      msgEl.textContent = message;

      // Динамический акцент в зависимости от текущей вкладки
      const activeNavItem = Array.from(this.navItems || []).find(item => item.classList.contains('active'));
      const activeTabId = activeNavItem ? activeNavItem.getAttribute('data-target') : '';
      if (['tab-notes', 'tab-checklists', 'tab-tasks'].includes(activeTabId)) {
        modal.style.setProperty('--accent-color', '#38bdf8');
        modal.style.setProperty('--accent-color-hover', '#0284c7');
        modal.style.setProperty('--accent-color-alpha', 'rgba(56, 189, 248, 0.15)');
      } else {
        modal.style.removeProperty('--accent-color');
        modal.style.removeProperty('--accent-color-hover');
        modal.style.removeProperty('--accent-color-alpha');
      }

      modal.classList.add('active');

      const cleanupAndResolve = (value) => {
        modal.classList.remove('active');
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        closeBtn.removeEventListener('click', onCancel);
        modal.removeEventListener('click', onOverlayClick);
        document.removeEventListener('keydown', onKeyDown);
        resolve(value);
      };

      const onOk = () => cleanupAndResolve(true);
      const onCancel = () => cleanupAndResolve(false);
      const onOverlayClick = (e) => {
        if (e.target === modal) cleanupAndResolve(false);
      };

      const onKeyDown = (e) => {
        if (e.key === 'Escape') {
          cleanupAndResolve(false);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          cleanupAndResolve(true);
        }
      };

      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
      closeBtn.addEventListener('click', onCancel);
      modal.addEventListener('click', onOverlayClick);
      document.addEventListener('keydown', onKeyDown);
    });
  },

  initCustomSelects() {
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
      if (select.parentElement.classList.contains('custom-select-wrapper')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'custom-select-wrapper';
      if (select.id) wrapper.classList.add(`wrapper-${select.id}`);

      select.parentNode.insertBefore(wrapper, select);
      wrapper.appendChild(select);
      select.style.display = 'none';

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'custom-select-trigger';
      trigger.setAttribute('title', '');
      trigger.setAttribute('autocomplete', 'off');
      
      const updateTriggerText = () => {
        const selectedOption = select.options[select.selectedIndex];
        trigger.textContent = selectedOption ? selectedOption.textContent : '···';
      };
      updateTriggerText();
      wrapper.appendChild(trigger);

      const optionsContainer = document.createElement('div');
      optionsContainer.className = 'custom-select-options';
      wrapper.appendChild(optionsContainer);

      const rebuildOptions = () => {
        optionsContainer.innerHTML = '';
        Array.from(select.options).forEach((opt, idx) => {
          const optDiv = document.createElement('div');
          optDiv.className = 'custom-option';
          optDiv.textContent = opt.textContent;
          optDiv.setAttribute('data-value', opt.value);
          if (idx === select.selectedIndex) {
            optDiv.classList.add('selected');
          }

          optDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            select.value = opt.value;
            
            const event = new Event('change', { bubbles: true });
            select.dispatchEvent(event);
            
            wrapper.classList.remove('open');
          });
          optionsContainer.appendChild(optDiv);
        });
        updateTriggerText();
      };

      rebuildOptions();

      select.addEventListener('change', () => {
        updateTriggerText();
        const optionDivs = optionsContainer.querySelectorAll('.custom-option');
        optionDivs.forEach(div => {
          if (div.getAttribute('data-value') === select.value) {
            div.classList.add('selected');
          } else {
            div.classList.remove('selected');
          }
        });
      });

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.custom-select-wrapper.open').forEach(w => {
          if (w !== wrapper) w.classList.remove('open');
        });
        wrapper.classList.toggle('open');
      });

      const observer = new MutationObserver(() => {
        rebuildOptions();
      });
      observer.observe(select, { childList: true, characterData: true, subtree: true });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-select-wrapper')) {
        document.querySelectorAll('.custom-select-wrapper.open').forEach(w => {
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

  // --- ЛОГИКА ОБЗОРА ---

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
        <div class="budget-card-status ${statusClass}" style="color: ${barColor};">
          ${this.formatSentenceCase(statusLabel)} (${percent.toFixed(0)}%)
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
          <div class="budget-card-title" style="color: var(--accent-lime);">
            <span class="material-symbols-outlined">track_changes</span>
            <span>${this.formatSentenceCase(this.escapeHtml(goal.title))}</span>
          </div>
        </div>
        <div class="budget-card-info">
          <span>${this.formatAmount(spent)}</span>
          <span class="budget-card-limit">${this.formatAmount(goal.targetAmount)}</span>
        </div>
        <div class="budget-card-bar" style="--bar-base-color: var(--accent-lime);">
          <div class="budget-card-progress" style="width: ${percent}%;"></div>
        </div>
        <div class="budget-card-status text-accent" style="color: var(--accent-lime);">
          Прогресс: ${percent.toFixed(0)}%
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
      
      let statusLabel = 'Не начато';
      let statusClass = 'todo-status';
      if (task.status === 'in_progress') {
        statusLabel = 'В процессе';
        statusClass = 'progress-status';
      } else if (task.status === 'done') {
        statusLabel = 'Выполнено';
        statusClass = 'done-status';
      }

      card.innerHTML = `
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
          <span style="font-weight: 500; font-size: 13px; color: var(--text-primary); word-break: break-word;">
            ${this.formatSentenceCase(this.escapeHtml(task.title))}
          </span>
          <span class="status-badge ${statusClass}" style="flex-shrink: 0;">${this.formatSentenceCase(statusLabel)}</span>
        </div>
        ${task.description ? `
          <div style="color: var(--text-secondary); font-size: 12px; line-height: 1.4; margin-top: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; word-break: break-word;">
            ${this.formatSentenceCase(this.escapeHtml(task.description))}
          </div>
        ` : ''}
      `;
      this.overviewTasksList.appendChild(card);
    });
  },

  // --- ЛОГИКА БЮДЖЕТОВ ---

  renderBudgets(highlightId = null) {
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
          opt.textContent = this.formatSentenceCase(cat.name);
          this.budgetCategory.appendChild(opt);
        });
      }
    }

    // 2. Очистить и отрисовать карточки лимитов
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
      card.className = `budget-card${bgt.id === highlightId ? ' card-fade-in' : ''}`;
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

    // Группировка платежей по дате
    const groups = {};
    plans.forEach(plan => {
      if (!groups[plan.date]) {
        groups[plan.date] = [];
      }
      groups[plan.date].push(plan);
    });

    // Сортировка дат по возрастанию (чем больше дата, тем ниже)
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
        card.style.gap = '12px'; // slightly more gap between grouped items for readability

        let rowsHtml = '';
        datePlans.forEach((plan, index) => {
          const cat = categories.find(c => c.id === plan.categoryId);

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

          let amountSign = '';
          if (plan.type === 'income') {
            amountSign = '+';
          } else if (plan.type === 'expense') {
            amountSign = '−';
          }

          const formattedDate = plan.date.split('-').reverse().join('.');
          const isLastRow = index === datePlans.length - 1;
          const borderStyle = isLastRow ? '' : 'border-bottom: 1px solid var(--border-color); padding-bottom: 12px;';
          const marginTopStyle = index === 0 ? '' : 'margin-top: 4px;';

          rowsHtml += `
            <div class="planning-row-item${plan.id === highlightId ? ' card-fade-in' : ''}" data-id="${plan.id}" style="display: flex; justify-content: space-between; align-items: center; ${borderStyle} ${marginTopStyle}">
              <!-- Левая часть: дата и название -->
              <div style="display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; margin-right: 16px;">
                <span style="font-size: 12px; color: var(--text-muted); font-family: var(--font-main); flex-shrink: 0;">${formattedDate}</span>
                <span style="font-weight: 500; font-size: 13px; color: var(--text-primary); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                  ${this.formatSentenceCase(this.escapeHtml(plan.description))}
                </span>
                <span class="status-badge ${statusClass}" style="font-size: 11px; padding: 2px 6px; flex-shrink: 0; margin-left: 4px;">${this.formatSentenceCase(statusLabel)}</span>
              </div>
              
              <!-- Правая часть: сумма и кнопки взаимодействия -->
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

        // Привязка обработчиков для каждого элемента внутри карточки
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
  },

  async payPlannedPayment(plan) {
    if (await this.showConfirm(`Оплатить платёж "${this.formatSentenceCase(plan.description)}" на сумму ${this.formatAmount(plan.amount)}? (Это создаст транзакцию в текущем месяце)`)) {
      // 1. Создать реальную транзакцию с сегодняшней датой
      const today = new Date().toISOString().substring(0, 10);
      const newTx = db.addTransaction({
        description: this.formatSentenceCase(`Оплата: ${plan.description}`),
        type: plan.type,
        categoryId: plan.categoryId,
        amount: plan.amount,
        date: today
      });

      // 2. Удалить планируемый платёж из базы данных
      db.deletePlan(plan.id);

      // 3. Обновить интерфейсы
      this.renderTransactions(newTx.id);
      this.renderPlanning();
      this.renderOverview();
      this.renderBudgets();
      this.renderSavingsGoals();
      this.showToast('Транзакция добавлена');
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
      if (!targetGrid) return;

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
        card.className = `budget-card${t.id === highlightId ? ' card-fade-in' : ''}`;
        
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
      card.className = `budget-card${goal.id === highlightId ? ' card-fade-in' : ''}`;
      card.innerHTML = `
        <div class="budget-card-header">
          <div class="budget-card-title" style="color: var(--accent-lime);">
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
          <span style="color: var(--accent-lime); font-size: 12px;">${this.formatAmount(spent)}</span>
          <span style="color: var(--text-muted); font-size: 12px;">${percent.toFixed(0)}%</span>
          <span style="color: var(--text-muted); font-size: 12px;">${this.formatAmount(goal.targetAmount)}</span>
        </div>
        <div class="budget-card-bar" style="--bar-base-color: var(--accent-lime); height: 6px; margin: 0; width: 100%;">
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

  // --- ЛОГИКА ПРОФИЛЯ ---
  renderProfile() {
    const user = db.getUser();
    if (!user) return;

    if (this.profileUsername) {
      this.profileUsername.value = user.username;
    }

    const passcodeField = document.getElementById('profile-passcode');
    if (passcodeField) {
      passcodeField.value = '';
    }

    this.updateAvatarDisplay(user.avatar, user.username);
  },

  updateAvatarDisplay(avatarBase64, username) {
    const profileAvatarImg = document.getElementById('profile-avatar-img');
    const profileAvatarPlaceholder = document.getElementById('profile-avatar-placeholder');

    if (avatarBase64) {
      if (profileAvatarImg) {
        profileAvatarImg.src = avatarBase64;
        profileAvatarImg.style.display = 'block';
      }
      if (profileAvatarPlaceholder) {
        profileAvatarPlaceholder.style.display = 'none';
      }
    } else {
      if (profileAvatarImg) {
        profileAvatarImg.src = '';
        profileAvatarImg.style.display = 'none';
      }
      if (profileAvatarPlaceholder) {
        profileAvatarPlaceholder.style.display = 'block';
      }
    }
  },

  // --- ЛОГИКА ЗАМЕТОК ---
  renderNotes(highlightId = null, repopulateEditor = true) {
    const notes = db.getNotes();
    if (!this.notesSidebarList) return;
    this.notesSidebarList.innerHTML = '';

    const searchVal = this.noteSearch ? this.noteSearch.value.trim().toLowerCase() : '';
    const filtered = notes.filter(note => {
      if (searchVal) {
        return note.title.toLowerCase().includes(searchVal) || 
               (note.content && note.content.toLowerCase().includes(searchVal));
      }
      return true;
    });

    if (notes.length === 0) {
      this.activeNoteId = null;
      this.lastActiveNoteId = null;
      if (this.noteEditorForm) this.noteEditorForm.style.display = 'none';
      if (this.noteEditorEmptyState) {
        this.noteEditorEmptyState.style.display = 'flex';
        this.noteEditorEmptyState.textContent = 'Нет заметок. Нажмите на иконку добавления вверху, чтобы создать заметку.';
      }
      return;
    }

    if (filtered.length === 0) {
      this.notesSidebarList.innerHTML = '<div class="empty-state">Заметки не найдены</div>';
      if (this.noteEditorForm) this.noteEditorForm.style.display = 'flex';
      if (this.noteEditorEmptyState) this.noteEditorEmptyState.style.display = 'none';
      return;
    }

    // Сортировка: новые сверху
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Устанавливаем активную заметку, если нет или если удалена
    if (!this.activeNoteId || !notes.some(n => n.id === this.activeNoteId)) {
      this.activeNoteId = filtered[0].id;
    }

    const activeNoteChanged = this.activeNoteId !== this.lastActiveNoteId;
    this.lastActiveNoteId = this.activeNoteId;

    // Показываем форму редактора и скрываем пустое состояние
    if (this.noteEditorForm) this.noteEditorForm.style.display = 'flex';
    if (this.noteEditorEmptyState) this.noteEditorEmptyState.style.display = 'none';

    filtered.forEach(note => {
      const card = document.createElement('div');
      card.className = `budget-card${note.id === this.activeNoteId ? ' active' : ''}${note.id === highlightId ? ' card-fade-in' : ''}`;
      card.style.cursor = 'pointer';

      if (note.id === this.activeNoteId) {
        // Заполняем редактор данными активной заметки
        if (this.noteEditorId) this.noteEditorId.value = note.id;
        if (repopulateEditor) {
          if (this.noteTitleEditor) this.noteTitleEditor.value = note.title || '';
          if (this.noteContentEditor) {
            this.noteContentEditor.value = note.content || '';
            this.autoResizeTextarea(this.noteContentEditor);
          }
        }
      }

      // Truncate content for card body
      const contentPreview = note.content
        ? this.escapeHtml(note.content)
        : '<span class="text-muted" style="font-style: italic;">Нет текста</span>';

      card.innerHTML = `
        <div class="budget-card-header" style="pointer-events: none;">
          <div class="budget-card-title" style="color: var(--accent-color);">
            <span class="material-symbols-outlined">description</span>
            <span>${this.formatSentenceCase(this.escapeHtml(note.title))}</span>
          </div>
        </div>
        <div style="color: var(--text-secondary); font-size: 12px; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; word-break: break-word; pointer-events: none;">
          ${contentPreview}
        </div>
      `;

      // Клик на саму строку заметки для выбора
      card.addEventListener('click', () => {
        if (this.activeNoteId === note.id) return;

        // Сразу подсвечиваем активную карточку в сайдбаре
        const activeCard = this.notesSidebarList.querySelector('.budget-card.active');
        if (activeCard) activeCard.classList.remove('active');
        card.classList.add('active');

        const editorForm = this.noteEditorForm;
        if (editorForm && editorForm.style.display !== 'none') {
          editorForm.classList.remove('screen-fade-in');
          editorForm.classList.add('screen-fade-out');
          setTimeout(() => {
            this.activeNoteId = note.id;
            this.renderNotes(null, true);
          }, 300);
        } else {
          this.activeNoteId = note.id;
          this.renderNotes(null, true);
        }
      });

      this.notesSidebarList.appendChild(card);
    });

    if (activeNoteChanged && repopulateEditor && this.noteEditorForm) {
      this.animateEditorFade(this.noteEditorForm);
    }
  },

  resetNoteForm() {
    if (this.noteEditorId) this.noteEditorId.value = '';
    if (this.noteTitleEditor) this.noteTitleEditor.value = '';
    if (this.noteContentEditor) this.noteContentEditor.value = '';
  },

  // --- ЛОГИКА ЧЕК-ЛИСТОВ ---
  renderChecklists(highlightId = null, repopulateEditor = true) {
    const lists = db.getChecklists();
    if (!this.checklistsSidebarList) return;
    this.checklistsSidebarList.innerHTML = '';

    const searchVal = this.checklistSearch ? this.checklistSearch.value.trim().toLowerCase() : '';
    const filtered = lists.filter(list => {
      if (searchVal) {
        const titleMatch = list.title.toLowerCase().includes(searchVal);
        const itemsMatch = list.items && list.items.some(item => item.text.toLowerCase().includes(searchVal));
        return titleMatch || itemsMatch;
      }
      return true;
    });

    if (lists.length === 0) {
      this.activeChecklistId = null;
      this.lastActiveChecklistId = null;
      if (this.checklistEditorForm) this.checklistEditorForm.style.display = 'none';
      if (this.checklistEditorEmptyState) {
        this.checklistEditorEmptyState.style.display = 'flex';
        this.checklistEditorEmptyState.textContent = 'Нет чек-листов. Нажмите на иконку добавления вверху, чтобы создать чек-лист.';
      }
      return;
    }

    if (filtered.length === 0) {
      this.checklistsSidebarList.innerHTML = '<div class="empty-state">Списки не найдены</div>';
      if (this.checklistEditorForm) this.checklistEditorForm.style.display = 'flex';
      if (this.checklistEditorEmptyState) this.checklistEditorEmptyState.style.display = 'none';
      return;
    }

    // Сортировка: новые сверху
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Устанавливаем активный чек-лист, если нет или если удален
    if (!this.activeChecklistId || !lists.some(l => l.id === this.activeChecklistId)) {
      this.activeChecklistId = filtered[0].id;
    }

    const activeChecklistChanged = this.activeChecklistId !== this.lastActiveChecklistId;
    this.lastActiveChecklistId = this.activeChecklistId;

    // Показываем форму редактора и скрываем пустое состояние
    if (this.checklistEditorForm) this.checklistEditorForm.style.display = 'flex';
    if (this.checklistEditorEmptyState) this.checklistEditorEmptyState.style.display = 'none';

    filtered.forEach(list => {
      const card = document.createElement('div');
      card.className = `budget-card${list.id === this.activeChecklistId ? ' active' : ''}${list.id === highlightId ? ' card-fade-in' : ''}`;
      card.style.cursor = 'pointer';

      // Вычисляем прогресс выполнения чек-листа
      const totalItems = list.items ? list.items.length : 0;
      const checkedItems = list.items ? list.items.filter(item => item.checked).length : 0;
      
      const progressText = totalItems > 0 
        ? `Выполнено: ${checkedItems} из ${totalItems}`
        : '<span class="text-muted" style="font-style: italic;">Список пуст</span>';

      card.innerHTML = `
        <div class="budget-card-header" style="pointer-events: none;">
          <div class="budget-card-title" style="color: var(--accent-color);">
            <span class="material-symbols-outlined">playlist_add_check</span>
            <span>${this.formatSentenceCase(this.escapeHtml(list.title))}</span>
          </div>
        </div>
        <div style="color: var(--text-secondary); font-size: 12px; margin-top: 4px; pointer-events: none;">
          ${progressText}
        </div>
      `;

      // Клик на саму строку чек-листа для выбора
      card.addEventListener('click', () => {
        if (this.activeChecklistId === list.id) return;

        // Сразу подсвечиваем активную карточку в сайдбаре
        const activeCard = this.checklistsSidebarList.querySelector('.budget-card.active');
        if (activeCard) activeCard.classList.remove('active');
        card.classList.add('active');

        const editorForm = this.checklistEditorForm;
        if (editorForm && editorForm.style.display !== 'none') {
          editorForm.classList.remove('screen-fade-in');
          editorForm.classList.add('screen-fade-out');
          setTimeout(() => {
            this.activeChecklistId = list.id;
            this.renderChecklists(null, true);
          }, 300);
        } else {
          this.activeChecklistId = list.id;
          this.renderChecklists(null, true);
        }
      });

      this.checklistsSidebarList.appendChild(card);

      // Заполняем редактор, если активный чек-лист
      if (list.id === this.activeChecklistId && repopulateEditor) {
        if (this.checklistEditorId) this.checklistEditorId.value = list.id;
        if (this.checklistTitleEditor) this.checklistTitleEditor.value = list.title || '';
        
        // Заполняем элементы списка в редакторе
        if (this.checklistItemsEditorContainer) {
          this.checklistItemsEditorContainer.innerHTML = '';
          if (!list.items || list.items.length === 0) {
            this.checklistItemsEditorContainer.innerHTML = '<div class="text-muted" style="font-size: 13px; font-style: italic; text-align: center; padding: 12px;">Список пуст. Нажмите кнопку добавления строки вверху, чтобы добавить пункты.</div>';
          } else {
            list.items.forEach(item => {
              const row = document.createElement('div');
              row.className = 'checklist-edit-item-row budget-card';
              row.style.flexDirection = 'row';
              row.style.alignItems = 'center';
              row.style.justifyContent = 'space-between';
              row.style.gap = '8px';
              row.style.padding = '8px 12px';
              row.style.background = 'var(--bg-panel)';
              
              row.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; flex-grow: 1;">
                  <span class="material-symbols-outlined checklist-edit-item-checkbox-icon" data-item-id="${item.id}" data-checked="${item.checked}" style="cursor: pointer; user-select: none; font-size: 20px; color: ${item.checked ? 'var(--accent-color)' : 'var(--text-muted)'};">
                    ${item.checked ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                  <input type="text" class="checklist-edit-item-text-input" value="${this.escapeHtml(item.text)}" style="flex-grow: 1; border: none; background: transparent; color: ${item.checked ? 'var(--text-muted)' : 'var(--text-primary)'}; text-decoration: ${item.checked ? 'line-through' : 'none'}; font-size: 13px; outline: none; padding: 4px 0;" placeholder="Название пункта..." autocomplete="off">
                </div>
                <button type="button" class="category-action-btn delete-item" data-item-id="${item.id}" style="padding: 2px;">
                  <span class="material-symbols-outlined" style="font-size: 16px;">close</span>
                </button>
              `;

              const checkboxIcon = row.querySelector('.checklist-edit-item-checkbox-icon');
              const textInput = row.querySelector('.checklist-edit-item-text-input');
              
              checkboxIcon.addEventListener('click', () => {
                const isChecked = checkboxIcon.getAttribute('data-checked') === 'true';
                const newChecked = !isChecked;
                
                checkboxIcon.setAttribute('data-checked', newChecked);
                checkboxIcon.textContent = newChecked ? 'check_box' : 'check_box_outline_blank';
                checkboxIcon.style.color = newChecked ? 'var(--accent-color)' : 'var(--text-muted)';
                
                textInput.style.textDecoration = newChecked ? 'line-through' : 'none';
                textInput.style.color = newChecked ? 'var(--text-muted)' : 'var(--text-primary)';
                
                this.saveCurrentChecklistState();
              });

              row.querySelector('.delete-item').addEventListener('click', () => {
                row.remove();
                this.saveCurrentChecklistState();
              });

              this.checklistItemsEditorContainer.appendChild(row);
            });
          }
        }
      }
    });

    if (activeChecklistChanged && repopulateEditor && this.checklistEditorForm) {
      this.animateEditorFade(this.checklistEditorForm);
    }
  },

  saveCurrentChecklistState() {
    const id = this.checklistEditorId.value;
    const title = this.checklistTitleEditor.value.trim();
    if (id) {
      const itemRows = this.checklistItemsEditorContainer.querySelectorAll('.checklist-edit-item-row');
      const items = Array.from(itemRows).map(row => {
        const cbIcon = row.querySelector('.checklist-edit-item-checkbox-icon');
        const txt = row.querySelector('.checklist-edit-item-text-input');
        return {
          id: cbIcon.getAttribute('data-item-id'),
          text: txt.value.trim() || 'Пункт',
          checked: cbIcon.getAttribute('data-checked') === 'true'
        };
      });
      db.updateChecklist(id, { title, items });
      this.renderChecklists(null, false);
    }
  },

  // --- ЛОГИКА ЗАДАЧ (KANBAN) ---
  renderTasks(highlightId = null) {
    const tasks = db.getTasks();
    
    const lists = {
      todo: document.getElementById('list-todo'),
      in_progress: document.getElementById('list-in-progress'),
      done: document.getElementById('list-done')
    };

    Object.values(lists).forEach(l => {
      if (l) l.innerHTML = '';
    });

    const searchVal = this.taskSearch ? this.taskSearch.value.trim().toLowerCase() : '';
    const filtered = tasks.filter(task => {
      if (searchVal) {
        return task.title.toLowerCase().includes(searchVal) || 
               (task.description && task.description.toLowerCase().includes(searchVal));
      }
      return true;
    });

    filtered.forEach(task => {
      const targetList = lists[task.status];
      if (targetList) {
        const card = document.createElement('div');
        card.className = `kanban-task-card status-${task.status.replace('_', '-')}${task.id === highlightId ? ' card-fade-in' : ''}`;
        
        let statusColor = '#ffffff'; // White for todo
        if (task.status === 'in_progress') {
          statusColor = '#38bdf8'; // Sky blue
        } else if (task.status === 'done') {
          statusColor = '#22c55e'; // Green
        }

        card.innerHTML = `
          <div class="budget-card-header">
            <div class="budget-card-title" style="color: ${statusColor};">
              <span class="material-symbols-outlined">assignment</span>
              <span>${this.formatSentenceCase(this.escapeHtml(task.title))}</span>
            </div>
            <div class="budget-card-actions">
              ${task.status !== 'todo' ? `
                <button class="category-action-btn move-left" style="margin-right: 4px;">
                  <span class="material-symbols-outlined">arrow_back</span>
                </button>
              ` : ''}
              ${task.status !== 'done' ? `
                <button class="category-action-btn move-right" style="margin-right: 4px;">
                  <span class="material-symbols-outlined">arrow_forward</span>
                </button>
              ` : ''}
              <button class="category-action-btn edit" style="margin-right: 4px;">
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button class="category-action-btn delete">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
          ${task.description ? `<div style="color: var(--text-secondary); font-size: 13px; margin-top: 8px; word-break: break-word; white-space: pre-wrap; text-align: left;">${this.formatSentenceCase(this.escapeHtml(task.description))}</div>` : ''}
        `;

        // Переместить влево
        const moveLeftBtn = card.querySelector('.move-left');
        if (moveLeftBtn) {
          moveLeftBtn.addEventListener('click', () => {
            const nextStatus = task.status === 'done' ? 'in_progress' : 'todo';
            db.updateTask(task.id, { status: nextStatus });
            this.renderTasks();
          });
        }

        // Переместить вправо
        const moveRightBtn = card.querySelector('.move-right');
        if (moveRightBtn) {
          moveRightBtn.addEventListener('click', () => {
            const nextStatus = task.status === 'todo' ? 'in_progress' : 'done';
            db.updateTask(task.id, { status: nextStatus });
            this.renderTasks();
          });
        }

        // Редактировать
        const editBtn = card.querySelector('.edit');
        if (editBtn) {
          editBtn.addEventListener('click', () => {
            if (this.addTaskModal) {
              if (this.modalTaskId) this.modalTaskId.value = task.id;
              if (this.addTaskModalTitle) this.addTaskModalTitle.textContent = 'Редактировать задачу';
              if (this.btnAddTaskSubmit) this.btnAddTaskSubmit.textContent = 'Сохранить';
              if (this.modalTaskTitle) this.modalTaskTitle.value = task.title;
              if (this.modalTaskDesc) this.modalTaskDesc.value = task.description || '';
              this.addTaskModal.classList.add('active');
              if (this.modalTaskTitle) this.modalTaskTitle.focus();
            }
          });
        }

        // Удалить
        card.querySelector('.delete').addEventListener('click', async () => {
          if (await this.showConfirm(`Удалить задачу "${this.formatSentenceCase(task.title)}"?`)) {
            db.deleteTask(task.id);
            this.renderTasks();
          }
        });

        targetList.appendChild(card);
      }
    });

  },

  // --- РАБОТА С ПРОФИЛЯМИ И ВХОДОМ ---

  switchAuthView(targetViewEl) {
    if (!targetViewEl) return;
    const views = [this.loginView, this.registerView];
    const activeView = views.find(v => v && v.classList.contains('active'));

    const performShowView = (view) => {
      view.classList.remove('screen-fade-out');
      view.classList.add('active', 'screen-fade-in');
    };

    if (activeView && activeView !== targetViewEl) {
      activeView.classList.remove('screen-fade-in');
      activeView.classList.add('screen-fade-out');
      setTimeout(() => {
        activeView.classList.remove('active', 'screen-fade-out');
        performShowView(targetViewEl);
      }, 250);
    } else {
      views.forEach(v => {
        if (v && v !== targetViewEl) {
          v.classList.remove('active', 'screen-fade-in', 'screen-fade-out');
        }
      });
      if (!targetViewEl.classList.contains('active')) {
        performShowView(targetViewEl);
      }
    }
  },

  resetAuthForms() {
    this.switchAuthView(this.loginView);
    if (this.loginUsernameInput) this.loginUsernameInput.value = '';
    if (this.loginPasswordInput) this.loginPasswordInput.value = '';
    if (this.loginErrorMsg) this.loginErrorMsg.textContent = '';
    if (this.registerUsernameInput) this.registerUsernameInput.value = '';
    if (this.registerPasswordInput) this.registerPasswordInput.value = '';
    if (this.registerErrorMsg) this.registerErrorMsg.textContent = '';
  },

  // Вспомогательный метод для защиты от XSS при вводе текста пользователем
  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
