#!/usr/bin/env python3
"""
Gera visualizer.html com graph.json embutido.
Uso: python scripts/build-visualizer.py
"""

import json
import os

# Lê o graph.json
with open('graphify-out/graph.json', 'r', encoding='utf-8') as f:
    graph_data = json.load(f)

# Template HTML com JSON embutido
html_template = '''<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Graphify - MandatoDigital</title>
  <script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
  <style>
    body {{ margin: 0; font-family: Arial, sans-serif; background: #1a1a2e; }}
    #mynetwork {{ width: 100vw; height: 100vh; }}
    #info {{
      position: fixed; top: 10px; left: 10px; background: rgba(0,0,0,0.8);
      color: white; padding: 15px; border-radius: 8px; max-width: 300px;
      z-index: 100;
    }}
    #info h2 {{ margin: 0 0 10px 0; font-size: 16px; }}
    #info p {{ margin: 5px 0; font-size: 12px; }}
    #search {{
      position: fixed; top: 10px; right: 10px;
      padding: 8px; border-radius: 4px; border: none; width: 200px;
      z-index: 100;
    }}
    #filters {{
      position: fixed; bottom: 10px; left: 10px;
      background: rgba(0,0,0,0.8); color: white;
      padding: 10px; border-radius: 8px; z-index: 100;
    }}
    #filters label {{ display: block; margin: 5px 0; font-size: 12px; cursor: pointer; }}
    #filters input {{ margin-right: 5px; }}
    #legend {{
      position: fixed; bottom: 10px; right: 10px;
      background: rgba(0,0,0,0.8); color: white;
      padding: 10px; border-radius: 8px; z-index: 100; font-size: 12px;
    }}
    .legend-item {{ display: flex; align-items: center; margin: 3px 0; }}
    .legend-color {{ width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }}
    #godnodes {{
      position: fixed; top: 50%; left: 10px; transform: translateY(-50%);
      background: rgba(0,0,0,0.8); color: white;
      padding: 10px; border-radius: 8px; z-index: 100;
      max-height: 300px; overflow-y: auto; font-size: 11px;
    }}
    #godnodes h3 {{ margin: 0 0 8px 0; font-size: 12px; }}
    #godnodes div {{ cursor: pointer; padding: 2px 0; }}
    #godnodes div:hover {{ color: #4a90d9; }}
    #details {{
      display: none; position: fixed; top: 50%; right: 10px; 
      transform: translateY(-50%); background: rgba(0,0,0,0.9); 
      color: white; padding: 15px; border-radius: 8px; 
      z-index: 100; max-width: 250px; font-size: 12px;
    }}
  </style>
</head>
<body>
  <div id="info">
    <h2>🧠 Graphify - MandatoDigital</h2>
    <p>🟢 Nós: <span id="nodes-count">-</span></p>
    <p>🔗 Arestas: <span id="edges-count">-</span></p>
    <p>📊 Comunidades: <span id="communities-count">-</span></p>
    <p style="margin-top:10px; font-size:11px; opacity:0.7;">
      Clique em um nó para ver detalhes.<br>
      Use o mouse para zoom e pan.
    </p>
  </div>
  
  <input type="text" id="search" placeholder="Buscar arquivo...">
  
  <div id="filters">
    <strong>Filtros:</strong>
    <label><input type="checkbox" id="filter-code" checked> Código (.ts, .tsx)</label>
    <label><input type="checkbox" id="filter-doc" checked> Documentação (.md)</label>
    <label><input type="checkbox" id="filter-config" checked> Configuração (.json)</label>
    <label><input type="checkbox" id="filter-other" checked> Outros</label>
  </div>
  
  <div id="legend">
    <strong>Legenda:</strong>
    <div class="legend-item"><div class="legend-color" style="background:#00d4ff"></div>Frontend (React)</div>
    <div class="legend-item"><div class="legend-color" style="background:#00ff88"></div>Backend (API)</div>
    <div class="legend-item"><div class="legend-color" style="background:#ff3366"></div>Banco de Dados</div>
    <div class="legend-item"><div class="legend-color" style="background:#ffaa00"></div>Configuração</div>
    <div class="legend-item"><div class="legend-color" style="background:#cc66ff"></div>Documentação</div>
    <div class="legend-item"><div class="legend-color" style="background:#8899aa"></div>Outros</div>
  </div>
  
  <div id="godnodes">
    <h3>⭐ God Nodes (Mais Conectados)</h3>
    <div id="godnodes-list"></div>
  </div>
  
  <div id="details">
    <h3 id="details-title" style="margin:0 0 10px 0; font-size:14px;"></h3>
    <p id="details-type"></p>
    <p id="details-file"></p>
    <p id="details-degree"></p>
    <p id="details-community"></p>
    <button onclick="document.getElementById('details').style.display='none'" style="margin-top:10px; padding:5px 10px; background:#4a90d9; color:white; border:none; border-radius:4px; cursor:pointer;">Fechar</button>
  </div>
  
  <div style="position:fixed; top:10px; left:50%; transform:translateX(-50%); z-index:100;">
    <button onclick="exportImage()" style="padding:8px 16px; background:#4a90d9; color:white; border:none; border-radius:4px; cursor:pointer; font-size:12px;">📷 Exportar PNG</button>
  </div>
  
  <div id="mynetwork"></div>

  <script>
    const GRAPH_DATA = {graph_json};
    
    let allNodes = [];
    let allEdges = [];
    let network = null;

    function getNodeCategory(node) {{
      const file = (node.source_file || node.label || '').toLowerCase();
      if (file.includes('src/components') || file.includes('src/pages') || file.endsWith('.tsx')) return 'frontend';
      if (file.includes('api/') || file.includes('router') || file.includes('middleware')) return 'backend';
      if (file.includes('db/') || file.includes('schema') || file.includes('migrations')) return 'database';
      if (file.endsWith('.md') || file.includes('docs/')) return 'doc';
      if (file.endsWith('.json') || file.includes('.config') || file.includes('package')) return 'config';
      return 'other';
    }}

    function getNodeColor(category) {{
      const colors = {{
        frontend: '#00d4ff',
        backend: '#00ff88',
        database: '#ff3366',
        config: '#ffaa00',
        doc: '#cc66ff',
        other: '#8899aa'
      }};
      return colors[category] || '#8899aa';
    }}

    function calculateDegree(edges, nodeId) {{
      return edges.filter(e => e.source === nodeId || e.target === nodeId).length;
    }}

    function updateGraph() {{
      const showCode = document.getElementById('filter-code').checked;
      const showDoc = document.getElementById('filter-doc').checked;
      const showConfig = document.getElementById('filter-config').checked;
      const showOther = document.getElementById('filter-other').checked;

      const visibleNodes = allNodes.filter(n => {{
        if (n.category === 'frontend' && !showCode) return false;
        if (n.category === 'backend' && !showCode) return false;
        if (n.category === 'database' && !showCode) return false;
        if (n.category === 'doc' && !showDoc) return false;
        if (n.category === 'config' && !showConfig) return false;
        if (n.category === 'other' && !showOther) return false;
        return true;
      }});

      const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
      const visibleEdges = allEdges.filter(e => 
        visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to)
      );

      const nodesDataSet = new vis.DataSet(visibleNodes.map(n => ({{
        id: n.id,
        label: n.label || n.id,
        title: `${{n.category.toUpperCase()}}: ${{n.source_file || n.label || n.id}}\nConexões: ${{n.degree}}`,
        color: {{
          background: getNodeColor(n.category),
          border: '#fff'
        }},
        size: 6 + Math.min(25, n.degree * 0.3)
      }})));

      const edgesDataSet = new vis.DataSet(visibleEdges);

      const container = document.getElementById('mynetwork');
      
      if (network) {{
        network.destroy();
      }}
      
      network = new vis.Network(container, {{ 
        nodes: nodesDataSet, 
        edges: edgesDataSet 
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
        interaction: {{
          hover: true,
          tooltipDelay: 200
        }}
      }});

      network.on('click', function(params) {{
        if (params.nodes.length > 0) {{
          const nodeId = params.nodes[0];
          const node = allNodes.find(n => n.id === nodeId);
          if (node) {{
            document.getElementById('details-title').textContent = node.label || node.id;
            document.getElementById('details-type').textContent = 'Tipo: ' + node.category;
            document.getElementById('details-file').textContent = 'Arquivo: ' + (node.source_file || '-');
            document.getElementById('details-degree').textContent = 'Conexões: ' + node.degree;
            document.getElementById('details-community').textContent = 'Comunidade: ' + node.community;
            document.getElementById('details').style.display = 'block';
          }}
        }}
      }});
    }}

    // Inicializa com os dados embutidos
    const data = GRAPH_DATA;
    
    allNodes = data.nodes.map(n => ({{
      ...n,
      category: getNodeCategory(n),
      degree: calculateDegree(data.links || data.edges || [], n.id)
    }}));

    allEdges = (data.links || data.edges || []).map(e => ({{
      from: e.source,
      to: e.target,
      title: e.type || 'connects',
      color: {{ color: 'rgba(255,255,255,0.15)' }},
      width: 1
    }}));

    const godNodes = [...allNodes].sort((a, b) => b.degree - a.degree).slice(0, 10);
    const godNodesList = document.getElementById('godnodes-list');
    godNodes.forEach((n, i) => {{
      const div = document.createElement('div');
      div.textContent = `${{i+1}}. ${{n.label || n.id}} (${{n.degree}})`;
      div.onclick = () => {{
        if (network) {{
          network.focus(n.id, {{ scale: 1.5, animation: true }});
          network.selectNodes([n.id]);
        }}
      }};
      godNodesList.appendChild(div);
    }});

    updateGraph();

    document.getElementById('nodes-count').textContent = allNodes.length;
    document.getElementById('edges-count').textContent = allEdges.length;
    document.getElementById('communities-count').textContent = 
      new Set(allNodes.map(n => n.community)).size;

    document.getElementById('search').addEventListener('input', (e) => {{
      const term = e.target.value.toLowerCase();
      const found = allNodes.filter(n => 
        (n.label || '').toLowerCase().includes(term)
      );
      if (found.length > 0 && network) {{
        network.focus(found[0].id, {{ scale: 1.5, animation: true }});
        network.selectNodes([found[0].id]);
      }}
    }});

    ['filter-code', 'filter-doc', 'filter-config', 'filter-other'].forEach(id => {{
      document.getElementById(id).addEventListener('change', updateGraph);
    }});

    window.exportImage = function() {{
      const canvas = document.querySelector('#mynetwork canvas');
      const link = document.createElement('a');
      link.download = 'graphify-mandatodigital.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }};
  </script>
</body>
</html>'''

# Substitui o placeholder pelo JSON formatado (indentado para evitar linha muito longa)
graph_json_str = json.dumps(graph_data, ensure_ascii=False, indent=2)
html_content = html_template.replace('{graph_json}', graph_json_str)

# Salva o arquivo
output_path = 'graphify-out/visualizer-embedded.html'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print('OK - Visualizador gerado:', output_path)
print('Nos:', len(graph_data['nodes']))
print('Arestas:', len(graph_data.get('links', graph_data.get('edges', []))))
print('\nAbra o arquivo no navegador (duplo clique)')
print('Nao precisa de servidor!')
