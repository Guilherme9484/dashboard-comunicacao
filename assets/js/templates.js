// Gerenciamento de Templates
class Templates {
    constructor() {
        this.tentativasGeracao = 0;
        this.maxTentativas = 2;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Botões de template
        document.getElementById('btn-abrir-gerar-template')?.addEventListener('click', () => {
            this.resetTemplateModal();
        });

        document.getElementById('btn-gerar-template')?.addEventListener('click', () => {
            this.gerarTemplates();
        });

        document.getElementById('btn-aplicar-template')?.addEventListener('click', () => {
            this.aplicarTemplateGerado();
        });
    }

    resetTemplateModal() {
        document.getElementById('descricao-template').value = '';
        document.getElementById('templates-list').innerHTML = '';
        document.getElementById('templates-list').classList.add('d-none');
        document.getElementById('btn-aplicar-template').classList.add('d-none');
        document.getElementById('alert-limite-tentativas').classList.add('d-none');
        this.tentativasGeracao = 0;
    }

    async gerarTemplates() {
        if (this.tentativasGeracao >= this.maxTentativas) {
            document.getElementById('alert-limite-tentativas').classList.remove('d-none');
            return;
        }

        const descricao = document.getElementById('descricao-template')?.value.trim();
        if (!descricao) {
            ui.showError('Descreva o que deseja no template antes de gerar');
            return;
        }

        this.tentativasGeracao++;
        document.getElementById('spinner-template').style.display = 'block';

        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.geradorTemplate}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ descricao })
            });

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            this.displayTemplates(result);

        } catch (error) {
            console.error('Error generating templates:', error);
            ui.showError('Erro ao gerar templates');
        } finally {
            document.getElementById('spinner-template').style.display = 'none';
        }
    }

    displayTemplates(templates) {
        if (!Array.isArray(templates) || templates.length === 0) {
            ui.showError('Nenhum template recebido ou formato inválido');
            return;
        }

        const listEl = document.getElementById('templates-list');
        listEl.innerHTML = '';

        templates.forEach((template, index) => {
            const templateText = typeof template === 'object' ? 
                               Object.values(template)[0] : template;

            const div = document.createElement('div');
            div.className = 'form-check mb-2';
            div.innerHTML = `
                <input class="form-check-input" type="radio" 
                       name="templateRadio" id="templateRadio${index}" 
                       value="${index}">
                <label class="form-check-label" for="templateRadio${index}">
                    <pre style="white-space: pre-wrap; font-family: inherit;">${templateText}</pre>
                </label>
            `;
            listEl.appendChild(div);
        });

        listEl.classList.remove('d-none');
        document.getElementById('btn-aplicar-template').classList.remove('d-none');
    }

    async aplicarTemplateGerado() {
        const selectedRadio = document.querySelector('input[name="templateRadio"]:checked');
        if (!selectedRadio) {
            ui.showError('Selecione um template antes de aplicar');
            return;
        }

        const templateIndex = parseInt(selectedRadio.value, 10);
        const templatePre = document.querySelectorAll('#templates-list pre')[templateIndex];
        
        if (!templatePre) {
            ui.showError('Erro ao recuperar o texto do template');
            return;
        }

        const textoSelecionado = templatePre.textContent;

        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.alterarMensagem}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: "1", // ID padrão para template principal
                    texto: textoSelecionado 
                })
            });

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            // Fecha o modal
            const modalEl = bootstrap.Modal.getInstance(document.getElementById('modalGerarTemplate'));
            modalEl?.hide();

            // Recarrega as mensagens
            window.dispatchEvent(new CustomEvent('section:changed', { 
                detail: { section: 'mensagem' } 
            }));

        } catch (error) {
            console.error('Error applying template:', error);
            ui.showError('Erro ao aplicar template');
        }
    }
}

// Inicializa os Templates
const templates = new Templates();
