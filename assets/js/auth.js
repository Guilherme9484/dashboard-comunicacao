// Gerenciamento de Autenticação
class Auth {
    constructor() {
        this.isLoggedIn = false;
        this.isAdmin = false;
        this.user = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        const logoutBtn = document.getElementById('btn-logout');

        loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
        logoutBtn?.addEventListener('click', () => this.handleLogout());
    }

    async handleLogin(e) {
        e.preventDefault();
        const user = document.getElementById('login-user').value;
        const password = document.getElementById('login-password').value;
        const loginType = document.getElementById('login-type').value;

        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.login}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user, password, loginType })
            });

            const data = await response.json();

            if (data.success) {
                this.isLoggedIn = true;
                this.isAdmin = data.isAdmin;
                this.user = data.user;
                this.showApp();
                this.updateUIForRole();
            } else {
                this.showLoginError(data.message || 'Falha no login');
            }
        } catch (error) {
            this.showLoginError('Erro ao conectar ao servidor');
            console.error('Login error:', error);
        }
    }

    handleLogout() {
        this.isLoggedIn = false;
        this.isAdmin = false;
        this.user = null;
        this.hideApp();
    }

    showApp() {
        document.getElementById('section-login').classList.add('d-none');
        document.getElementById('app-container').classList.remove('d-none');
        // Inicializa o dashboard após login
        window.dispatchEvent(new CustomEvent('app:loaded'));
    }

    hideApp() {
        document.getElementById('app-container').classList.add('d-none');
        document.getElementById('section-login').classList.remove('d-none');
        document.getElementById('login-form').reset();
    }

    updateUIForRole() {
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = this.isAdmin ? 'block' : 'none';
        });
    }

    showLoginError(message) {
        const output = document.getElementById('login-output');
        output.textContent = message;
        output.classList.add('text-danger');
        setTimeout(() => {
            output.textContent = '';
            output.classList.remove('text-danger');
        }, 3000);
    }

    // Verifica se o usuário está autenticado
    isAuthenticated() {
        return this.isLoggedIn;
    }

    // Verifica se o usuário é admin
    isAdminUser() {
        return this.isAdmin;
    }
}

// Inicializa a autenticação
const auth = new Auth();
