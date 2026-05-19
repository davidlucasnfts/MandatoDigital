// Tela de Administracao - monitoramento interno
// Acesso restrito a usuarios com role = admin

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, TrendingUp, MapPin, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import GeocodingConfig from "@/components/GeocodingConfig";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

export default function AdminPage() {
  const { user, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();

  // Protecao: so admin pode acessar
  useEffect(() => {
    if (!isLoading && (!user || !user.app_metadata?.role || user.app_metadata.role !== "admin")) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Carregando...</div>
      </div>
    );
  }

  if (!user || !user.app_metadata?.role || user.app_metadata.role !== "admin") {
    return null; // Redirecionando
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Painel Administrativo</h2>
            <p className="text-sm text-slate-400">Monitoramento interno e configuracoes avancadas</p>
          </div>
        </div>
      </motion.div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Geocodificacao</p>
                  <p className="text-lg font-bold text-slate-800">Here API</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Custo Atual</p>
                  <p className="text-lg font-bold text-slate-800">R$ 0,00</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={3} variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <p className="text-lg font-bold text-green-600">Operacional</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Configuracao de Geocodificacao */}
      <motion.div custom={4} variants={fadeIn} initial="hidden" animate="visible">
        <GeocodingConfig />
      </motion.div>

      {/* Alertas e Avisos */}
      <motion.div custom={5} variants={fadeIn} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Alertas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-700">CNEFE sem dados</p>
                  <p className="text-xs text-amber-600">
                    A tabela cnefe_enderecos na VPS esta vazia apos o incidente de seguranca. 
                    Reimportar dados do IBGE quando possivel.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <MapPin className="w-4 h-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-700">Here API em teste</p>
                  <p className="text-xs text-blue-600">
                    O sistema esta configurado para usar Here API, mas a API key ainda nao foi configurada.
                    Adicione VITE_HERE_API_KEY no .env para ativar.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
