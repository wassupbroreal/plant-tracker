import { db } from '../db.js';

export const authMethods = {
  bindAuthEvents() {
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
          this.showToast('Неверный логин или пароль!', 'error');
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
          this.showToast('Профиль с таким логином уже существует!', 'error');
        }
      });
    }
  },

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
      }, 150);
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
  }
};
