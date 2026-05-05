import { Routes, Route, Navigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import LandingPage from '@/pages/LandingPage';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardHome from '@/pages/DashboardHome';
import EleitoresPage from '@/pages/EleitoresPage';
import ComunidadesPage from '@/pages/ComunidadesPage';
import SolicitacoesPage from '@/pages/SolicitacoesPage';
import ComunicacaoPage from '@/pages/ComunicacaoPage';
import MapaPage from '@/pages/MapaPage';
import AgendaPage from '@/pages/AgendaPage';
import TarefasPage from '@/pages/TarefasPage';
import DocumentosPage from '@/pages/DocumentosPage';
import RelatoriosPage from '@/pages/RelatoriosPage';
import EquipePage from '@/pages/EquipePage';
import ConfiguracoesPage from '@/pages/ConfiguracoesPage';
import { RoleGuard } from '@/components/RoleGuard';

function App() {
  const auth = useSupabaseAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage {...auth} />} />
      <Route
        path="/dashboard"
        element={auth.isAuthenticated ? <DashboardLayout {...auth} /> : <Navigate to="/" replace />}
      >
        <Route index element={<DashboardHome />} />
        <Route path="eleitores" element={<EleitoresPage />} />
        <Route path="comunidades" element={<ComunidadesPage />} />
        <Route path="solicitacoes" element={<SolicitacoesPage />} />
        <Route path="comunicacao" element={<ComunicacaoPage />} />
        <Route path="mapa" element={<MapaPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="tarefas" element={<TarefasPage />} />
        <Route path="documentos" element={<DocumentosPage />} />
        <Route path="relatorios" element={<RelatoriosPage />} />
        <Route path="equipe" element={<RoleGuard require="admin"><EquipePage /></RoleGuard>} />
        <Route path="configuracoes" element={<RoleGuard require="admin"><ConfiguracoesPage /></RoleGuard>} />
      </Route>
    </Routes>
  );
}

export default App;
