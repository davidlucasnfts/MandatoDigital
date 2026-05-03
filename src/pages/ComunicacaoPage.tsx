import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Mail, Smartphone, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { comunicacoes } from '@/data/mockData';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

export default function ComunicacaoPage() {
  const [tipo, setTipo] = useState<'email' | 'sms'>('email');
  const [assunto, setAssunto] = useState('');
  const [conteudo, setConteudo] = useState('');

  const templates = [
    { id: '1', nome: 'Feliz Aniversário', tipo: 'email' as const, descricao: 'Mensagem de parabéns personalizada' },
    { id: '2', nome: 'Convite para Evento', tipo: 'email' as const, descricao: 'Convite para eventos e reuniões' },
    { id: '3', nome: 'Agradecimento', tipo: 'sms' as const, descricao: 'Agradecimento pela participação' },
    { id: '4', nome: 'Newsletter Mensal', tipo: 'email' as const, descricao: 'Resumo mensal de atividades' },
    { id: '5', nome: 'Lembrete', tipo: 'sms' as const, descricao: 'Lembrete de compromissos' },
  ];

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Comunicação
        </h2>
      </motion.div>

      <Tabs defaultValue="enviar" className="space-y-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="enviar">Enviar</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="enviar" className="space-y-6">
          <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Nova Comunicação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant={tipo === 'email' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTipo('email')}
                      className={tipo === 'email' ? 'bg-blue-600' : ''}
                    >
                      <Mail className="w-4 h-4 mr-1.5" /> E-mail
                    </Button>
                    <Button
                      variant={tipo === 'sms' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTipo('sms')}
                      className={tipo === 'sms' ? 'bg-blue-600' : ''}
                    >
                      <Smartphone className="w-4 h-4 mr-1.5" /> SMS
                    </Button>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Assunto</label>
                    <Input
                      placeholder="Digite o assunto..."
                      value={assunto}
                      onChange={(e) => setAssunto(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Conteúdo</label>
                    <textarea
                      placeholder={`Digite o conteúdo da sua ${tipo === 'email' ? 'mensagem' : 'SMS'}...\n\nUse {{nome}}, {{comunidade}}, {{cidade}} para personalizar.`}
                      rows={8}
                      value={conteudo}
                      onChange={(e) => setConteudo(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-slate-400">
                      {conteudo.length} caracteres
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Send className="w-4 h-4 mr-1.5" /> Enviar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Destinatários</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Todos os eleitores</span>
                      <span className="text-xs text-slate-400">2.450</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Por comunidade</span>
                      <span className="text-xs text-slate-400">8</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Por tag</span>
                      <span className="text-xs text-slate-400">12</span>
                    </div>
                    <Button variant="outline" className="w-full text-sm">
                      <Users className="w-4 h-4 mr-1.5" /> Selecionar
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Variáveis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {['{{nome}}', '{{comunidade}}', '{{cidade}}', '{{endereco}}', '{{telefone}}'].map((v) => (
                        <button
                          key={v}
                          onClick={() => setConteudo(prev => prev + v)}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t, i) => (
              <motion.div key={t.id} custom={i} variants={fadeIn} initial="hidden" animate="visible">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {t.tipo === 'email' ? <Mail className="w-4 h-4 text-blue-600" /> : <Smartphone className="w-4 h-4 text-green-600" />}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${t.tipo === 'email' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>{t.tipo.toUpperCase()}</span>
                    </div>
                    <h3 className="font-semibold text-slate-800">{t.nome}</h3>
                    <p className="text-xs text-slate-500 mt-1">{t.descricao}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="historico">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Assunto</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Destinatários</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Data</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Taxa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comunicacoes.map((c) => (
                      <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.tipo === 'email' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                            {c.tipo.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{c.assunto}</td>
                        <td className="py-3 px-4 text-slate-500">{c.destinatarios.toLocaleString()}</td>
                        <td className="py-3 px-4 text-slate-500">{c.dataEnvio}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'enviado' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {c.taxaAbertura ? (
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-slate-400" />
                              <span className="text-xs text-slate-600">{c.taxaAbertura}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
