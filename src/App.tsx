import { Routes, Route, Navigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useAuthErrorHandler } from '@/hooks/useAuthErrorHandler';

import LandingPage from '@/pages/LandingPage';
import AfiliarPage from '@/pages/AfiliarPage';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardHome from '@/pages/DashboardHome';
import EleitoresPage from '@/pages/EleitoresPage';
import ComunidadesPage from '@/pages/ComunidadesPage';
import ComunidadesPageV2 from '@/pages/ComunidadesPageV2';
import SolicitacoesPage from '@/pages/SolicitacoesPage';

import ComunicacaoPage from '@/pages/ComunicacaoPage';
import MapaPage from '@/pages/MapaPage';

import AgendaPage from '@/pages/AgendaPage';
import AgendaPageV2 from '@/pages/AgendaPageV2';

import TarefasPage from '@/pages/TarefasPage';
import TarefasPageV2 from '@/pages/TarefasPageV2';
import RelatoriosPage from '@/pages/RelatoriosPage';
import RelatoriosPageV2 from '@/pages/RelatoriosPageV2';
import EquipePage from '@/pages/EquipePage';
import EquipePageV2 from '@/pages/EquipePageV2';
import ConfiguracoesPage from '@/pages/ConfiguracoesPage';
import ConfiguracoesPageV2 from '@/pages/ConfiguracoesPageV2';
import AdminPage from '@/pages/AdminPage';
import HereApiTest from '@/components/HereApiTest';

import ProposicoesPage from '@/pages/ProposicoesPage';
import ProposicoesPageV2 from '@/pages/ProposicoesPageV2';
import ProposicaoFormPage from '@/pages/ProposicaoFormPage';
import ProposicaoDetailPage from '@/pages/ProposicaoDetailPage';
import ProdutividadePage from '@/pages/ProdutividadePage';
import ProdutividadePageV2 from '@/pages/ProdutividadePageV2';
import LideresProdutividadePage from '@/pages/LideresProdutividadePage';
import EnquetesPage from '@/pages/EnquetesPage';
import EnquetesPageV2 from '@/pages/EnquetesPageV2';
import EnquetePublicaPage from '@/pages/EnquetePublicaPage';

import { RoleGuard } from '@/components/RoleGuard';

function App() {
  const auth = useSupabaseAuth();
  useAuthErrorHandler();

  return (
    <Routes>
      <Route path="/" element={<LandingPage {...auth} />} />
      <Route path="/afiliar/:liderId" element={<AfiliarPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/teste-here" element={<HereApiTest />} />

      <Route path="/enquete/:enqueteId" element={<EnquetePublicaPage />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route
        path="/dashboard"
        element={auth.isAuthenticated ? <DashboardLayout {...auth} /> : <Navigate to="/" replace />}
      >
        <Route index element={<DashboardHome />} />
        <Route path="eleitores" element={<EleitoresPage />} />
        <Route path="comunidades" element={<ComunidadesPage />} />
        <Route path="comunidades/teste-v2" element={<ComunidadesPageV2 />} />
        <Route path="solicitacoes" element={<SolicitacoesPage />} />
        <Route path="comunicacao" element={<ComunicacaoPage />} />
        <Route path="mapa" element={<MapaPage />} />

        <Route path="agenda" element={<AgendaPage />} />
        <Route path="agenda/teste-v2" element={<AgendaPageV2 />} />

        <Route path="tarefas" element={<TarefasPage />} />
        <Route path="tarefas/teste-v2" element={<TarefasPageV2 />} />
        <Route path="relatorios" element={<RelatoriosPage />} />
        <Route path="relatorios/teste-v2" element={<RelatoriosPageV2 />} />
        <Route path="proposicoes" element={<ProposicoesPage />} />
        <Route path="proposicoes/teste-v2" element={<ProposicoesPageV2 />} />
        <Route path="proposicoes/:id" element={<ProposicaoDetailPage />} />
        <Route path="proposicoes/:id/editar" element={<ProposicaoFormPage />} />
        <Route path="produtividade" element={<ProdutividadePage />} />
        <Route path="produtividade/teste-v2" element={<ProdutividadePageV2 />} />
        <Route path="lideres" element={<LideresProdutividadePage />} />
        <Route path="enquetes" element={<EnquetesPage />} />
        <Route path="enquetes/teste-v2" element={<EnquetesPageV2 />} />
        <Route path="equipe" element={<RoleGuard require="admin"><EquipePage /></RoleGuard>} />
        <Route path="equipe/teste-v2" element={<RoleGuard require="admin"><EquipePageV2 /></RoleGuard>} />
        <Route path="configuracoes" element={<RoleGuard require="admin"><ConfiguracoesPage /></RoleGuard>} />
          <Route path="configuracoes/teste-v2" element={<RoleGuard require="admin"><ConfiguracoesPageV2 /></RoleGuard>} />
      </Route>
    </Routes>
  );
}

export default App;
