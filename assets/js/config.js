// Configuração dos endpoints da API
const CONFIG = {
    API: {
        // URL base da API - detecta automaticamente o ambiente
        BASE_URL: window.location.hostname.includes('easypanel.host') 
            ? 'https://dashboard-backend.olf8kj.easypanel.host/api'
            : 'http://localhost:3000/api',
        ENDPOINTS: {
            // Autenticação
            login: '/auth/login',
            profile: '/auth/profile',
            register: '/auth/register',
            users: '/auth/users',
            
            // Agendamentos
            agendamento: '/agendamento',
            agendamentoStats: '/agendamento/stats/overview',
            
            // Contatos
            contato: '/contato',
            contatoSearch: '/contato/search',
            contatoStats: '/contato/stats/overview',
            
            // Mensagens
            mensagem: '/mensagem',
            mensagensEnviadas: '/mensagem/history',
            alterarMensagem: '/mensagem',  // PUT para Id específico
            geradorTemplate: '/mensagem/generate',
            enviarMensagem: '/mensagem/send'
        }
    },
    UI: {
        THEME: {
            LIGHT: 'light-mode',
            DARK: 'dark-mode'
        },
        ANIMATION: {
            DURATION: 300
        }
    }
};
