// API gratuita de câmbio: https://exchangerate.host (sem chave, confiável)
const API_COTACAO = "https://api.exchangerate.host/latest?base=BRL&symbols=ARS,USD";
let cotacao = { ars: 0.00, usd: 0.00, brl: 1 };

// Atualiza painel de cotação e total
function formatBRL(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function formatUSD(valor) {
    return valor.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function atualizarTotal() {
    let total = 3078;
    let lista_atracoes = '';
    document.querySelectorAll('.detail-checkbox:checked').forEach(cb => {
        const valor = parseFloat(cb.getAttribute('data-value'));
        const moeda = cb.getAttribute('data-moeda');
        let valReal = 0;
        if (moeda === 'ars') valReal = valor / cotacao.ars;
        else if (moeda === 'usd') valReal = valor * cotacao.usd;
        else valReal = valor; // Já em reais
        total += valReal;
        
        let atracaoTexto = '';
        const id = cb.id;
        //console.warn(`id: ${id}`);
        
        // Busca o <label> correspondente pelo atributo for
        const label = document.querySelector('label[for="' + id + '"]');
        
        if (label) {
            const atracaoSpan = label.querySelector('.atracao');
            atracaoTexto = atracaoSpan ? atracaoSpan.textContent : 'Atração não encontrada';
            
            
        } else {
            console.warn(`Label não encontrado para o checkbox com id: ${id}`);
            //console.warn(`2`);
        }
        //console.warn(atracaoTexto);
        lista_atracoes += '- '+ atracaoTexto + '\n';

    });
    //if (total == 0) total = 3078;
    total_brl = total;
    total_usd = total / cotacao.usd;
    document.getElementById('painel-total-valor').textContent = formatBRL(total_brl) + ' / ' + formatUSD(total_usd) + ' USD';

    document.getElementById('lista_atividades').textContent = lista_atracoes;
}

function atualizarCotacaoPainel() {
    const painelCot = document.getElementById('painel-cotacao');
    painelCot.innerHTML =
        `<span>Cotação atual: 1 BRL <br> ${cotacao.ars ? cotacao.ars.toFixed(2) : "-"} ARS | 1 USD = ${cotacao.usd ? cotacao.usd.toFixed(2) : "-"} BRL</span>`;
}

function carregarCotacao(callback) {
    fetch(API_COTACAO)
        .then(resp => resp.json())
        .then(data => {
            cotacao.ars = data.rates.ARS;
            cotacao.usd = data.rates.USD;
            atualizarCotacaoPainel();
            if (callback) callback();
            //alert(cotacao.usd);
        })
        .catch(() => {
            cotacao.ars = 213; // fallback
            cotacao.usd = 5.54;
            atualizarCotacaoPainel();
            if (callback) callback();
        });
}

// Abas saiba mais/onde comprar (igual antes)
function toggleSaibaMais(el) {
    const card = el.closest('.activity-card');
    const saiba = card.querySelector('.saiba-mais-content');
    const onde = card.querySelector('.onde-comprar-content');
    if (saiba.classList.contains('expanded')) {
        saiba.classList.remove('expanded');
        el.innerHTML = '📖 Saiba Mais ▼';
    } else {
        if (onde && onde.classList.contains('expanded')) {
            card.querySelector('.onde-comprar-link').innerHTML = '💳 Onde Comprar ▼';
            onde.classList.remove('expanded');
        }
        saiba.classList.add('expanded');
        el.innerHTML = '📖 Saiba Mais ▲';
        if (card.querySelector('.onde-comprar-link')) card.querySelector('.onde-comprar-link').innerHTML = '💳 Onde Comprar ▼';
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
            card.querySelector('.saiba-mais').innerHTML = '📖 Saiba Mais ▼';
            saiba.classList.remove('expanded');
        }
        onde.classList.add('expanded');
        el.innerHTML = '💳 Onde Comprar ▲';
        if (card.querySelector('.saiba-mais')) card.querySelector('.saiba-mais').innerHTML = '📖 Saiba Mais ▼';
    }
}
// Fecha abas se clicar fora
document.addEventListener('click', function(event) {
    document.querySelectorAll('.activity-card').forEach(function(card) {
        if (!card.contains(event.target)) {
            const saiba = card.querySelector('.saiba-mais-content');
            const onde = card.querySelector('.onde-comprar-content');
            if (saiba && saiba.classList.contains('expanded')) {
                saiba.classList.remove('expanded');
                if (card.querySelector('.saiba-mais')) card.querySelector('.saiba-mais').innerHTML = '📖 Saiba Mais ▼';
            }
            if (onde && onde.classList.contains('expanded')) {
                onde.classList.remove('expanded');
                if (card.querySelector('.onde-comprar-link')) card.querySelector('.onde-comprar-link').innerHTML = '💳 Onde Comprar ▼';
            }
        }
    });
});
// Filtro
function filterActivities(type) {
    var btns = document.querySelectorAll('.filter-btn');
    btns.forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    var cards = document.querySelectorAll('.activity-card');
    cards.forEach(card => {
        if(type === 'todos') {
            card.style.display = 'block';
        } else if(card.getAttribute('data-type').includes(type)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}
// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Painel de atividades
    if (!document.getElementById('painel-atividades')) {
        const painel_atividades = document.createElement('div');
        painel_atividades.id = 'painel-atividades';
        painel_atividades.innerHTML = `
            <strong>Lista de atividades selecionadas:</strong>
            <pre id="lista_atividades"></pre>
            <button id="baixar_txt">Baixar Lista</button>`;
        document.body.appendChild(painel_atividades);

        document.getElementById('baixar_txt').addEventListener('click', function() {
            // Pega o conteúdo do <pre>
            const texto = 'Gasto médio com refeição (12 dias):\n $540 USD / R$ 3078,00\n\n\nLista de atividades selecionadas: \n'
            + document.getElementById('lista_atividades').textContent + 
            '\n\n\nValor total: ' + document.getElementById('painel-total-valor').textContent;

            // Cria um Blob com o conteúdo do texto
            const blob = new Blob([texto], { type: 'text/plain' });

            // Cria um link temporário para download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'lista_atividades.txt'; // nome do arquivo

            // Dispara o download
            document.body.appendChild(link);
            link.click();

            // Limpa o link temporário
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
            <span class='refeicao_description'>Café da manhã + 1 Fast food + 1 restaurante médio alto</span>
            <span>Subtotal selecionado:</span>
            <span id="painel-total-valor">R$ 3078,00</span>
            <span id="painel-cotacao"></span>`;
        document.body.appendChild(painel);
    }
    carregarCotacao(() => {
        atualizarTotal();
        document.querySelectorAll('.detail-checkbox').forEach(cb => {
            cb.addEventListener('change', atualizarTotal);
        });
    });
    // Atualiza total se DOM mudar dinamicamente
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('detail-checkbox')) atualizarTotal();
    });
});


