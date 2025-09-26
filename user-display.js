// Arquivo: user-display.js

document.addEventListener('DOMContentLoaded', async () => {
    // Não executa na página de login
    if (window.location.pathname.endsWith('/login.html')) {
        return;
    }

    // Pega o usuário da sessão atual
    const { data: { user } } = await supabase_client.auth.getUser();

    if (user) {
        // Busca o perfil do usuário para obter o alias
        const { data: profile, error } = await supabase_client
            .from('profiles')
            .select('alias, email')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Erro ao buscar perfil do usuário:', error);
            return;
        }

        // Define o nome de exibição: usa o alias, ou o email como fallback
        const displayName = profile.alias || profile.email;

        // Cria o elemento HTML que será exibido
        const userInfoDiv = document.createElement('div');
        userInfoDiv.id = 'user-info-display';
        userInfoDiv.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
            </svg>
            <span>${displayName}</span>
        `;

        // Cria o estilo CSS para o elemento
        const style = document.createElement('style');
        style.textContent = `
            #user-info-display {
                position: fixed;
                top: 10px;
                right: 20px;
                background-color: rgba(0, 0, 0, 0.5);
                color: white;
                padding: 8px 15px;
                border-radius: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 14px;
                font-family: sans-serif;
                z-index: 1000;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
        `;

        // Adiciona o estilo e o elemento HTML à página
        document.head.appendChild(style);
        document.body.appendChild(userInfoDiv);
    }
});