// Gerenciamento da Interface do Usuário
class UI {
    constructor() {
        this.currentSection = 'dashboard';
        this.setupEventListeners();
        this.setupTheme();
        this.setupMobileMenu();
    }

    setupEventListeners() {
        // Navegação
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('.nav-link').dataset.section;
                this.navigateTo(section);
            });
        });

        // Tema
        document.getElementById('toggle-theme').addEventListener('click', () => this.toggleTheme());

        // Carregamento inicial
        window.addEventListener('app:loaded', () => this.init());
    }

    setupTheme() {
        // Recupera tema salvo ou usa o padrão
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.classList.add(savedTheme);
        }
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu');
        const sidebar = document.getElementById('sidebar');

        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('hide');
        });

        // Fecha menu no mobile ao clicar em um link
        if (window.innerWidth <= 768) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    sidebar.classList.add('hide');
                });
            });
        }
    }

    init() {
        // Carrega a seção inicial (dashboard)
        this.navigateTo('dashboard');
    }

    async navigateTo(section) {
        // Atualiza navegação
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === section) {
                link.classList.add('active');
            }
        });

        // Atualiza URL sem recarregar a página
        window.history.pushState({}, '', `#${section}`);
        
        // Carrega o conteúdo da seção
        await this.loadSectionContent(section);
    }

    async loadSectionContent(section) {
        this.showLoading();
        
        try {
            // Aqui você pode implementar a lógica para carregar o conteúdo
            // de cada seção dinamicamente ou mostrar/esconder seções existentes
            this.currentSection = section;
            
            // Dispara evento de mudança de seção
            window.dispatchEvent(new CustomEvent('section:changed', { 
                detail: { section } 
            }));
        } catch (error) {
            console.error('Error loading section:', error);
            this.showError('Erro ao carregar a seção');
        } finally {
            this.hideLoading();
        }
    }

    toggleTheme() {
        const isDark = !document.body.classList.contains(CONFIG.UI.THEME.LIGHT);
        document.body.classList.toggle(CONFIG.UI.THEME.LIGHT);
        localStorage.setItem('theme', isDark ? CONFIG.UI.THEME.LIGHT : CONFIG.UI.THEME.DARK);
    }

    showLoading() {
        document.getElementById('loading-overlay').classList.remove('d-none');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.add('d-none');
    }

    showError(message) {
        // Implementar lógica de exibição de erro
        console.error(message);
    }
}

// Inicializa a UI
const ui = new UI();
