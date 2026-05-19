// Script para rodar Graphify Watch + Servidor ao mesmo tempo
// Uso: node scripts/graphify-serve-watch.js

const { spawn } = require('child_process');
const path = require('path');

console.log('🧠 Graphify Serve + Watch');
console.log('Servidor: http://localhost:3001');
console.log('Watch: atualizando automaticamente...');
console.log('Pressione Ctrl+C para parar\n');

// Inicia o servidor
const server = spawn('npx', ['serve', 'graphify-out', '-p', '3001'], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'pipe'
});

server.stdout.on('data', (data) => {
  console.log('[SERVIDOR]', data.toString().trim());
});

server.stderr.on('data', (data) => {
  console.error('[SERVIDOR ERRO]', data.toString().trim());
});

// Inicia o watch
const watch = spawn('py', ['-m', 'graphify', 'watch', '.'], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'pipe'
});

watch.stdout.on('data', (data) => {
  console.log('[WATCH]', data.toString().trim());
});

watch.stderr.on('data', (data) => {
  console.error('[WATCH ERRO]', data.toString().trim());
});

// Abre o navegador automaticamente
setTimeout(() => {
  const open = spawn('start', ['http://localhost:3001/visualizer.html'], {
    shell: true
  });
  console.log('🌐 Abrindo navegador...\n');
}, 3000);

// Tratamento de encerramento
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando...');
  server.kill();
  watch.kill();
  process.exit(0);
});

console.log('Aguardando inicialização...\n');
