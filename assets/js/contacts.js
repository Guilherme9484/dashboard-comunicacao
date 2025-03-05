// Gerenciamento de Contatos
class Contacts {
    constructor() {
        this.contatosData = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Carrega contatos quando a seção for ativada
        window.addEventListener('section:changed', (e) => {
            if (e.detail.section === 'contato') {
                this.loadContatos();
            }
        });

        // Filtros e busca
        document.getElementById('search-contato')?.addEventListener('input', () => this.filterContatos());
        document.getElementById('filter-envio')?.addEventListener('change', () => this.filterContatos());

        // Exportação
        document.getElementById('btn-export-excel')?.addEventListener('click', () => this.exportToExcel());
        document.getElementById('btn-export-pdf')?.addEventListener('click', () => this.exportToPDF());
    }

    async loadContatos() {
        ui.showLoading();
        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.contato}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            this.contatosData = await response.json();
            this.displayContatos(this.contatosData);
        } catch (error) {
            console.error('Error loading contatos:', error);
            ui.showError('Erro ao carregar contatos');
        } finally {
            ui.hideLoading();
        }
    }

    displayContatos(contatos) {
        const container = document.getElementById('contato-output');
        if (!container || !Array.isArray(contatos)) return;

        container.innerHTML = '';

        if (contatos.length === 0) {
            container.innerHTML = '<div class="alert alert-info">Nenhum contato encontrado.</div>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'table table-striped';
        
        // Cabeçalho
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Status</th>
                <th>Ações</th>
            </tr>
        `;
        table.appendChild(thead);

        // Corpo da tabela
        const tbody = document.createElement('tbody');
        contatos.forEach(contato => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${contato.nome_cliente || contato.nome_subscriber || 'N/D'}</td>
                <td>${contato.email || 'N/D'}</td>
                <td>${contato.telefone || 'N/D'}</td>
                <td>${contato.mensagem_enviada ? 'Enviado' : 'Pendente'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="contacts.viewDetails('${contato.id}')">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        container.appendChild(table);
    }

    filterContatos() {
        const searchValue = document.getElementById('search-contato')?.value.toLowerCase();
        const envioValue = document.getElementById('filter-envio')?.value;

        let filtered = [...this.contatosData];

        if (searchValue) {
            filtered = filtered.filter(item => {
                const nome = (item.nome_cliente || item.nome_subscriber || "").toLowerCase();
                const email = (item.email || "").toLowerCase();
                const telefone = (item.telefone || "").toLowerCase();
                return nome.includes(searchValue) || 
                       email.includes(searchValue) || 
                       telefone.includes(searchValue);
            });
        }

        if (envioValue !== "") {
            filtered = filtered.filter(item => 
                String(item.mensagem_enviada) === envioValue
            );
        }

        this.displayContatos(filtered);
    }

    async exportToExcel() {
        if (!this.contatosData || this.contatosData.length === 0) {
            ui.showError('Não há dados para exportar');
            return;
        }

        // Prepara os dados para exportação
        const exportData = this.contatosData.map(contato => ({
            Nome: contato.nome_cliente || contato.nome_subscriber || 'N/D',
            Email: contato.email || 'N/D',
            Telefone: contato.telefone || 'N/D',
            Status: contato.mensagem_enviada ? 'Enviado' : 'Pendente',
            'Data Cadastro': contato.created_at ? new Date(contato.created_at).toLocaleDateString('pt-BR') : 'N/D'
        }));

        // Cria a planilha
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Contatos");

        // Exporta o arquivo
        XLSX.writeFile(wb, `contatos_${new Date().toISOString().split('T')[0]}.xlsx`);
    }

    async exportToPDF() {
        if (!this.contatosData || this.contatosData.length === 0) {
            ui.showError('Não há dados para exportar');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Configurações do documento
        doc.setFont("helvetica");
        doc.setFontSize(16);
        doc.text("Lista de Contatos", 14, 15);
        doc.setFontSize(10);

        // Cabeçalho da tabela
        const headers = ["Nome", "Email", "Telefone", "Status"];
        let yPos = 25;
        const lineHeight = 7;

        // Adiciona os dados
        this.contatosData.forEach((contato, index) => {
            if (yPos > 280) {
                doc.addPage();
                yPos = 20;
            }

            doc.text([
                contato.nome_cliente || contato.nome_subscriber || 'N/D',
                contato.email || 'N/D',
                contato.telefone || 'N/D',
                contato.mensagem_enviada ? 'Enviado' : 'Pendente'
            ].join(" | "), 14, yPos);

            yPos += lineHeight;
        });

        // Salva o PDF
        doc.save(`contatos_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    viewDetails(id) {
        const contato = this.contatosData.find(c => c.id === id);
        if (!contato) return;

        // Aqui você pode implementar a lógica para mostrar mais detalhes do contato
        // Por exemplo, abrir um modal com todas as informações
        console.log('Detalhes do contato:', contato);
    }
}

// Inicializa os Contatos
const contacts = new Contacts();
