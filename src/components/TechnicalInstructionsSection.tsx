import React from 'react';
import { 
  BookOpen, 
  Code2, 
  Layers, 
  Database, 
  Terminal, 
  ChevronUp, 
  ArrowUp,
  HelpCircle,
  Sparkles,
  ArrowRight,
  X,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { EndpointConsumptionGuide } from './EndpointConsumptionGuide';
import { SystemDesignView } from './SystemDesignView';
import { DatabaseAndGitView } from './DatabaseAndGitView';
import { SpringBootExplorer } from './SpringBootExplorer';

export type InstructionTab = 'endpoints' | 'systemdesign' | 'optimization' | 'code';

interface TechnicalInstructionsSectionProps {
  activeInstructionTab: InstructionTab;
  setActiveInstructionTab: (tab: InstructionTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const TechnicalInstructionsSection: React.FC<TechnicalInstructionsSectionProps> = ({
  activeInstructionTab,
  setActiveInstructionTab,
  isOpen,
  setIsOpen,
}) => {
  const tabs: { id: InstructionTab; label: string; icon: any; badge?: string; desc: string }[] = [
    {
      id: 'endpoints',
      label: 'Consumo de Endpoints',
      icon: Terminal,
      badge: 'Sección Exclusiva',
      desc: 'Especificación REST, cabeceras x-api-key, ejemplos en cURL/JS/Java/Python y Sandbox',
    },
    {
      id: 'systemdesign',
      label: 'Módulo 1: System Design',
      icon: Layers,
      desc: 'Arquitectura de alto nivel, justificación de patrones (EDA, Hexagonal, CQRS) y NFRs',
    },
    {
      id: 'optimization',
      label: 'Módulos 3 & 4: BBDD & Git',
      icon: Database,
      desc: 'DDL con constraints, consultas de alta escala con EXPLAIN y estrategia cherry-pick',
    },
    {
      id: 'code',
      label: 'Código Spring Boot 3',
      icon: Code2,
      desc: 'Explorador del código fuente Java (Controllers, Services, JPA Entities, Security)',
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSpecificTab = (tab: InstructionTab) => {
    setActiveInstructionTab(tab);
    setIsOpen(true);
    setTimeout(() => {
      const el = document.getElementById('seccion-instrucciones');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <section 
      id="seccion-instrucciones" 
      className="mt-16 pt-8 border-t-2 border-slate-800/80 text-slate-100 scroll-mt-6"
    >
      {/* ESTADO 1: PREGUNTA INTERACTIVA (Cuando está cerrado para no interferir con la operación) */}
      {!isOpen ? (
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/30 shrink-0 shadow-inner">
                <HelpCircle className="w-7 h-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-950/90 text-teal-300 border border-teal-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-400" />
                    <span>Módulo de Soporte & Evaluación</span>
                  </span>
                  <span className="text-xs text-slate-400">Separado de la operación diaria</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  ¿Necesitas ayuda técnica o consultar la documentación de la prueba?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
                  Para no saturar tu flujo de trabajo operativo (Pólizas, Riesgos y Recordatorios), las especificaciones de arquitectura, contratos de endpoints y código backend se activan únicamente cuando lo requieras.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
              <button
                onClick={() => setIsOpen(true)}
                className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-teal-900/30 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>Sí, ver Instrucciones & Evaluación</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Atajos Rápidos a Preguntas Específicas */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              O accede directamente a un entregable específico:
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleOpenSpecificTab('endpoints')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-teal-300 border border-slate-700 text-xs flex items-center gap-1.5 transition"
              >
                <Terminal className="w-3.5 h-3.5 text-teal-400" />
                <span>🔌 Consumo de Endpoints</span>
              </button>
              <button
                onClick={() => handleOpenSpecificTab('systemdesign')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-teal-300 border border-slate-700 text-xs flex items-center gap-1.5 transition"
              >
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                <span>🏛️ System Design</span>
              </button>
              <button
                onClick={() => handleOpenSpecificTab('optimization')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-teal-300 border border-slate-700 text-xs flex items-center gap-1.5 transition"
              >
                <Database className="w-3.5 h-3.5 text-teal-400" />
                <span>⚡ BBDD & Git</span>
              </button>
              <button
                onClick={() => handleOpenSpecificTab('code')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-teal-300 border border-slate-700 text-xs flex items-center gap-1.5 transition"
              >
                <Code2 className="w-3.5 h-3.5 text-teal-400" />
                <span>☕ Código Java</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ESTADO 2: SECCIÓN COMPLETA ABIERTA */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Banner de Modo Evaluación Activo con opción para cerrarlo */}
          <div className="bg-gradient-to-r from-teal-950/80 via-slate-900 to-slate-900 border border-teal-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-teal-900/80 px-2 py-0.5 rounded border border-teal-700">
                    Modo Evaluación Desplegado
                  </span>
                  <span className="text-xs text-slate-400">Guías técnicas y contratos de integración</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  Visualizando: Instrucciones, Arquitectura y Consumo de Endpoints
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition active:scale-95"
                title="Ocultar esta sección para volver a concentrarte en la operación"
              >
                <X className="w-3.5 h-3.5 text-rose-400" />
                <span>Ocultar Instrucciones</span>
              </button>
              <button
                onClick={scrollToTop}
                title="Volver a los componentes operativos superiores"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
              >
                <ArrowUp className="w-4 h-4" />
                <span className="hidden sm:inline">Subir</span>
              </button>
            </div>
          </div>

          {/* Selector de Pestañas de la Documentación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeInstructionTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveInstructionTab(tab.id)}
                  className={`p-4 rounded-2xl text-left transition-all border flex flex-col justify-between relative group ${
                    isSelected
                      ? 'bg-slate-800/90 border-teal-500 shadow-xl ring-2 ring-teal-500/30'
                      : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className={`p-2 rounded-xl ${
                        isSelected 
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {tab.badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-white block mb-1">
                      {tab.label}
                    </span>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {tab.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-semibold text-teal-400">
                    <span>{isSelected ? '● Visualizando' : 'Seleccionar'}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Área de Visualización del Contenido Activo */}
          <div className="mt-6">
            {activeInstructionTab === 'endpoints' && (
              <div className="animate-in fade-in duration-200">
                <EndpointConsumptionGuide />
              </div>
            )}

            {activeInstructionTab === 'systemdesign' && (
              <div className="animate-in fade-in duration-200">
                <SystemDesignView />
              </div>
            )}

            {activeInstructionTab === 'optimization' && (
              <div className="animate-in fade-in duration-200">
                <DatabaseAndGitView />
              </div>
            )}

            {activeInstructionTab === 'code' && (
              <div className="animate-in fade-in duration-200">
                <SpringBootExplorer />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pie de página con créditos y retorno al inicio */}
      <footer className="mt-12 py-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-2">
          <span>Prueba Técnica Seguros Bolívar • Desarrollador TI</span>
          <span>•</span>
          <span className="text-slate-400">Diego Sepúlveda</span>
        </div>
        <div className="flex items-center gap-4">
          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-200 underline"
            >
              Cerrar documentación técnica
            </button>
          )}
          <button
            onClick={scrollToTop}
            className="text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Volver a la plataforma operativa</span>
          </button>
        </div>
      </footer>
    </section>
  );
};
