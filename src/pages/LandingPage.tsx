import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MapPin, Mail, BarChart3, Calendar, FolderOpen, Shield, ChevronDown, Menu, X, Check, ArrowRight, Star, Phone, MessageSquare, Zap, Lock, Headphones, Smartphone, Bell, FileText, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { User } from '@supabase/supabase-js';

const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } } };
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

function FIU({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <motion.div variants={fadeInUp} className={className}>{children}</motion.div>;
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors">
        <span className="font-medium text-slate-800 pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden"><div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed">{answer}</div></motion.div>}</AnimatePresence>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, image }: { icon: React.ElementType; title: string; description: string; image?: string }) {
  return (
    <motion.div variants={fadeInUp} className="group bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4"><Icon className="w-6 h-6 text-blue-600" /></div>
      <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      {image && <div className="mt-4 rounded-lg overflow-hidden border border-slate-100"><img src={image} alt={title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" /></div>}
    </motion.div>
  );
}

function PricingCard({ plan, price, period, features, recommended, onSubscribe }: { plan: string; price: string; period: string; features: string[]; recommended?: boolean; onSubscribe: () => void }) {
  return (
    <motion.div variants={fadeInUp} className={`relative rounded-2xl p-8 ${recommended ? 'bg-blue-600 text-white shadow-xl scale-105' : 'bg-white border border-slate-200'}`}>
      {recommended && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-semibold px-4 py-1 rounded-full">RECOMENDADO</div>}
      <div className="text-sm font-medium mb-2 opacity-80">{plan}</div>
      <div className="flex items-baseline gap-1 mb-6"><span className="text-3xl font-bold">{price}</span><span className={`text-sm ${recommended ? 'opacity-70' : 'text-slate-400'}`}>{period}</span></div>
      <ul className="space-y-3 mb-8">{features.map((f, i) => (<li key={i} className="flex items-start gap-2 text-sm"><Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${recommended ? 'text-blue-200' : 'text-blue-600'}`} /><span className={recommended ? '' : 'text-slate-600'}>{f}</span></li>))}</ul>
      <Button onClick={onSubscribe} className={`w-full h-11 font-semibold ${recommended ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>Começar Agora</Button>
    </motion.div>
  );
}

export default function LandingPage({ user, isAuthenticated, signUp, signIn, signOut }: {
  user: User | null; isAuthenticated: boolean;
  signUp: (email: string, password: string, metadata: { nome: string }) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
}) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ nome: '', email: '', password: '' });
  const [annual, setAnnual] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => { const h = () => setScrolled(window.scrollY > 100); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);
  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError('');
    const { error } = await signIn(loginForm.email, loginForm.password);
    if (error) setAuthError(error.message);
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError('');
    const { error } = await signUp(registerForm.email, registerForm.password, { nome: registerForm.nome });
    if (error) setAuthError(error.message);
    else { setShowRegister(false); setShowLogin(true); setAuthError('Verifique seu e-mail para confirmar.'); }
  };

  const scrollToSection = (id: string) => { const el = document.getElementById(id); if (el) { el.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); } };

  const features = [
    { icon: Users, title: 'Cadastro de Eleitores', description: 'Base de dados completa com geolocalização, comunidades, níveis de influência e tags personalizadas.', image: '/assets/feature-eleitores.jpg' },
    { icon: MapPin, title: 'Mapa Interativo', description: 'Visualize seus eleitores no mapa, filtre por comunidade, prioridade e status. Estratégia territorial inteligente.', image: '/assets/feature-mapa.jpg' },
    { icon: Mail, title: 'Comunicação em Massa', description: 'Envie e-mails e SMS segmentados com templates personalizados. Alcance sua base no momento certo.' },
    { icon: BarChart3, title: 'Relatórios e Análises', description: 'Dashboards interativos com gráficos de crescimento, demandas por categoria e engajamento da base.', image: '/assets/feature-relatorios.jpg' },
    { icon: Calendar, title: 'Agenda Integrada', description: 'Gerencie compromissos, reuniões e eventos. Sincronize com Google Calendar e compartilhe com a equipe.' },
    { icon: FolderOpen, title: 'Gestão de Documentos', description: 'Pasta virtual para armazenar releases, ofícios, projetos de lei e documentos do mandato.' },
    { icon: Shield, title: 'Subcontas e Permissões', description: 'Cadastre sua equipe com níveis de acesso diferenciados. Controle total sobre quem acessa o quê.' },
    { icon: FileText, title: 'Controle de Solicitações', description: 'Acompanhe demandas dos eleitores com priorização, prazos e responsáveis. Nada cai no esquecimento.' },
    { icon: Tag, title: 'Automação e Tags', description: 'Automatize mensagens de aniversário e use tags para segmentação precisa da sua base eleitoral.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            <a href="#" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">M</span></div>
              <span className="font-bold text-xl"><span className="text-slate-800">Mandato</span><span className="text-blue-600">Digital</span></span>
            </a>
            <div className="hidden lg:flex items-center gap-8">
              <button onClick={() => scrollToSection('recursos')} className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Recursos</button>
              <button onClick={() => scrollToSection('beneficios')} className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Benefícios</button>
              <button onClick={() => scrollToSection('planos')} className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Planos</button>
              <button onClick={() => scrollToSection('faq')} className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">FAQ</button>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-slate-600">Olá, {user?.user_metadata?.nome || 'Usuário'}</span>
                  <Button variant="ghost" onClick={signOut} className="text-sm">Sair</Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => setShowLogin(true)} className="text-sm font-medium">Entrar</Button>
                  <Button onClick={() => setShowRegister(true)} className="bg-blue-600 hover:bg-blue-700 text-sm font-semibold px-5">Começar Agora</Button>
                </>
              )}
            </div>
            <button className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
          </div>
        </div>
        <AnimatePresence>{mobileMenuOpen && <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3 }} className="fixed inset-0 top-16 bg-white z-40 lg:hidden">
          <div className="flex flex-col p-6 gap-4">
            {['recursos','beneficios','planos','faq','contato'].map(id => <button key={id} onClick={() => scrollToSection(id)} className="text-left py-3 text-lg font-medium border-b border-slate-100 capitalize">{id}</button>)}
            <div className="mt-4 flex flex-col gap-3">
              <Button variant="outline" onClick={() => { setShowLogin(true); setMobileMenuOpen(false); }} className="w-full">Entrar</Button>
              <Button onClick={() => { setShowRegister(true); setMobileMenuOpen(false); }} className="w-full bg-blue-600">Começar Agora</Button>
            </div>
          </div>
        </motion.div>}</AnimatePresence>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#0B1120]">
        <div className="absolute inset-0"><img src="/assets/hero-bg.jpg" alt="" className="w-full h-full object-cover opacity-60" /><div className="absolute inset-0 bg-gradient-to-r from-[#0B1120] via-[#0B1120]/80 to-transparent" /></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              <FIU><div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 mb-6"><Zap className="w-4 h-4 text-blue-400" /><span className="text-blue-300 text-sm font-medium">Software de Gestão Política #1 do Brasil</span></div></FIU>
              <FIU><h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">Gestão política<br /><span className="text-blue-400">inteligente</span> e<br /><span className="text-blue-400">integrada</span></h1></FIU>
              <FIU><p className="text-lg text-slate-300 mb-8 max-w-lg leading-relaxed">Crie, amplie e gerencie sua base eleitoral com a plataforma mais completa do mercado. Relacionamento, demandas, geolocalização e comunicação em um só lugar.</p></FIU>
              <FIU><div className="flex flex-col sm:flex-row gap-4"><Button onClick={() => setShowRegister(true)} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 h-14 text-base">Teste Grátis por 7 Dias<ArrowRight className="w-5 h-5 ml-2" /></Button><Button onClick={() => scrollToSection('recursos')} variant="outline" size="lg" className="border-slate-500 text-white hover:bg-white/10 px-8 h-14 text-base">Conheça os Recursos</Button></div></FIU>
              <FIU><div className="flex items-center gap-6 mt-10"><div className="text-center"><div className="text-2xl font-bold text-white">2.450+</div><div className="text-xs text-slate-400">Eleitores gerenciados</div></div><div className="w-px h-10 bg-slate-700" /><div className="text-center"><div className="text-2xl font-bold text-white">127</div><div className="text-xs text-slate-400">Cidades atendidas</div></div><div className="w-px h-10 bg-slate-700" /><div className="text-center"><div className="text-2xl font-bold text-white">98%</div><div className="text-xs text-slate-400">Satisfação</div></div></div></FIU>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="hidden lg:block">
              <div className="relative"><div className="absolute -inset-4 bg-blue-500/20 rounded-2xl blur-2xl" /><img src="/assets/dashboard-preview.jpg" alt="Dashboard" className="relative rounded-xl shadow-2xl border border-slate-700/50" /></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerContainer} className="text-center mb-16">
            <FIU><span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Recursos</span></FIU>
            <FIU><h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mt-3 mb-4">Tudo que você precisa para gerenciar seu mandato</h2></FIU>
            <FIU><p className="text-slate-500 max-w-2xl mx-auto">Uma plataforma completa com ferramentas pensadas especificamente para a realidade política brasileira.</p></FIU>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{features.map((f, i) => <FeatureCard key={i} {...f} />)}</motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerContainer} className="text-center mb-16">
            <FIU><span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Benefícios</span></FIU>
            <FIU><h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mt-3 mb-4">Por que escolher o Mandato Digital?</h2></FIU>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[{icon:Lock,title:'Segurança de Dados',desc:'Seus dados protegidos com criptografia, backups diários e conformidade com a LGPD.'},{icon:Smartphone,title:'Acesso de Qualquer Lugar',desc:'Plataforma 100% online, responsiva. Acesse do celular, tablet ou computador.'},{icon:Headphones,title:'Suporte Humanizado',desc:'Atendimento via chat, e-mail e WhatsApp com especialistas em gestão política.'},{icon:Zap,title:'Automação Inteligente',desc:'Automatize tarefas repetitivas como mensagens de aniversário e follow-ups.'},{icon:Bell,title:'Notificações em Tempo Real',desc:'Receba alertas sobre prazos, novas solicitações e atividades da equipe.'},{icon:Shield,title:'Controle de Acesso',desc:'Subcontas com permissões diferenciadas para toda a equipe do mandato.'}].map((b,i) => <motion.div key={i} variants={fadeInUp} className="flex gap-4"><div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0"><b.icon className="w-5 h-5 text-blue-600" /></div><div><h3 className="font-semibold text-slate-800 mb-1">{b.title}</h3><p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p></div></motion.div>)}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[{value:'2.450+',label:'Eleitores Gerenciados'},{value:'350+',label:'Políticos Atendidos'},{value:'127',label:'Cidades Atendidas'},{value:'98%',label:'Taxa de Satisfação'}].map((s,i) => <FIU key={i} className="text-center"><div className="text-3xl lg:text-4xl font-bold text-white mb-2">{s.value}</div><div className="text-blue-200 text-sm">{s.label}</div></FIU>)}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <FIU><span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Depoimentos</span></FIU>
            <FIU><h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mt-3">O que nossos clientes dizem</h2></FIU>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
            {[{name:'Vereador Ricardo Almeida',role:'Vereador - São Paulo/SP',text:'O Mandato Digital transformou nossa gestão. Conseguimos organizar mais de 3 mil eleitores e as solicitações não caem mais no esquecimento.'},{name:'Deputada Fernanda Costa',role:'Deputada Estadual - MG',text:'A geolocalização e os relatórios nos deram uma visão estratégica que não tínhamos antes. Recomendo a todos os parlamentares.'},{name:'Prefeito Carlos Mendes',role:'Prefeito - Curitiba/PR',text:'Plataforma intuitiva, suporte excelente e preço justo. A automação de comunicação nos economiza horas de trabalho toda semana.'}].map((t,i) => <FIU key={i}><div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 h-full"><div className="flex gap-1 mb-4">{Array.from({length:5}).map((_,j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div><p className="text-slate-600 mb-6 leading-relaxed">"{t.text}"</p><div><div className="font-semibold text-slate-800 text-sm">{t.name}</div><div className="text-slate-400 text-xs">{t.role}</div></div></div></FIU>)}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-12">
            <FIU><span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Planos</span></FIU>
            <FIU><h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mt-3 mb-4">Escolha o plano ideal para você</h2></FIU>
            <FIU><div className="flex items-center justify-center gap-3"><span className={`text-sm font-medium ${!annual ? 'text-slate-800' : 'text-slate-400'}`}>Mensal</span><button onClick={() => setAnnual(!annual)} className={`relative w-14 h-7 rounded-full transition-colors ${annual ? 'bg-blue-600' : 'bg-slate-300'}`}><div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${annual ? 'translate-x-7' : 'translate-x-0.5'}`} /></button><span className={`text-sm font-medium ${annual ? 'text-slate-800' : 'text-slate-400'}`}>Anual</span><span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">-40%</span></div></FIU>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            <PricingCard plan="Mensal" price={annual ? 'R$149' : 'R$249'} period="/mês" features={['Cadastro de eleitores ilimitado','Comunidades e geolocalização','Agenda e tarefas','E-mail em massa (300/dia)','5 subcontas','Suporte por e-mail']} onSubscribe={() => setShowRegister(true)} />
            <PricingCard plan="Profissional" price={annual ? 'R$249' : 'R$399'} period="/mês" recommended features={['Tudo do plano Mensal','SMS em massa','Relatórios avançados','Automação de mensagens','Subcontas ilimitadas','Suporte prioritário','Exportação de dados','API de integração']} onSubscribe={() => setShowRegister(true)} />
            <PricingCard plan="Enterprise" price="Personalizado" period="" features={['Tudo do plano Profissional','Consultoria dedicada','Integrações personalizadas','Treinamento da equipe','SLA garantido','Gerente de conta','White label disponível']} onSubscribe={() => setShowRegister(true)} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-12">
            <FIU><span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">FAQ</span></FIU>
            <FIU><h2 className="text-3xl font-bold text-slate-800 mt-3 mb-4">Dúvidas Frequentes</h2></FIU>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-3">
            {[{q:'Como funciona o teste gratuito?',a:'Você tem 7 dias de acesso completo. Não precisa informar cartão de crédito.'},{q:'Posso importar meus dados?',a:'Sim! Importação via planilha Excel ou CSV. Migramos seus dados de outras plataformas.'},{q:'Meus dados estão seguros?',a:'Criptografia AES-256, servidores certificados ISO 27001, backups diários e conformidade com LGPD.'},{q:'Preciso instalar algum programa?',a:'Não. É 100% online e funciona em qualquer navegador. Também temos PWA para instalar no celular.'},{q:'Posso cancelar a qualquer momento?',a:'Sim. Sem contrato de fidelidade. Acesso até o final do período pago.'},{q:'Como funciona o suporte?',a:'Chat, e-mail e WhatsApp em horário comercial. Planos Profissional e Enterprise têm prioridade.'}].map((f,i) => <FIU key={i}><FAQItem question={f.q} answer={f.a} /></FIU>)}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Pronto para transformar sua gestão política?</h2>
            <p className="text-blue-200 mb-8 text-lg">Comece seu teste gratuito de 7 dias hoje mesmo. Sem cartão de crédito.</p>
            <Button onClick={() => setShowRegister(true)} size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-10 h-14 text-base">Começar Teste Grátis<ArrowRight className="w-5 h-5 ml-2" /></Button>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section id="contato" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <FIU><span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Contato</span></FIU>
            <FIU><h2 className="text-3xl font-bold text-slate-800 mt-3 mb-4">Fale Conosco</h2></FIU>
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-6">
              {[{icon:Phone,title:'Telefone',value:'(11) 3135-6552'},{icon:Mail,title:'E-mail',value:'contato@mandatodigital.com.br'},{icon:MessageSquare,title:'WhatsApp',value:'(11) 99809-4818'}].map((c,i) => <FIU key={i}><div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"><div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><c.icon className="w-5 h-5 text-blue-600" /></div><div><div className="text-sm font-medium text-slate-500">{c.title}</div><div className="font-semibold text-slate-800">{c.value}</div></div></div></FIU>)}
            </motion.div>
            <FIU><form className="space-y-4" onSubmit={e => e.preventDefault()}><div className="grid sm:grid-cols-2 gap-4"><Input placeholder="Nome" className="h-11" /><Input placeholder="E-mail" type="email" className="h-11" /></div><Input placeholder="Assunto" className="h-11" /><textarea placeholder="Mensagem" rows={5} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none" /><Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11 font-semibold">Enviar Mensagem</Button></form></FIU>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">M</span></div><span className="font-bold text-lg text-white">Mandato<span className="text-blue-400">Digital</span></span></div>
              <p className="text-sm leading-relaxed">A plataforma mais completa de gestão política do Brasil.</p>
            </div>
            <div><h4 className="font-semibold text-white mb-3 text-sm">Produto</h4><ul className="space-y-2 text-sm">{['recursos','planos','faq'].map(k => <li key={k}><button onClick={() => scrollToSection(k)} className="hover:text-white transition-colors capitalize">{k}</button></li>)}</ul></div>
            <div><h4 className="font-semibold text-white mb-3 text-sm">Empresa</h4><ul className="space-y-2 text-sm">{['Sobre nós','Blog','Carreiras'].map(k => <li key={k}><span className="hover:text-white transition-colors cursor-pointer">{k}</span></li>)}</ul></div>
            <div><h4 className="font-semibold text-white mb-3 text-sm">Legal</h4><ul className="space-y-2 text-sm">{['Termos de Uso','Política de Privacidade','LGPD'].map(k => <li key={k}><span className="hover:text-white transition-colors cursor-pointer">{k}</span></li>)}</ul></div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-xs">© 2025 Mandato Digital. Todos os direitos reservados.</div>
        </div>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>{showLogin && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowLogin(false)}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-xl shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-6"><h2 className="text-2xl font-bold text-slate-800">Bem-vindo de volta</h2><p className="text-slate-500 text-sm mt-1">Entre na sua conta para continuar</p></div>
          {authError && <div className="mb-4 p-3 bg-blue-50 text-blue-600 text-sm rounded-lg">{authError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">E-mail</label><Input type="email" placeholder="seu@email.com" value={loginForm.email} onChange={e => setLoginForm({...loginForm,email:e.target.value})} className="h-11" required /></div>
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Senha</label><Input type="password" placeholder="Sua senha" value={loginForm.password} onChange={e => setLoginForm({...loginForm,password:e.target.value})} className="h-11" required /></div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11 font-semibold">Entrar</Button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">Não tem conta? <button onClick={() => {setShowLogin(false);setShowRegister(true);setAuthError('');}} className="text-blue-600 font-medium hover:underline">Criar conta</button></p>
        </motion.div>
      </motion.div>}</AnimatePresence>

      {/* Register Modal */}
      <AnimatePresence>{showRegister && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowRegister(false)}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-xl shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-6"><h2 className="text-2xl font-bold text-slate-800">Criar conta</h2><p className="text-slate-500 text-sm mt-1">Comece seu teste gratuito de 7 dias</p></div>
          {authError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{authError}</div>}
          <form onSubmit={handleRegister} className="space-y-4">
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Nome completo</label><Input placeholder="Seu nome" value={registerForm.nome} onChange={e => setRegisterForm({...registerForm,nome:e.target.value})} className="h-11" required /></div>
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">E-mail</label><Input type="email" placeholder="seu@email.com" value={registerForm.email} onChange={e => setRegisterForm({...registerForm,email:e.target.value})} className="h-11" required /></div>
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Senha</label><Input type="password" placeholder="Mínimo 6 caracteres" value={registerForm.password} onChange={e => setRegisterForm({...registerForm,password:e.target.value})} className="h-11" required /></div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11 font-semibold">Criar Conta Grátis</Button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">Já tem conta? <button onClick={() => {setShowRegister(false);setShowLogin(true);setAuthError('');}} className="text-blue-600 font-medium hover:underline">Entrar</button></p>
        </motion.div>
      </motion.div>}</AnimatePresence>
    </div>
  );
}
