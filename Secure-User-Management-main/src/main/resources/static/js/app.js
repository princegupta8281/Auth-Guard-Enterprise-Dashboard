/**
 * Secure User Management - Frontend SPA
 */

const API_BASE = `${window.location.origin}/api`;

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem('user')) || null;
    } catch (error) {
        localStorage.removeItem('user');
        return null;
    }
}

const app = {
    state: {
        token: localStorage.getItem('token') || null,
        user: getStoredUser(),
        theme: localStorage.getItem('theme') || 'light',
        currentView: 'login',
        usersPage: 0,
        usersSort: 'id',
        usersSearch: '',
        activeRequests: 0
    },

    elements: {
        appContainer: document.getElementById('app-container'),
        authLayout: document.getElementById('auth-layout'),
        mainLayout: document.getElementById('main-layout'),
        viewContainer: document.getElementById('view-container'),
        loader: document.getElementById('global-loader'),
        toastContainer: document.getElementById('toast-container'),
        sidebar: document.getElementById('sidebar'),
        themeToggle: document.getElementById('theme-toggle')
    },

    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.checkAuth();
    },

    setupTheme() {
        if (this.state.theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
            this.elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
            this.elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    },

    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.state.theme);
        this.setupTheme();
        
        // Redraw chart if it exists and we're on reports
        if(this.state.currentView === 'reports') {
            this.loadReports();
        }
    },

    setupEventListeners() {
        // Handle hash routing
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
        
        // Mobile menu
        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            this.elements.sidebar.classList.add('open');
        });
        document.getElementById('mobile-close-btn').addEventListener('click', () => {
            this.elements.sidebar.classList.remove('open');
        });
        
        // Click outside sidebar to close on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                this.elements.sidebar.classList.contains('open') && 
                !this.elements.sidebar.contains(e.target) && 
                e.target.id !== 'mobile-menu-btn' && 
                !e.target.closest('#mobile-menu-btn')) {
                this.elements.sidebar.classList.remove('open');
            }
        });
    },

    checkAuth() {
        if (this.state.token && this.state.user) {
            // Verify token is still valid by fetching profile
            this.apiCall('/users/profile', 'GET', null, true, true)
                .then(data => {
                    this.state.user = this.normalizeUser(data);
                    localStorage.setItem('user', JSON.stringify(this.state.user));
                    this.showMainLayout();
                    this.handleRoute();
                })
                .catch(err => {
                    this.logout(false);
                });
        } else {
            this.showAuthLayout();
            this.handleRoute();
        }
    },

    showAuthLayout() {
        this.elements.mainLayout.classList.add('hidden');
        this.elements.authLayout.classList.remove('hidden');
    },

    showMainLayout() {
        this.elements.authLayout.classList.add('hidden');
        this.elements.mainLayout.classList.remove('hidden');
        this.updateSidebar();
        this.checkUnreadNotifications();
    },

    updateSidebar() {
        const user = this.state.user;
        if (!user) return;

        // Update mini profile in sidebar
        const avatar = document.getElementById('sidebar-avatar');
        this.setAvatar(avatar, user.name, user.profileImage);

        document.getElementById('sidebar-username').textContent = user.name;
        
        const roleBadge = document.getElementById('sidebar-role');
        roleBadge.textContent = user.role;
        roleBadge.className = `role badge bg-${user.role === 'ADMIN' ? 'primary' : 'success'}`;

        // Header avatar
        const headerAvatar = document.getElementById('header-avatar');
        this.setAvatar(headerAvatar, user.name, user.profileImage);

        // Handle Admin visibility
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            if (user.role === 'ADMIN') {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });
    },

    navigate(view) {
        window.location.hash = view;
    },

    handleRoute() {
        const [hashRoute, hashQuery = ''] = window.location.hash.slice(1).split('?', 2);
        const hash = hashRoute || (this.state.token ? 'dashboard' : 'login');
        const params = new URLSearchParams(`${window.location.search.slice(1)}&${hashQuery}`);
        
        // Handle reset password token in URL
        if (hash === 'reset-password' && params.has('token')) {
            this.state.currentView = hash;
            this.showAuthLayout();
            this.renderView('reset-password', { token: params.get('token') });
            return;
        }

        this.state.currentView = hash;

        // Active nav link
        document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-item[data-view="${hash}"] .nav-link`);
        if (activeLink) activeLink.classList.add('active');

        // Close sidebar on mobile after navigation
        if (window.innerWidth <= 768) {
            this.elements.sidebar.classList.remove('open');
        }

        // Route protection
        const publicRoutes = ['login', 'register', 'forgot-password', 'reset-password'];
        if (!this.state.token && !publicRoutes.includes(hash)) {
            this.navigate('login');
            return;
        }
        if (this.state.token && publicRoutes.includes(hash) && hash !== 'reset-password') {
            this.navigate('dashboard');
            return;
        }

        // Admin protection
        const adminRoutes = ['users', 'reports'];
        if (adminRoutes.includes(hash) && (!this.state.user || this.state.user.role !== 'ADMIN')) {
            this.navigate('dashboard');
            return;
        }

        this.renderView(hash);
    },

    renderView(view, props = {}) {
        const template = document.getElementById(`tpl-${view}`);
        if (!template) {
            this.renderView(this.state.token ? 'dashboard' : 'login');
            return;
        }

        const clone = template.content.cloneNode(true);
        const container = this.state.token && view !== 'reset-password'
            ? this.elements.viewContainer
            : this.elements.authLayout;
        
        container.innerHTML = '';
        container.appendChild(clone);

        // Update page title
        const titles = {
            'dashboard': 'Dashboard',
            'profile': 'My Profile',
            'notifications': 'Notifications',
            'users': 'User Management',
            'reports': 'System Reports'
        };
        if (document.getElementById('page-title') && titles[view]) {
            document.getElementById('page-title').textContent = titles[view];
        }

        // Call specific initialization for the view
        switch (view) {
            case 'login': this.initLogin(); break;
            case 'register': this.initRegister(); break;
            case 'forgot-password': this.initForgotPassword(); break;
            case 'reset-password': this.initResetPassword(props.token); break;
            case 'dashboard': this.initDashboard(); break;
            case 'profile': this.initProfile(); break;
            case 'notifications': this.initNotifications(); break;
            case 'users': this.initUsers(); break;
            case 'reports': this.initReports(); break;
        }
    },

    // --- Auth Logic ---

    initLogin() {
        const form = document.getElementById('login-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            this.apiCall('/auth/login', 'POST', { email, password }, false)
                .then(data => {
                    if (!data || typeof data.token !== 'string' || !data.token.trim()) {
                        throw new Error('The server returned an incomplete login response. Please try again.');
                    }
                    const { token, ...responseUser } = data;
                    const user = this.normalizeUser(responseUser);
                    this.state.token = token;
                    this.state.user = user;
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    this.showToast('Login successful', 'success');
                    this.showMainLayout();
                    this.navigate('dashboard');
                })
                .catch(err => {
                    this.showToast(err.message || 'Login failed', 'error');
                });
        });
    },

    initRegister() {
        const form = document.getElementById('register-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirm = document.getElementById('reg-confirm').value;

            if (password !== confirm) {
                this.showToast('Passwords do not match', 'error');
                return;
            }

            this.apiCall('/auth/register', 'POST', { name, email, password }, false)
                .then(() => {
                    this.showToast('Registration successful! Please check your email to verify.', 'success');
                    this.navigate('login');
                })
                .catch(err => {
                    this.showToast(err.message || 'Registration failed', 'error');
                });
        });
    },

    initForgotPassword() {
        const form = document.getElementById('forgot-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;

            this.apiCall('/auth/forgot-password', 'POST', { email }, false)
                .then(() => {
                    this.showToast('Password reset link sent to your email', 'success');
                    this.navigate('login');
                })
                .catch(err => {
                    this.showToast(err.message || 'Failed to send reset link', 'error');
                });
        });
    },

    initResetPassword(token) {
        if (!token) {
            this.showToast('Invalid reset token', 'error');
            this.navigate('login');
            return;
        }

        const form = document.getElementById('reset-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const password = document.getElementById('reset-password').value;
            const confirm = document.getElementById('reset-confirm').value;

            if (password !== confirm) {
                this.showToast('Passwords do not match', 'error');
                return;
            }

            this.apiCall(`/auth/reset-password?token=${encodeURIComponent(token)}`, 'POST', { newPassword: password }, false)
                .then(() => {
                    this.logout(false);
                    this.showToast('Password reset successful. Sign in with your new password.', 'success');
                })
                .catch(err => {
                    this.showToast(err.message || 'Password reset failed', 'error');
                });
        });
    },

    logout(showMessage = true) {
        this.state.token = null;
        this.state.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        this.showAuthLayout();
        this.navigate('login');
        if (showMessage) {
            this.showToast('Logged out successfully', 'success');
        }
    },

    // --- Main App Logic ---

    initDashboard() {
        document.getElementById('dash-welcome').textContent = `Welcome back, ${this.state.user.name.split(' ')[0]}!`;

        if (this.state.user.role === 'ADMIN') {
            document.getElementById('admin-stats-container').classList.remove('hidden');
            document.querySelector('.admin-only').classList.remove('hidden');
            
            this.loadAdminStats();
            this.loadDashboardChart();
        }
    },

    loadAdminStats() {
        this.apiCall('/dashboard/stats')
            .then(data => {
                this.animateValue('stat-total', 0, data.totalUsers, 1000);
                this.animateValue('stat-verified', 0, data.verifiedUsers, 1000);
                this.animateValue('stat-unverified', 0, data.unverifiedUsers, 1000);
                this.animateValue('stat-admins', 0, data.totalAdmins, 1000);
            })
            .catch(err => this.showToast(err.message, 'error'));
    },

    loadDashboardChart() {
        this.apiCall('/reports/users/monthly')
            .then(data => {
                const ctx = document.getElementById('registrationChart');
                if (!ctx) return;
                if (typeof Chart === 'undefined') {
                    ctx.hidden = true;
                    this.showToast('Charts are unavailable. The report data is still accessible below.', 'warning');
                    return;
                }
                
                const labels = data.map(d => d.month);
                const values = data.map(d => d.totalUsers);

                const textColor = this.state.theme === 'dark' ? '#e2e8f0' : '#475569';
                const gridColor = this.state.theme === 'dark' ? '#334155' : '#e2e8f0';

                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'New Registrations',
                            data: values,
                            borderColor: '#4f46e5',
                            backgroundColor: 'rgba(79, 70, 229, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { color: textColor, precision: 0 },
                                grid: { color: gridColor }
                            },
                            x: {
                                ticks: { color: textColor },
                                grid: { color: gridColor, display: false }
                            }
                        }
                    }
                });
            })
            .catch(err => this.showToast(err.message, 'error'));
    },

    initProfile() {
        // Load profile data
        this.apiCall('/users/profile')
            .then(user => {
                document.getElementById('profile-name-display').textContent = user.name;
                document.getElementById('profile-email-display').textContent = user.email;
                
                const roleBadge = document.getElementById('profile-role-badge');
                roleBadge.textContent = user.role;
                roleBadge.className = `badge bg-${user.role === 'ADMIN' ? 'primary' : 'success'}`;

                document.getElementById('prof-name').value = user.name;
                document.getElementById('prof-email').value = user.email;

                const avatar = document.getElementById('profile-page-avatar');
                this.setAvatar(avatar, user.name, user.profileImage);
            })
            .catch(err => this.showToast('Failed to load profile', 'error'));

        // Handle profile update
        document.getElementById('profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('prof-name').value;
            const email = document.getElementById('prof-email').value;

            this.apiCall('/users/profile', 'PUT', { name, email })
                .then(data => {
                    this.showToast('Profile updated successfully', 'success');
                    const previousEmail = this.state.user.email;
                    this.state.user = { ...this.state.user, ...data };
                    localStorage.setItem('user', JSON.stringify(this.state.user));
                    this.updateSidebar();
                    document.getElementById('profile-name-display').textContent = this.state.user.name;
                    document.getElementById('profile-email-display').textContent = this.state.user.email;
                    if (previousEmail !== this.state.user.email) {
                        this.logout(false);
                        this.showToast('Email updated. Sign in again with your new address.', 'success');
                    }
                })
                .catch(err => this.showToast(err.message, 'error'));
        });

        // Handle password update
        document.getElementById('password-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('pwd-current').value;
            const newPassword = document.getElementById('pwd-new').value;

            this.apiCall('/users/change-password', 'PUT', { currentPassword, newPassword })
                .then(() => {
                    this.showToast('Password changed successfully', 'success');
                    e.target.reset();
                })
                .catch(err => this.showToast(err.message, 'error'));
        });

        // Handle image upload
        document.getElementById('profile-image-upload').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                this.showToast('Choose an image file to upload', 'error');
                e.target.value = '';
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                this.showToast('Image must be 5 MB or smaller', 'error');
                e.target.value = '';
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            this.showLoader();
            fetch(`${API_BASE}/users/profile-image`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.state.token}` },
                body: formData
            })
            .then(res => {
                return res.text().then(message => {
                    if (!res.ok) throw new Error(message || 'Failed to upload image');
                    return message;
                });
            })
            .then(imageUrl => {
                this.showToast('Profile image updated', 'success');
                this.state.user.profileImage = imageUrl;
                localStorage.setItem('user', JSON.stringify(this.state.user));
                this.updateSidebar();
                this.setAvatar(
                    document.getElementById('profile-page-avatar'),
                    this.state.user.name,
                    imageUrl
                );
            })
            .catch(err => {
                this.showToast(err.message, 'error');
            })
            .finally(() => {
                this.hideLoader();
            });
        });
    },

    initNotifications() {
        this.apiCall(`/notifications/user/${this.state.user.userId || this.state.user.id}`)
            .then(notifications => {
                const list = document.getElementById('notifications-list');
                const empty = document.getElementById('no-notifications');
                
                list.innerHTML = '';
                
                if (!notifications || notifications.length === 0) {
                    empty.classList.remove('hidden');
                    return;
                }
                
                empty.classList.add('hidden');
                
                notifications.forEach(notif => {
                    const div = document.createElement('div');
                    const isRead = Boolean(notif.isRead ?? notif.read);
                    div.className = `list-group-item ${isRead ? '' : 'unread'}`;
                    
                    const createdAt = new Date(notif.createdAt);
                    const date = Number.isNaN(createdAt.getTime()) ? '' : createdAt.toLocaleString();
                    
                    div.innerHTML = `
                        <div class="noti-content">
                            <div class="noti-title">${this.escapeHtml(notif.title)}</div>
                            <div class="noti-message">${this.escapeHtml(notif.message)}</div>
                            <div class="noti-time text-muted small">${date}</div>
                        </div>
                        ${!isRead ? `<button class="btn btn-sm btn-outline-primary mark-read-btn" data-id="${this.escapeHtml(notif.id)}">Mark Read</button>` : ''}
                    `;
                    
                    list.appendChild(div);
                });

                // Attach events
                document.querySelectorAll('.mark-read-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.currentTarget.getAttribute('data-id');
                        this.markNotificationRead(id);
                    });
                });
            })
            .catch(err => this.showToast(err.message, 'error'));
    },

    checkUnreadNotifications() {
        const userId = this.state.user.userId || this.state.user.id;
        if (!userId) return;

        this.apiCall(`/notifications/user/${userId}/unread`, 'GET', null, true, true)
            .then(notifications => {
                const count = notifications.length;
                const navBadge = document.getElementById('nav-notification-badge');
                const headerBadge = document.getElementById('header-notification-badge');
                
                if (count > 0) {
                    navBadge.textContent = count;
                    navBadge.classList.remove('hidden');
                    headerBadge.classList.remove('hidden');
                } else {
                    navBadge.classList.add('hidden');
                    headerBadge.classList.add('hidden');
                }
            })
            .catch(err => this.showToast(err.message, 'error'));
    },

    markNotificationRead(id) {
        const userId = this.state.user.userId || this.state.user.id;
        this.apiCall(`/notifications/${id}/read/user/${userId}`, 'PUT')
            .then(() => {
                this.initNotifications();
                this.checkUnreadNotifications();
            })
            .catch(err => this.showToast('Failed to mark as read', 'error'));
    },

    initUsers() {
        this.loadUsers();

        // Pagination
        document.getElementById('btn-prev-page').addEventListener('click', () => {
            if (this.state.usersPage > 0) {
                this.state.usersPage--;
                this.loadUsers();
            }
        });
        
        document.getElementById('btn-next-page').addEventListener('click', () => {
            this.state.usersPage++;
            this.loadUsers();
        });

        // Search
        let searchTimeout;
        document.getElementById('user-search').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            this.state.usersSearch = e.target.value;
            this.state.usersPage = 0; // reset to first page
            
            searchTimeout = setTimeout(() => {
                this.loadUsers();
            }, 500);
        });

        // Modal Close
        document.getElementById('close-user-modal').addEventListener('click', () => {
            document.getElementById('user-modal').classList.add('hidden');
        });

        // Edit Form Submit
        document.getElementById('edit-user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-user-id').value;
            const name = document.getElementById('edit-user-name').value;
            const email = document.getElementById('edit-user-email').value;
            this.apiCall(`/users/${id}`, 'PUT', { name, email })
                .then(() => {
                    this.showToast('User updated', 'success');
                    document.getElementById('user-modal').classList.add('hidden');
                    this.loadUsers();
                })
                .catch(err => this.showToast(err.message, 'error'));
        });
    },

    loadUsers() {
        const { usersPage, usersSort, usersSearch } = this.state;
        let url = `/users/page?page=${usersPage}&size=10&sortBy=${usersSort}&direction=asc`;
        if (usersSearch) {
            url += `&search=${encodeURIComponent(usersSearch)}`;
        }

        this.apiCall(url)
            .then(data => {
                const tbody = document.getElementById('users-table-body');
                tbody.innerHTML = '';
                
                // Spring Data Pageable response structure
                const content = data.content || [];
                const totalPages = data.totalPages || 1;
                
                content.forEach(user => {
                    const tr = document.createElement('tr');
                    const role = user.role === 'ADMIN' ? 'ADMIN' : 'USER';
                    tr.innerHTML = `
                        <td>#${this.escapeHtml(user.id)}</td>
                        <td>
                            <div class="d-flex align-items-center" style="gap: 10px;">
                                <div class="avatar small user-avatar"></div>
                                <div>
                                    <div style="font-weight: 500">${this.escapeHtml(user.name)}</div>
                                    <div class="text-muted small">${this.escapeHtml(user.email)}</div>
                                </div>
                            </div>
                        </td>
                        <td><span class="badge bg-${role === 'ADMIN' ? 'primary' : 'success'}">${role}</span></td>
                        <td><span class="badge bg-${user.emailVerified ? 'success' : 'danger'}">${user.emailVerified ? 'Verified' : 'Unverified'}</span></td>
                        <td>
                            <button class="btn-icon text-primary edit-user-btn" data-id="${this.escapeHtml(user.id)}" aria-label="Edit ${this.escapeHtml(user.name)}"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon text-danger del-user-btn" data-id="${this.escapeHtml(user.id)}" aria-label="Delete ${this.escapeHtml(user.name)}" ${String(user.id) === String(this.state.user.id || this.state.user.userId) ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                    this.setAvatar(tr.querySelector('.user-avatar'), user.name, user.profileImage);
                });

                document.getElementById('current-page-display').textContent = (usersPage + 1);
                document.getElementById('page-info').textContent = `Showing page ${usersPage + 1} of ${totalPages}`;
                if (content.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" class="empty-table">No users found.</td></tr>';
                }
                
                document.getElementById('btn-prev-page').disabled = usersPage === 0;
                document.getElementById('btn-next-page').disabled = usersPage >= totalPages - 1;

                // Edit/Delete Events
                document.querySelectorAll('.edit-user-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => this.openEditUserModal(e.currentTarget.dataset.id));
                });
                
                document.querySelectorAll('.del-user-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => this.deleteUser(e.currentTarget.dataset.id));
                });
            })
            .catch(err => {
                this.showToast(err.message, 'error');
            });
    },

    openEditUserModal(id) {
        this.apiCall(`/users/${id}`)
            .then(user => {
                document.getElementById('edit-user-id').value = user.id;
                document.getElementById('edit-user-name').value = user.name;
                document.getElementById('edit-user-email').value = user.email;
                document.getElementById('user-modal').classList.remove('hidden');
            })
            .catch(err => this.showToast(err.message, 'error'));
    },

    deleteUser(id) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.apiCall(`/users/${id}`, 'DELETE')
                .then(() => {
                    this.showToast('User deleted', 'success');
                    this.loadUsers();
                })
                .catch(err => this.showToast('Failed to delete', 'error'));
        }
    },

    initReports() {
        this.loadReports();
    },

    loadReports() {
        this.apiCall('/reports/users/monthly')
            .then(data => {
                // Table
                const tbody = document.getElementById('reports-table-body');
                tbody.innerHTML = '';
                
                data.forEach(item => {
                    const tr = document.createElement('tr');
                    const month = document.createElement('td');
                    month.textContent = item.month;
                    const totalUsers = document.createElement('td');
                    totalUsers.textContent = item.totalUsers;
                    tr.append(month, totalUsers);
                    tbody.appendChild(tr);
                });

                // Chart
                const ctx = document.getElementById('reportsChart');
                if (!ctx) return;
                if (typeof Chart === 'undefined') {
                    ctx.hidden = true;
                    this.showToast('Charts are unavailable. The report data is still accessible in the table.', 'warning');
                    return;
                }
                
                // Destroy previous instance if exists
                let chartStatus = Chart.getChart("reportsChart"); 
                if (chartStatus != undefined) {
                  chartStatus.destroy();
                }

                const labels = data.map(d => d.month);
                const values = data.map(d => d.totalUsers);

                const textColor = this.state.theme === 'dark' ? '#e2e8f0' : '#475569';
                const gridColor = this.state.theme === 'dark' ? '#334155' : '#e2e8f0';

                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Registrations',
                            data: values,
                            backgroundColor: '#4f46e5',
                            borderRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { color: textColor, precision: 0 },
                                grid: { color: gridColor }
                            },
                            x: {
                                ticks: { color: textColor },
                                grid: { display: false }
                            }
                        }
                    }
                });
            })
            .catch(err => this.showToast(err.message, 'error'));
    },

    // --- Helpers ---

    apiCall(endpoint, method = 'GET', body = null, requireAuth = true, silent = false) {
        if (!silent) this.showLoader();

        const headers = {};
        if (body && !(body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (requireAuth && this.state.token) {
            headers['Authorization'] = `Bearer ${this.state.token}`;
        }

        const options = {
            method,
            headers
        };

        if (body) {
            options.body = body instanceof FormData ? body : JSON.stringify(body);
        }

        return fetch(`${API_BASE}${endpoint}`, options)
            .then(async response => {
                if (response.status === 401 && requireAuth) {
                    this.logout(false);
                    throw new Error('Session expired. Please login again.');
                }

                const contentType = response.headers.get('content-type') || '';
                const data = response.status === 204
                    ? null
                    : contentType.includes('application/json')
                        ? await response.json()
                        : await response.text();

                if (!response.ok) {
                    const errorMsg = typeof data === 'object' ? (data.message || data.error) : data;
                    throw new Error(errorMsg || 'Request failed');
                }

                return data;
            })
            .finally(() => {
                if (!silent) this.hideLoader();
            });
    },

    showLoader() {
        this.state.activeRequests++;
        this.elements.loader.classList.remove('hidden');
    },

    hideLoader() {
        this.state.activeRequests = Math.max(0, this.state.activeRequests - 1);
        if (this.state.activeRequests === 0) {
            this.elements.loader.classList.add('hidden');
        }
    },

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        if (type === 'warning') icon = 'exclamation-triangle';

        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <div class="toast-content">
                <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="toast-message">${this.escapeHtml(message)}</div>
            </div>
        `;

        this.elements.toastContainer.appendChild(toast);

        // Remove after animation
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    },

    animateValue(id, start, end, duration) {
        const obj = document.getElementById(id);
        if (!obj) return;
        
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    },

    escapeHtml(value) {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
    },

    setAvatar(element, name, imageUrl) {
        const initial = String(name || '?').trim().charAt(0).toUpperCase() || '?';
        element.avatarRequestId = (element.avatarRequestId || 0) + 1;
        element.textContent = initial;
        element.style.backgroundImage = '';

        if (element.avatarObjectUrl) {
            URL.revokeObjectURL(element.avatarObjectUrl);
            element.avatarObjectUrl = null;
        }
        if (!imageUrl) return;

        try {
            const baseUrl = 'http://localhost:8081';
            const image = new URL(imageUrl, baseUrl);
            if (!image.pathname.startsWith('/uploads/')) return;

            const requestId = element.avatarRequestId;
            fetch(image.href, {
                headers: { Authorization: `Bearer ${this.state.token}` }
            })
                .then(response => {
                    if (!response.ok) throw new Error('Profile image request failed');
                    return response.blob();
                })
                .then(blob => {
                    if (element.avatarRequestId !== requestId || element.isConnected === false) return;
                    element.avatarObjectUrl = URL.createObjectURL(blob);
                    element.style.backgroundImage = `url("${element.avatarObjectUrl}")`;
                    element.textContent = '';
                })
                .catch(() => {
                    if (element.avatarRequestId === requestId) {
                        this.showToast('Could not load the profile image', 'warning');
                    }
                });
        } catch (error) {
            this.showToast('The saved profile image URL is invalid', 'warning');
        }
    },

    normalizeUser(user) {
        const id = Number(user?.id ?? user?.userId);
        if (!Number.isSafeInteger(id) || id <= 0) {
            throw new Error('The server did not return a valid user ID. Please contact support.');
        }
        if (typeof user.name !== 'string' || typeof user.email !== 'string' ||
                typeof user.role !== 'string') {
            throw new Error('The server returned incomplete user details. Please try again.');
        }
        return { ...user, id, userId: id };
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
