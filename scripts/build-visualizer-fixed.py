#!/usr/bin/env python3
"""
Gera visualizer.html com graph.json embutido - VERSÃO CORRIGIDA
Uso: python scripts/build-visualizer-fixed.py
"""

import json
import os

# Lê o graph.json
with open('graphify-out/graph.json', 'r', encoding='utf-8') as f:
    graph_data = json.load(f)

# Converte para string JSON compacta (uma linha só - como o Graphify faz)
graph_json_compact = json.dumps(graph_data, ensure_ascii=False, separators=(',', ':'))

# Template HTML - mesma abordagem do graph.html original (dados embutidos em uma linha)
html_template = '''<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Graphify - MandatoDigital</title>
  <script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ background: #0f0f1a; color: #e0e0e0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; display: flex; height: 100vh; overflow: hidden; }}
    #graph {{ flex: 1; position: relative; }}
    #sidebar {{ width: 300px; background: #1a1a2e; border-left: 1px solid #2a2a4e; display: flex; flex-direction: column; overflow: hidden; }}
    #search-wrap {{ padding: 12px; border-bottom: 1px solid #2a2a4e; }}
    #search {{ width: 100%; background: #0f0f1a; border: 1px solid #3a3a5e; color: #e0e0e0; padding: 7px 10px; border-radius: 6px; font-size: 13px; outline: none; }}
    #search:focus {{ border-color: #4E79A7; }}
    #info-panel {{ padding: 14px; border-bottom: 1px solid #2a2a4e; min-height: 120px; }}
    #info-panel h3 {{ font-size: 13px; color: #aaa; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }}
    #info-content {{ font-size: 13px; color: #ccc; line-height: 1.6; }}
    #info-content .field {{ margin-bottom: 5px; }}
    #info-content .field b {{ color: #e0e0e0; }}
    #legend-wrap {{ flex: 1; overflow-y: auto; padding: 12px; }}
    #legend-wrap h3 {{ font-size: 13px; color: #aaa; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }}
    .legend-item {{ display: flex; align-items: center; gap: 8px; padding: 4px 0; cursor: pointer; border-radius: 4px; font-size: 12px; }}
    .legend-item:hover {{ background: #2a2a4e; padding-left: 4px; }}
    .legend-item.dimmed {{ opacity: 0.35; }}
    .legend-dot {{ width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }}
    .legend-label {{ flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }}
    .legend-count {{ color: #666; font-size: 11px; }}
    #stats {{ padding: 10px 14px; border-top: 1px solid #2a2a4e; font-size: 11px; color: #555; }}
    #godnodes {{ padding: 12px; border-bottom: 1px solid #2a2a4e; max-height: 200px; overflow-y: auto; }}
    #godnodes h3 {{ font-size: 13px; color: #aaa; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }}
    .godnode-item {{ cursor: pointer; padding: 2px 0; font-size: 11px; color: #ccc; }}
    .godnode-item:hover {{ color: #4E79A7; }}
    #export-btn {{ position: absolute; top: 10px; right: 10px; z-index: 100; padding: 6px 12px; background: #4E79A7; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }}
    #export-btn:hover {{ background: #3d6090; }}
    .legend-cb {{ appearance: none; -webkit-appearance: none; width: 14px; height: 14px; border: 1.5px solid #3a3a5e; border-radius: 3px; background: #0f0f1a; cursor: pointer; position: relative; flex-shrink: 0; }}
    .legend-cb:checked {{ background: #4E79A7; border-color: #4E79A7; }}
    .legend-cb:checked::after {{ content: ''; position: absolute; left: 3.5px; top: 1px; width: 4px; height: 7px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); }}
  </style>
</head>
<body>
<div id="graph">
  <button id="export-btn" onclick="exportPNG()">📷 Exportar PNG</button>
</div>
<div id="sidebar">
  <div id="search-wrap">
    <input id="search" type="text" placeholder="Buscar nó..." autocomplete="off">
  </div>
  <div id="info-panel">
    <h3>ℹ️ Detalhes</h3>
    <div id="info-content"><span class="empty">Clique em um nó para ver detalhes</span></div>
  </div>
  <div id="godnodes">
    <h3>⭐ Top 10 - Mais Conectados</h3>
    <div id="godnodes-list"></div>
  </div>
  <div id="legend-wrap">
    <h3>📊 Comunidades</h3>
    <div id="legend"></div>
  </div>
  <div id="stats"></div>
</div>

<script>
// Dados embutidos do grafo (formato compacto - uma linha)
const GRAPH_DATA = {graph_json};

// Processa dados
const RAW_NODES = GRAPH_DATA.nodes || [];
const RAW_EDGES = GRAPH_DATA.links || GRAPH_DATA.edges || [];

// Calcula grau de cada nó
const degreeMap = {{}};
RAW_EDGES.forEach(e => {{
  degreeMap[e.source] = (degreeMap[e.source] || 0) + 1;
  degreeMap[e.target] = (degreeMap[e.target] || 0) + 1;
}});

const nodesWithDegree = RAW_NODES.map(n => ({{
  ...n,
  degree: degreeMap[n.id] || 0
}}));

// Agrupa por comunidade
const communities = {{}};
nodesWithDegree.forEach(n => {{
  const c = n.community || 0;
  if (!communities[c]) communities[c] = {{ color: n.color?.background || '#4E79A7', count: 0, label: 'Comunidade ' + c }};
  communities[c].count++;
}});

const LEGEND = Object.entries(communities).map(([cid, info]) => ({{
  cid: parseInt(cid),
  ...info
}}));

const hiddenCommunities = new Set();

// Cria DataSets
const nodesDS = new vis.DataSet(nodesWithDegree.map(n => ({{
  id: n.id,
  label: n.label || n.id,
  title: `${{n.label || n.id}}<br>Conexões: ${{n.degree}}<br>Comunidade: ${{n.community || 0}}`,
  color: n.color || {{ background: '#4E79A7', border: '#fff' }},
  size: 5 + Math.min(25, (n.degree || 0) * 0.5),
  hidden: false
}})));

const edgesDS = new vis.DataSet(RAW_EDGES.map(e => ({{
  from: e.source,
  to: e.target,
  color: {{ color: 'rgba(255,255,255,0.1)' }},
  width: 1
}})));

// Inicializa rede
const network = new vis.Network(document.getElementById('graph'), {{
  nodes: nodesDS,
  edges: edgesDS
}}, {{
  physics: {{
    forceAtlas2Based: {{
      gravitationalConstant: -50,
      centralGravity: 0.01,
      springLength: 100,
      springConstant: 0.08
    }},
    maxVelocity: 50,
    solver: 'forceAtlas2Based',
    timestep: 0.35,
    stabilization: {{ iterations: 150 }}
  }},
  interaction: {{ hover: true, tooltipDelay: 200 }}
}});

// Click no nó
network.on('click', function(params) {{
  if (params.nodes.length > 0) {{
    const nodeId = params.nodes[0];
    const node = nodesWithDegree.find(n => n.id === nodeId);
    if (node) {{
      const neighbors = RAW_EDGES
        .filter(e => e.source === nodeId || e.target === nodeId)
        .map(e => e.source === nodeId ? e.target : e.source);
      const uniqueNeighbors = [...new Set(neighbors)];
      
      document.getElementById('info-content').innerHTML = `
        <div class="field"><b>ID:</b> ${{node.id}}</div>
        <div class="field"><b>Label:</b> ${{node.label || '-'}}</div>
        <div class="field"><b>Tipo:</b> ${{node.file_type || '-'}}</div>
        <div class="field"><b>Arquivo:</b> ${{node.source_file || '-'}}</div>
        <div class="field"><b>Conexões:</b> ${{node.degree}}</div>
        <div class="field"><b>Comunidade:</b> ${{node.community || 0}}</div>
        <div class="field"><b>Vizinhos:</b> ${{uniqueNeighbors.length}}</div>
      `;
    }}
  }} else {{
    document.getElementById('info-content').innerHTML = '<span class="empty">Clique em um nó para ver detalhes</span>';
  }}
}});

// God Nodes
const godNodes = [...nodesWithDegree].sort((a, b) => b.degree - a.degree).slice(0, 10);
const godList = document.getElementById('godnodes-list');
godNodes.forEach((n, i) => {{
  const div = document.createElement('div');
  div.className = 'godnode-item';
  div.textContent = `${{i+1}}. ${{n.label || n.id}} (${{n.degree}})`;
  div.onclick = () => network.focus(n.id, {{ scale: 1.5, animation: true }});
  godList.appendChild(div);
}});

// Legenda com filtros
const legendEl = document.getElementById('legend');
LEGEND.forEach(c => {{
  const item = document.createElement('div');
  item.className = 'legend-item';
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.className = 'legend-cb';
  cb.checked = true;
  cb.addEventListener('change', (e) => {{
    e.stopPropagation();
    if (cb.checked) {{
      hiddenCommunities.delete(c.cid);
      item.classList.remove('dimmed');
    }} else {{
      hiddenCommunities.add(c.cid);
      item.classList.add('dimmed');
    }}
    const updates = nodesWithDegree
      .filter(n => (n.community || 0) === c.cid)
      .map(n => ({{ id: n.id, hidden: !cb.checked }}));
    nodesDS.update(updates);
  }});
  item.innerHTML = `<div class="legend-dot" style="background:${{c.color}}"></div>
    <span class="legend-label">${{c.label}}</span>
    <span class="legend-count">${{c.count}}</span>`;
  item.prepend(cb);
  legendEl.appendChild(item);
}});

// Estatísticas
document.getElementById('stats').innerHTML = `
  Nós: <b>${{RAW_NODES.length}}</b> | 
  Arestas: <b>${{RAW_EDGES.length}}</b> | 
  Comunidades: <b>${{LEGEND.length}}</b>
`;

// Busca
document.getElementById('search').addEventListener('input', (e) => {{
  const term = e.target.value.toLowerCase();
  if (!term) return;
  const found = nodesWithDegree.filter(n => 
    (n.label || '').toLowerCase().includes(term)
  );
  if (found.length > 0) {{
    network.focus(found[0].id, {{ scale: 1.5, animation: true }});
    network.selectNodes([found[0].id]);
  }}
}});

// Export PNG
function exportPNG() {{
  const canvas = document.querySelector('#graph canvas');
  const link = document.createElement('a');
  link.download = 'graphify-mandatodigital.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}}
</script>
</body>
</html>'''

# Substitui o placeholder pelo JSON compacto (uma linha só, como o Graphify faz)
html_content = html_template.replace('{graph_json}', graph_json_compact)

# Salva o arquivo
output_path = 'graphify-out/visualizer-final.html'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print('OK - Visualizador gerado:', output_path)
print('   Nos:', len(graph_data['nodes']))
print('   Arestas:', len(graph_data.get('links', graph_data.get('edges', []))))
print('   Tamanho:', round(len(html_content) / 1024 / 1024, 2), 'MB')
print('\nAbra o arquivo no navegador (duplo clique)')
print('Nao precisa de servidor!')
