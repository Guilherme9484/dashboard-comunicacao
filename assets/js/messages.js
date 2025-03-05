// Gerenciamento de Mensagens
class Messages {
    constructor() {
        this.mensagensData = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Carrega mensagens quando a seção for ativada
        window.addEventListener('section:changed', (e) => {
            if (e.detail.section === 'mensagem') {
                this.loadMensagens();
            } else if (e.detail.section === 'mensagens-enviadas') {
                this.loadMensagensEnviadas();
            }
        });

        // Alteração de mensagem
        document.getElementById('btn-alterar-mensagem')?.addEventListener('click', () => {
            this.alterarMensagem();
        });

        // Busca de mensagens enviadas
        document.getElementById('search-enviadas')?.addEventListener('input', () => {
            this.filterMensagensEnviadas();
        });

        // Agrupamento
        document.getElementById('check-agrupadas')?.addEventListener('change', () => {
            this.filterMensagensEnviadas();
        });
    }

    async loadMensagens() {
        ui.showLoading();
        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.mensagem}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            this.displayMensagens(data);
        } catch (error) {
            console.error('Error loading mensagens:', error);
            ui.showError('Erro ao carregar mensagens');
        } finally {
            ui.hideLoading();
        }
    }

    async loadMensagensEnviadas() {
        ui.showLoading();
        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.mensagensEnviadas}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            this.mensagensData = await response.json();
            this.displayMensagensEnviadas(this.mensagensData);
        } catch (error) {
            console.error('Error loading mensagens enviadas:', error);
            ui.showError('Erro ao carregar mensagens enviadas');
        } finally {
            ui.hideLoading();
        }
    }

    displayMensagens(mensagens) {
        const container = document.getElementById('mensagem-output');
        if (!container || !Array.isArray(mensagens)) return;

        container.innerHTML = '';

        if (mensagens.length === 0) {
            container.innerHTML = '<div class="alert alert-info">Nenhuma mensagem disponível.</div>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'table table-striped';
        
        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Texto</th>
                    <th>Status</th>
                    <th>Última Atualização</th>
                </tr>
            </thead>
            <tbody>
                ${mensagens.map(msg => `
                    <tr>
                        <td>${msg.id || 'N/D'}</td>
                        <td>${msg.texto || 'N/D'}</td>
                        <td>${msg.status || 'Ativo'}</td>
                        <td>${msg.updated_at ? new Date(msg.updated_at).toLocaleString('pt-BR') : 'N/D'}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        container.appendChild(table);
    }

    displayMensagensEnviadas(mensagens) {
        const container = document.getElementById('mensagens-enviadas-output');
        if (!container || !Array.isArray(mensagens)) return;

        container.innerHTML = '';

        if (mensagens.length === 0) {
            container.innerHTML = '<div class="alert alert-info">Nenhuma mensagem enviada.</div>';
            return;
        }

        // Verifica se deve agrupar mensagens
        const agrupar = document.getElementById('check-agrupadas')?.checked;
        
        let mensagensProcessadas = mensagens;
        if (agrupar) {
            const grupos = {};
            mensagens.forEach(msg => {
                const key = msg.texto || 'sem_texto';
                if (!grupos[key]) {
                    grupos[key] = {
                        ...msg,
                        count: 1,
                        destinatarios: [msg.email || msg.telefone || 'N/D']
                    };
                } else {
                    grupos[key].count++;
                    grupos[key].destinatarios.push(msg.email || msg.telefone || 'N/D');
                }
            });
            mensagensProcessadas = Object.values(grupos);
        }

        const table = document.createElement('table');
        table.className = 'table table-striped';
        
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Destinatário</th>
                    <th>Mensagem</th>
                    ${agrupar ? '<th>Quantidade</th>' : ''}
                </tr>
            </thead>
            <tbody>
                ${mensagensProcessadas.map(msg => `
                    <tr>
                        <td>${msg.created_at ? new Date(msg.created_at).toLocaleString('pt-BR') : 'N/D'}</td>
                        <td>${agrupar ? 
                            `Múltiplos (${msg.count})` : 
                            (msg.email || msg.telefone || 'N/D')}</td>
                        <td>${msg.texto || 'N/D'}</td>
                        ${agrupar ? `<td>${msg.count}</td>` : ''}
                    </tr>
                `).join('')}
            </tbody>
        `;

        container.appendChild(table);
    }

    async alterarMensagem() {
        const id = document.getElementById('alterar-mensagem-id')?.value.trim();
        const novoTexto = document.getElementById('alterar-mensagem-txt')?.value.trim();

        if (!id || !novoTexto) {
            ui.showError('Por favor, insira o ID e o novo texto');
            return;
        }

        ui.showLoading();
        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.alterarMensagem}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, texto: novoTexto })
            });
            
            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }

            // Limpa os campos
            document.getElementById('alterar-mensagem-id').value = '';
            document.getElementById('alterar-mensagem-txt').value = '';

            // Recarrega as mensagens
            this.loadMensagens();

        } catch (error) {
            console.error('Error updating message:', error);
            ui.showError('Erro ao atualizar mensagem');
        } finally {
            ui.hideLoading();
        }
    }

    filterMensagensEnviadas() {
        const searchValue = document.getElementById('search-enviadas')?.value.toLowerCase();
        if (!searchValue) {
            this.displayMensagensEnviadas(this.mensagensData);
            return;
        }

        const filtered = this.mensagensData.filter(msg => {
            const texto = (msg.texto || '').toLowerCase();
            const destinatario = (msg.email || msg.telefone || '').toLowerCase();
            return texto.includes(searchValue) || destinatario.includes(searchValue);
        });

        this.displayMensagensEnviadas(filtered);
    }
}

// Inicializa as Mensagens
const messages = new Messages();
