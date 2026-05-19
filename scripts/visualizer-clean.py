#!/usr/bin/env python3
"""
Versao limpa do visualizador Graphify.
Remove Node Info (nao funcional) e corrige fisica.
"""

import json
from collections import defaultdict

# Le o graph.html original
with open('graphify-out/graph.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Le o graph.json para analisar comunidades
with open('graphify-out/graph.json', 'r', encoding='utf-8') as f:
    graph_data = json.load(f)

# Analisa comunidades
communities = defaultdict(lambda: {'paths': defaultdict(int)})
for node in graph_data['nodes']:
    c = node.get('community', 0)
    sf = node.get('source_file', '')
    if '/' in sf:
        parts = sf.split('/')
        if len(parts) >= 2:
            communities[c]['paths'][parts[0] + '/' + parts[1]] += 1
        else:
            communities[c]['paths'][parts[0]] += 1
    else:
        communities[c]['paths'][sf] += 1

# Nomeia comunidades
community_names = {}
for c, info in communities.items():
    paths = sorted(info['paths'].items(), key=lambda x: -x[1])
    top_path = paths[0][0] if paths else ''
    
    if 'db/migrations' in top_path:
        community_names[c] = 'DB Migrations'
    elif 'db/schema' in top_path or 'db/relations' in top_path:
        community_names[c] = 'Database'
    elif 'package.json' in top_path:
        community_names[c] = 'Dependencies'
    elif 'tsconfig' in top_path:
        community_names[c] = 'TS Config'
    elif 'components.json' in top_path:
        community_names[c] = 'UI Config'
    elif top_path.startswith('api/'):
        community_names[c] = 'Backend API'
    elif 'src/data' in top_path:
        community_names[c] = 'Data Files'
    elif 'src/pages' in top_path:
        page_count = sum(cnt for p, cnt in paths if 'src/pages' in p)
        comp_count = sum(cnt for p, cnt in paths if 'src/components' in p)
        if page_count > comp_count:
            community_names[c] = 'Pages'
        else:
            community_names[c] = 'Components'
    elif 'src/components/ui' in top_path:
        community_names[c] = 'UI Components'
    elif 'src/components' in top_path:
        community_names[c] = 'Components'
    elif 'src/lib' in top_path:
        community_names[c] = 'Libraries'
    elif 'src/hooks' in top_path:
        community_names[c] = 'Hooks'
    elif 'src/providers' in top_path:
        community_names[c] = 'Providers'
    elif 'public' in top_path:
        community_names[c] = 'Assets'
    elif 'docs' in top_path:
        community_names[c] = 'Documentation'
    elif 'supabase' in top_path:
        community_names[c] = 'Supabase'
    elif 'scripts' in top_path:
        community_names[c] = 'Scripts'
    else:
        community_names[c] = 'Module ' + str(c)

# 1. REMOVE info-panel (nao funcional)
# Substitui o bloco inteiro do info-panel por nada
html = html.replace(
    '''  <div id="info-panel">
    <h3>Node Info</h3>
    <div id="info-content"><span class="empty">Click a node to inspect it</span></div>
  </div>
''',
    ''
)

# Remove tambem o CSS do info-panel
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

# 2. CORRIGE FISICA - reduz iterations de 200 para 60
html = html.replace(
    'stabilization: { iterations: 200, fit: true },',
    'stabilization: { iterations: 60, fit: true },'
)

# 3. Adiciona botao Exportar PNG
export_btn = '<button onclick="exportPNG()" style="position:absolute;top:10px;right:10px;z-index:100;padding:6px 12px;background:#4E79A7;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;">Exportar PNG</button>'
html = html.replace(
    '<div id="graph"></div>',
    '<div id="graph" style="position:relative;">' + export_btn + '</div>'
)

# 4. Adiciona God Nodes na sidebar
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

# 5. Substitui nomes de comunidades
community_map_json = json.dumps(community_names, ensure_ascii=False)

legend_insertion = '''
// Mapa de nomes de comunidades
const COMMUNITY_NAMES = ''' + community_map_json + ''';

'''

html = html.replace(
    "const legendEl = document.getElementById('legend');",
    legend_insertion + "const legendEl = document.getElementById('legend');"
)

html = html.replace(
    '<span class="legend-label">${c.label}</span>',
    '<span class="legend-label">${COMMUNITY_NAMES[c.cid] || c.label}</span>'
)

# 6. Adiciona God Nodes e Export PNG no final
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
output_path = 'graphify-out/visualizer-clean.html'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(html)

print('OK - Visualizador clean gerado:', output_path)
print('\nMudancas:')
print('  - REMOVIDO: Node Info (nao funcional)')
print('  - CORRIGIDO: Fisica reduzida (60 iteracoes)')
print('  - ADICIONADO: Top 10 com tipo')
print('  - ADICIONADO: Nomes de comunidades significativos')
print('  - ADICIONADO: Botao Exportar PNG')
print('\nComunidades:')
for c in sorted(community_names.keys())[:15]:
    print('  - ' + community_names[c])
print('\nAbra no navegador (duplo clique)')
