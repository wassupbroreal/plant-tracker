import { db } from '../db.js';

export const productivityMethods = {
  bindProductivityEvents() {
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
        if (this.addNoteModal) {
          this.addNoteModal.classList.add('active');
          if (this.addNoteModalForm) this.addNoteModalForm.reset();
          if (this.modalNoteTitle) this.modalNoteTitle.focus();
        }
      });
    }

    if (this.closeAddNoteModal) {
      this.closeAddNoteModal.addEventListener('click', () => {
        if (this.addNoteModal) this.addNoteModal.classList.remove('active');
      });
    }

    if (this.btnAddNoteCancel) {
      this.btnAddNoteCancel.addEventListener('click', () => {
        if (this.addNoteModal) this.addNoteModal.classList.remove('active');
      });
    }

    if (this.addNoteModal) {
      this.addNoteModal.addEventListener('click', (e) => {
        if (e.target === this.addNoteModal) {
          this.addNoteModal.classList.remove('active');
        }
      });
    }

    if (this.addNoteModalForm) {
      this.addNoteModalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = this.formatSentenceCase(this.modalNoteTitle.value.trim());
        if (title) {
          const newNote = db.addNote({ title, content: '' });
          if (this.addNoteModal) this.addNoteModal.classList.remove('active');
          if (this.addNoteModalForm) this.addNoteModalForm.reset();
          this.activeNoteId = newNote.id;
          this.renderNotes(newNote.id);
          this.renderOverview();
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
          this.showToast('Заметка сохранена');
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
        if (this.addChecklistModal) {
          this.addChecklistModal.classList.add('active');
          if (this.addChecklistModalForm) this.addChecklistModalForm.reset();
          if (this.modalChecklistTitle) this.modalChecklistTitle.focus();
        }
      });
    }

    if (this.closeAddChecklistModal) {
      this.closeAddChecklistModal.addEventListener('click', () => {
        if (this.addChecklistModal) this.addChecklistModal.classList.remove('active');
      });
    }

    if (this.btnAddChecklistCancel) {
      this.btnAddChecklistCancel.addEventListener('click', () => {
        if (this.addChecklistModal) this.addChecklistModal.classList.remove('active');
      });
    }

    if (this.addChecklistModal) {
      this.addChecklistModal.addEventListener('click', (e) => {
        if (e.target === this.addChecklistModal) {
          this.addChecklistModal.classList.remove('active');
        }
      });
    }

    if (this.addChecklistModalForm) {
      this.addChecklistModalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = this.formatSentenceCase(this.modalChecklistTitle.value.trim());
        if (title) {
          const newList = db.addChecklist({ title });
          if (this.addChecklistModal) this.addChecklistModal.classList.remove('active');
          if (this.addChecklistModalForm) this.addChecklistModalForm.reset();
          this.activeChecklistId = newList.id;
          this.renderChecklists(newList.id);
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
          this.showToast('Чек-лист сохранен');
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
  },

  // --- ЛОГИКА ЗАМЕТОК ---
  renderNotes(highlightId = null, repopulateEditor = true) {
    const notes = db.getNotes();
    
    // Проверка достижений заметок
    this.checkAchievement('notes_count_3', notes.length);
    
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

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (!this.activeNoteId || !notes.some(n => n.id === this.activeNoteId)) {
      this.activeNoteId = filtered[0].id;
    }

    const activeNoteChanged = this.activeNoteId !== this.lastActiveNoteId;
    this.lastActiveNoteId = this.activeNoteId;

    if (this.noteEditorForm) this.noteEditorForm.style.display = 'flex';
    if (this.noteEditorEmptyState) this.noteEditorEmptyState.style.display = 'none';

    filtered.forEach(note => {
      const card = document.createElement('div');
      card.className = `budget-card${note.id === this.activeNoteId ? ' active' : ''}`;
      card.style.cursor = 'pointer';

      if (note.id === this.activeNoteId) {
        if (this.noteEditorId) this.noteEditorId.value = note.id;
        if (repopulateEditor) {
          if (this.noteTitleEditor) this.noteTitleEditor.value = note.title || '';
          if (this.noteContentEditor) {
            this.noteContentEditor.value = note.content || '';
            this.autoResizeTextarea(this.noteContentEditor);
          }
        }
      }
      card.innerHTML = `
        <div class="budget-card-header" style="pointer-events: none; margin-bottom: 0;">
          <div class="budget-card-title" style="color: var(--accent-color);">
            <span class="material-symbols-outlined">description</span>
            <span>${this.formatSentenceCase(this.escapeHtml(note.title))}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        if (this.activeNoteId === note.id) return;

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
          }, 150);
        } else {
          this.activeNoteId = note.id;
          this.renderNotes(null, true);
        }
      });

      this.notesSidebarList.appendChild(card);
    });

    if (highlightId && this.notesSidebarList) {
      this.animateBlock(this.notesSidebarList);
    }

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

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (!this.activeChecklistId || !lists.some(l => l.id === this.activeChecklistId)) {
      this.activeChecklistId = filtered[0].id;
    }

    const activeChecklistChanged = this.activeChecklistId !== this.lastActiveChecklistId;
    this.lastActiveChecklistId = this.activeChecklistId;

    if (this.checklistEditorForm) this.checklistEditorForm.style.display = 'flex';
    if (this.checklistEditorEmptyState) this.checklistEditorEmptyState.style.display = 'none';

    filtered.forEach(list => {
      const card = document.createElement('div');
      card.className = `budget-card${list.id === this.activeChecklistId ? ' active' : ''}`;
      card.style.cursor = 'pointer';

      card.innerHTML = `
        <div class="budget-card-header" style="pointer-events: none; margin-bottom: 0;">
          <div class="budget-card-title" style="color: var(--accent-color);">
            <span class="material-symbols-outlined">playlist_add_check</span>
            <span>${this.formatSentenceCase(this.escapeHtml(list.title))}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        if (this.activeChecklistId === list.id) return;

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
          }, 150);
        } else {
          this.activeChecklistId = list.id;
          this.renderChecklists(null, true);
        }
      });

      this.checklistsSidebarList.appendChild(card);

      if (list.id === this.activeChecklistId && repopulateEditor) {
        if (this.checklistEditorId) this.checklistEditorId.value = list.id;
        if (this.checklistTitleEditor) this.checklistTitleEditor.value = list.title || '';
        
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

    if (highlightId && this.checklistsSidebarList) {
      this.animateBlock(this.checklistsSidebarList);
    }

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
  createCardElement(task) {
    const card = document.createElement('div');
    card.className = `kanban-task-card status-${task.status.replace('_', '-')}`;
    card.setAttribute('data-task-id', task.id);
    this.populateCard(card, task);
    return card;
  },

  populateCard(card, task) {
    let statusColor = '#ffffff';
    if (task.status === 'in_progress') {
      statusColor = '#38bdf8';
    } else if (task.status === 'done') {
      statusColor = '#22c55e';
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

    const moveLeftBtn = card.querySelector('.move-left');
    if (moveLeftBtn) {
      moveLeftBtn.addEventListener('click', () => {
        const nextStatus = task.status === 'done' ? 'in_progress' : 'todo';
        card.classList.add('task-card-slide-out');
        card.addEventListener('animationend', () => {
          db.updateTask(task.id, { status: nextStatus });
          this.renderTasks(task.id);
          this.renderOverview();
        }, { once: true });
      });
    }

    const moveRightBtn = card.querySelector('.move-right');
    if (moveRightBtn) {
      moveRightBtn.addEventListener('click', () => {
        const nextStatus = task.status === 'todo' ? 'in_progress' : 'done';
        card.classList.add('task-card-slide-out');
        card.addEventListener('animationend', () => {
          db.updateTask(task.id, { status: nextStatus });
          this.renderTasks(task.id);
          this.renderOverview();
        }, { once: true });
      });
    }

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

    const deleteBtn = card.querySelector('.delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (await this.showConfirm(`Удалить задачу "${this.formatSentenceCase(task.title)}"?`)) {
          card.classList.add('task-card-slide-out');
          card.addEventListener('animationend', () => {
            db.deleteTask(task.id);
            this.renderTasks();
            this.renderOverview();
          }, { once: true });
        }
      });
    }
  },

  updateCardContent(card, task) {
    card.className = `kanban-task-card status-${task.status.replace('_', '-')}`;
    this.populateCard(card, task);
  },

  renderTasks(highlightId = null) {
    const tasks = db.getTasks();
    
    const lists = {
      todo: document.getElementById('list-todo'),
      in_progress: document.getElementById('list-in-progress'),
      done: document.getElementById('list-done')
    };

    if (!lists.todo && !lists.in_progress && !lists.done) return;

    const searchVal = this.taskSearch ? this.taskSearch.value.trim().toLowerCase() : '';
    const filtered = tasks.filter(task => {
      if (searchVal) {
        return task.title.toLowerCase().includes(searchVal) || 
               (task.description && task.description.toLowerCase().includes(searchVal));
      }
      return true;
    });

    // 1. Создаем карту существующих на доске карточек: taskId -> cardElement
    const currentCardsMap = new Map();
    Object.values(lists).forEach(list => {
      if (!list) return;
      const cards = list.querySelectorAll('.kanban-task-card');
      cards.forEach(card => {
        const tid = card.getAttribute('data-task-id');
        if (tid) {
          currentCardsMap.set(tid, card);
        }
      });
    });

    // 2. Рендерим отфильтрованные задачи
    filtered.forEach(task => {
      const targetList = lists[task.status];
      if (!targetList) return;

      const existingCard = currentCardsMap.get(task.id);

      if (existingCard) {
        if (existingCard.parentElement === targetList) {
          // И в правильной колонке — просто обновляем содержимое in-place
          this.updateCardContent(existingCard, task);
          // Убираем из карты удаления, так как она остается
          currentCardsMap.delete(task.id);
        }
      }
    });

    // 3. Все оставшиеся в currentCardsMap карточки должны быть плавно удалены
    currentCardsMap.forEach((card, tid) => {
      if (card.classList.contains('task-card-slide-out')) {
        card.remove();
      } else {
        card.classList.add('task-card-slide-out');
        card.addEventListener('animationend', () => {
          card.remove();
        }, { once: true });
      }
    });

    // 4. Добавляем карточки для задач, которых еще нет в целевых колонках
    filtered.forEach(task => {
      const targetList = lists[task.status];
      if (!targetList) return;

      const alreadyInTarget = targetList.querySelector(`[data-task-id="${task.id}"]`);
      if (alreadyInTarget && !alreadyInTarget.classList.contains('task-card-slide-out')) {
        return;
      }

      // Создаем новую карточку
      const card = this.createCardElement(task);
      card.classList.add('task-card-slide-in');
      
      card.addEventListener('animationend', () => {
        card.classList.remove('task-card-slide-in');
      }, { once: true });

      targetList.appendChild(card);
    });

    // 5. Если есть подсветка ( highlightId ), применим временный импульс
    if (highlightId) {
      const targetCard = document.querySelector(`[data-task-id="${highlightId}"]`);
      if (targetCard) {
        targetCard.classList.remove('task-card-highlight');
        void targetCard.offsetWidth; // force reflow
        targetCard.classList.add('task-card-highlight');
        targetCard.addEventListener('animationend', () => {
          targetCard.classList.remove('task-card-highlight');
        }, { once: true });
      }
    }

    // Проверка достижений задач
    if (tasks.some(t => t.status === 'done')) {
      this.checkAchievement('first_task_done', 1);
    }
  }
};
