import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, FileText, Users, MapPin, MessageSquare, Calendar, Settings, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ElementType;
  action: () => void;
}

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const items: CommandItem[] = [
    { id: "eleitores", label: "Eleitores", icon: Users, action: () => navigate("/dashboard/eleitores") },
    { id: "mapa", label: "Mapa", icon: MapPin, action: () => navigate("/dashboard/mapa") },
    { id: "comunicacao", label: "Comunicação", icon: MessageSquare, action: () => navigate("/dashboard/comunicacao") },
    { id: "agenda", label: "Agenda", icon: Calendar, action: () => navigate("/dashboard/agenda") },
    { id: "relatorios", label: "Relatórios", icon: BarChart3, action: () => navigate("/dashboard/relatorios") },
    { id: "configuracoes", label: "Configurações", icon: Settings, action: () => navigate("/dashboard/configuracoes") },
  ];

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white 
          text-slate-500 text-sm hover:border-slate-300 hover:bg-slate-50 transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-500">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]"
            onClick={() => setOpen(false)}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar página ou funcionalidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400"
                  autoFocus
                />
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-500">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[300px] overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-400">
                    Nenhum resultado encontrado
                  </div>
                ) : (
                  filtered.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.action();
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors
                        focus:outline-none focus:bg-slate-50"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-slate-600" />
                      </div>
                      <span className="flex-1 text-sm text-left text-slate-700 font-medium">
                        {item.label}
                      </span>
                      {index === 0 && (
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-500">
                          ↵
                        </kbd>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-slate-100 bg-slate-50/50">
                <span className="text-[10px] text-slate-400">
                  <kbd className="px-1 rounded bg-white border border-slate-200 text-slate-500">↑↓</kbd> navegar
                </span>
                <span className="text-[10px] text-slate-400">
                  <kbd className="px-1 rounded bg-white border border-slate-200 text-slate-500">↵</kbd> selecionar
                </span>
                <span className="text-[10px] text-slate-400">
                  <kbd className="px-1 rounded bg-white border border-slate-200 text-slate-500">esc</kbd> fechar
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
