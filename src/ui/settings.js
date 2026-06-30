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
    if (this.settingsGeneralForm) {
      this.settingsGeneralForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const currency = this.settingsCurrency.value;
        const finMonthStart = parseInt(this.settingsFinMonthStart.value) || 1;
        const roundAmounts = this.settingsRoundAmounts.checked;
        const roundUpMode = this.settingsRoundUpMode ? this.settingsRoundUpMode.value : 'none';
        const roundUpGoalId = this.settingsRoundUpGoal ? this.settingsRoundUpGoal.value : '';
        const user = db.getUser();
        if (user) {
          db.setUser(
            user.username,
            currency,
            user.passcode,
            user.avatar,
            user.theme,
            finMonthStart,
            roundAmounts,
            roundUpMode,
            roundUpGoalId
          );
          this.renderTransactions();
          this.renderOverview();
          this.renderBudgets();
          this.renderSavingsGoals();
          this.renderPlanning();
          this.renderAnalytics();
        }
        alert('Настройки успешно сохранены!');
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
                db.setUser(
                  importedData.user.username,
                  importedData.user.currency || 'RUB',
                  importedData.user.passcode || '',
                  importedData.user.avatar || '',
                  importedData.user.theme || 'lime',
                  importedData.user.financialMonthStart || 1,
                  importedData.user.roundAmounts || false,
                  importedData.user.roundUpMode || 'none',
                  importedData.user.roundUpGoalId || ''
                );
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

    // Prefill general settings
    if (this.settingsCurrency) {
      this.settingsCurrency.value = user.currency || 'RUB';
    }
    if (this.settingsFinMonthStart) {
      this.settingsFinMonthStart.value = user.financialMonthStart || 1;
    }
    if (this.settingsRoundAmounts) {
      this.settingsRoundAmounts.checked = !!user.roundAmounts;
    }

    // Populate roundUp goals dropdown in settings tab
    if (this.settingsRoundUpGoal) {
      const goals = db.getGoals();
      this.settingsRoundUpGoal.innerHTML = '<option value="">Не выбрано</option>' + 
        goals.map(g => `<option value="${g.id}">${this.escapeHtml(g.title)}</option>`).join('');
      this.settingsRoundUpGoal.value = user.roundUpGoalId || '';
    }
    if (this.settingsRoundUpMode) {
      this.settingsRoundUpMode.value = user.roundUpMode || 'none';
    }

    // Подсветка активной темы в настройках
    const swatches = document.querySelectorAll('.theme-swatch');
    swatches.forEach(swatch => {
      if (swatch.getAttribute('data-theme') === (user.theme || 'lime')) {
        swatch.classList.add('active');
      } else {
        swatch.classList.remove('active');
      }
    });

    // Отрисовка достижений
    this.renderAchievementsList();
  },

  renderAchievementsList() {
    const grid = document.getElementById('profile-achievements-grid');
    const counter = document.getElementById('profile-achievements-counter');
    if (!grid) return;

    const achievements = db.getAchievements();
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    if (counter) {
      counter.textContent = `${unlockedCount} / ${achievements.length}`;
    }

    grid.innerHTML = achievements.map(ach => {
      const isUnlocked = ach.unlocked;
      const cardClass = isUnlocked ? 'achievement-card unlocked' : 'achievement-card';
      const icon = ach.icon || 'star';
      
      let progressHTML = '';
      if (!isUnlocked && ach.maxProgress > 1) {
        const percent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));
        progressHTML = `
          <div class="achievement-progress-wrapper">
            <span class="achievement-progress-text">${ach.progress} / ${ach.maxProgress}</span>
            <div class="achievement-progress-bar-bg">
              <div class="achievement-progress-bar-fill" style="width: ${percent}%;"></div>
            </div>
          </div>
        `;
      }

      const dateHTML = isUnlocked ? `<span class="achievement-unlocked-date">Открыто ${ach.unlockedAt}</span>` : '';
      const lockHTML = !isUnlocked ? `<span class="material-symbols-outlined achievement-lock-icon">lock</span>` : '';

      return `
        <div class="${cardClass}">
          <span class="achievement-xp-badge">+${ach.xp} XP</span>
          <div class="achievement-icon-wrapper">
            <span class="material-symbols-outlined">${icon}</span>
            ${lockHTML}
          </div>
          <div class="achievement-title">${ach.title}</div>
          <div class="achievement-desc">${ach.desc}</div>
          ${progressHTML}
          ${dateHTML}
        </div>
      `;
    }).join('');

    // Отрисовка уровня
    this.renderLevelProgress(achievements);
  },

  renderLevelProgress(achievements) {
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

    const badgeEl = document.getElementById('profile-level-badge');
    const nameEl = document.getElementById('profile-level-name');
    const textEl = document.getElementById('profile-xp-text');
    const fillEl = document.getElementById('profile-xp-fill');

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
