#!/usr/bin/env python3
"""
Agrupa comunidades do graph.json e gera visualizador limpo.
"""

import json
from collections import defaultdict

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

# Cria mapa de comunidade original -> nova comunidade agrupada
# Usa um ID unico para cada grupo
unique_groups = sorted(set(community_groups.values()))
group_to_id = {g: i for i, g in enumerate(unique_groups)}

# Paleta de cores para os grupos
palette = [
    '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
    '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC',
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'
]

# MODIFICA O GRAPH_DATA: agrupa comunidades
for node in graph_data['nodes']:
    old_community = node.get('community', 0)
    group_name = community_groups.get(old_community, 'Other')
    new_community = group_to_id[group_name]
    node['community'] = new_community
    # Atualiza a cor do no para a cor do grupo
    node['color'] = {
        'background': palette[new_community % len(palette)],
        'border': '#fff'
    }

# Salva o graph.json modificado
with open('graphify-out/graph-agrupado.json', 'w', encoding='utf-8') as f:
    json.dump(graph_data, f, ensure_ascii=False, separators=(',', ':'))

print('OK - graph-agrupado.json gerado')
print('Grupos (' + str(len(unique_groups)) + '):')
for i, g in enumerate(unique_groups):
    print('  ' + str(i) + '. ' + g + ' (cor: ' + palette[i % len(palette)] + ')')
