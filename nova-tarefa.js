// Arquivo: nova-tarefa.js
// OBS: A inicialização do supabase_client e a função showMessage agora vêm do config.js

/**
 * Formata uma string de data (YYYY-MM-DD) para o formato DD/MM/YYYY.
 * @param {string} dataString - A data no formato YYYY-MM-DD.
 * @returns {string} - A data formatada ou 'N/A'.
 */
function formatarData(dataString) {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    if (isNaN(data.getTime())) {
        return 'N/A';
    }
    // Ajusta o fuso horário para exibir a data corretamente
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// --- LÓGICA DA PÁGINA: alterar-tarefa.html ---
function inicializarPaginaAlterar() {
    const tarefasContainer = document.getElementById('tarefas-container');
    if (!tarefasContainer) return; // Encerra se não estiver na página correta

    const loadingSpinner = document.getElementById('loading-spinner');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmYes = document.getElementById('confirm-yes');
    const confirmNo = document.getElementById('confirm-no');
    let tarefaIdParaExcluir = null;

    const mensagem = localStorage.getItem('tarefaAtualizada');
    if (mensagem) {
        showMessage("Tarefa atualizada com sucesso!", true);
        localStorage.removeItem('tarefaAtualizada');
    }
    carregarTarefas();

    async function carregarTarefas() {
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        const { data: tarefas, error } = await supabase_client
            .from('tarefas')
            .select(`id, codigo, titulo, status, porto:porto_id(nome), armador:armador_id(nome)`)
            .order('dataInicio', { ascending: false });

        if (error) {
            console.error("Erro ao carregar tarefas:", error);
            if (loadingSpinner) loadingSpinner.textContent = 'Erro ao carregar as tarefas.';
            return;
        }
        renderizarTarefas(tarefas);
    }

    function renderizarTarefas(tarefas) {
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        tarefasContainer.innerHTML = '';
        if (!tarefas || tarefas.length === 0) {
            tarefasContainer.innerHTML = '<p class="text-center text-secondary">Nenhuma tarefa encontrada.</p>';
            return;
        }
        const table = document.createElement('table');
        table.className = 'table w-full';
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        thead.innerHTML = `<tr><th>Cód.</th><th>Título</th><th>Porto</th><th>Armador</th><th>Status</th><th>Ações</th></tr>`;
        tarefas.forEach(tarefa => {
            const codigoCurto = tarefa.codigo ? String(tarefa.codigo).slice(-4) : '';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${codigoCurto}</td>
                <td><a href="detalhar-tarefa.html?id=${tarefa.id}" class="detalhe-link" title="Ver detalhes">${tarefa.titulo || ''}</a></td>
                <td>${tarefa.porto ? tarefa.porto.nome : 'N/A'}</td>
                <td>${tarefa.armador ? tarefa.armador.nome : 'N/A'}</td>
                <td>${tarefa.status || ''}</td>
                <td class="actions-cell">
                    <a href="editar-tarefa.html?id=${tarefa.id}" class="action-button alterar-button">Alterar</a>
                    <button class="action-button excluir-button" data-id="${tarefa.id}">Excluir</button>
                </td>`;
            tbody.appendChild(tr);
        });
        table.appendChild(thead);
        table.appendChild(tbody);
        tarefasContainer.appendChild(table);
    }

    tarefasContainer.addEventListener('click', (e) => {
        const targetButton = e.target.closest('.excluir-button');
        if (targetButton) {
            tarefaIdParaExcluir = targetButton.dataset.id;
            if (confirmModal) confirmModal.style.display = 'block';
        }
    });

    if (confirmYes) {
        confirmYes.addEventListener('click', async () => {
            if (tarefaIdParaExcluir) {
                const { error } = await supabase_client.from('tarefas').delete().eq('id', tarefaIdParaExcluir);
                if (error) {
                    showMessage(`Erro ao excluir tarefa: ${error.message}`, false);
                } else {
                    showMessage("Tarefa excluída com sucesso!", true);
                    carregarTarefas();
                }
            }
            if (confirmModal) confirmModal.style.display = 'none';
            tarefaIdParaExcluir = null;
        });
    }

    if (confirmNo) {
        confirmNo.addEventListener('click', () => {
            if (confirmModal) confirmModal.style.display = 'none';
            tarefaIdParaExcluir = null;
        });
    }
}

// --- LÓGICA DA PÁGINA: detalhar-tarefa.html ---
async function inicializarPaginaDetalhes() {
    const detalhesContainer = document.getElementById('detalhes-tarefa-container');
    if (!detalhesContainer) return; // Encerra se não estiver na página correta

    const loadingDetails = document.getElementById('loading-details');
    const urlParams = new URLSearchParams(window.location.search);
    const tarefaId = urlParams.get('id');

    if (!tarefaId) {
        loadingDetails.textContent = 'ID da tarefa não encontrado na URL.';
        return;
    }

    try {
        const { data: tarefa, error } = await supabase_client
            .from('tarefas')
            .select(`*, porto:porto_id(nome), armador:armador_id(nome), embarcacao:embarcacao_id(nome), solicitante:solicitante_id(nome), tipo:tipo_id(nome)`)
            .eq('id', tarefaId)
            .single();
        
        if (error || !tarefa) {
            detalhesContainer.innerHTML = '<p>Erro: Tarefa não encontrada.</p>';
            console.error("Erro ao carregar detalhes:", error);
            return;
        }

        const detalhesHTML = `
            <div class="card-detalhes">
                <h3>Detalhes da Tarefa Cód. ${tarefa.codigo.slice(-4)}</h3>
                <p><strong>Código Completo:</strong> ${tarefa.codigo}</p>
                <p><strong>Título:</strong> ${tarefa.titulo || 'N/A'}</p>
                <p><strong>Porto:</strong> ${tarefa.porto ? tarefa.porto.nome : 'N/A'}</p>
                <p><strong>Armador:</strong> ${tarefa.armador ? tarefa.armador.nome : 'N/A'}</p>
                <p><strong>Embarcação:</strong> ${tarefa.embarcacao ? tarefa.embarcacao.nome : 'N/A'}</p>
                <p><strong>Solicitante:</strong> ${tarefa.solicitante ? tarefa.solicitante.nome : 'N/A'}</p>
                <p><strong>Tipo:</strong> ${tarefa.tipo ? tarefa.tipo.nome : 'N/A'}</p>
                <p><strong>Status:</strong> ${tarefa.status || 'N/A'}</p>
                <p><strong>Data de Início:</strong> ${formatarData(tarefa.dataInicio)}</p>
                <p><strong>Protocolo:</strong> ${tarefa.protocolo || 'N/A'}</p>
                <p><strong>Data do Fim:</strong> ${formatarData(tarefa.dataFim)}</p>
                <p><strong>Observações:</strong> ${tarefa.observacoes || 'N/A'}</p>
                ${tarefa.urlEvidencia ? `<p><strong>Evidência:</strong> <a href="${tarefa.urlEvidencia}" target="_blank">Ver Evidência</a></p>` : ''}
            </div>`;
        detalhesContainer.innerHTML = detalhesHTML;

    } catch (e) {
        console.error("Erro ao processar detalhes da tarefa: ", e);
        detalhesContainer.innerHTML = '<p>Ocorreu um erro ao carregar os detalhes da tarefa.</p>';
    } finally {
        if (loadingDetails) loadingDetails.style.display = 'none';
    }
}

// --- INICIALIZADOR GERAL ---
// Executa o código apropriado dependendo da página em que o script foi carregado.
document.addEventListener('DOMContentLoaded', () => {
    inicializarPaginaAlterar();
    inicializarPaginaDetalhes();
});