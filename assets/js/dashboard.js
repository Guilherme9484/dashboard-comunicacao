// Gerenciamento do Dashboard
class Dashboard {
    constructor() {
        this.charts = {
            status: null,
            timeline: null
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Atualizar dashboard quando a seção for carregada
        window.addEventListener('section:changed', (e) => {
            if (e.detail.section === 'dashboard') {
                this.loadDashboardData();
            }
        });

        // Botão de atualização
        document.getElementById('refresh-dashboard')?.addEventListener('click', () => {
            this.loadDashboardData();
        });
    }

    async loadDashboardData() {
        ui.showLoading();
        try {
            const [agendamentos, contatos, mensagem, msgsEnviadas] = await Promise.all([
                this.fetchData('agendamento'),
                this.fetchData('contato'),
                this.fetchData('mensagem'),
                this.fetchData('mensagensEnviadas')
            ]);

            this.updateCounters({
                agendamentos: Array.isArray(agendamentos) ? agendamentos.length : 0,
                enviadas: Array.isArray(msgsEnviadas) ? msgsEnviadas.length : 0,
                pendentes: 0,
                falhas: 0
            });

            this.updateCharts({
                enviadas: msgsEnviadas || [],
                pendentes: [],
                falhas: []
            });

            this.updateRecentMessages(msgsEnviadas || []);

        } catch (error) {
            console.error('Error loading dashboard:', error);
            ui.showError('Erro ao carregar dados do dashboard');
        } finally {
            ui.hideLoading();
        }
    }

    async fetchData(endpoint) {
        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS[endpoint]}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return null;
        }
    }

    updateCounters({ agendamentos, enviadas, pendentes, falhas }) {
        document.getElementById('appointments-count').textContent = agendamentos;
        document.getElementById('sent-count').textContent = enviadas;
        document.getElementById('pending-count').textContent = pendentes;
        document.getElementById('failed-count').textContent = falhas;
    }

    updateCharts({ enviadas, pendentes, falhas }) {
        this.updateStatusChart(enviadas.length, pendentes.length, falhas.length);
        this.updateTimelineChart(enviadas);
    }

    updateStatusChart(sent, pending, failed) {
        const ctx = document.getElementById('status-chart')?.getContext('2d');
        if (!ctx) return;

        if (this.charts.status) {
            this.charts.status.destroy();
        }

        this.charts.status = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Enviadas', 'Pendentes', 'Falhas'],
                datasets: [{
                    data: [sent, pending, failed],
                    backgroundColor: [
                        'rgba(30, 40, 217, 0.7)',
                        'rgba(240, 173, 78, 0.7)',
                        'rgba(217, 83, 79, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    updateTimelineChart(messages) {
        const ctx = document.getElementById('timeline-chart')?.getContext('2d');
        if (!ctx) return;

        if (this.charts.timeline) {
            this.charts.timeline.destroy();
        }

        const timelineData = this.processTimelineData(messages);

        this.charts.timeline = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timelineData.labels,
                datasets: [
                    {
                        label: 'Enviadas',
                        data: timelineData.sent,
                        borderColor: 'rgba(30, 40, 217, 1)',
                        backgroundColor: 'rgba(30, 40, 217, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    processTimelineData(messages) {
        const days = [];
        const sent = [];

        // Últimos 7 dias
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('pt-BR', { weekday: 'short' }));

            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            const dayMessages = messages.filter(m => {
                if (!m.created_at) return false;
                const msgDate = new Date(m.created_at);
                return msgDate >= dayStart && msgDate <= dayEnd;
            });

            sent.push(dayMessages.length);
        }

        return { labels: days, sent };
    }

    updateRecentMessages(messages) {
        const tableBody = document.getElementById('recent-messages-table');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        
        const recent = messages
            .filter(m => m.created_at)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 8);

        recent.forEach(m => {
            const tr = document.createElement('tr');
            const date = new Date(m.created_at);
            const formattedDate = date.toLocaleDateString('pt-BR') + ' ' +
                                date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const destinatario = m.email || m.telefone || 'N/D';
            const status = (m.nome && m.nome.toLowerCase().includes('finalizado')) ? 'Finalizado' : 'N/D';
            
            tr.innerHTML = `
                <td>${formattedDate}</td>
                <td>${destinatario}</td>
                <td>${status}</td>
            `;
            tableBody.appendChild(tr);
        });
    }
}

// Inicializa o Dashboard
const dashboard = new Dashboard();
