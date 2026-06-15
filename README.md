# Dashboard Logístico - Instruções

Resumo:
- Dashboard em HTML/CSS/JS com KPIs, gráficos e tabela de priorização.
- Dados de exemplo incluídos (campos: `id_entrega`, `transportadora`, `regiao`, `prazo_dias`, `dias_reais`, `dataPrevista`, `dataReal`).
- Regra de atraso: entrega é considerada atrasada quando `dias_reais > prazo_dias`. `dias_excesso = dias_reais - prazo_dias`.

Funcionalidades implementadas:
- Filtros interativos: `transportadora`, `regiao`, intervalo `dataReal (de/até)`, `min dias reais`.
- Gráficos reativos: barras por transportadora e rosca por região (consideram apenas entregas atrasadas conforme a regra).
- Tabela de priorização ordenada por `dias_excesso` com badges visuais: `Crítico` (>=5 dias_excesso), `Atenção` (1-4), `OK`.
- Ranking de transportadoras com mais atrasos.
- Export CSV da tabela filtrada.

Como testar localmente:
1. Abra `index.html` no navegador (duplo clique) ou rode um servidor local (recomendado):

```powershell
# a partir da pasta do projeto
# usando Python 3
python -m http.server 8000
# depois abra http://localhost:8000
```

Como entregar online:
- Hospede no GitHub Pages (crie repositório com estes arquivos e ative Pages na branch `main`), ou
- Hospede em qualquer serviço estático (Netlify, Vercel).

Lógica e decisões:
- Preferi incluir `dataPrevista` e `dataReal` geradas a partir de `prazo_dias`/`dias_reais` para permitir filtros por intervalo de datas.
- KPI `taxa de atraso` calcula percentagem de entregas atrasadas entre registros filtrados.
- Priorização usa `dias_excesso` para ordenar e definir criticidade.

Próximos passos recomendados (opcionais):
- Adicionar séries temporais (tendência diária/mensal) para análise de tendência.
- Implementar dashboard em plataforma compartilhada (Looker/PowerBI/Streamlit) para link público.
- Permitir upload de CSV para análise com dados reais.


