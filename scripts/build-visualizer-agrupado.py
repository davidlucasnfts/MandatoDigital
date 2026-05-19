#!/usr/bin/env python3
"""
Gera visualizador.html com graph-agrupado.json embutido.
"""

import json

# Le o graph-agrupado.json
with open('graphify-out/graph-agrupado.json', 'r', encoding='utf-8') as f:
    graph_data = json.load(f)

# Conta nos por comunidade
from collections import Counter
comm_counts = Counter(n['community'] for n in graph_data['nodes'])

# Nomes dos grupos
GROUP_NAMES = {
    0: 'Assets',
    1: 'Backend API',
    2: 'Config',
    3: 'Data Files',
    4: 'Database',
    5: 'Docs',
    6: 'Hooks',
    7: 'Libraries',
    8: 'Other',
    9: 'Page Components',
    10: 'Pages',
    11: 'Pages & Hooks',
    12: 'Scripts',
    13: 'Supabase',
    14: 'UI Components'
}

# Paleta de cores
PALETTE = [
    '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
    '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC',
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'
]

# Converte para string JSON compacta
graph_json = json.dumps(graph_data, ensure_ascii=False, separators=(',', ':'))

html = '''<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Graphify - MandatoDigital</title>
<script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0f0f1a; color: #e0e0e0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; display: flex; height: 100vh; overflow: hidden; }
  #graph { flex: 1; position: relative; }
  #sidebar { width: 280px; background: #1a1a2e; border-left: 1px solid #2a2a4e; display: flex; flex-direction: column; overflow: hidden; }
  #search-wrap { padding: 12px; border-bottom: 1px solid #2a2a4e; }
  #search { width: 100%; background: #0f0f1a; border: 1px solid #3a3a5e; color: #e0e0e0; padding: 7px 10px; border-radius: 6px; font-size: 13px; outline: none; }
  #search:focus { border-color: #4E79A7; }
  #godnodes { padding: 12px; border-bottom: 1px solid #2a2a4e; max-height: 200px; overflow-y: auto; }
  #godnodes h3 { font-size: 13px; color: #aaa; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
  .godnode-item { cursor: pointer; padding: 2px 0; font-size: 11px; color: #ccc; display: flex; justify-content: space-between; align-items: center; border-radius: 3px; }
  .godnode-item:hover { background: #2a2a4e; }
  #legend-wrap { flex: 1; overflow-y: auto; padding: 12px; }
  #legend-wrap h3 { font-size: 13px; color: #aaa; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
  .legend-item { display: flex; align-items: center; gap: 8px; padding: 4px 0; cursor: pointer; border-radius: 4px; font-size: 12px; }
  .legend-item:hover { background: #2a2a4e; padding-left: 4px; }
  .legend-item.dimmed { opacity: 0.35; }
  .legend-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
  .legend-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .legend-count { color: #666; font-size: 11px; }
  #stats { padding: 10px 14px; border-top: 1px solid #2a2a4e; font-size: 11px; color: #555; }
  #export-btn { position: absolute; top: 10px; right: 10px; z-index: 100; padding: 6px 12px; background: #4E79A7; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
  #export-btn:hover { background: #3d6090; }
  .legend-cb { appearance: none; -webkit-appearance: none; width: 14px; height: 14px; border: 1.5px solid #3a3a5e; border-radius: 3px; background: #0f0f1a; cursor: pointer; position: relative; flex-shrink: 0; }
  .legend-cb:checked { background: #4E79A7; border-color: #4E79A7; }
  .legend-cb:checked::after { content: ''; position: absolute; left: 3.5px; top: 1px; width: 4px; height: 7px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); }
</style>
</head>
<body>
<div id="graph">
  <button id="export-btn" onclick="exportPNG()">Exportar PNG</button>
</div>
<div id="sidebar">
  <div id="search-wrap">
    <input id="search" type="text" placeholder="Buscar no..." autocomplete="off">
  </div>
  <div id="godnodes">
    <h3>Top 10 - Mais Conectados</h3>
    <div id="godnodes-list"></div>
  </div>
  <div id="legend-wrap">
    <h3>Grupos</h3>
    <div id="legend"></div>
  </div>
  <div id="stats"></div>
</div>

<script>
const GRAPH_DATA = ''' + graph_json + ''';

const RAW_NODES = GRAPH_DATA.nodes || [];
const RAW_EDGES = GRAPH_DATA.links || GRAPH_DATA.edges || [];

// Calcula grau
const degreeMap = {};
RAW_EDGES.forEach(e => {
  degreeMap[e.source] = (degreeMap[e.source] || 0) + 1;
  degreeMap[e.target] = (degreeMap[e.target] || 0) + 1;
});

const nodesWithDegree = RAW_NODES.map(n => ({
  ...n,
  degree: degreeMap[n.id] || 0
}));

// Agrupa por comunidade
const communities = {};
nodesWithDegree.forEach(n => {
  const c = n.community || 0;
  if (!communities[c]) communities[c] = { count: 0, color: (n.color && n.color.background) || '#4E79A7' };
  communities[c].count++;
});

const GROUP_NAMES = ''' + json.dumps(GROUP_NAMES, ensure_ascii=False) + ''';
const PALETTE = ''' + json.dumps(PALETTE, ensure_ascii=False) + ''';

const LEGEND = Object.entries(communities).map(([cid, info]) => ({
  cid: parseInt(cid),
  label: GROUP_NAMES[cid] || ('Grupo ' + cid),
  color: info.color,
  count: info.count
}));

const hiddenCommunities = new Set();

// Cria DataSets
const nodesDS = new vis.DataSet(nodesWithDegree.map(n => ({
  id: n.id,
  label: n.label || n.id,
  title: (n.label || n.id) + '<br>Conexoes: ' + (n.degree || 0) + '<br>Grupo: ' + (GROUP_NAMES[n.community] || 'Other'),
  color: n.color || { background: '#4E79A7', border: '#fff' },
  size: 5 + Math.min(25, (n.degree || 0) * 0.5),
  hidden: false
})));

const edgesDS = new vis.DataSet(RAW_EDGES.map(e => ({
  from: e.source,
  to: e.target,
  color: { color: 'rgba(255,255,255,0.1)' },
  width: 1
})));

// Inicializa rede
const network = new vis.Network(document.getElementById('graph'), {
  nodes: nodesDS,
  edges: edgesDS
}, {
  physics: {
    enabled: true,
    solver: 'forceAtlas2Based',
    forceAtlas2Based: {
      gravitationalConstant: -60,
      centralGravity: 0.005,
      springLength: 120,
      springConstant: 0.08,
      damping: 0.4,
      avoidOverlap: 0.8
    },
    stabilization: { iterations: 200, fit: true }
  },
  interaction: { hover: true, tooltipDelay: 200, hideEdgesOnDrag: true },
  nodes: { shape: 'dot', borderWidth: 1.5 },
  edges: { smooth: { type: 'continuous', roundness: 0.2 } }
});

network.once('stabilizationIterationsDone', () => {
  network.setOptions({ physics: { enabled: false } });
});

// God Nodes
const godNodes = [...nodesWithDegree].sort((a, b) => b.degree - a.degree).slice(0, 10);
const godList = document.getElementById('godnodes-list');
godNodes.forEach((n, i) => {
  const div = document.createElement('div');
  div.className = 'godnode-item';
  div.innerHTML = '<span>' + (i+1) + '. ' + (n.label || n.id).substring(0, 25) + '</span>' +
    '<span style="color:#888;">' + n.degree + '</span>';
  div.onclick = () => {
    network.focus(n.id, { scale: 1.5, animation: true });
    network.selectNodes([n.id]);
  };
  godList.appendChild(div);
});

// Legenda
const legendEl = document.getElementById('legend');
LEGEND.forEach(c => {
  const item = document.createElement('div');
  item.className = 'legend-item';
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.className = 'legend-cb';
  cb.checked = true;
  cb.addEventListener('change', (e) => {
    e.stopPropagation();
    if (cb.checked) {
      hiddenCommunities.delete(c.cid);
      item.classList.remove('dimmed');
    } else {
      hiddenCommunities.add(c.cid);
      item.classList.add('dimmed');
    }
    const updates = nodesWithDegree
      .filter(n => (n.community || 0) === c.cid)
      .map(n => ({ id: n.id, hidden: !cb.checked }));
    nodesDS.update(updates);
  });
  item.innerHTML = '<div class="legend-dot" style="background:' + c.color + '"></div>' +
    '<span class="legend-label">' + c.label + '</span>' +
    '<span class="legend-count">' + c.count + '</span>';
  item.prepend(cb);
  legendEl.appendChild(item);
});

// Estatisticas
document.getElementById('stats').innerHTML = 
  'Nos: <b>' + RAW_NODES.length + '</b> | ' +
  'Arestas: <b>' + RAW_EDGES.length + '</b> | ' +
  'Grupos: <b>' + LEGEND.length + '</b>';

// Busca
document.getElementById('search').addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  if (!term) return;
  const found = nodesWithDegree.filter(n => 
    (n.label || '').toLowerCase().includes(term)
  );
  if (found.length > 0) {
    network.focus(found[0].id, { scale: 1.5, animation: true });
    network.selectNodes([found[0].id]);
  }
});

// Export PNG
function exportPNG() {
  const canvas = document.querySelector('#graph canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.download = 'graphify-mandatodigital.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}
</script>
</body>
</html>'''

# Salva
output_path = 'graphify-out/visualizer-agrupado.html'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(html)

print('OK - Visualizador agrupado gerado:', output_path)
print('Nos:', len(graph_data['nodes']))
print('Arestas:', len(graph_data.get('links', graph_data.get('edges', []))))
print('Grupos:', len(comm_counts))
print('\nAbra no navegador (duplo clique)')
print('Nao precisa de servidor!')
