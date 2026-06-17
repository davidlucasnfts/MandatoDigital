import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Mail, Gift, Save, Check, MessageSquare, RotateClockwise, Scan, Link2 } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchFilterBar } from '@/components/dashboard';
import { useConfiguracoes } from '@/hooks/useSupabaseData';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { maskPhone, capitalizeWords, isValidPhone, normalizePhoneForWhatsApp } from '@/lib/masks';


const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

export default function ConfiguracoesPageV2() {
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
  const { getSession, startSession, stopSession, getQRCode, sendText } = useWhatsApp();
  const [wahaStatus, setWahaStatus] = useState<string>('');
  const [wahaQR, setWahaQR] = useState<string | null>(null);
  const [wahaLoading, setWahaLoading] = useState(false);
  const [wahaMe, setWahaMe] = useState<{ id: string; pushName: string } | null>(null);
  const [wahaError, setWahaError] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrCountdown, setQrCountdown] = useState<number>(20);

  // Verificar status ao abrir a aba
  useEffect(() => {
    checkStatus();
  }, []);

  // Polling: verifica status automaticamente quando aguardando QR Code
  useEffect(() => {
    if (wahaStatus !== 'SCAN_QR_CODE') return;
    
    const interval = setInterval(async () => {
      const session = await getSession();
      console.log('Polling status:', session?.status);
      if (session?.status === 'WORKING') {
        setWahaStatus('WORKING');
        setWahaMe(session?.me || null);
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [wahaStatus]);

  // Auto-renovação do QR Code a cada 15 segundos
  useEffect(() => {
    if (wahaStatus !== 'SCAN_QR_CODE') return;
    
    // Força primeira renovação imediatamente
    const renewQR = async () => {
      const qr = await getQRCode();
      if (qr) {
        setWahaQR(qr);
        setQrCountdown(15);
      }
    };
    
    renewQR(); // Primeira carga
    
    const renewInterval = setInterval(renewQR, 10000); // Renova a cada 10s
    
    // Contador visual
    const countdown = setInterval(() => {
      setQrCountdown((prev) => (prev > 0 ? prev - 1 : 10));
    }, 1000);

    return () => {
      clearInterval(renewInterval);
      clearInterval(countdown);
    };
  }, [wahaStatus]);

  const checkStatus = async () => {
    setWahaLoading(true);
    setWahaError(null);
    try {
      const session = await getSession();
      console.log('WAHA status:', session);
      setWahaStatus(session?.status || 'OFFLINE');
      setWahaMe(session?.me || null);
    } catch (e) {
      setWahaError('Falha ao verificar status');
    }
    setWahaLoading(false);
  };
  const [tab, setTab] = useState('perfil');
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

      <SearchFilterBar
        showSearch={false}
        delay={2}
        tabs={[
          { value: 'perfil', label: 'Perfil' },
          { value: 'notificacoes', label: 'Notificações' },
          { value: 'aniversario', label: 'Aniversário' },
          { value: 'seguranca', label: 'Segurança' },
          { value: 'integracoes', label: 'Integrações' },
          { value: 'whatsapp', label: 'WhatsApp' },
        ]}
        activeTab={tab}
        onTabChange={setTab}
      />

      {tab === 'perfil' && (
        <div className="space-y-4">
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
                    <Input 
                      value={profile.telefone} 
                      onChange={(e) => setProfile({ ...profile, telefone: maskPhone(e.target.value) })} 
                      className={`h-10 ${profile.telefone && !isValidPhone(profile.telefone) ? 'border-red-300' : ''}`} 
                      maxLength={16} 
                      placeholder="(11) 98765-4321"
                    />
                    {profile.telefone && !isValidPhone(profile.telefone) && (
                      <p className="text-[10px] text-red-500 mt-1">Informe DDD + 9 dígitos</p>
                    )}
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
        </div>
      )}

      {tab === 'notificacoes' && (
        <div className="space-y-4">
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
        </div>
      )}

      {tab === 'aniversario' && (
        <div className="space-y-4">
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
        </div>
      )}

      {tab === 'seguranca' && (
        <div className="space-y-4">
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
        </div>
      )}

      {tab === 'integracoes' && (
        <div className="space-y-4">
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
        </div>
      )}

      {tab === 'whatsapp' && (
        <div className="space-y-4">
          <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {wahaStatus === 'WORKING' ? (
                      <>
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium text-green-700">Conectado</span>
                        {wahaMe && (
                          <span className="text-xs text-slate-500">({wahaMe.pushName})</span>
                        )}
                      </>
                    ) : wahaStatus === 'SCAN_QR_CODE' ? (
                      <>
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-sm font-medium text-amber-700">Aguardando QR Code</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <span className="text-sm font-medium text-slate-500">Desconectado</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {wahaStatus === 'WORKING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                        onClick={async () => {
                          setWahaLoading(true);
                          const ok = await stopSession();
                          if (ok) {
                            setWahaStatus('OFFLINE');
                            setWahaMe(null);
                            setWahaQR(null);
                          }
                          setWahaLoading(false);
                        }}
                        disabled={wahaLoading}
                      >
                        Desconectar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={checkStatus}
                      disabled={wahaLoading}
                    >
                      <RotateClockwise className={`w-3 h-3 mr-1 ${wahaLoading ? 'animate-spin' : ''}`} />
                      Atualizar
                    </Button>
                  </div>
                </div>

                {/* Erro */}
                {wahaError && (
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-sm text-red-700">{wahaError}</p>
                  </div>
                )}

                {/* Não conectado — mostra botão Conectar */}
                {wahaStatus !== 'WORKING' && wahaStatus !== 'SCAN_QR_CODE' && (
                  <div className="text-center space-y-3 py-4">
                    <p className="text-sm text-slate-600">
                      Conecte o WhatsApp para enviar mensagens automaticamente
                    </p>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                      onClick={async () => {
                        setWahaLoading(true);
                        setWahaError(null);
                        setQrError(null);
                        try {
                          const result = await startSession();
                          console.log('Start session result:', result);
                          if (!result.ok) {
                            setWahaError(result.error || 'Falha ao iniciar sessão. Tente novamente.');
                            setWahaLoading(false);
                            return;
                          }
                          // Atualiza status
                          setWahaStatus(result.status || 'SCAN_QR_CODE');
                          // Já gera o QR Code automaticamente
                          const qr = await getQRCode();
                          console.log('QR Code result:', qr ? 'recebido' : 'null');
                          if (qr) {
                            setWahaQR(qr);
                          } else {
                            setQrError('Não foi possível gerar o QR Code. Clique em Atualizar.');
                          }
                          setWahaLoading(false);
                        } catch (e) {
                          setWahaError('Erro ao conectar. Verifique o console.');
                          setWahaLoading(false);
                        }
                      }}
                      disabled={wahaLoading}
                    >
                      <Scan className="w-4 h-4 mr-1" />
                      {wahaLoading ? 'Iniciando...' : 'Conectar WhatsApp'}
                    </Button>
                  </div>
                )}

                {/* Aguardando QR Code */}
                {wahaStatus === 'SCAN_QR_CODE' && (
                  <div className="text-center space-y-3">
                    <div className="bg-amber-50 rounded-lg p-3">
                      <p className="text-sm text-amber-800 font-medium">
                        Escaneie o QR Code com seu celular
                      </p>
                      <ol className="text-xs text-amber-700 mt-2 text-left space-y-1 px-4">
                        <li>1. Abra o WhatsApp no celular</li>
                        <li>2. Toque em Configurações → Aparelhos conectados</li>
                        <li>3. Toque em "Conectar aparelho"</li>
                        <li>4. Aponte a câmera para o QR Code abaixo</li>
                      </ol>
                    </div>
                    
                    {/* Botão para gerar QR Code */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        setQrError(null);
                        const qr = await getQRCode();
                        console.log('QR Code gerado:', qr ? qr.substring(0, 50) + '...' : 'null');
                        if (qr) {
                          setWahaQR(qr);
                        } else {
                          setQrError('Não foi possível gerar o QR Code.');
                        }
                      }}
                    >
                      <Scan className="w-4 h-4 mr-1" /> Mostrar QR Code
                    </Button>
                    
                    {qrError && (
                      <p className="text-xs text-red-600">{qrError}</p>
                    )}
                    
                    {wahaQR && (
                      <div className="mt-2 max-w-md mx-auto">
                        <img 
                          src={wahaQR} 
                          alt="Tela de login WhatsApp Web - escaneie o QR Code" 
                          className="w-full h-auto border rounded-lg bg-white"
                          onError={() => {
                            console.error('Erro ao carregar imagem do QR Code');
                            setQrError('Erro ao exibir QR Code. Tente novamente.');
                          }}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          <span className="text-amber-600 font-medium">
                            ⏱️ Novo QR em {qrCountdown}s — aponte a câmera rapidamente
                          </span>
                        </p>
                      </div>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-slate-500"
                      onClick={checkStatus}
                    >
                      Já escaneei — verificar conexão
                    </Button>
                  </div>
                )}

                {/* Conectado — mostra teste */}
                {wahaStatus === 'WORKING' && (
                  <div className="border rounded-lg p-4 space-y-3">
                    <p className="text-sm font-medium text-slate-700">Testar envio</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Input
                          placeholder="(11) 98765-4321"
                          value={testPhone}
                          onChange={e => setTestPhone(maskPhone(e.target.value))}
                          maxLength={16}
                          className={`h-9 text-xs ${testPhone && !isValidPhone(testPhone) ? 'border-red-300' : ''}`}
                        />
                        {testPhone && !isValidPhone(testPhone) && (
                          <p className="text-[10px] text-red-500 mt-1">Informe DDD + 9 dígitos</p>
                        )}
                      </div>
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
                        if (!testPhone || !testMessage || !isValidPhone(testPhone)) return;
                        setTestResult('Enviando...');
                        const result = await sendText(testPhone, testMessage);
                        setTestResult(result.ok ? 'Enviado com sucesso!' : `Falha: ${result.error || 'Erro desconhecido'}`);
                      }}
                      disabled={!testPhone || !testMessage || !isValidPhone(testPhone)}
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
                    <strong>Como funciona:</strong> A integração com WhatsApp permite enviar mensagens automaticamente através de campanhas de comunicação, sem precisar abrir o WhatsApp Web no navegador.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

    </div>
  );
}

function montarPreview(template: string): string {
  return template
    .replace(/{{nome}}/g, 'Maria')
    .replace(/{{nome_completo}}/g, 'Maria Aparecida Santos')
    .replace(/{{cidade}}/g, 'São Paulo');
}
