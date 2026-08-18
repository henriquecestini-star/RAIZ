const fs = require('fs');
const path = require('path');

const txt = fs.readFileSync('raiz-v2-fullcode.txt', 'utf8');
const linhas = txt.split(/\r?\n/);

let arquivoAtual = null;

for (const linha of linhas) {
  const m = linha.match(/^FILE:\s*(src\/[^\s(]+)/);
  if (m) {
    arquivoAtual = m[1];
    fs.mkdirSync(path.dirname(arquivoAtual), { recursive: true });
    fs.writeFileSync(arquivoAtual, '');
    continue;
  }
  if (arquivoAtual && !/^─{4,}$/.test(linha.trim())) {
    fs.appendFileSync(arquivoAtual, linha + '\n');
  }
}
console.log('Pronto! Pasta src criada com todos os arquivos.');