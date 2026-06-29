/* Управление интерфейсом приложения PLANT */

import { db } from './db.js';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

// Импорт суб-модулей логики
import { authMethods } from './ui/auth.js';
import { dashboardMethods } from './ui/dashboard.js';
import { financeMethods } from './ui/finance.js';
import { productivityMethods } from './ui/productivity.js';
import { settingsMethods } from './ui/settings.js';

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

  animateBlock(element) {
    if (!element) return;
    element.classList.remove('card-fade-in');
    void element.offsetWidth; // force reflow
    element.classList.add('card-fade-in');
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

    // Модальное окно заметок
    this.addNoteModal = document.getElementById('add-note-modal');
    this.closeAddNoteModal = document.getElementById('close-add-note-modal');
    this.addNoteModalForm = document.getElementById('add-note-modal-form');
    this.modalNoteTitle = document.getElementById('modal-note-title');
    this.btnAddNoteCancel = document.getElementById('btn-add-note-cancel');
    this.btnAddNoteSubmit = document.getElementById('btn-add-note-submit');

    // Модальное окно чек-листов
    this.addChecklistModal = document.getElementById('add-checklist-modal');
    this.closeAddChecklistModal = document.getElementById('close-add-checklist-modal');
    this.addChecklistModalForm = document.getElementById('add-checklist-modal-form');
    this.modalChecklistTitle = document.getElementById('modal-checklist-title');
    this.btnAddChecklistCancel = document.getElementById('btn-add-checklist-cancel');
    this.btnAddChecklistSubmit = document.getElementById('btn-add-checklist-submit');

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
    if (user && user.theme) {
      this.applyTheme(user.theme);
    } else {
      const globalTheme = localStorage.getItem('plant_global_theme') || 'lime';
      this.applyTheme(globalTheme);
    }
    
    this.bindEvents();
    this.initCustomSelects();
    this.initHeaderRain();

    setTimeout(() => {
      if (user) {
        this.showMainScreen(user);
      } else {
        this.hideLoader();
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
        if (manual) {
          const confirmMsg = `Доступно новое обновление!\n\nВерсия: v${update.version}\n\nХотите скачать и установить обновление сейчас? Приложение будет перезапущено автоматически.`;
          if (await this.showConfirm(confirmMsg)) {
            this.showToast('Загрузка обновления...', 'info');
            await update.downloadAndInstall();
            await relaunch();
          }
        } else {
          this.showUpdateBanner(update.version, update);
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

  showUpdateBanner(version, update) {
    if (document.getElementById('update-toast-banner')) return;

    const container = document.getElementById('toast-container');
    if (!container) return;

    const banner = document.createElement('div');
    banner.id = 'update-toast-banner';
    banner.className = 'update-toast-banner';
    
    banner.innerHTML = `
      <div class="update-toast-header">
        <span class="material-symbols-outlined update-toast-icon">deployed_code</span>
        <span class="update-toast-title">Доступно обновление</span>
      </div>
      <div class="update-toast-body">
        Версия v${version} готова к установке. Приложение будет перезапущено автоматически.
      </div>
      <div class="update-toast-actions">
        <button class="btn btn-primary btn-sm" id="update-toast-btn-install">Установить</button>
        <button class="btn btn-secondary btn-sm" id="update-toast-btn-later">Позже</button>
      </div>
    `;

    container.appendChild(banner);

    // Анимация появления
    setTimeout(() => {
      banner.style.transform = 'translateY(0)';
      banner.style.opacity = '1';
    }, 10);

    const installBtn = banner.querySelector('#update-toast-btn-install');
    const laterBtn = banner.querySelector('#update-toast-btn-later');

    installBtn.addEventListener('click', async () => {
      banner.remove();
      this.showToast('Загрузка обновления...', 'info');
      try {
        await update.downloadAndInstall();
        await relaunch();
      } catch (error) {
        console.error('Ошибка установки обновления:', error);
        this.showToast('Не удалось установить обновление', 'error');
      }
    });

    laterBtn.addEventListener('click', () => {
      // Анимация скрытия
      banner.style.transform = 'translateY(20px)';
      banner.style.opacity = '0';
      banner.addEventListener('transitionend', () => {
        banner.remove();
      });

      // Показываем индикатор на вкладке сайдбара
      const updatesTab = document.querySelector('.titlebar-tab[data-target="screen-updates"]');
      if (updatesTab) {
        updatesTab.classList.add('has-update');
      }
    });
  },

  bindEvents() {
    // Кнопка проверки обновлений
    const checkUpdatesBtn = document.getElementById('check-updates-btn');
    if (checkUpdatesBtn) {
      checkUpdatesBtn.addEventListener('click', () => {
        this.checkAppUpdates(true);
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

    // Выход
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', () => {
        if (this.updateCheckInterval) {
          clearInterval(this.updateCheckInterval);
          this.updateCheckInterval = null;
        }
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

    // Делегируем привязку событий суб-модулям
    this.bindAuthEvents();
    this.bindDashboardEvents();
    this.bindFinanceEvents();
    this.bindProductivityEvents();
    this.bindSettingsEvents();
  },

  showAuthScreen() {
    const globalTheme = localStorage.getItem('plant_global_theme') || 'lime';
    this.applyTheme(globalTheme);
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
    this.updateSidebarSlimState();
    this.resetAuthForms();
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
    
    const performShowAuth = () => {
      document.body.classList.add('auth-mode');
      if (this.authScreen) {
        this.authScreen.classList.remove('screen-fade-out');
        this.authScreen.classList.add('active', 'screen-fade-in');
      }
    };

    if (activeScreen && activeScreen !== this.authScreen) {
      activeScreen.classList.remove('screen-fade-in');
      activeScreen.classList.add('screen-fade-out');
      
      const sidebarSlim = document.querySelector('.sidebar-slim');
      if (sidebarSlim) {
        sidebarSlim.style.animation = 'screenFadeOut 0.3s forwards ease-in-out';
      }
      
      setTimeout(() => {
        activeScreen.classList.remove('active', 'screen-fade-out');
        if (sidebarSlim) {
          sidebarSlim.style.animation = '';
        }
        performShowAuth();
      }, 300);
    } else {
      if (this.authScreen) this.authScreen.classList.remove('active');
      [document.getElementById('about-screen'), document.getElementById('updates-screen'), document.getElementById('profile-screen'), document.getElementById('settings-screen')].forEach(el => {
        if (el) el.classList.remove('active');
      });
      performShowAuth();
    }
  },

  hideLoader() {
    if (this.loader) this.loader.style.display = 'none';
  },

  showMainScreen(user) {
    if (this.loader) {
      const loaderTextEl = this.loader.querySelector('.loader-text');
      if (loaderTextEl) {
        loaderTextEl.textContent = 'Загрузка профиля...';
      }
      this.loader.style.display = 'flex';
    }

    if (user && user.theme) {
      this.applyTheme(user.theme);
    }
    this.updateSidebarSlimState();
    if (this.titlebarTabs) {
      this.titlebarTabs.forEach(t => {
        if (t.getAttribute('data-target') === 'screen-home') t.classList.add('active');
        else t.classList.remove('active');
      });
    }

    // Скрыть активный экран до отрисовки для предотвращения FOUC (flash of unstyled content)
    const activeScreen = [
      this.authScreen,
      document.getElementById('about-screen'),
      document.getElementById('updates-screen'),
      document.getElementById('profile-screen'),
      document.getElementById('settings-screen')
    ].find(el => el && el.classList.contains('active'));

    if (activeScreen) {
      activeScreen.classList.remove('active', 'screen-fade-in', 'screen-fade-out');
    }
    if (this.mainScreen) {
      this.mainScreen.classList.remove('active', 'screen-fade-in', 'screen-fade-out');
    }

    // Фоновая синхронная отрисовка данных
    document.body.classList.remove('auth-mode');
    const sidebarUsername = document.getElementById('sidebar-username');
    if (sidebarUsername) sidebarUsername.textContent = this.formatSentenceCase(user.username);
    this.updateAvatarDisplay(user.avatar, user.username);

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

    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
    }
    this.updateCheckInterval = setInterval(() => {
      this.checkAppUpdates(false);
    }, 15 * 60 * 1000);

    // Даем браузеру отрисовать изменения за экраном загрузки
    setTimeout(() => {
      if (this.loader) this.loader.style.display = 'none';
      if (this.mainScreen) {
        this.mainScreen.classList.add('active', 'screen-fade-in');
      }
    }, 500);
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
      tab.scrollTop = 0;
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
        }, 300);
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

    if (tabId === 'screen-updates' && this.titlebarTabs) {
      const updatesTab = Array.from(this.titlebarTabs).find(tab => tab.getAttribute('data-target') === 'screen-updates');
      if (updatesTab) {
        updatesTab.classList.remove('has-update');
      }
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

    const performShowScreen = (screen) => {
      screen.classList.remove('screen-fade-out');
      screen.classList.add('active', 'screen-fade-in');
    };

    if (activeScreen && activeScreen !== targetScreen) {
      activeScreen.classList.remove('screen-fade-in');
      activeScreen.classList.add('screen-fade-out');
      
      setTimeout(() => {
        activeScreen.classList.remove('active', 'screen-fade-out');
        if (targetScreen) {
          performShowScreen(targetScreen);
        }
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

      modal.style.removeProperty('--accent-color');
      modal.style.removeProperty('--accent-color-hover');
      modal.style.removeProperty('--accent-color-alpha');

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
        if (e.key === 'Escape') cleanupAndResolve(false);
        if (e.key === 'Enter') cleanupAndResolve(true);
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

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  applyTheme(themeName) {
    if (!themeName) themeName = 'lime';
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('plant_global_theme', themeName);
  },

  initHeaderRain() {
    const headers = document.querySelectorAll('.header-bg-shapes');
    const currencies = ['₽', '$', '€', '£', '₸', '₴'];
    
    headers.forEach(header => {
      header.innerHTML = '';
      
      const isAuth = header.classList.contains('auth-rain');
      const dropCount = isAuth ? 160 : 96;
      for (let i = 0; i < dropCount; i++) {
        const drop = document.createElement('span');
        drop.className = 'rain-drop';
        drop.textContent = currencies[Math.floor(Math.random() * currencies.length)];
        
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.top = isAuth ? `${-40 - Math.random() * 50}px` : `${-20 - Math.random() * 30}px`;
        drop.style.fontSize = isAuth ? `${14 + Math.random() * 16}px` : `${11 + Math.random() * 13}px`;
        drop.style.opacity = isAuth ? `${0.04 + Math.random() * 0.08}` : `${0.08 + Math.random() * 0.12}`;
        drop.style.animationDelay = isAuth ? `${Math.random() * 12}s` : `${Math.random() * 8}s`;
        drop.style.animationDuration = isAuth ? `${4 + Math.random() * 5}s` : `${2 + Math.random() * 2.5}s`;
        
        header.appendChild(drop);
      }
    });
  }
};

// Объединяем методы суб-модулей в единый объект ui
Object.assign(
  ui, 
  authMethods, 
  dashboardMethods, 
  financeMethods, 
  productivityMethods, 
  settingsMethods
);
