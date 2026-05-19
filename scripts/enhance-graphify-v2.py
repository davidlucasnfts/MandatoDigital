#!/usr/bin/env python3
"""
Pega o graph.html original do Graphify e adiciona:
- God Nodes com tipo do arquivo
- Comunidades com nomes significativos
- Fisica mais leve (para nao travar)
Uso: python scripts/enhance-graphify-v2.py
"""

import json
import re
from collections import defaultdict

# Le o graph.html original
with open('graphify-out/graph.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Le o graph.json para analisar comunidades
with open('graphify-out/graph.json', 'r', encoding='utf-8') as f:
    graph_data = json.load(f)

# Analisa comunidades para dar nomes significativos
communities = defaultdict(lambda: {'files': [], 'paths': defaultdict(int), 'types': defaultdict(int)})

for node in graph_data['nodes']:
    c = node.get('community', 0)
    sf = node.get('source_file', '')
    ft = node.get('file_type', 'other')
    communities[c]['files'].append(sf)
    communities[c]['types'][ft] += 1
    
    # Extrai pasta principal
    if '/' in sf:
        parts = sf.split('/')
        if len(parts) >= 2:
            communities[c]['paths'][parts[0] + '/' + parts[1]] += 1
        else:
            communities[c]['paths'][parts[0]] += 1
    else:
        communities[c]['paths'][sf] += 1

# Mapeia comunidades para nomes significativos
community_names = {}
community_icons = {}

for c, info in communities.items():
    paths = sorted(info['paths'].items(), key=lambda x: -x[1])
    top_path = paths[0][0] if paths else ''
    files = info['files']
    
    # Regras de nomeacao baseadas nos paths mais comuns
    if 'db/migrations' in top_path:
        community_names[c] = 'DB Migrations'
        community_icons[c] = '🗄️'
    elif 'db/schema' in top_path or any('schema' in f for f in files):
        community_names[c] = 'Database Schema'
        community_icons[c] = '📊'
    elif 'package.json' in top_path:
        community_names[c] = 'Dependencies'
        community_icons[c] = '📦'
    elif 'tsconfig' in top_path:
        community_names[c] = 'Config TypeScript'
        community_icons[c] = '⚙️'
    elif 'components.json' in top_path:
        community_names[c] = 'UI Config'
        community_icons[c] = '🎨'
    elif 'api/' in top_path or any(f.startswith('api/') for f in files if f):
        community_names[c] = 'Backend API'
        community_icons[c] = '⚡'
    elif 'src/data' in top_path:
        community_names[c] = 'Data Files'
        community_icons[c] = '📁'
    elif 'src/pages' in top_path and 'src/components' not in top_path:
        # Verifica se tem mais pages que components
        page_count = sum(1 for p, cnt in paths if 'src/pages' in p)
        comp_count = sum(1 for p, cnt in paths if 'src/components' in p)
        if page_count > comp_count:
            community_names[c] = 'Pages'
            community_icons[c] = '📄'
        else:
            community_names[c] = 'Components'
            community_icons[c] = '🧩'
    elif 'src/components' in top_path:
        # Verifica se e UI puro ou components de feature
        ui_count = sum(1 for f in files if 'ui/' in f)
        if ui_count > len(files) * 0.5:
            community_names[c] = 'UI Components'
            community_icons[c] = '🎨'
        else:
            community_names[c] = 'Components'
            community_icons[c] = '🧩'
    elif 'src/lib' in top_path:
        community_names[c] = 'Libraries'
        community_icons[c] = '📚'
    elif 'src/hooks' in top_path:
        community_names[c] = 'Hooks'
        community_icons[c] = '⚓'
    elif 'src/providers' in top_path:
        community_names[c] = 'Providers'
        community_icons[c] = '🔌'
    elif any('test' in f.lower() for f in files):
        community_names[c] = 'Tests'
        community_icons[c] = '🧪'
    elif any('docs/' in f for f in files):
        community_names[c] = 'Documentation'
        community_icons[c] = '📝'
    elif any('.md' in f for f in files):
        community_names[c] = 'Docs'
        community_icons[c] = '📖'
    else:
        community_names[c] = 'Module ' + str(c)
        community_icons[c] = '📦'

# Gera o JSON de mapeamento de comunidades
community_map_json = json.dumps(community_names, ensure_ascii=False)
community_icons_json = json.dumps(community_icons, ensure_ascii=False)

# 1. Adiciona botao Exportar PNG
export_btn = '<button id="export-btn" onclick="exportPNG()" style="position:absolute;top:10px;right:10px;z-index:100;padding:6px 12px;background:#4E79A7;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;">Exportar PNG</button>'
html = html.replace('<div id="graph"></div>', '<div id="graph" style="position:relative;">' + export_btn + '</div>')

# 2. Adiciona secao God Nodes na sidebar
godnodes_html = '''
  <div id="godnodes" style="padding:12px;border-bottom:1px solid #2a2a4e;max-height:220px;overflow-y:auto;">
    <h3 style="font-size:13px;color:#aaa;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em;">Top 10 - Mais Conectados</h3>
    <div id="godnodes-list"></div>
  </div>
'''
html = html.replace('<div id="legend-wrap">', godnodes_html + '  <div id="legend-wrap">')

# 3. Modifica a fisica para ser mais leve (nao travar)
# Reduz iterations de 150 para 80
html = html.replace('stabilization: { iterations: 150 }', 'stabilization: { iterations: 80 }')
# Reduz maxVelocity
html = html.replace('maxVelocity: 50,', 'maxVelocity: 30,')

# 4. Adiciona o codigo JavaScript para God Nodes, Export PNG e nomes de comunidades
js_code = '''

// MAPEAMENTO DE COMUNIDADES PARA NOMES SIGNIFICATIVOS
const COMMUNITY_NAMES = ''' + community_map_json + ''';
const COMMUNITY_ICONS = ''' + community_icons_json + ''';

// Substitui nomes de comunidades na legenda
function updateCommunityNames() {
  document.querySelectorAll('.legend-item').forEach(item => {
    const labelSpan = item.querySelector('.legend-label');
    if (labelSpan) {
      const text = labelSpan.textContent;
      const match = text.match(/Community (\\d+)/);
      if (match) {
        const cid = parseInt(match[1]);
        const name = COMMUNITY_NAMES[cid] || ('Community ' + cid);
        const icon = COMMUNITY_ICONS[cid] || '';
        labelSpan.textContent = icon + ' ' + name;
      }
    }
  });
}

// Chama apos um tempo para a legenda estar renderizada
setTimeout(updateCommunityNames, 500);

// GOD NODES - Top 10 mais conectados com tipo
function getNodeType(node) {
  const sf = node.source_file || '';
  const label = node.label || '';
  if (sf.includes('router')) return 'API';
  if (sf.includes('page') || sf.includes('Page')) return 'Page';
  if (sf.includes('hook') || sf.includes('use')) return 'Hook';
  if (sf.includes('component') || sf.endsWith('.tsx')) return 'Component';
  if (sf.includes('lib/') || sf.includes('util')) return 'Lib';
  if (sf.includes('schema') || sf.includes('db/')) return 'DB';
  if (sf.includes('test')) return 'Test';
  if (label.includes('()') || label.includes('function')) return 'Function';
  if (sf.endsWith('.json')) return 'JSON';
  if (sf.endsWith('.css')) return 'Style';
  return 'Code';
}

const godNodes = [...RAW_NODES].sort((a, b) => (b.degree || 0) - (a.degree || 0)).slice(0, 10);
const godList = document.getElementById('godnodes-list');
if (godList) {
  godNodes.forEach((n, i) => {
    const div = document.createElement('div');
    div.style.cssText = 'cursor:pointer;padding:3px 0;font-size:11px;color:#ccc;display:flex;justify-content:space-between;align-items:center;';
    
    const type = getNodeType(n);
    const typeColor = {
      'API': '#ff6b6b', 'Page': '#4ecdc4', 'Hook': '#45b7d1',
      'Component': '#96ceb4', 'Lib': '#ffeaa7', 'DB': '#dfe6e9',
      'Test': '#fd79a8', 'Function': '#a29bfe', 'JSON': '#fdcb6e',
      'Style': '#fab1a0', 'Code': '#74b9ff'
    }[type] || '#ccc';
    
    div.innerHTML = '<span>' + (i+1) + '. ' + (n.label || n.id) + '</span>' +
      '<span style="background:' + typeColor + ';color:#000;padding:1px 4px;border-radius:3px;font-size:9px;font-weight:bold;">' + type + '</span>';
    
    div.onmouseenter = () => { div.style.background = '#2a2a4e'; div.style.borderRadius = '4px'; };
    div.onmouseleave = () => { div.style.background = 'transparent'; };
    div.onclick = () => {
      network.focus(n.id, { scale: 1.5, animation: true });
      network.selectNodes([n.id]);
    };
    godList.appendChild(div);
  });
}

// EXPORTAR PNG
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

html = html.replace('</script>\n</body>\n</html>', js_code + '</script>\n</body>\n</html>')

# Salva o arquivo melhorado
output_path = 'graphify-out/visualizer-final.html'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(html)

print('OK - Visualizador final gerado:', output_path)
print('\nMelhorias:')
print('  - Fisica mais leve (80 iteracoes, maxVelocity 30)')
print('  - Top 10 com tipo do arquivo (colorido)')
print('  - Comunidades com nomes significativos:')
for c in sorted(community_names.keys())[:10]:
    print('    ' + community_icons.get(c, '') + ' ' + community_names[c])
print('\nAbra no navegador (duplo clique)')
