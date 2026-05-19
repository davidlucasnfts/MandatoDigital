// Script para rodar Graphify em watch mode automaticamente
// Uso: node scripts/graphify-watch.js

const { spawn } = require('child_process');
const path = require('path');

console.log('🧠 Graphify Watch Mode iniciado...');
console.log('Observando mudanças no código...');
console.log('Pressione Ctrl+C para parar\n');

const graphify = spawn('py', ['-m', 'graphify', 'watch', '.'], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit'
});

graphify.on('error', (err) => {
  console.error('Erro ao iniciar Graphify:', err.message);
  console.log('Tente: npm run graphify:watch');
});

graphify.on('exit', (code) => {
  console.log(`Graphify finalizado com código ${code}`);
});
