const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 500 });
  
  const htmlPath = path.resolve(__dirname, '../public/assets/ref-icons/estilos-clusters.html');
  await page.goto('file://' + htmlPath);
  await new Promise(r => setTimeout(r, 500));
  
  const outputPath = path.resolve(__dirname, '../public/assets/ref-icons/estilos-clusters.png');
  await page.screenshot({ path: outputPath, fullPage: true });
  
  await browser.close();
  console.log('Imagem gerada:', outputPath);
})();
