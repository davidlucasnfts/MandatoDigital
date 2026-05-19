#!/usr/bin/env python3
"""
Pega o graph.html original do Graphify e adiciona:
- God Nodes (top 10 mais conectados)
- Botao Exportar PNG
Uso: python scripts/enhance-graphify.py
"""

import re

# Le o graph.html original
with open('graphify-out/graph.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Adiciona botao Exportar PNG no canto superior direito do grafo
# Procura o div #graph e adiciona o botao dentro dele
export_btn = '<button id="export-btn" onclick="exportPNG()" style="position:absolute;top:10px;right:10px;z-index:100;padding:6px 12px;background:#4E79A7;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;">Exportar PNG</button>'
html = html.replace('<div id="graph"></div>', '<div id="graph" style="position:relative;">' + export_btn + '</div>')

# 2. Adiciona secao God Nodes na sidebar, antes do legend-wrap
# Procura o inicio do legend-wrap e insere o godnodes antes
godnodes_html = '''
  <div id="godnodes" style="padding:12px;border-bottom:1px solid #2a2a4e;max-height:200px;overflow-y:auto;">
    <h3 style="font-size:13px;color:#aaa;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em;">Top 10 - Mais Conectados</h3>
    <div id="godnodes-list"></div>
  </div>
'''
html = html.replace('<div id="legend-wrap">', godnodes_html + '  <div id="legend-wrap">')

# 3. Adiciona o codigo JavaScript para God Nodes e Export PNG
# Procura o final do script (antes de </script></body>) e adiciona
js_code = '''

// GOD NODES - Top 10 mais conectados
const godNodes = [...RAW_NODES].sort((a, b) => (b.degree || 0) - (a.degree || 0)).slice(0, 10);
const godList = document.getElementById('godnodes-list');
if (godList) {
  godNodes.forEach((n, i) => {
    const div = document.createElement('div');
    div.style.cssText = 'cursor:pointer;padding:2px 0;font-size:11px;color:#ccc;';
    div.textContent = (i+1) + '. ' + (n.label || n.id) + ' (' + (n.degree || 0) + ')';
    div.onmouseenter = () => div.style.color = '#4E79A7';
    div.onmouseleave = () => div.style.color = '#ccc';
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

# Insere antes do </script></body></html>
html = html.replace('</script>\n</body>\n</html>', js_code + '</script>\n</body>\n</html>')

# Salva o arquivo melhorado
output_path = 'graphify-out/visualizer-completo.html'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(html)

print('OK - Visualizador completo gerado:', output_path)
print('Baseado no graph.html original + God Nodes + Export PNG')
print('\nAbra no navegador (duplo clique)')
print('Nao precisa de servidor!')
