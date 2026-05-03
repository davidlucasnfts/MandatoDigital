import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Toaster } from './components/ui/sonner';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import EleitoresPage from './pages/EleitoresPage';
import ComunidadesPage from './pages/ComunidadesPage';
import SolicitacoesPage from './pages/SolicitacoesPage';
import ComunicacaoPage from './pages/ComunicacaoPage';
import MapaPage from './pages/MapaPage';
import AgendaPage from './pages/AgendaPage';
import TarefasPage from './pages/TarefasPage';
import DocumentosPage from './pages/DocumentosPage';
import RelatoriosPage from './pages/RelatoriosPage';
import EquipePage from './pages/EquipePage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  const auth = useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage {...auth} />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout {...auth} />
            </PrivateRoute>
          }
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
          <Route path="equipe" element={<EquipePage />} />
          <Route path="configuracoes" element={<ConfiguracoesPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;

