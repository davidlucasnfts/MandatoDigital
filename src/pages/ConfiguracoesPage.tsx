import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Configurações
        </h2>
      </motion.div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="perfil">
            <User className="w-4 h-4 mr-1.5" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="notificacoes">
            <Bell className="w-4 h-4 mr-1.5" /> Notificações
          </TabsTrigger>
          <TabsTrigger value="seguranca">
            <Shield className="w-4 h-4 mr-1.5" /> Segurança
          </TabsTrigger>
          <TabsTrigger value="integracoes">
            <Mail className="w-4 h-4 mr-1.5" /> Integrações
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
                    <Input value={profile.nome} onChange={(e) => setProfile({ ...profile, nome: e.target.value })} className="h-10" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">E-mail</label>
                    <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="h-10" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Telefone</label>
                    <Input value={profile.telefone} onChange={(e) => setProfile({ ...profile, telefone: e.target.value })} className="h-10" />
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
                      <Input value={profile.cidade} onChange={(e) => setProfile({ ...profile, cidade: e.target.value })} className="h-10" />
                      <Input value={profile.estado} onChange={(e) => setProfile({ ...profile, estado: e.target.value })} className="h-10 w-20" />
                    </div>
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">Salvar Alterações</Button>
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

        <TabsContent value="seguranca" className="space-y-4">
          <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alterar Senha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Senha Atual</label>
                  <Input type="password" placeholder="Digite sua senha atual" className="h-10" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Nova Senha</label>
                  <Input type="password" placeholder="Mínimo 8 caracteres" className="h-10" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Confirmar Nova Senha</label>
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
      </Tabs>
    </div>
  );
}
