import type { Eleitor } from './supabase';

/**
 * Substitui variáveis de template no conteúdo da mensagem.
 * Variáveis suportadas: {{nome}}, {{nome_completo}}, {{cidade}}, {{bairro}},
 * {{comunidade}}, {{telefone}}, {{endereco}}
 */
export function aplicarTemplate(
  conteudo: string,
  eleitor: Eleitor,
  comunidades: { id: string; nome: string }[] = []
): string {
  const comunidade = comunidades.find(c => c.id === eleitor.comunidade_id);
  return conteudo
    .replace(/{{nome}}/g, eleitor.nome?.split(' ')[0] || '')
    .replace(/{{nome_completo}}/g, eleitor.nome || '')
    .replace(/{{cidade}}/g, eleitor.cidade || '')
    .replace(/{{bairro}}/g, eleitor.bairro || '')
    .replace(/{{comunidade}}/g, comunidade?.nome || '')
    .replace(/{{telefone}}/g, eleitor.telefone || '')
    .replace(/{{endereco}}/g, eleitor.endereco || '');
}
