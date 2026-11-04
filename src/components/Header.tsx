import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Factory, 
  Warehouse, 
  BarChart3, 
  FileCode2, 
  MapPin, 
  AlertTriangle, 
  RotateCcw, 
  ShieldCheck, 
  Zap, 
  UserCheck 
} from 'lucide-react';
import { UserRole } from '../types';

export const Header: React.FC = () => {
  const { role, setRole, activeTab, setActiveTab, resetToDefaultData, quickSimulateEmergency, kpis } = useApp();

  const rolesConfig: { id: UserRole; title: string; subtitle: string; icon: any; color: string }[] = [
    {
      id: 'operario',
      title: 'Operario de Prensa',
      subtitle: 'Pull System & Recepción',
      icon: Factory,
      color: 'border-blue-500 bg-blue-50 text-blue-800'
    },
    {
      id: 'bodega',
      title: 'Auxiliar de Bodega',
      subtitle: 'Pick Lists ABC & Milk Run',
      icon: Warehouse,
      color: 'border-amber-500 bg-amber-50 text-amber-800'
    },
    {
      id: 'admin',
      title: 'Jefe de Planta / Logística',
      subtitle: 'Torre de Control & KPIs',
      icon: BarChart3,
      color: 'border-emerald-500 bg-emerald-50 text-emerald-800'
    }
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      {/* Top corporate bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-bold tracking-wider text-slate-100 uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Impresos El Día S.A.S.</span>
            <span className="text-slate-400 font-normal">| NIT: 890.903.512-1 (Medellín, Col)</span>
          </div>
          <div className="hidden md:flex items-center space-x-1 text-[11px] text-slate-400 border-l border-slate-700 pl-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ISO 9001:2015</span>
            <span className="text-slate-600">•</span>
            <span>ISO 14001:2015</span>
            <span className="text-slate-600">•</span>
            <span>ISO 45001:2018</span>
            <span className="text-slate-600">•</span>
            <span>ISO 12647</span>
          </div>
        </div>

        {/* Quick simulator buttons */}
        <div className="flex items-center space-x-2 mt-1 sm:mt-0">
          <button
            onClick={quickSimulateEmergency}
            className="flex items-center space-x-1 bg-rose-600/90 hover:bg-rose-600 text-white px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer shadow-sm"
            title="Simula un pedido crítico de reposición de planchas CTP por parada de máquina"
          >
            <Zap className="w-3 h-3 text-yellow-300 animate-bounce" />
            <span>Simular Parada de Línea (Urgencia)</span>
          </button>
          <button
            onClick={resetToDefaultData}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded text-[11px] transition cursor-pointer"
            title="Restaurar datos iniciales"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Main navigation and Role Switcher */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Brand & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Factory className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-white tracking-tight">OptiFlow Suministros</h1>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Bodega &harr; Producción
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pull System, Surtido Inteligente ABC, Kitting y Sincronización en Tiempo Real
              </p>
            </div>
          </div>

          {/* Role selector buttons */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
            <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Rol:
            </span>
            {rolesConfig.map(r => {
              const isSelected = role === r.id;
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{r.title}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Tab navigation bar */}
        <div className="flex overflow-x-auto space-x-1 mt-3 pt-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('production')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-t-lg font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === 'production'
                ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Factory className="w-4 h-4" />
            <span>1. Requerimientos Digitales (Pull System)</span>
          </button>

          <button
            onClick={() => setActiveTab('warehouse')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-t-lg font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === 'warehouse'
                ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Warehouse className="w-4 h-4" />
            <span>2. Surtido ABC, Kitting & Milk Runs</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-t-lg font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>3. Tablero de Control & KPIs (OTIF)</span>
            <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded text-[10px] font-bold">
              {kpis.otifPercentage}%
            </span>
          </button>

          <button
            onClick={() => setActiveTab('layout')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-t-lg font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === 'layout'
                ? 'bg-slate-800 text-purple-400 border-b-2 border-purple-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>4. Layout Bodega 2D & Almacenamiento</span>
          </button>

          <button
            onClick={() => setActiveTab('spec')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-t-lg font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === 'spec'
                ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>5. Especificación Técnica & Esquemas DDL</span>
          </button>
        </div>
      </div>
    </header>
  );
};
