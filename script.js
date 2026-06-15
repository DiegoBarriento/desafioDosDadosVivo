// Dados de exemplo
const dadosLogistica = [
    { id_entrega: 301, transportadora: 'RotaMax', regiao: 'Sudeste', prazo_dias: 3, dias_reais: 7 },
    { id_entrega: 302, transportadora: 'ViaCargo', regiao: 'Sul', prazo_dias: 5, dias_reais: 5 },
    { id_entrega: 303, transportadora: 'FlashLog', regiao: 'Nordeste', prazo_dias: 4, dias_reais: 9 },
    { id_entrega: 304, transportadora: 'RotaMax', regiao: 'Norte', prazo_dias: 6, dias_reais: 4 },
    { id_entrega: 305, transportadora: 'ViaCargo', regiao: 'Centro-Oeste', prazo_dias: 2, dias_reais: 6 },
    { id_entrega: 306, transportadora: 'FlashLog', regiao: 'Sul', prazo_dias: 5, dias_reais: 12 },
    { id_entrega: 307, transportadora: 'RotaMax', regiao: 'Sul', prazo_dias: 6, dias_reais: 9 },
    { id_entrega: 308, transportadora: 'ViaCargo', regiao: 'Sudeste', prazo_dias: 3, dias_reais: 4 },
    { id_entrega: 309, transportadora: 'FlashLog', regiao: 'Norte', prazo_dias: 5, dias_reais: 5 },
    { id_entrega: 310, transportadora: 'ViaCargo', regiao: 'Nordeste', prazo_dias: 4, dias_reais: 8 }
];

// Data Gerenciamento
function addDates(dataset, baseDateStr = '2026-06-01'){
    const base = new Date(baseDateStr + 'T00:00:00');
    dataset.forEach(d => {
        // data prevista = base + prazo_dias
        const prevista = new Date(base.getTime() + d.prazo_dias * 24*60*60*1000);
        // data real = base + dias_reais
        const real = new Date(base.getTime() + d.dias_reais * 24*60*60*1000);
        d.dataPrevista = prevista.toISOString().slice(0,10);
        d.dataReal = real.toISOString().slice(0,10);
        d.dias_excesso = Math.max(0, d.dias_reais - d.prazo_dias);
        d.atrasada = d.dias_reais > d.prazo_dias;
    });
}

addDates(dadosLogistica);

// Gráfico Gerenciamento
let chartTransportadora = null;
let chartRegiao = null;
let currentFiltered = dadosLogistica.slice();

function atualizarKPIs(dataset){
    const total = dataset.length;
    const atrasadas = dataset.filter(d => d.atrasada).length;
    const noPrazo = total - atrasadas;
    const taxa = total? ((atrasadas/total)*100).toFixed(1): '0.0';
    document.getElementById('kpi-total').innerText = total;
    document.getElementById('kpi-prazo').innerText = noPrazo;
    document.getElementById('kpi-atraso').innerText = atrasadas;
    document.getElementById('kpi-taxa').innerText = `${taxa}%`;
}

function contagens(dataset){
    const byTransport = {};
    const byRegiao = {};
    dataset.filter(d=>d.atrasada).forEach(d=>{
        byTransport[d.transportadora] = (byTransport[d.transportadora]||0)+1;
        byRegiao[d.regiao] = (byRegiao[d.regiao]||0)+1;
    });
    return {byTransport, byRegiao};
}

function criarOuAtualizarGraficos(dataset){
    const counts = contagens(dataset);
    const tLabels = Object.keys(counts.byTransport);
    const tValues = Object.values(counts.byTransport);
    const rLabels = Object.keys(counts.byRegiao);
    const rValues = Object.values(counts.byRegiao);

    if(!chartTransportadora){
        chartTransportadora = new Chart(document.getElementById('chartTransportadora'),{
            type:'bar',
            data:{labels:tLabels,datasets:[{label:'Qtd Atrasos',data:tValues,backgroundColor:'#e74c3c'}]}
        });
    } else {
        chartTransportadora.data.labels = tLabels;
        chartTransportadora.data.datasets[0].data = tValues;
        chartTransportadora.update();
    }

    if(!chartRegiao){
        chartRegiao = new Chart(document.getElementById('chartRegiao'),{
            type:'doughnut',
            data:{labels:rLabels,datasets:[{data:rValues,backgroundColor:['#3498db','#f1c40f','#e67e22','#9b59b6']} ]}
        });
    } else {
        chartRegiao.data.labels = rLabels;
        chartRegiao.data.datasets[0].data = rValues;
        chartRegiao.update();
    }
}

function atualizarTabela(dataset){
    const tabela = document.querySelector('#tabela-atrasos tbody');
    tabela.innerHTML = '';
    const rows = dataset.slice().sort((a,b)=>b.dias_excesso - a.dias_excesso);
    rows.forEach(d=>{
        const tr = document.createElement('tr');
        let badgeClass='bg-success'; let status='OK';
        if(d.atrasada){
            status = d.dias_excesso>=5? 'Crítico' : 'Atenção';
            badgeClass = d.dias_excesso>=5? 'bg-danger':'bg-warning';
        }
        tr.innerHTML = `
            <td><strong>${d.id_entrega}</strong></td>
            <td>${d.transportadora}</td>
            <td>${d.regiao}</td>
            <td><strong>${d.dias_reais} dias</strong></td>
            <td><span class="status-badge ${badgeClass}">${status}</span></td>
        `;
        tabela.appendChild(tr);
    });
}

function atualizarRanking(dataset){
    const byTransport = {};
    dataset.filter(d=>d.atrasada).forEach(d=> byTransport[d.transportadora]=(byTransport[d.transportadora]||0)+1);
    const arr = Object.entries(byTransport).sort((a,b)=>b[1]-a[1]);
    const ol = document.getElementById('ranking-transportadoras');
    ol.innerHTML='';
    arr.forEach(([name,count])=>{
        const li = document.createElement('li');
        li.textContent = `${name}: ${count} atrasos`;
        ol.appendChild(li);
    });
}

function aplicarFiltros(){
    const t = document.getElementById('filter-transportadora').value;
    const r = document.getElementById('filter-regiao').value;
    const start = document.getElementById('filter-date-start').value;
    const end = document.getElementById('filter-date-end').value;
    const minDias = Number(document.getElementById('filter-min-dias').value||0);

    currentFiltered = dadosLogistica.filter(d=>{
        if(t && d.transportadora !== t) return false;
        if(r && d.regiao !== r) return false;
        if(minDias && d.dias_reais < minDias) return false;
        if(start){ if(d.dataReal < start) return false; }
        if(end){ if(d.dataReal > end) return false; }
        return true;
    });

    atualizarKPIs(currentFiltered);
    criarOuAtualizarGraficos(currentFiltered);
    atualizarTabela(currentFiltered);
    atualizarRanking(currentFiltered);
}

function popularFiltros(){
    const transports = Array.from(new Set(dadosLogistica.map(d=>d.transportadora)));
    const regioes = Array.from(new Set(dadosLogistica.map(d=>d.regiao)));
    const selT = document.getElementById('filter-transportadora');
    const selR = document.getElementById('filter-regiao');
    transports.forEach(v=>{ const opt = document.createElement('option'); opt.value=v; opt.textContent=v; selT.appendChild(opt); });
    regioes.forEach(v=>{ const opt = document.createElement('option'); opt.value=v; opt.textContent=v; selR.appendChild(opt); });
}

function exportCSV(){
    const rows = currentFiltered.map(d=>({id_entrega:d.id_entrega,transportadora:d.transportadora,regiao:d.regiao,prazo_dias:d.prazo_dias,dias_reais:d.dias_reais,dataPrevista:d.dataPrevista,dataReal:d.dataReal}));
    const header = Object.keys(rows[0]||{}).join(',') + '\n';
    const csv = header + rows.map(r=>Object.values(r).join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'export.csv'; a.click(); URL.revokeObjectURL(url);
}

// Inicializar
document.addEventListener('DOMContentLoaded', ()=>{
    popularFiltros();
    aplicarFiltros();
    document.getElementById('btn-aplicar').addEventListener('click', aplicarFiltros);
    document.getElementById('btn-limpar').addEventListener('click', ()=>{ document.getElementById('filter-transportadora').value=''; document.getElementById('filter-regiao').value=''; document.getElementById('filter-date-start').value=''; document.getElementById('filter-date-end').value=''; document.getElementById('filter-min-dias').value='0'; aplicarFiltros(); });
    document.getElementById('btn-export').addEventListener('click', exportCSV);
});
