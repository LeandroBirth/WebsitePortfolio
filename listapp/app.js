// Task Manager App
class TaskManager {
  constructor() {
    this.tasks = this.loadTasks();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderTasks();
    this.updateStats();
    this.updateDate();
    this.initSwipeGestures();
  }

  setupEventListeners() {
    const addBtn = document.getElementById('add-btn');
    const taskInput = document.getElementById('task-input');
    const spinBtn = document.getElementById('spin-btn');

    addBtn.addEventListener('click', () => this.addTask());
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTask();
    });
    spinBtn.addEventListener('click', () => this.pickRandomTask());
  }

  addTask() {
    const input = document.getElementById('task-input');
    const text = input.value.trim();

    if (!text) return;

    const task = {
      id: Date.now(),
      text,
      done: false,
      createdAt: new Date().toISOString(),
    };

    this.tasks.push(task);
    this.saveTasks();
    this.renderTasks();
    this.updateStats();
    input.value = '';
    input.focus();
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveTasks();
    this.renderTasks();
    this.updateStats();
  }

  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.done = !task.done;
      this.saveTasks();
      this.renderTasks();
      this.updateStats();
    }
  }

  renderTasks() {
    const list = document.getElementById('tasks-list');
    const empty = document.getElementById('empty-state');
    const pickSection = document.getElementById('pick-section');

    // Show all tasks
    const activeTasks = this.tasks.filter(t => !t.done);

    if (this.tasks.length === 0) {
      list.innerHTML = '';
      empty.classList.remove('hidden');
      pickSection.classList.add('hidden');
      return;
    }

    empty.classList.add('hidden');
    if (activeTasks.length > 0) {
      pickSection.classList.remove('hidden');
    } else {
      pickSection.classList.add('hidden');
    }

    list.innerHTML = this.tasks
      .map(
        (task) => `
      <div class="task-item ${task.done ? 'task-done' : ''}" data-id="${task.id}" role="listitem">
        <div class="task-swipe-actions">
          <div class="swipe-action swipe-done">✓ Done</div>
          <div class="swipe-action swipe-delete">Delete ✕</div>
        </div>
        <div class="task-content">
          <span class="task-text">${this.escapeHtml(task.text)}</span>
        </div>
      </div>
    `
      )
      .join('');

    // Clear any lingering transforms from task-content elements
    document.querySelectorAll('.task-content').forEach(content => {
      content.style.transform = '';
    });
  }

  initSwipeGestures() {
    let activeItem = null;
    let startX = 0;
    let currentX = 0;

    const handleDown = (e) => {
      // Only handle left mouse button
      if (e.button !== undefined && e.button !== 0) return;
      
      const item = e.target.closest('.task-item');
      if (!item || activeItem) return;
      
      // Don't allow swiping done tasks
      if (item.classList.contains('task-done')) return;

      activeItem = item;
      startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      currentX = startX;
    };

    const handleMove = (e) => {
      if (!activeItem) return;

      currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const diff = currentX - startX;

      // Move only the task content to reveal DELETE/DONE actions underneath
      const taskContent = activeItem.querySelector('.task-content');
      if (taskContent) {
        taskContent.style.transform = `translateX(${diff}px)`;
      }

      // Show action hints
      if (diff < -40) {
        activeItem.classList.add('swipe-left-active');
        activeItem.classList.remove('swipe-right-active');
      } else if (diff > 40) {
        activeItem.classList.add('swipe-right-active');
        activeItem.classList.remove('swipe-left-active');
      } else {
        activeItem.classList.remove('swipe-left-active', 'swipe-right-active');
      }
    };

    const handleUp = () => {
      if (!activeItem) return;

      const diff = currentX - startX;
      const id = parseInt(activeItem.dataset.id);
      const item = activeItem;

      if (diff < -60) {
        // Swiped left - mark as done
        item.classList.add('complete');
        setTimeout(() => this.toggleTask(id), 250);
      } else if (diff > 60) {
        // Swiped right - delete
        item.classList.add('delete');
        setTimeout(() => this.deleteTask(id), 250);
      } else {
        // Reset - clear task-content transform
        const taskContent = item.querySelector('.task-content');
        if (taskContent) {
          taskContent.style.transform = '';
        }
        item.classList.remove('swipe-left-active', 'swipe-right-active');
      }

      activeItem = null;
    };

    // Remove existing listeners if any
    const tasksList = document.getElementById('tasks-list');
    tasksList.removeEventListener('touchstart', handleDown);
    tasksList.removeEventListener('mousedown', handleDown);
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('touchend', handleUp);
    document.removeEventListener('mouseup', handleUp);

    // Add listeners with event delegation
    tasksList.addEventListener('touchstart', handleDown, { passive: true });
    tasksList.addEventListener('mousedown', handleDown);
    document.addEventListener('touchmove', handleMove, { passive: true });
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchend', handleUp);
    document.addEventListener('mouseup', handleUp);
  }

  pickRandomTask() {
    const openTasks = this.tasks.filter(t => !t.done);
    if (openTasks.length === 0) return;

    const wheel = document.getElementById('spin-wheel');
    const pickIdle = document.getElementById('pick-idle');
    const pickCard = document.getElementById('pick-card');
    const pickCardText = document.getElementById('pick-card-text');

    // Remove highlight from previously picked task
    document.querySelectorAll('.task-item').forEach(item => {
      item.classList.remove('task-picked');
    });

    // Spin animation
    wheel.style.animation = 'none';
    setTimeout(() => {
      const randomDegrees = Math.random() * 360 + 720;
      wheel.style.animation = `spin 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
      wheel.style.setProperty('--final-degrees', `${randomDegrees}deg`);
    }, 10);

    // Pick task after spin
    setTimeout(() => {
      const task = openTasks[Math.floor(Math.random() * openTasks.length)];
      pickCardText.textContent = task.text;
      pickIdle.classList.add('hidden');
      pickCard.classList.remove('hidden');

      // Highlight the picked task in the list
      const taskItem = document.querySelector(`[data-id="${task.id}"]`);
      if (taskItem) {
        taskItem.classList.add('task-picked');
      }
    }, 2000);
  }

  updateStats() {
    const openCount = this.tasks.filter(t => !t.done).length;
    const doneCount = this.tasks.filter(t => t.done).length;
    const total = this.tasks.length;
    const percentage = total === 0 ? 0 : Math.round((doneCount / total) * 100);

    document.getElementById('stat-open').textContent = openCount;
    document.getElementById('stat-done').textContent = doneCount;
    document.getElementById('progress-fill').style.width = `${percentage}%`;

    const progressTrack = document.getElementById('progress-track');
    progressTrack.setAttribute('aria-valuenow', percentage);
  }

  updateDate() {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    document.getElementById('app-date').textContent = today;
  }

  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  loadTasks() {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  new TaskManager();
});
