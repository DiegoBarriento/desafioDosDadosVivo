// 1. Base de Dados Fictícia (Amostra para fins didáticos)
const dadosLogistica = [
    { id: "CNT-8492", transportadora: "Marítima Sul", regiao: "Baixada Santista/SP", diasAtraso: 12 },
    { id: "CNT-1102", transportadora: "RodoRápido", regiao: "Capital/SP", diasAtraso: 3 },
    { id: "CNT-3391", transportadora: "Marítima Sul", regiao: "Baixada Santista/SP", diasAtraso: 8 },
    { id: "CNT-4412", transportadora: "LogExpress", regiao: "Interior/SP", diasAtraso: 0 },
    { id: "CNT-5523", transportadora: "RodoRápido", regiao: "Vale do Paraíba", diasAtraso: 5 },
    { id: "CNT-6634", transportadora: "Marítima Sul", regiao: "Baixada Santista/SP", diasAtraso: 15 },
    { id: "CNT-7745", transportadora: "LogExpress", regiao: "Capital/SP", diasAtraso: 1 },
    { id: "CNT-8856", transportadora: "RodoRápido", regiao: "Capital/SP", diasAtraso: 0 },
    { id: "CNT-9967", transportadora: "Marítima Sul", regiao: "Interior/SP", diasAtraso: 6 },
    { id: "CNT-0078", transportadora: "LogExpress", regiao: "Vale do Paraíba", diasAtraso: 0 }
];

// 2. Processamento e Cálculos
const totalEntregas = dadosLogistica.length;
const entregasAtrasadas = dadosLogistica.filter(d => d.diasAtraso > 0);
const entregasNoPrazo = totalEntregas - entregasAtrasadas.length;
const taxaAtraso = ((entregasAtrasadas.length / totalEntregas) * 100).toFixed(1);

// Atualizar KPIs na tela
document.getElementById('kpi-total').innerText = totalEntregas;
document.getElementById('kpi-prazo').innerText = entregasNoPrazo;
document.getElementById('kpi-atraso').innerText = entregasAtrasadas.length;
document.getElementById('kpi-taxa').innerText = `${taxaAtraso}%`;

// 3. Preparar dados para os Gráficos
const contagemTransportadora = {};
const contagemRegiao = {};

entregasAtrasadas.forEach(d => {
    contagemTransportadora[d.transportadora] = (contagemTransportadora[d.transportadora] || 0) + 1;
    contagemRegiao[d.regiao] = (contagemRegiao[d.regiao] || 0) + 1;
});

// Gráfico de Barras: Transportadoras
new Chart(document.getElementById('chartTransportadora'), {
    type: 'bar',
    data: {
        labels: Object.keys(contagemTransportadora),
        datasets: [{
            label: 'Qtd de Entregas Atrasadas',
            data: Object.values(contagemTransportadora),
            backgroundColor: '#e74c3c'
        }]
    }
});

// Gráfico de Rosca: Regiões
new Chart(document.getElementById('chartRegiao'), {
    type: 'doughnut',
    data: {
        labels: Object.keys(contagemRegiao),
        datasets: [{
            data: Object.values(contagemRegiao),
            backgroundColor: ['#3498db', '#f1c40f', '#e67e22', '#9b59b6']
        }]
    }
});

// 4. Preencher Tabela com Priorização (Ordenando do maior atraso para o menor)
const tabela = document.querySelector('#tabela-atrasos tbody');

// Ordenação estratégica: Prioridade para os maiores atrasos
entregasAtrasadas.sort((a, b) => b.diasAtraso - a.diasAtraso).forEach(d => {
    const tr = document.createElement('tr');
    
    // Lógica de Alerta Visual
    let badgeClass = 'bg-warning';
    let statusText = 'Atenção';
    if (d.diasAtraso > 5) {
        badgeClass = 'bg-danger';
        statusText = 'Crítico';
    }

    tr.innerHTML = `
        <td><strong>${d.id}</strong></td>
        <td>${d.transportadora}</td>
        <td>${d.regiao}</td>
        <td><strong>${d.diasAtraso} dias</strong></td>
        <td><span class="status-badge ${badgeClass}">${statusText}</span></td>
    `;
    tabela.appendChild(tr);
});
