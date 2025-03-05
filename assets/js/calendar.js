// Gerenciamento do Calendário e Agendamentos
class Calendar {
    constructor() {
        this.calendar = null;
        this.agendamentosData = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Inicializa quando a seção for carregada
        window.addEventListener('section:changed', (e) => {
            if (e.detail.section === 'agendamento') {
                this.initCalendar();
                this.loadAgendamentos();
            }
        });

        // Filtros
        document.getElementById('btn-filter-agendamentos')?.addEventListener('click', () => {
            this.filterAgendamentos();
        });
    }

    async loadAgendamentos() {
        ui.showLoading();
        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.agendamento}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            this.agendamentosData = await response.json();
            this.updateCalendarEvents();
        } catch (error) {
            console.error('Error loading agendamentos:', error);
            ui.showError('Erro ao carregar agendamentos');
        } finally {
            ui.hideLoading();
        }
    }

    initCalendar() {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;

        if (this.calendar) {
            this.calendar.destroy();
        }

        this.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'pt-br',
            aspectRatio: 1.4,
            height: "auto",
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            buttonText: {
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia'
            },
            eventClick: (info) => this.handleEventClick(info),
            eventDidMount: (info) => {
                // Adiciona tooltip
                const tooltip = new bootstrap.Tooltip(info.el, {
                    title: info.event.title,
                    placement: 'top',
                    trigger: 'hover',
                    container: 'body'
                });
            }
        });

        this.calendar.render();
    }

    updateCalendarEvents() {
        if (!this.calendar || !Array.isArray(this.agendamentosData)) return;

        // Remove eventos existentes
        this.calendar.removeAllEvents();

        // Adiciona novos eventos
        const events = this.agendamentosData.map(item => ({
            title: item.nome_cliente || 'Agendamento',
            start: item.data_agendamento,
            backgroundColor: this.getEventColor(item.tipo),
            extendedProps: {
                email: item.email_cliente,
                telefone: item.telefone_cliente,
                tipo: item.tipo,
                procedimentos: item.procedimentos
            }
        }));

        this.calendar.addEventSource(events);
    }

    getEventColor(tipo) {
        // Você pode personalizar as cores baseado no tipo de agendamento
        const colors = {
            'consulta': '#1E28D9',
            'retorno': '#6368BF',
            'procedimento': '#A68A56',
            'default': '#262840'
        };
        return colors[tipo?.toLowerCase()] || colors.default;
    }

    handleEventClick(info) {
        const event = info.event;
        const ext = event.extendedProps;
        
        const content = `
            <strong>Nome do Cliente:</strong> ${event.title}<br/>
            <strong>Email:</strong> ${ext.email || 'N/D'}<br/>
            <strong>Telefone:</strong> ${ext.telefone || 'N/D'}<br/>
            <strong>Tipo:</strong> ${ext.tipo || 'N/D'}<br/>
            <strong>Procedimentos:</strong> ${ext.procedimentos || 'N/D'}<br/>
        `;

        document.getElementById('event-details-content').innerHTML = content;
        const modalEl = new bootstrap.Modal(document.getElementById('modalEventDetails'));
        modalEl.show();
    }

    filterAgendamentos() {
        const startDate = document.getElementById('filter-start')?.value;
        const endDate = document.getElementById('filter-end')?.value;

        if (!startDate || !endDate) {
            ui.showError('Selecione as datas de início e fim para filtrar');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const filtered = this.agendamentosData.filter(item => {
            if (!item.data_agendamento) return false;
            const itemDate = new Date(item.data_agendamento);
            return itemDate >= start && itemDate <= end;
        });

        // Atualiza a visualização do calendário
        this.calendar.gotoDate(start);
        this.updateCalendarEvents(filtered);
    }
}

// Inicializa o Calendário
const calendar = new Calendar();
