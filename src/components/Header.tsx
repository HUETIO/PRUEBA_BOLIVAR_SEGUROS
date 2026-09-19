import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Server, 
  Bell, 
  Plus, 
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
  BookOpen
} from 'lucide-react';
import { getApiKey, setApiKey } from '../lib/api';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreatePolicy: () => void;
  onOpenCreateReminder: () => void;
  pendingRemindersCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  onScrollToInstructions: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreatePolicy,
  onOpenCreateReminder,
  pendingRemindersCount,
  onRefresh,
  isRefreshing,
  onScrollToInstructions,
}) => {
  const [apiKeyVal, setApiKeyVal] = useState(getApiKey());
  const [showKeyEditor, setShowKeyEditor] = useState(false);

  const handleKeyChange = (newKey: string) => {
    setApiKeyVal(newKey);
    setApiKey(newKey);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-900/30 text-white font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">SegurosPolizas</span>
                <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  Spring Boot 3 + React
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Gestión de Pólizas de Arrendamiento • Individuales & Colectivas
              </p>
            </div>
          </div>

          {/* Center/Right Status Badges & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Backend & Mock Status */}
            <div className="hidden lg:flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-medium">REST API Spring Boot</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1 text-teal-300">
                <Server className="w-3.5 h-3.5" />
                <span>WebLogic Mock</span>
              </div>
            </div>

            {/* API Key Security Indicator */}
            <div className="relative">
              <button
                onClick={() => setShowKeyEditor(!showKeyEditor)}
                title="Configurar Header x-api-key"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                  apiKeyVal === '123456'
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/70 hover:bg-emerald-900/40'
                    : 'bg-rose-950/40 text-rose-300 border-rose-800/70 hover:bg-rose-900/40'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span className="hidden md:inline">x-api-key:</span>
                <span className="font-bold">{apiKeyVal}</span>
                {apiKeyVal === '123456' ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                )}
              </button>

              {showKeyEditor && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-2xl z-50 text-xs">
                  <div className="font-semibold text-slate-200 mb-1 flex items-center justify-between">
                    <span>Seguridad Módulo 2</span>
                    <span className="text-[10px] text-slate-400">Header obligatorio</span>
                  </div>
                  <p className="text-slate-400 mb-2 leading-relaxed">
                    El backend requiere <code className="text-emerald-400 font-mono">x-api-key: 123456</code>. Puedes modificarlo aquí para verificar que el servidor rechaza peticiones no autorizadas (401).
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={apiKeyVal}
                      onChange={(e) => handleKeyChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
                      placeholder="123456"
                    />
                    <button
                      onClick={() => handleKeyChange('123456')}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-[11px]"
                    >
                      Reset
                    </button>
                  </div>
                  {apiKeyVal !== '123456' && (
                    <div className="mt-2 p-1.5 rounded bg-rose-950/60 border border-rose-900 text-[11px] text-rose-300">
                      ⚠️ Clave distinta a 123456: Las llamadas a la API retornarán error 401 Unauthorized.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Actualizar datos"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {/* Reminders Button */}
            <button
              onClick={() => setActiveTab('reminders')}
              className={`relative p-2 rounded-lg transition ${
                activeTab === 'reminders'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Ver Recordatorios"
            >
              <Bell className="w-4 h-4" />
              {pendingRemindersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingRemindersCount}
                </span>
              )}
            </button>

            {/* Quick Action Button */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={onOpenCreatePolicy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Póliza</span>
              </button>
              <button
                onClick={onOpenCreateReminder}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg shadow-sm transition active:scale-95"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Recordatorio</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Exclusively Operational Components */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-t border-slate-800/80 text-xs">
          {/* Componentes Operativos */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/70 px-2.5 py-1 rounded-md border border-emerald-800/70 shrink-0 mr-1">
              Plataforma Operativa
            </span>
            {[
              { id: 'dashboard', label: '📊 Tablero Mensual' },
              { id: 'polizas', label: '🛡️ Pólizas & Riesgos' },
              { id: 'reminders', label: '⏰ Recordatorios' },
              { id: 'coremock', label: '📡 WebLogic CORE' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold ring-1 ring-emerald-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Botón directo hacia la sección de Instrucciones ubicada en la parte inferior */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onScrollToInstructions}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-teal-300 hover:text-white bg-teal-950/60 hover:bg-teal-900/60 border border-teal-500/40 text-xs font-semibold transition active:scale-95 shadow-sm"
              title="Ir a las instrucciones técnicas y guía de endpoints al final de la página"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              <span>Instrucciones & Endpoints</span>
              <ArrowDown className="w-3.5 h-3.5 text-teal-400 animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
