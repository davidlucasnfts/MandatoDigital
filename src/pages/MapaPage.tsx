import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Filter, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { comunidades, eleitores } from '@/data/mockData';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } })
};

// Simplified Brazil map SVG
function BrazilMap() {
  const markers = [
    { x: 58, y: 68, cidade: 'São Paulo', count: 1240 },
    { x: 62, y: 72, cidade: 'Curitiba', count: 580 },
    { x: 65, y: 50, cidade: 'Brasília', count: 320 },
    { x: 70, y: 75, cidade: 'Florianópolis', count: 180 },
    { x: 75, y: 82, cidade: 'Porto Alegre', count: 220 },
    { x: 50, y: 45, cidade: 'Manaus', count: 90 },
    { x: 78, y: 78, cidade: 'Rio Grande', count: 45 },
    { x: 60, y: 55, cidade: 'Goiânia', count: 160 },
    { x: 72, y: 42, cidade: 'Salvador', count: 280 },
    { x: 78, y: 35, cidade: 'Recife', count: 145 },
  ];

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ minHeight: '400px' }}>
      {/* Simplified Brazil outline */}
      <path
        d="M45 15 L55 12 L62 18 L70 15 L78 22 L82 30 L85 38 L82 48 L78 55 L75 62 L72 70 L68 78 L62 85 L55 88 L48 85 L42 78 L38 70 L35 60 L32 50 L30 40 L32 30 L38 22 Z"
        fill="#f1f5f9"
        stroke="#cbd5e1"
        strokeWidth="0.3"
      />
      {/* States lines (simplified) */}
      <path d="M55 12 L55 40" stroke="#e2e8f0" strokeWidth="0.2" fill="none" />
      <path d="M62 18 L62 55" stroke="#e2e8f0" strokeWidth="0.2" fill="none" />
      <path d="M70 15 L70 70" stroke="#e2e8f0" strokeWidth="0.2" fill="none" />
      <path d="M45 15 L78 55" stroke="#e2e8f0" strokeWidth="0.2" fill="none" />
      <path d="M38 40 L82 48" stroke="#e2e8f0" strokeWidth="0.2" fill="none" />
      <path d="M35 60 L72 70" stroke="#e2e8f0" strokeWidth="0.2" fill="none" />
      {/* Grid dots for cities */}
      {markers.map((m, i) => (
        <g key={i}>
          <circle cx={m.x} cy={m.y} r={Math.min(m.count / 100 + 1, 4)} fill="#2563EB" opacity={0.7} />
          <circle cx={m.x} cy={m.y} r={1.5} fill="#2563EB" />
        </g>
      ))}
    </svg>
  );
}

export default function MapaPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (nome: string) => {
    setActiveFilters(prev =>
      prev.includes(nome) ? prev.filter(f => f !== nome) : [...prev, nome]
    );
  };

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Mapa de Eleitores
        </h2>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible" className="lg:col-span-1">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <h3 className="font-semibold text-sm text-slate-700">Filtros</h3>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Comunidades</h4>
                <div className="space-y-1.5">
                  {comunidades.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => toggleFilter(c.nome)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
                        activeFilters.includes(c.nome) ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.cor }} />
                      <span className="flex-1 truncate">{c.nome}</span>
                      <span className="text-xs text-slate-400">{c.totalEleitores}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Resumo</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total de eleitores</span>
                    <span className="font-semibold text-slate-800">{eleitores.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Comunidades</span>
                    <span className="font-semibold text-slate-800">{comunidades.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Cidades</span>
                    <span className="font-semibold text-slate-800">1</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Map */}
        <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible" className="lg:col-span-3">
          <Card className="h-full">
            <CardContent className="p-0 relative">
              <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>Eleitores</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Users className="w-3 h-3" />
                  <span>{eleitores.length} cadastrados</span>
                </div>
              </div>
              <div className="p-4">
                <BrazilMap />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
