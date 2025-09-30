function resetarEstadoVisual() {
    console.log('🧹 Resetando estado visual...');
    
    // Resetar todos os corações
    setTimeout(() => {
        document.querySelectorAll('.heart').forEach(heart => {
            heart.classList.remove('filled', 'active');
        });
        
        // Resetar badges
        const badgeSelecionadas = document.querySelector('#tab-selecionadas .tab-badge');
        const badgeAvaliacoes = document.querySelector('#tab-avaliacoes .tab-badge');
        if (badgeSelecionadas) badgeSelecionadas.textContent = '0';
        if (badgeAvaliacoes) badgeAvaliacoes.textContent = '0';
        
        // Limpar lista de avaliações
        const avaliacoesContainer = document.getElementById('avaliacoes_lista');
        if (avaliacoesContainer) {
            avaliacoesContainer.innerHTML = '<div class="no-avaliacoes">Nenhuma avaliação ainda.<br>Clique nos corações nas atividades para avaliar!</div>';
        }
        
        console.log('✅ Estado visual resetado');
    }, 100);
}// Função original para quando acessar a aba (carrega do localStorage)
function atualizarListaAvaliacoes() {
    const avaliacoesContainer = document.getElementById('avaliacoes_lista');
    if (!avaliacoesContainer) return;
    
    let avaliacoesHtml = '';
    let contadorAvaliacoes = 0;
    
    // Filtrar avaliações válidas do localStorage
    const avaliacoesValidas = Object.entries(activityRatings).filter(([_, rating]) => rating > 0);
    
    if (avaliacoesValidas.length > 0) {
        // Ordenar por rating (maior para menor)
        avaliacoesValidas.sort(([,a], [,b]) => b - a);
        
        avaliacoesValidas.forEach(([activityId, rating]) => {
            const activityCard = document.querySelector(`[data-activity-id="${activityId}"]`);
            
            if (activityCard) {
                const nomeAtividade = activityCard.querySelector('.activity-title')?.textContent.trim() || 'Atividade sem nome';
                const coracoes = '♥'.repeat(rating);
                const nomeReduzido = nomeAtividade.length > 22 ? 
                    nomeAtividade.substring(0, 19) + '...' : nomeAtividade;
                
                avaliacoesHtml += `
                    <div class="avaliacao-item">
                        <span class="avaliacao-nome" title="${nomeAtividade}">${nomeReduzido}</span>
                        <span class="avaliacao-coracao">${coracoes}</span>
                    </div>
                `;
                contadorAvaliacoes++;
            }
        });
    }
    
    if (avaliacoesHtml === '') {
        avaliacoesHtml = '<div class="no-avaliacoes">Nenhuma avaliação ainda.<br>Clique nos corações nas atividades para avaliar!</div>';
    }
    
    avaliacoesContainer.innerHTML = avaliacoesHtml;
    atualizarBadgeAvaliacoes(contadorAvaliacoes);
}// ===== CONFIGURAÇÕES INICIAIS =====
const API_COTACAO = "https://api.exchangerate.host/latest?base=BRL&symbols=ARS,USD";
let cotacao = { ars: 0.00, usd: 0.00, brl: 1 };
let activityRatings = {};

// ===== FUNÇÕES DE FORMATAÇÃO =====
function formatBRL(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatUSD(valor) {
    return valor.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

// ===== SISTEMA DE COTAÇÃO =====
function atualizarCotacaoPainel() {
    const painelCot = document.getElementById('painel-cotacao');
    if (painelCot) {
        painelCot.innerHTML = `<span>Cotação atual: 1 BRL <br> ${cotacao.ars ? cotacao.ars.toFixed(2) : "-"} ARS | 1 USD = ${cotacao.usd ? cotacao.usd.toFixed(2) : "-"} BRL</span>`;
    }
}

function carregarCotacao(callback) {
    fetch(API_COTACAO)
        .then(resp => resp.json())
        .then(data => {
            cotacao.ars = data.rates.ARS;
            cotacao.usd = data.rates.USD;
            atualizarCotacaoPainel();
            if (callback) callback();
        })
        .catch(() => {
            cotacao.ars = 256; // fallback
            cotacao.usd = 5.31;
            atualizarCotacaoPainel();
            if (callback) callback();
        });
}

// ===== SISTEMA DE TOTAIS =====
function atualizarTotal() {
    let total = 3078;
    let lista_atracoes = '';
    let contadorSelecionadas = 0;
    
    document.querySelectorAll('.detail-checkbox:checked').forEach(cb => {
        const valor = parseFloat(cb.getAttribute('data-value'));
        const moeda = cb.getAttribute('data-moeda');
        let valReal = 0;
        
        if (moeda === 'ars') valReal = valor / cotacao.ars;
        else if (moeda === 'usd') valReal = valor * cotacao.usd;
        else valReal = valor;
        
        total += valReal;
        
        const id = cb.id;
        const label = document.querySelector(`label[for="${id}"]`);
        let atracaoTexto = 'Atração não encontrada';
        
        if (label) {
            const atracaoSpan = label.querySelector('.atracao');
            atracaoTexto = atracaoSpan ? atracaoSpan.textContent : 'Atração não encontrada';
        }
        
        lista_atracoes += '- ' + atracaoTexto + '\n';
        contadorSelecionadas++;
    });
    
    const total_brl = total;
    const total_usd = total / cotacao.usd;
    
    const painelValor = document.getElementById('painel-total-valor');
    const listaAtividades = document.getElementById('lista_atividades');
    
    if (painelValor) {
        painelValor.textContent = formatBRL(total_brl) + ' / ' + formatUSD(total_usd) + ' USD';
    }
    
    if (listaAtividades) {
        listaAtividades.textContent = lista_atracoes;
    }
    
    atualizarBadgeSelecionadas(contadorSelecionadas);
}

// ===== SISTEMA DE ABAS (SAIBA MAIS / ONDE COMPRAR) =====
function toggleSaibaMais(el) {
    const card = el.closest('.activity-card');
    const saiba = card.querySelector('.saiba-mais-content');
    const onde = card.querySelector('.onde-comprar-content');
    
    if (saiba.classList.contains('expanded')) {
        saiba.classList.remove('expanded');
        el.innerHTML = '📖 Saiba Mais ▼';
    } else {
        if (onde && onde.classList.contains('expanded')) {
            const ondeLink = card.querySelector('.onde-comprar-link');
            if (ondeLink) ondeLink.innerHTML = '💳 Onde Comprar ▼';
            onde.classList.remove('expanded');
        }
        saiba.classList.add('expanded');
        el.innerHTML = '📖 Saiba Mais ▲';
    }
}

function toggleDropdown(el) {
    const card = el.closest('.activity-card');
    const saiba = card.querySelector('.saiba-mais-content');
    const onde = card.querySelector('.onde-comprar-content');
    
    if (onde.classList.contains('expanded')) {
        onde.classList.remove('expanded');
        el.innerHTML = '💳 Onde Comprar ▼';
    } else {
        if (saiba && saiba.classList.contains('expanded')) {
            const saibaLink = card.querySelector('.saiba-mais');
            if (saibaLink) saibaLink.innerHTML = '📖 Saiba Mais ▼';
            saiba.classList.remove('expanded');
        }
        onde.classList.add('expanded');
        el.innerHTML = '💳 Onde Comprar ▲';
    }
}

// Fechar abas ao clicar fora
document.addEventListener('click', function(event) {
    document.querySelectorAll('.activity-card').forEach(function(card) {
        if (!card.contains(event.target)) {
            const saiba = card.querySelector('.saiba-mais-content');
            const onde = card.querySelector('.onde-comprar-content');
            
            if (saiba && saiba.classList.contains('expanded')) {
                saiba.classList.remove('expanded');
                const saibaLink = card.querySelector('.saiba-mais');
                if (saibaLink) saibaLink.innerHTML = '📖 Saiba Mais ▼';
            }
            
            if (onde && onde.classList.contains('expanded')) {
                onde.classList.remove('expanded');
                const ondeLink = card.querySelector('.onde-comprar-link');
                if (ondeLink) ondeLink.innerHTML = '💳 Onde Comprar ▼';
            }
        }
    });
});

// ===== SISTEMA DE FILTROS =====
function filterActivities(type) {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    const cards = document.querySelectorAll('.activity-card');
    cards.forEach(card => {
        if (type === 'todos') {
            card.style.display = 'block';
        } else if (card.getAttribute('data-type').includes(type)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// ===== SISTEMA DE AVALIAÇÕES =====
function saveRatings() {
    localStorage.setItem('bariloche_ratings', JSON.stringify(activityRatings));
}

function loadRatings() {
    // Função mantida para compatibilidade, mas sempre retorna vazio
    activityRatings = {};
    console.log('Sistema configurado para sempre iniciar limpo');
}

function createRatingElement(activityId) {
    const ratingContainer = document.createElement('div');
    ratingContainer.className = 'rating-container';
    
    const label = document.createElement('span');
    label.className = 'rating-label';
    label.textContent = 'Avaliação:';
    
    const heartsContainer = document.createElement('div');
    heartsContainer.className = 'rating-hearts';
    
    for (let i = 1; i <= 5; i++) {
        const heart = document.createElement('span');
        heart.className = 'heart';
        heart.innerHTML = '♥';
        heart.dataset.rating = i;
        heart.dataset.activityId = activityId;
        
        heart.addEventListener('click', (e) => {
            setRating(activityId, i);
            e.stopPropagation();
        });
        
        heartsContainer.appendChild(heart);
    }
    
    ratingContainer.appendChild(label);
    ratingContainer.appendChild(heartsContainer);
    
    return ratingContainer;
}

function setRating(activityId, rating) {
    activityRatings[activityId] = rating;
    updateHeartDisplay(activityId, rating);
    saveRatings();
    
    // Atualizar APENAS a lista (sem aplicar outras avaliações)
    setTimeout(() => {
        atualizarListaAvaliacoesAtual();
    }, 100);
}

function updateHeartDisplay(activityId, rating) {
    const hearts = document.querySelectorAll(`[data-activity-id="${activityId}"]`);
    
    hearts.forEach((heart) => {
        const heartRating = parseInt(heart.dataset.rating);
        heart.classList.remove('filled', 'active');
        
        if (heartRating <= rating) {
            heart.classList.add('filled');
            if (heartRating === rating) {
                heart.classList.add('active');
                setTimeout(() => heart.classList.remove('active'), 300);
            }
        }
    });
}

function addRatingToCards() {
    const activityCards = document.querySelectorAll('.activity-card');
    console.log('Adicionando ratings para', activityCards.length, 'atividades');
    
    activityCards.forEach((card, index) => {
        const activityTitle = card.querySelector('.activity-title');
        const activityName = activityTitle ? activityTitle.textContent.trim() : `activity_${index}`;
        
        const activityId = `activity_${index}_${activityName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')}`;
        
        card.dataset.activityId = activityId;
        
        // Só adiciona se não existir
        if (!card.querySelector('.rating-container')) {
            const ratingElement = createRatingElement(activityId);
            card.appendChild(ratingElement);
        }
    });
    
    // NÃO aplicar avaliações automaticamente - deixar limpo
    console.log('✅ Elementos de rating adicionados (estado limpo)');
}

function applyStoredRatings() {
    console.log('Aplicando', Object.keys(activityRatings).length, 'avaliações salvas');
    
    Object.entries(activityRatings).forEach(([activityId, rating]) => {
        if (rating && rating > 0) {
            updateHeartDisplay(activityId, rating);
        }
    });
}

// ===== SISTEMA DE ABAS DO PAINEL =====
function trocarAba(abaId) {
    // Remover active de todas as abas
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Esconder todo conteúdo
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    // Ativar aba selecionada
    const tabButton = document.getElementById(`tab-${abaId}`);
    const tabContent = document.getElementById(`content-${abaId}`);
    
    if (tabButton && tabContent) {
        tabButton.classList.add('active');
        tabContent.classList.add('active');
        tabContent.style.display = 'block';
        
        // Para aba de avaliações, mostrar apenas o que está visualmente ativo
        if (abaId === 'avaliacoes') {
            setTimeout(() => {
                atualizarListaAvaliacoesAtual();
            }, 50);
        }
    }
}

// Função para atualizar lista SEM aplicar avaliações visuais antigas
function atualizarListaAvaliacoesAtual() {
    const avaliacoesContainer = document.getElementById('avaliacoes_lista');
    if (!avaliacoesContainer) return;
    
    let avaliacoesHtml = '';
    let contadorAvaliacoes = 0;
    
    // Pegar apenas avaliações que estão VISUALMENTE ativas no momento
    const avaliacoesVisuais = [];
    
    document.querySelectorAll('.activity-card').forEach(card => {
        const activityId = card.dataset.activityId;
        if (!activityId) return;
        
        // Verificar se tem corações preenchidos VISUALMENTE
        const coracoesPreenchidos = card.querySelectorAll('.heart.filled').length;
        
        if (coracoesPreenchidos > 0) {
            const nomeAtividade = card.querySelector('.activity-title')?.textContent.trim() || 'Atividade sem nome';
            avaliacoesVisuais.push([activityId, coracoesPreenchidos, nomeAtividade]);
        }
    });
    
    if (avaliacoesVisuais.length > 0) {
        // Ordenar por rating (maior para menor)
        avaliacoesVisuais.sort(([,a], [,b]) => b - a);
        
        avaliacoesVisuais.forEach(([activityId, rating, nomeAtividade]) => {
            const coracoes = '♥'.repeat(rating);
            const nomeReduzido = nomeAtividade.length > 22 ? 
                nomeAtividade.substring(0, 19) + '...' : nomeAtividade;
            
            avaliacoesHtml += `
                <div class="avaliacao-item">
                    <span class="avaliacao-nome" title="${nomeAtividade}">${nomeReduzido}</span>
                    <span class="avaliacao-coracao">${coracoes}</span>
                </div>
            `;
            contadorAvaliacoes++;
        });
    }
    
    if (avaliacoesHtml === '') {
        avaliacoesHtml = '<div class="no-avaliacoes">Nenhuma avaliação ainda.<br>Clique nos corações nas atividades para avaliar!</div>';
    }
    
    avaliacoesContainer.innerHTML = avaliacoesHtml;
    atualizarBadgeAvaliacoes(contadorAvaliacoes);
}

function atualizarBadgeSelecionadas(contador) {
    const badge = document.querySelector('#tab-selecionadas .tab-badge');
    if (badge) badge.textContent = contador;
}

function atualizarBadgeAvaliacoes(contador) {
    const badge = document.querySelector('#tab-avaliacoes .tab-badge');
    if (badge) badge.textContent = contador;
}

// ===== FUNÇÕES DE UTILIDADE =====
function limparAvaliacoes() {
    activityRatings = {};
    localStorage.removeItem('bariloche_ratings');
    
    // Limpar corações visuais
    document.querySelectorAll('.heart').forEach(heart => {
        heart.classList.remove('filled', 'active');
    });
    
    // Usar a função que lê do visual, não do localStorage
    atualizarListaAvaliacoesAtual();
}

function resetarSistema() {
    localStorage.removeItem('bariloche_ratings');
    activityRatings = {};
    location.reload();
}

function removerRating(activityId) {
    if (activityRatings[activityId]) {
        delete activityRatings[activityId];
        saveRatings();
        updateHeartDisplay(activityId, 0);
        // Usar a função que lê do visual atual
        atualizarListaAvaliacoesAtual();
    }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏔️ Iniciando sistema Bariloche...');
    
    // 1. LIMPAR TUDO da memória quando carregar a página
    limparTudoDaMemoria();
    
    // 2. Resetar estado visual
    resetarEstadoVisual();
    
    // 3. Criar painéis se não existirem
    criarPaineis();
    
    // 4. Carregar cotação e configurar eventos
    carregarCotacao(() => {
        configurarEventos();
        
        // 5. Inicializar sistema limpo
        setTimeout(() => {
            inicializarSistemaLimpo();
        }, 300);
    });
});

function criarPaineis() {
    // Painel de atividades com abas
    if (!document.getElementById('painel-atividades')) {
        const painel_atividades = document.createElement('div');
        painel_atividades.id = 'painel-atividades';
        painel_atividades.innerHTML = `
            <div class="painel-tabs">
                <button class="tab-button active" id="tab-selecionadas" onclick="trocarAba('selecionadas')">
                    Selecionadas <span class="tab-badge">0</span>
                </button>
                <button class="tab-button" id="tab-avaliacoes" onclick="trocarAba('avaliacoes')">
                    Avaliações <span class="tab-badge">0</span>
                </button>
            </div>
            
            <div class="tab-content active" id="content-selecionadas" style="display: block;">
                <strong>Lista de atividades selecionadas:</strong>
                <pre id="lista_atividades"></pre>
                <button id="baixar_txt">📥 Baixar Lista</button>
            </div>
            
            <div class="tab-content" id="content-avaliacoes" style="display: none;">
                <strong>Suas avaliações:</strong>
                <div id="avaliacoes_lista" class="avaliacoes-lista"></div>
            </div>
        `;
        document.body.appendChild(painel_atividades);
        
        // Event listener para download
        document.getElementById('baixar_txt').addEventListener('click', function() {
            const texto = 'ROTEIRO FAMÍLIA MELO MORAES MARADEI\n\n' +
                'Gasto médio com refeição (12 dias):\n $540 USD / R$ 3078,00\n\n\n' +
                'Lista de atividades selecionadas: \n' +
                document.getElementById('lista_atividades').textContent + 
                '\n\n\nValor total: ' + document.getElementById('painel-total-valor').textContent;

            const blob = new Blob([texto], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'roteiro_bariloche_familia_melo_moraes_maradei.txt';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        });
    }
   
    // Painel de total
    if (!document.getElementById('painel-total')) {
        const painel = document.createElement('div');
        painel.id = 'painel-total';
        painel.innerHTML = `
            <span class='refeicao'>Gasto médio com refeição (12 dias)<br> $540 USD / R$ 3078,00</span>
            <span class='refeicao_description'>Café da manhã + 1 almoço simples + 1 restaurante médio alto</span>
            <span>Subtotal selecionado:</span>
            <span id="painel-total-valor">R$ 3078,00</span>
            <span id="painel-cotacao"></span>`;
        document.body.appendChild(painel);
    }
}

function configurarEventos() {
    // Configurar checkboxes
    document.querySelectorAll('.detail-checkbox').forEach(cb => {
        cb.addEventListener('change', atualizarTotal);
    });
    
    // Listener global para mudanças
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('detail-checkbox')) {
            atualizarTotal();
        }
    });
    
    // Atualizar total inicial
    atualizarTotal();
}

function limparTudoDaMemoria() {
    console.log('🗑️ Limpando TUDO da memória...');
    
    // Limpar localStorage
    localStorage.removeItem('bariloche_ratings');
    
    // Resetar variável
    activityRatings = {};
    
    console.log('✅ Memória completamente limpa!');
}

function inicializarSistemaLimpo() {
    console.log('📝 Inicializando sistema completamente limpo...');
    
    // Apenas adicionar elementos de rating sem nenhuma avaliação
    addRatingToCards();
    
    console.log('✅ Sistema inicializado - começando do zero!');
}

// ===== EXPOSIÇÃO GLOBAL =====
window.trocarAba = trocarAba;
window.limparAvaliacoes = limparAvaliacoes;
window.resetarSistema = resetarSistema;

window.removerRating = removerRating;


