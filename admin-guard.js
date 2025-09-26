(async function() {
    // Pega o usuário da sessão atual
    const { data: { user } } = await supabase_client.auth.getUser();

    if (user) {
        // Busca o perfil do usuário logado na nossa tabela 'profiles'
        const { data: profile, error } = await supabase_client
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single(); // .single() para pegar apenas um resultado

        // Se o perfil não for 'master', nega o acesso
        if (error || !profile || profile.role !== 'master') {
            alert('Acesso negado. Você não tem permissão para ver esta página.');
            window.location.href = 'index.html'; // Redireciona para a página inicial
        }
        // Se for 'master', não faz nada e permite que a página carregue
    }
})();