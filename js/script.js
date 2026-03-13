// ============================================
// TO-DO LIFE DASHBOARD - FIXED VERSION
// Semua fitur BERFUNGSI 100%
// ============================================

class LifeDashboard {
    constructor() {
        this.userName = localStorage.getItem('userName') || '';
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.quickLinks = JSON.parse(localStorage.getItem('quickLinks')) || [];
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.timerSeconds = 25 * 60;
        this.originalTimerTime = 25 * 60;
        this.isTimerRunning = false;
        this.timerInterval = null;
        this.editingTodoId = null;

        this.init();
    }

    init() {
        this.cacheElements();
        this.applyTheme();
        this.bindEvents();
        this.updateAll();
        setInterval(() => this.updateTimeDate(), 1000);
    }

    cacheElements() {
        this.userNameInput = document.getElementById('userName');
        this.saveNameBtn = document.getElementById('saveNameBtn');
        this.greetingText = document.getElementById('greetingText');
        this.currentTime = document.getElementById('currentTime');
        this.currentDate = document.getElementById('currentDate');

        this.timerDisplay = document.getElementById('timerDisplay');
        this.timerStart = document.getElementById('timerStart');
        this.timerStop = document.getElementById('timerStop');
        this.timerReset = document.getElementById('timerReset');
        this.progressBar = document.getElementById('progressBar');

        this.todoInput = document.getElementById('todoInput');
        this.addTodoBtn = document.getElementById('addTodoBtn');
        this.todoList = document.getElementById('todoList');
        this.todoStats = document.getElementById('todoStats');

        this.addLinkBtn = document.getElementById('addLinkBtn');
        this.quickLinksList = document.getElementById('quickLinksList');

        this.themeToggle = document.getElementById('themeToggle');
        this.linkModal = document.getElementById('linkModal');
        this.closeModal = document.getElementById('closeModal');
        this.saveLinkBtn = document.getElementById('saveLinkBtn');
        this.cancelLinkBtn = document.getElementById('cancelLinkBtn');
        this.linkNameInput = document.getElementById('linkName');
        this.linkUrlInput = document.getElementById('linkUrl');
    }

    // ===== THEME SYSTEM =====
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
        const icon = this.themeToggle.querySelector('i');
        icon.className = this.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.applyTheme();
    }

    // ===== GREETING =====
    updateGreeting() {
        const hour = new Date().getHours();
        const name = this.userName || '';
        let greeting = '';

        if (hour < 10) greeting = `Selamat pagi${name ? ', ' + name : ''}!`;
        else if (hour < 15) greeting = `Selamat siang${name ? ', ' + name : ''}!`;
        else if (hour < 18) greeting = `Selamat sore${name ? ', ' + name : ''}!`;
        else greeting = `Selamat malam${name ? ', ' + name : ''}!`;

        this.greetingText.textContent = greeting;
        this.userNameInput.value = name;
    }

    saveUserName() {
        const name = this.userNameInput.value.trim();
        if (name) {
            this.userName = name;
            localStorage.setItem('userName', name);
            this.updateGreeting();
            this.showNotification('Nama disimpan!', 'success');
        }
    }

    // ===== TIME & DATE =====
    updateTimeDate() {
        const now = new Date();
        this.currentTime.textContent = now.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        this.currentDate.textContent = now.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        this.updateGreeting();
    }

    // ===== TIMER =====
    updateTimerDisplay() {
        const minutes = Math.floor(this.timerSeconds / 60);
        const seconds = this.timerSeconds % 60;
        this.timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const progress = ((this.originalTimerTime - this.timerSeconds) / this.originalTimerTime) * 100;
        this.progressBar.style.width = `${Math.min(progress, 100)}%`;
    }

    startTimer() {
        if (this.isTimerRunning) return;
        this.isTimerRunning = true;
        this.timerInterval = setInterval(() => {
            this.timerSeconds--;
            this.updateTimerDisplay();
            if (this.timerSeconds <= 0) {
                this.stopTimer();
                this.resetTimer();
                this.showNotification('⏰ Waktu Pomodoro selesai!', 'success');
            }
        }, 1000);
    }

    stopTimer() {
        this.isTimerRunning = false;
        clearInterval(this.timerInterval);
    }

    resetTimer() {
        this.stopTimer();
        this.timerSeconds = this.originalTimerTime;
        this.updateTimerDisplay();
    }

    // ===== TO-DO LIST =====
    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        // Cek duplikat
        const exists = this.todos.some(todo => 
            todo.text.toLowerCase() === text.toLowerCase()
        );
        if (exists) {
            this.showNotification('Tugas sudah ada!', 'error');
            return;
        }

        this.todos.unshift({
            id: Date.now(),
            text: text,
            completed: false
        });

        localStorage.setItem('todos', JSON.stringify(this.todos));
        this.todoInput.value = '';
        this.renderTodos();
        this.showNotification('Tugas ditambahkan', 'success');
    }

    deleteTodo(id) {
        if (confirm('Hapus tugas ini?')) {
            this.todos = this.todos.filter(todo => todo.id !== id);
            localStorage.setItem('todos', JSON.stringify(this.todos));
            this.renderTodos();
        }
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            localStorage.setItem('todos', JSON.stringify(this.todos));
            this.renderTodos();
        }
    }

    renderTodos() {
        this.todoList.innerHTML = this.todos.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="todo-edit" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="todo-delete" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        this.updateTodoStats();

        // Event delegation
        this.todoList.querySelectorAll('.todo-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                this.toggleTodo(parseInt(e.target.closest('.todo-item').dataset.id));
            });
        });

        this.todoList.querySelectorAll('.todo-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.deleteTodo(parseInt(e.target.closest('.todo-item').dataset.id));
            });
        });

        this.todoList.querySelectorAll('.todo-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.todo-item').dataset.id);
                const newText = prompt('Edit tugas:', 
                    this.todos.find(t => t.id === id).text
                );
                if (newText && newText.trim()) {
                    const todo = this.todos.find(t => t.id === id);
                    todo.text = newText.trim();
                    localStorage.setItem('todos', JSON.stringify(this.todos));
                    this.renderTodos();
                }
            });
        });
    }

    updateTodoStats() {
        const remaining = this.todos.filter(t => !t.completed).length;
        this.todoStats.textContent = `${remaining} tugas tersisa`;
    }

    // ===== QUICK LINKS =====
    showLinkModal() {
        this.linkModal.style.display = 'block';
    }

    hideLinkModal() {
        this.linkModal.style.display = 'none';
        this.linkNameInput.value = '';
        this.linkUrlInput.value = '';
    }

    addQuickLink() {
        const name = this.linkNameInput.value.trim();
        const url = this.linkUrlInput.value.trim();

        if (!name || !url) {
            this.showNotification('Isi nama dan URL!', 'error');
            return;
        }

        const fullUrl = url.startsWith('http') ? url : 'https://' + url;
        
        this.quickLinks.unshift({
            id: Date.now(),
            name: name,
            url: fullUrl
        });

        localStorage.setItem('quickLinks', JSON.stringify(this.quickLinks));
        this.renderQuickLinks();
        this.hideLinkModal();
        this.showNotification('Link ditambahkan!', 'success');
    }

    deleteQuickLink(id) {
        if (confirm('Hapus link ini?')) {
            this.quickLinks = this.quickLinks.filter(link => link.id !== id);
            localStorage.setItem('quickLinks', JSON.stringify(this.quickLinks));
            this.renderQuickLinks();
        }
    }

    renderQuickLinks() {
        this.quickLinksList.innerHTML = this.quickLinks.map(link => {
            const domain = new URL(link.url).hostname.replace('www.', '');
            const color1 = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 4)];
            const color2 = ['#1d4ed8', '#059669', '#d97706', '#dc2626'][Math.floor(Math.random() * 4)];

            return `
                <div class="quick-link-item" data-id="${link.id}">
                    <div class="quick-link-icon" style="background: linear-gradient(135deg, ${color1}, ${color2})">
                        ${link.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="quick-link-info">
                        <h4>${escapeHtml(link.name)}</h4>
                        <small>${domain}</small>
                    </div>
                    <button class="quick-link-remove" title="Hapus">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }).join('');

        // Event delegation
        this.quickLinksList.querySelectorAll('.quick-link-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.quick-link-remove')) return;
                const id = parseInt(item.dataset.id);
                const link = this.quickLinks.find(l => l.id === id);
                if (link) window.open(link.url, '_blank');
            });
        });

        this.quickLinksList.querySelectorAll('.quick-link-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteQuickLink(parseInt(e.target.closest('.quick-link-item').dataset.id));
            });
        });
    }

    // ===== NOTIFICATION =====
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 100px; right: 20px; z-index: 9999;
            padding: 1rem 1.5rem; border-radius: 12px; color: white;
            font-family: 'Poppins', sans-serif; font-weight: 500;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            transform: translateX(400px); transition: all 0.3s ease;
            display: flex; align-items: center; gap: 0.75rem;
            max-width: 350px;
        `;
        
        const bgColor = type === 'success' ? '#10b981' : '#ef4444';
        notification.style.background = `linear-gradient(135deg, ${bgColor}, ${bgColor}cc)`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        notification.innerHTML = `<i class="fas ${icon}"></i> ${message}`;

        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ===== UPDATE ALL =====
    updateAll() {
        this.updateTimeDate();
        this.updateTimerDisplay();
        this.renderTodos();
        this.renderQuickLinks();
        this.updateGreeting();
    }

    // ===== EVENTS =====
    bindEvents() {
        // Theme
        this.themeToggle.onclick = () => this.toggleTheme();

        // Name
        this.saveNameBtn.onclick = () => this.saveUserName();
        this.userNameInput.onkeypress = (e) => e.key === 'Enter' && this.saveUserName();

        // Timer
        this.timerStart.onclick = () => this.startTimer();
        this.timerStop.onclick = () => this.stopTimer();
        this.timerReset.onclick = () => this.resetTimer();

        // Todo
        this.addTodoBtn.onclick = () => this.addTodo();
        this.todoInput.onkeypress = (e) => e.key === 'Enter' && this.addTodo();

        // Quick Links
        this.addLinkBtn.onclick = () => this.showLinkModal();
        this.saveLinkBtn.onclick = () => this.addQuickLink();
        this.cancelLinkBtn.onclick = () => this.hideLinkModal();
        this.closeModal.onclick = () => this.hideLinkModal();

        // Modal backdrop
        this.linkModal.onclick = (e) => e.target === this.linkModal && this.hideLinkModal();

        // Keyboard
        document.onkeydown = (e) => {
            if (e.key === 'Escape') this.hideLinkModal();
        };
    }
}

// ===== HELPER FUNCTION =====
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ===== INIT =====
const dashboard = new LifeDashboard();