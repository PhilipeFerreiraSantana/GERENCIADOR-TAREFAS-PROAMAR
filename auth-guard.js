(async function() {
    const { data: { session } } = await supabase_client.auth.getSession();

    if (!session) {
        // Se não houver sessão, redireciona para a página de login
        window.location.href = 'login.html';
    }
})();