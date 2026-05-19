#!/usr/bin/env python3
"""
Visualizador Graphify com agrupamento de comunidades.
Agrupa comunidades similares para reduzir a lista.
"""

import json
from collections import defaultdict

# Le o graph.html original
with open('graphify-out/graph.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Le o graph.json
with open('graphify-out/graph.json', 'r', encoding='utf-8') as f:
    graph_data = json.load(f)

# Analisa comunidades
communities = defaultdict(lambda: {'files': [], 'paths': defaultdict(int)})
for node in graph_data['nodes']:
    c = node.get('community', 0)
    sf = node.get('source_file', '')
    communities[c]['files'].append(sf)
    if '/' in sf:
        parts = sf.split('/')
        if len(parts) >= 2:
            communities[c]['paths'][parts[0] + '/' + parts[1]] += 1
        else:
            communities[c]['paths'][parts[0]] += 1
    else:
        communities[c]['paths'][sf] += 1

# Funcao para classificar uma comunidade
def classify_community(c, info):
    files = info['files']
    paths = sorted(info['paths'].items(), key=lambda x: -x[1])
    top_path = paths[0][0] if paths else ''
    
    total = len(files)
    ui_count = sum(1 for f in files if 'components/ui/' in f)
    page_count = sum(1 for f in files if 'pages/' in f)
    hook_count = sum(1 for f in files if 'hooks/' in f)
    lib_count = sum(1 for f in files if 'lib/' in f)
    api_count = sum(1 for f in files if f.startswith('api/'))
    db_count = sum(1 for f in files if f.startswith('db/'))
    data_count = sum(1 for f in files if 'src/data/' in f)
    config_count = sum(1 for f in files if any(x in f for x in ['package.json', 'tsconfig', 'components.json']))
    
    # Regras de classificacao
    if api_count > 0:
        return 'Backend API'
    if db_count > 0:
        return 'Database'
    if config_count > 0:
        return 'Config'
    if data_count > 0:
        return 'Data Files'
    if hook_count > 0 and hook_count > page_count and hook_count > ui_count:
        return 'Hooks'
    if ui_count > total * 0.5:
        return 'UI Components'
    if page_count > 0 and ui_count > 0:
        return 'Page Components'
    if page_count > 0 and hook_count > 0:
        return 'Pages & Hooks'
    if page_count > 0:
        return 'Pages'
    if lib_count > 0:
        return 'Libraries'
    if 'providers' in top_path:
        return 'Providers'
    if 'public' in top_path:
        return 'Assets'
    if 'docs' in top_path:
        return 'Docs'
    if 'supabase' in top_path:
        return 'Supabase'
    if 'scripts' in top_path:
        return 'Scripts'
    return 'Other'

# Classifica todas as comunidades
community_groups = {}
for c, info in communities.items():
    community_groups[c] = classify_community(c, info)

# Conta quantas comunidades de cada tipo
from collections import Counter
group_counts = Counter(community_groups.values())

print('Agrupamento de comunidades:')
for group, count in sorted(group_counts.items(), key=lambda x: -x[1]):
    print('  ' + group + ': ' + str(count) + ' comunidades')

# Mapeia cada comunidade para seu grupo
community_map_json = json.dumps(community_groups, ensure_ascii=False)

# 1. Adiciona botao Exportar PNG
export_btn = '<button onclick="exportPNG()" style="position:absolute;top:10px;right:10px;z-index:100;padding:6px 12px;background:#4E79A7;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;">Exportar PNG</button>'
html = html.replace(
    '<div id="graph"></div>',
    '<div id="graph" style="position:relative;">' + export_btn + '</div>'
)

# 2. Remove info-panel
html = html.replace(
    '''  <div id="info-panel">
    <h3>Node Info</h3>
    <div id="info-content"><span class="empty">Click a node to inspect it</span></div>
  </div>
''',
    ''
)

# Remove CSS do info-panel
html = html.replace(
    '''  #info-panel { padding: 14px; border-bottom: 1px solid #2a2a4e; min-height: 140px; }
  #info-panel h3 { font-size: 13px; color: #aaa; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
  #info-content { font-size: 13px; color: #ccc; line-height: 1.6; }
  #info-content .field { margin-bottom: 5px; }
  #info-content .field b { color: #e0e0e0; }
  #info-content .empty { color: #555; font-style: italic; }
  .neighbor-link { display: block; padding: 2px 6px; margin: 2px 0; border-radius: 3px; cursor: pointer; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-left: 3px solid #333; }
  .neighbor-link:hover { background: #2a2a4e; }
  #neighbors-list { max-height: 160px; overflow-y: auto; margin-top: 4px; }
''',
    ''
)

# 3. Adiciona God Nodes
godnodes_section = '''
  <div id="godnodes" style="padding:12px;border-bottom:1px solid #2a2a4e;max-height:200px;overflow-y:auto;">
    <h3 style="font-size:13px;color:#aaa;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em;">Top 10 - Mais Conectados</h3>
    <div id="godnodes-list" style="font-size:11px;"></div>
  </div>
'''
html = html.replace(
    '<div id="legend-wrap">',
    godnodes_section + '  <div id="legend-wrap">'
)

# 4. Substitui nomes de comunidades pelos grupos
legend_insertion = '''
// Mapa de grupos de comunidades
const COMMUNITY_GROUPS = ''' + community_map_json + ''';

'''

html = html.replace(
    "const legendEl = document.getElementById('legend');",
    legend_insertion + "const legendEl = document.getElementById('legend');"
)

html = html.replace(
    '<span class="legend-label">${c.label}</span>',
    '<span class="legend-label">${COMMUNITY_GROUPS[c.cid] || c.label}</span>'
)

# 5. Adiciona God Nodes e Export PNG no final
js_final = '''

// God Nodes - Top 10 mais conectados
function getNodeType(node) {
  const sf = node._source_file || node.source_file || '';
  const label = node.label || '';
  if (sf.includes('router')) return 'API';
  if (sf.includes('page') || sf.includes('Page')) return 'Page';
  if (sf.includes('hook') || label.startsWith('use')) return 'Hook';
  if (sf.includes('component') || sf.endsWith('.tsx')) return 'Component';
  if (sf.includes('lib/') || sf.includes('util')) return 'Lib';
  if (sf.includes('schema') || sf.includes('db/')) return 'DB';
  if (sf.includes('test')) return 'Test';
  if (sf.endsWith('.json')) return 'JSON';
  if (sf.endsWith('.css')) return 'Style';
  return 'Code';
}

const godNodesList = [...RAW_NODES].sort((a, b) => (b.degree || b._degree || 0) - (a.degree || a._degree || 0)).slice(0, 10);
const godContainer = document.getElementById('godnodes-list');
if (godContainer) {
  godNodesList.forEach((n, i) => {
    const div = document.createElement('div');
    div.style.cssText = 'cursor:pointer;padding:2px 0;color:#ccc;display:flex;justify-content:space-between;align-items:center;border-radius:3px;';
    
    const type = getNodeType(n);
    const typeColors = {
      'API': '#ff6b6b', 'Page': '#4ecdc4', 'Hook': '#45b7d1',
      'Component': '#96ceb4', 'Lib': '#ffeaa7', 'DB': '#b2bec3',
      'Test': '#fd79a8', 'JSON': '#fdcb6e', 'Style': '#fab1a0', 'Code': '#74b9ff'
    };
    const typeColor = typeColors[type] || '#ccc';
    const degree = n.degree || n._degree || 0;
    
    div.innerHTML = '<span>' + (i+1) + '. ' + (n.label || n.id).substring(0, 25) + '</span>' +
      '<span style="background:' + typeColor + ';color:#000;padding:1px 4px;border-radius:3px;font-size:9px;font-weight:bold;margin-left:4px;">' + type + '</span>';
    
    div.onmouseenter = () => { div.style.background = '#2a2a4e'; };
    div.onmouseleave = () => { div.style.background = 'transparent'; };
    div.onclick = () => {
      network.focus(n.id, { scale: 1.5, animation: true });
      network.selectNodes([n.id]);
    };
    godContainer.appendChild(div);
  });
}

// Exportar PNG
function exportPNG() {
  const canvas = document.querySelector('#graph canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.download = 'graphify-mandatodigital.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}
'''

html = html.replace('</script>\n</body>\n</html>', js_final + '</script>\n</body>\n</html>')

# Salva
output_path = 'graphify-out/visualizer-grouped.html'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(html)

print('\nOK - Visualizador grouped gerado:', output_path)
print('Fisica: original (200 iteracoes)')
print('Node Info: removido')
print('Comunidades agrupadas por tipo')
print('\nAbra no navegador (duplo clique)')
