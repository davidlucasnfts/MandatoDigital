import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Mail, Gift, Save, Check, MessageSquare, RotateClockwise, Scan, Link2 } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConfiguracoes } from '@/hooks/useSupabaseData';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { maskPhone, capitalizeWords } from '@/lib/masks';


const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

export default function ConfiguracoesPage() {
  const [profile, setProfile] = useState({
    nome: 'Administrador',
    email: 'admin@mandatodigital.com.br',
    telefone: '(11) 98765-4321',
    cargo: 'Vereador',
    partido: 'PSDB',
    cidade: 'São Paulo',
    estado: 'SP',
  });

  const [notificacoes, setNotificacoes] = useState({
    email: true,
    sms: false,
    aniversario: true,
    solicitacoes: true,
    tarefas: true,
  });

  const { data: configs, set: setConfig, loading: saving } = useConfiguracoes();
  const [templateLocal, setTemplateLocal] = useState('');
  const [saved, setSaved] = useState(false);
  const { getSession, startSession, getQRCode, sendText } = useWhatsApp();
  const [wahaStatus, setWahaStatus] = useState<string>('');
  const [wahaQR, setWahaQR] = useState<string | null>(null);
  const [wahaLoading, setWahaLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);

  const templateAtual = configs['template_aniversario'] || 'Olá {{nome}}! 🎉\n\nDesejo um feliz aniversário! Muita saúde, paz e conquistas.\n\nConte comigo sempre!\n\nAbraço,';

  const handleSaveTemplate = async () => {
    await setConfig('template_aniversario', templateLocal || templateAtual);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Configurações
        </h2>
      </motion.div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="bg-white border flex-wrap h-auto">
          <TabsTrigger value="perfil">
            <User className="w-4 h-4 mr-1.5" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="notificacoes">
            <Bell className="w-4 h-4 mr-1.5" /> Notificações
          </TabsTrigger>
          <TabsTrigger value="aniversario">
            <Gift className="w-4 h-4 mr-1.5" /> Aniversário
          </TabsTrigger>
          <TabsTrigger value="seguranca">
            <Shield className="w-4 h-4 mr-1.5" /> Segurança
          </TabsTrigger>
          <TabsTrigger value="integracoes">
            <Mail className="w-4 h-4 mr-1.5" /> Integrações
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <MessageSquare className="w-4 h-4 mr-1.5" /> WhatsApp
          </TabsTrigger>

        </TabsList>

        <TabsContent value="perfil" className="space-y-4">
          <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Nome Completo</label>
                    <Input value={profile.nome} onChange={(e) => setProfile({ ...profile, nome: capitalizeWords(e.target.value) })} className="h-10" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">E-mail</label>
                    <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="h-10" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Telefone</label>
                    <Input value={profile.telefone} onChange={(e) => setProfile({ ...profile, telefone: maskPhone(e.target.value) })} className="h-10" maxLength={15} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Cargo</label>
                    <Input value={profile.cargo} onChange={(e) => setProfile({ ...profile, cargo: e.target.value })} className="h-10" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Partido</label>
                    <Input value={profile.partido} onChange={(e) => setProfile({ ...profile, partido: e.target.value })} className="h-10" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Cidade/Estado</label>
                    <div className="flex gap-2">
                      <Input value={profile.cidade} onChange={(e) => setProfile({ ...profile, cidade: capitalizeWords(e.target.value) })} className="h-10" />
                      <Input value={profile.estado} onChange={(e) => setProfile({ ...profile, estado: e.target.value.toUpperCase().replace(/[^A-Za-z]/g, '').slice(0, 2) })} className="h-10 w-20" maxLength={2} />
                    </div>
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">Salvar alterações</Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-4">
          <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preferências de Notificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'email', label: 'Notificações por E-mail', desc: 'Receba atualizações importantes por e-mail' },
                  { key: 'sms', label: 'Notificações por SMS', desc: 'Receba alertas urgentes por SMS' },
                  { key: 'aniversario', label: 'Lembretes de Aniversário', desc: 'Seja notificado sobre aniversários de eleitores' },
                  { key: 'solicitacoes', label: 'Novas Solicitações', desc: 'Seja notificado quando houver novas solicitações' },
                  { key: 'tarefas', label: 'Prazos de Tarefas', desc: 'Receba alertas sobre tarefas próximas do prazo' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-slate-700">{item.label}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => setNotificacoes(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${notificacoes[item.key as keyof typeof notificacoes] ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notificacoes[item.key as keyof typeof notificacoes] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
                <Button className="bg-blue-600 hover:bg-blue-700">Salvar Preferências</Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="aniversario" className="space-y-4">
          <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Gift className="w-4 h-4 text-pink-500" />
                  Template de Mensagem de Aniversário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500">Mensagem padrão enviada via WhatsApp</label>
                  <p className="text-[10px] text-slate-400">
                    Variáveis disponíveis: {'{{nome}}'} (primeiro nome), {'{{nome_completo}}'}, {'{{cidade}}'}
                  </p>
                  <textarea
                    defaultValue={templateAtual}
                    onChange={e => setTemplateLocal(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-medium text-slate-500 mb-1">Preview</p>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap">
                    {montarPreview(templateLocal || templateAtual)}
                  </p>
                </div>
                <Button
                  className="bg-pink-600 hover:bg-pink-700"
                  onClick={handleSaveTemplate}
                  disabled={saving}
                >
                  {saved ? <Check className="w-4 h-4 mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                  {saved ? 'Salvo!' : 'Salvar Template'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-4">
          <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alterar Senha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Senha atual</label>
                  <Input type="password" placeholder="Digite sua senha atual" className="h-10" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Nova senha</label>
                  <Input type="password" placeholder="Mínimo 8 caracteres" className="h-10" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Confirmar nova senha</label>
                  <Input type="password" placeholder="Repita a nova senha" className="h-10" />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">Atualizar Senha</Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="integracoes" className="space-y-4">
          <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Integrações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { nome: 'Brevo (Sendinblue)', desc: 'Envio de e-mails em massa', status: 'Conectado', cor: 'text-green-600 bg-green-50' },
                  { nome: 'Twilio', desc: 'Envio de SMS', status: 'Conectado', cor: 'text-green-600 bg-green-50' },
                  { nome: 'Google Calendar', desc: 'Sincronização de agenda', status: 'Não conectado', cor: 'text-slate-500 bg-slate-50' },
                  { nome: 'WhatsApp Business', desc: 'Mensagens via WhatsApp', status: 'Em breve', cor: 'text-amber-600 bg-amber-50' },
                ].map((int, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-800">{int.nome}</div>
                      <div className="text-xs text-slate-400">{int.desc}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${int.cor}`}>{int.status}</span>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        {int.status === 'Conectado' ? 'Configurar' : 'Conectar'}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  WhatsApp — WAHA API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {wahaStatus === 'WORKING' ? (
                      <Link2 className="w-4 h-4 text-green-600" />
                    ) : wahaStatus === 'SCAN_QR_CODE' ? (
                      <Scan className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Link2 className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-sm font-medium text-slate-700">
                      Status: {wahaStatus || 'Desconhecido'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={async () => {
                      setWahaLoading(true);
                      const session = await getSession();
                      setWahaStatus(session?.status || 'OFFLINE');
                      setWahaLoading(false);
                    }}
                    disabled={wahaLoading}
                  >
                    <RotateClockwise className={`w-3 h-3 mr-1 ${wahaLoading ? 'animate-spin' : ''}`} />
                    Verificar
                  </Button>
                </div>

                {/* QR Code */}
                {wahaStatus === 'SCAN_QR_CODE' && (
                  <div className="text-center space-y-2">
                    <p className="text-xs text-slate-500">
                      Escaneie o QR Code com o WhatsApp do celular
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const qr = await getQRCode();
                        if (qr) setWahaQR(qr);
                      }}
                    >
                      <Scan className="w-4 h-4 mr-1" /> Gerar QR Code
                    </Button>
                    {wahaQR && (
                      <div className="mt-2">
                        <img src={wahaQR} alt="QR Code WhatsApp" className="mx-auto w-48 h-48" />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Válido por 20 segundos. Se expirar, clique em Gerar novamente.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Conectado */}
                {wahaStatus === 'WORKING' && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                      <Check className="w-4 h-4" /> WhatsApp conectado!
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Pronto para enviar mensagens automaticamente.
                    </p>
                  </div>
                )}

                {/* Teste de envio */}
                {wahaStatus === 'WORKING' && (
                  <div className="border rounded-lg p-4 space-y-3">
                    <p className="text-sm font-medium text-slate-700">Testar envio</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Telefone (ex: 11999999999)"
                        value={testPhone}
                        onChange={e => setTestPhone(e.target.value)}
                        className="h-9 text-xs"
                      />
                      <Input
                        placeholder="Mensagem de teste"
                        value={testMessage}
                        onChange={e => setTestMessage(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={async () => {
                        if (!testPhone || !testMessage) return;
                        setTestResult('Enviando...');
                        const ok = await sendText(testPhone, testMessage);
                        setTestResult(ok ? 'Enviado com sucesso!' : 'Falha ao enviar');
                      }}
                      disabled={!testPhone || !testMessage}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" /> Enviar teste
                    </Button>
                    {testResult && (
                      <p className={`text-xs ${testResult.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
                        {testResult}
                      </p>
                    )}
                  </div>
                )}

                {/* Info */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <strong>Como funciona:</strong> A WAHA API está rodando na VPS (82.197.73.101:8080).
                    Quando conectado, as campanhas de comunicação enviam mensagens automaticamente
                    sem precisar abrir o WhatsApp Web.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

      </Tabs>
    </div>
  );
}

function montarPreview(template: string): string {
  return template
    .replace(/{{nome}}/g, 'Maria')
    .replace(/{{nome_completo}}/g, 'Maria Aparecida Santos')
    .replace(/{{cidade}}/g, 'São Paulo');
}
