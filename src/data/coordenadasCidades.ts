// Coordenadas aproximadas das principais cidades brasileiras
// Usado para posicionar marcadores no mapa sem precisar de geocodificacao

export const coordenadasCidades: Record<string, [number, number]> = {
  'São Paulo': [-23.5505, -46.6333],
  'Rio de Janeiro': [-22.9068, -43.1729],
  'Belo Horizonte': [-19.9167, -43.9345],
  'Salvador': [-12.9714, -38.5014],
  'Brasília': [-15.7975, -47.8919],
  'Curitiba': [-25.4290, -49.2671],
  'Fortaleza': [-3.7319, -38.5267],
  'Manaus': [-3.1190, -60.0217],
  'Recife': [-8.0476, -34.8770],
  'Porto Alegre': [-30.0346, -51.2177],
  'Belém': [-1.4558, -48.4902],
  'Goiânia': [-16.6869, -49.2648],
  'Guarulhos': [-23.4543, -46.5339],
  'Campinas': [-22.9053, -47.0659],
  'São Luís': [-2.5307, -44.3068],
  'São Gonçalo': [-22.8268, -43.0535],
  'Maceió': [-9.6659, -35.7350],
  'Duque de Caxias': [-22.7856, -43.3112],
  'Natal': [-5.7945, -35.2110],
  'Teresina': [-5.0892, -42.8016],
  'São Bernardo do Campo': [-23.6937, -46.5650],
  'Nova Iguaçu': [-22.7592, -43.4511],
  'João Pessoa': [-7.1195, -34.8450],
  'Santo André': [-23.6639, -46.5383],
  'Osasco': [-23.5325, -46.7917],
  'Jaboatão dos Guararapes': [-8.1129, -35.0149],
  'São José dos Campos': [-23.2237, -45.9009],
  'Ribeirão Preto': [-21.1775, -47.8103],
  'Uberlândia': [-18.9128, -48.2755],
  'Sorocaba': [-23.5015, -47.4526],
  'Cuiabá': [-15.6014, -56.0979],
  'Aparecida de Goiânia': [-16.8203, -49.2473],
  'Aracaju': [-10.9472, -37.0731],
  'Feira de Santana': [-12.2664, -38.9663],
  'Londrina': [-23.3045, -51.1696],
  'Juiz de Fora': [-21.7624, -43.3434],
  'Belford Roxo': [-22.7641, -43.3992],
  'Joinville': [-26.3044, -48.8464],
  'Niterói': [-22.8833, -43.1034],
  'São João de Meriti': [-22.8038, -43.3722],
  'Ananindeua': [-1.3653, -48.3718],
  'Florianópolis': [-27.5954, -48.5480],
  'Santos': [-23.9618, -46.3322],
  'Vila Velha': [-20.3417, -40.2875],
  'Serra': [-20.1286, -40.3074],
  'Diadema': [-23.6861, -46.6244],
  'Campos dos Goytacazes': [-21.7621, -41.3186],
  'Mauá': [-23.6677, -46.4603],
  'Betim': [-19.9672, -44.1981],
  'Cariacica': [-20.2632, -40.4164],
  'Olinda': [-8.0084, -34.8553],
  'Campo Grande': [-20.4697, -54.6201],
  'Piracicaba': [-22.7343, -47.6481],
  'Carapicuíba': [-23.5235, -46.8405],
  'Boa Vista': [2.8235, -60.6758],
  'Macapá': [0.0355, -51.0705],
  'Palmas': [-10.2491, -48.3243],
  'Vitória': [-20.3155, -40.3128],
  'Porto Velho': [-8.7608, -63.8999],
  'Rio Branco': [-9.9754, -67.8249],
};

export function getCoordenadasCidade(nome: string): [number, number] | null {
  // Tenta match exato
  if (coordenadasCidades[nome]) return coordenadasCidades[nome];
  
  // Tenta match case-insensitive
  const lower = nome.toLowerCase();
  for (const [cidade, coords] of Object.entries(coordenadasCidades)) {
    if (cidade.toLowerCase() === lower) return coords;
  }
  
  return null;
}
