// Arquivo: config.js

// --- Configurações do seu projeto Supabase ---
const SUPABASE_URL = 'https://xjhongbhakhyjsluudbp.supabase.co';
// --- CHAVE CORRIGIDA ---
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqaG9uZ2JoYWtoeWpzbHV1ZGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NDk0NjcsImV4cCI6MjA3NDIyNTQ2N30.yLro4ZFi-wF8HtaCLgu9BYbyinH-_la_heFxWDEtcPs';
const supabase_client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Exibe uma mensagem de feedback para o usuário.
 * @param {string} message - A mensagem a ser exibida.
 * @param {boolean} isSuccess - Define se a mensagem é de sucesso (verde) ou erro (vermelho).
 */
function showMessage(message, isSuccess) {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
        messageContainer.textContent = message;
        messageContainer.className = isSuccess ? 'message-success' : 'message-error';
        messageContainer.style.display = 'block';
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 3000);
    }
}