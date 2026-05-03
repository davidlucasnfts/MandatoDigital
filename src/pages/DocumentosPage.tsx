import { motion } from 'framer-motion';
import { FolderOpen, Plus, FileText, Image, FileSpreadsheet, File, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { documentos } from '@/data/mockData';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

const typeIcons: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
  pdf: { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
  doc: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
  xls: { icon: FileSpreadsheet, color: 'text-green-500', bg: 'bg-green-50' },
  img: { icon: Image, color: 'text-purple-500', bg: 'bg-purple-50' },
  outro: { icon: File, color: 'text-slate-500', bg: 'bg-slate-50' },
};

const pastas = ['Todos', 'Projetos de Lei', 'Relatórios', 'Fotos', 'Dados', 'Ofícios'];

export default function DocumentosPage() {
  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-600" />
              Documentos
            </h2>
            <p className="text-sm text-slate-500 mt-1">{documentos.length} documentos</p>
          </div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-1.5" /> Upload
          </Button>
        </div>
      </motion.div>

      <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Buscar documentos..." className="pl-9 h-10" />
          </div>
          <div className="flex flex-wrap gap-2">
            {pastas.map((p) => (
              <button key={p} className={`text-xs px-3 py-1.5 rounded-full transition-colors ${p === 'Todos' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {documentos.map((d, i) => {
          const typeConfig = typeIcons[d.tipo] || typeIcons.outro;
          const Icon = typeConfig.icon;
          return (
            <motion.div key={d.id} custom={i + 2} variants={fadeIn} initial="hidden" animate="visible">
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${typeConfig.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${typeConfig.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors">{d.nome}</h4>
                      <p className="text-xs text-slate-400 mt-1">{d.pasta}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-400">{d.tamanho}</span>
                        <span className="text-xs text-slate-400">{d.dataUpload}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
