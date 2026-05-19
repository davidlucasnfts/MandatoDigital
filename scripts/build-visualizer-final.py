#!/usr/bin/env python3
"""
Visualizador final com:
- Fisica otimizada (nao trava)
- Grupos expansivos (clica para ver arquivos)
"""

import json
from collections import defaultdict

# Le o graph-agrupado.json
with open('graphify-out/graph-agrupado.json', 'r', encoding='utf-8') as f:
    graph_data = json.load(f)

# Conta nos por comunidade
comm_counts = defaultdict(list)
for n in graph_data['nodes']:
    comm_counts[n['community']].append(n)

GROUP_NAMES = {
    0: 'Assets', 1: 'Backend API', 2: 'Config', 3: 'Data Files',
    4: 'Database', 5: 'Docs', 6: 'Hooks', 7: 'Libraries',
    8: 'Other', 9: 'Page Components', 10: 'Pages', 11: 'Pages & Hooks',
    12: 'Scripts', 13: 'Supabase', 14: 'UI Components'
}

PALETTE = [
    '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
    '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC',
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'
]

# Prepara dados dos grupos para o JS
groups_data = {}
for cid, nodes in comm_counts.items():
    groups_data[cid] = {
        'name': GROUP_NAMES.get(cid, 'Grupo ' + str(cid)),
        'color': PALETTE[cid % len(PALETTE)],
        'count': len(nodes),
        'files': sorted([n.get('label', n['id']) for n in nodes])[:20]  # Top 20 arquivos
    }

groups_json = json.dumps(groups_data, ensure_ascii=False, separators=(',', ':'))
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
  #sidebar { width: 300px; background: #1a1a2e; border-left: 1px solid #2a2a4e; display: flex; flex-direction: column; overflow: hidden; }
  #search-wrap { padding: 12px; border-bottom: 1px solid #2a2a4e; }
  #search { width: 100%; background: #0f0f1a; border: 1px solid #3a3a5e; color: #e0e0e0; padding: 7px 10px; border-radius: 6px; font-size: 13px; outline: none; }
  #search:focus { border-color: #4E79A7; }
  #godnodes { padding: 12px; border-bottom: 1px solid #2a2a4e; max-height: 180px; overflow-y: auto; }
  #godnodes h3 { font-size: 13px; color: #aaa; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
  .godnode-item { cursor: pointer; padding: 2px 0; font-size: 11px; color: #ccc; display: flex; justify-content: space-between; align-items: center; border-radius: 3px; }
  .godnode-item:hover { background: #2a2a4e; }
  #legend-wrap { flex: 1; overflow-y: auto; padding: 12px; }
  #legend-wrap h3 { font-size: 13px; color: #aaa; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
  .group-item { margin-bottom: 4px; }
  .group-header { display: flex; align-items: center; gap: 8px; padding: 6px 8px; cursor: pointer; border-radius: 4px; font-size: 12px; background: #0f0f1a; }
  .group-header:hover { background: #2a2a4e; }
  .group-header.expanded { background: #2a2a4e; }
  .group-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
  .group-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
  .group-count { color: #666; font-size: 11px; }
  .group-arrow { color: #666; font-size: 10px; transition: transform 0.2s; }
  .group-arrow.expanded { transform: rotate(90deg); }
  .group-files { display: none; padding: 4px 8px 4px 32px; font-size: 10px; color: #888; max-height: 150px; overflow-y: auto; }
  .group-files.visible { display: block; }
  .group-file { padding: 1px 0; cursor: pointer; }
  .group-file:hover { color: #4E79A7; }
  #stats { padding: 10px 14px; border-top: 1px solid #2a2a4e; font-size: 11px; color: #555; }
  #export-btn { position: absolute; top: 10px; right: 10px; z-index: 100; padding: 6px 12px; background: #4E79A7; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
  #export-btn:hover { background: #3d6090; }
  .loading { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #4E79A7; font-size: 14px; z-index: 50; }
</style>
</head>
<body>
<div id="graph">
  <div id="loading" class="loading">Carregando grafo...</div>
  <button id="export-btn" onclick="exportPNG()" style="display:none;">Exportar PNG</button>
</div>
<div id="sidebar">
  <div id="search-wrap">
    <input id="search" type="text" placeholder="Buscar arquivo..." autocomplete="off">
  </div>
  <div id="godnodes">
    <h3>Top 10 - Mais Conectados</h3>
    <div id="godnodes-list"></div>
  </div>
  <div id="legend-wrap">
    <h3>Grupos (clique para expandir)</h3>
    <div id="legend"></div>
  </div>
  <div id="stats"></div>
</div>

<script>
const GRAPH_DATA = ''' + graph_json + ''';
const GROUPS_DATA = ''' + groups_json + ''';

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

// Cria DataSets
const nodesDS = new vis.DataSet(nodesWithDegree.map(n => ({
  id: n.id,
  label: n.label || n.id,
  title: (n.label || n.id) + '<br>Conexoes: ' + (n.degree || 0),
  color: n.color || { background: '#4E79A7', border: '#fff' },
  size: 5 + Math.min(25, (n.degree || 0) * 0.5),
  hidden: false
})));

const edgesDS = new vis.DataSet(RAW_EDGES.map(e => ({
  from: e.source,
  to: e.target,
  color: { color: 'rgba(255,255,255,0.08)' },
  width: 1
})));

// Inicializa rede com fisica mais leve
const network = new vis.Network(document.getElementById('graph'), {
  nodes: nodesDS,
  edges: edgesDS
}, {
  physics: {
    enabled: true,
    solver: 'forceAtlas2Based',
    forceAtlas2Based: {
      gravitationalConstant: -40,
      centralGravity: 0.005,
      springLength: 100,
      springConstant: 0.05,
      damping: 0.5,
      avoidOverlap: 0.5
    },
    stabilization: { iterations: 100, fit: true, updateInterval: 50 }
  },
  interaction: { hover: true, tooltipDelay: 200 },
  nodes: { shape: 'dot', borderWidth: 1 },
  edges: { smooth: { type: 'continuous', roundness: 0.2 } }
});

// Esconde loading e mostra botao export
network.once('stabilizationIterationsDone', () => {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('export-btn').style.display = 'block';
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

// Grupos expansivos
const legendEl = document.getElementById('legend');
Object.entries(GROUPS_DATA).forEach(([cid, group]) => {
  const item = document.createElement('div');
  item.className = 'group-item';
  
  const header = document.createElement('div');
  header.className = 'group-header';
  header.innerHTML = 
    '<div class="group-dot" style="background:' + group.color + '"></div>' +
    '<span class="group-label">' + group.name + '</span>' +
    '<span class="group-count">' + group.count + '</span>' +
    '<span class="group-arrow">▶</span>';
  
  const filesDiv = document.createElement('div');
  filesDiv.className = 'group-files';
  group.files.forEach(fname => {
    const fdiv = document.createElement('div');
    fdiv.className = 'group-file';
    fdiv.textContent = fname;
    fdiv.onclick = (e) => {
      e.stopPropagation();
      const found = nodesWithDegree.find(n => (n.label || n.id) === fname);
      if (found) {
        network.focus(found.id, { scale: 1.5, animation: true });
        network.selectNodes([found.id]);
      }
    };
    filesDiv.appendChild(fdiv);
  });
  
  header.onclick = () => {
    const isExpanded = filesDiv.classList.contains('visible');
    if (isExpanded) {
      filesDiv.classList.remove('visible');
      header.classList.remove('expanded');
      header.querySelector('.group-arrow').classList.remove('expanded');
    } else {
      filesDiv.classList.add('visible');
      header.classList.add('expanded');
      header.querySelector('.group-arrow').classList.add('expanded');
    }
  };
  
  item.appendChild(header);
  item.appendChild(filesDiv);
  legendEl.appendChild(item);
});

// Estatisticas
document.getElementById('stats').innerHTML = 
  'Nos: <b>' + RAW_NODES.length + '</b> | ' +
  'Arestas: <b>' + RAW_EDGES.length + '</b> | ' +
  'Grupos: <b>' + Object.keys(GROUPS_DATA).length + '</b>';

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

output_path = 'graphify-out/visualizer-final.html'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(html)

print('OK - Visualizador final gerado:', output_path)
print('Nos:', len(graph_data['nodes']))
print('Arestas:', len(graph_data.get('links', graph_data.get('edges', []))))
print('Grupos:', len(comm_counts))
print('\nMelhorias:')
print('  - Fisica mais leve (100 iteracoes, parametros otimizados)')
print('  - Loading indicator enquanto carrega')
print('  - Grupos clicaveis para ver arquivos')
print('  - Cada arquivo no grupo e clicavel para focar no grafo')
print('\nAbra no navegador (duplo clique)')
