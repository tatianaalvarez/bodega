import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { ProductionView } from './components/production/ProductionView';
import { WarehouseView } from './components/warehouse/WarehouseView';
import { ManagementView } from './components/management/ManagementView';
import { WarehouseLayoutView } from './components/layout/WarehouseLayoutView';
import { TechnicalSpecificationView } from './components/specification/TechnicalSpecificationView';
import { ShieldCheck, Layers, HelpCircle } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, role } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {activeTab === 'production' && <ProductionView />}
      {activeTab === 'warehouse' && <WarehouseView />}
      {activeTab === 'dashboard' && <ManagementView />}
      {activeTab === 'layout' && <WarehouseLayoutView />}
      {activeTab === 'spec' && <TechnicalSpecificationView />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-100/80 text-slate-900 font-sans flex flex-col selection:bg-blue-500 selection:text-white">
        <Header />
        
        <div className="flex-1">
          <MainContent />
        </div>

        {/* Corporate Footer with Standards */}
        <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="font-semibold text-slate-200">
                Impresos El Día S.A.S. — Sistema de Abastecimiento Interno (OptiFlow)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Medellín, Colombia • NIT: 890.903.512-1 • Formatos de Control FOR-LOG-02 / FOR-LOG-03
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ISO 9001:2015
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ISO 14001:2015
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ISO 45001:2018
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ISO 12647
              </span>
            </div>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}
