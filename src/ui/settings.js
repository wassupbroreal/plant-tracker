import { db } from '../db.js';

export const settingsMethods = {
  bindSettingsEvents() {
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

          const sidebarUsername = document.getElementById('sidebar-username');
          if (sidebarUsername) sidebarUsername.textContent = username;
          this.updateAvatarDisplay(avatar, username);

          if (this.settingsUsername) this.settingsUsername.value = username;

          this.renderProfile();
          alert('Профиль сохранен!');
        }
      });
    }

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
        if (user) {
          db.setUser(user.username, currency, user.passcode, user.avatar);
          this.renderTransactions();
          this.renderOverview();
          this.renderBudgets();
          this.renderSavingsGoals();
          this.renderPlanning();
        }
        alert('Валюта приложения успешно изменена!');
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

      const importTriggerBtn = document.getElementById('import-trigger-btn');
      if (importTriggerBtn) {
        importTriggerBtn.addEventListener('click', () => {
          this.settingsImportFile.click();
        });
      }
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

    // --- ЦВЕТОВАЯ ТЕМА ---
    const swatches = document.querySelectorAll('.theme-swatch');
    swatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        const theme = swatch.getAttribute('data-theme');
        const user = db.getUser();
        if (user) {
          db.setUser(user.username, user.currency, user.passcode, user.avatar, theme);
          this.applyTheme(theme);
          
          swatches.forEach(s => s.classList.remove('active'));
          swatch.classList.add('active');
        }
      });
    });

    // --- ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК НАСТРОЕК (50/50) ---
    const settingsNavBtns = document.querySelectorAll('.settings-nav-btn');
    const settingsTabContents = document.querySelectorAll('.settings-tab-content');
    
    settingsNavBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTabId = btn.getAttribute('data-settings-tab');
        if (!targetTabId) return;

        // Переключение активного класса у кнопок
        settingsNavBtns.forEach(b => {
          b.classList.remove('active');
        });
        btn.classList.add('active');

        // Переключение активного таба с анимацией fade-in
        settingsTabContents.forEach(tab => {
          if (tab.id === targetTabId) {
            tab.classList.add('active');
            this.animateEditorFade(tab);
          } else {
            tab.classList.remove('active');
          }
        });
      });
    });
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

    // Подсветка активной темы в настройках
    const swatches = document.querySelectorAll('.theme-swatch');
    swatches.forEach(swatch => {
      if (swatch.getAttribute('data-theme') === (user.theme || 'lime')) {
        swatch.classList.add('active');
      } else {
        swatch.classList.remove('active');
      }
    });
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
  }
};
