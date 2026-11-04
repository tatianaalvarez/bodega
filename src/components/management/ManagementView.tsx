import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Flame, 
  Activity, 
  Layers, 
  ArrowUpRight,
  Truck,
  PackageX,
  Gauge
} from 'lucide-react';

export const ManagementView: React.FC = () => {
  const { kpis, inventory, machines, requests } = useApp();

  const criticalMaterials = inventory.filter(i => i.physicalStock <= i.minSafetyStock);
  const reorderMaterials = inventory.filter(i => i.physicalStock > i.minSafetyStock && i.physicalStock <= i.reorderPoint);

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Control Tower */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-5 rounded-2xl border border-emerald-800 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500/30 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-400/30 uppercase tracking-wide">
              Módulo 3: Torre de Control Logística & Planta
            </span>
            <span className="text-xs text-emerald-200">Métricas Automatizadas en Tiempo Real</span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-white">Indicadores de Desempeño (KPIs) y Eliminación de Tiempos Muertos</h2>
          <p className="text-xs text-slate-300 max-w-3xl mt-1">
            Supervisión integral de nivel de servicio interno hacia líneas de producción litográfica, empaque y troquelado. Monitoreo continuo de <strong>OTIF</strong>, tiempos de ciclo de picking y mitigación proactiva de desabastecimiento.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-xs">
          <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div>
            <div className="text-slate-300 font-semibold">Estado de Planta:</div>
            <div className="text-emerald-400 font-bold">Líneas de Prensa al 94% OEE</div>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: OTIF */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nivel de Servicio OTIF
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{kpis.otifPercentage}%</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +4.2% vs mes ant.
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            On-Time In-Full: Solicitudes entregadas puntuales y completas según estándar ISO 9001.
          </p>
          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${kpis.otifPercentage}%` }}></div>
          </div>
        </div>

        {/* KPI 2: Lead Time */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Picking Lead Time Promedio
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{kpis.averageLeadTimeMinutes} min</span>
            <span className="text-xs font-bold text-emerald-600">
              Meta: &lt; 30 min
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Tiempo transcurrido desde emisión de solicitud pull hasta llegada al pie de máquina.
          </p>
          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>

        {/* KPI 3: Horas de Paro Evitadas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Paradas Evitadas en Prensa
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{kpis.avoidedDowntimeHours} h</span>
            <span className="text-xs font-bold text-purple-600">
              Ahorro: ~$4,800 USD
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Tiempos muertos eliminados al sustituir chats informales por alertas automáticas de reposición.
          </p>
          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* KPI 4: Tasa de Errores de Surtido */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tasa de Error de Surtido
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <PackageX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{kpis.errorRatePercentage}%</span>
            <span className="text-xs font-bold text-emerald-600">
              Excelente (&lt; 2%)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Verificado por código de barras y lista de chequeo de no conformidad FOR-LOG-03.
          </p>
          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '12%' }}></div>
          </div>
        </div>

      </div>

      {/* Second Row: Critical Stock Alarms & Machine Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Critical Materials Warning Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Alertas Tempranas de Inventario (Prevención de Quiebre)
              </h3>
              <p className="text-xs text-slate-500">
                Materiales en o por debajo del Stock de Seguridad y Punto de Reorden
              </p>
            </div>
            <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full">
              {criticalMaterials.length + reorderMaterials.length} Insumos en Alerta
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1">
            {criticalMaterials.map(item => (
              <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-xs">{item.name}</span>
                    <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded uppercase">
                      Stock Crítico
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.2 rounded">
                      Bin: {item.locationBin}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Categoría: {item.category} • Clase ABC: <strong>{item.abcClass}</strong>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs shrink-0">
                  <div className="text-right">
                    <div className="text-rose-600 font-black">
                      {item.physicalStock} {item.unit}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Mínimo: {item.minSafetyStock} {item.unit}
                    </div>
                  </div>
                  <span className="bg-rose-50 text-rose-700 text-[11px] font-semibold px-2 py-1 rounded border border-rose-200">
                    Sugerir Compra
                  </span>
                </div>
              </div>
            ))}

            {reorderMaterials.map(item => (
              <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-xs">{item.name}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded uppercase">
                      Punto Reorden
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Categoría: {item.category} • Ubicación: {item.locationBin}
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs shrink-0">
                  <div className="text-right">
                    <div className="text-amber-700 font-bold">
                      {item.physicalStock} {item.unit}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Reorden: {item.reorderPoint} {item.unit}
                    </div>
                  </div>
                  <span className="bg-amber-50 text-amber-700 text-[11px] font-medium px-2 py-1 rounded border border-amber-200">
                    Planificar OP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Machine Status & Floor Demand (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Líneas de Producción Litográfica & Empaque
              </h3>
              <p className="text-xs text-slate-500">Abastecimiento en tiempo real por centro de costo</p>
            </div>
          </div>

          <div className="space-y-3">
            {machines.map(m => {
              const activeMachineRequests = requests.filter(r => r.machineId === m.id && r.status !== 'ENTREGADO_CONFORME');

              return (
                <div key={m.id} className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{m.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      m.status === 'OPERATIVA'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>{m.costCenter}</span>
                    <span className="font-semibold text-blue-600">
                      {activeMachineRequests.length} solicitudes activas
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Operario asignado: {m.assignedOperator}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ABC Inventory Velocity Analysis */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              Estratificación ABC del Almacén (Impresos El Día S.A.S.)
            </h3>
            <p className="text-xs text-slate-500">
              Distribución Pareto 80/20 aplicada a sustratos, tintas y planchas CTP
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Class A Box */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 uppercase">Artículos Clase A</span>
              <span className="text-xs font-mono font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
                80% Movimiento
              </span>
            </div>
            <div className="text-2xl font-black text-rose-950">
              {inventory.filter(i => i.abcClass === 'A').length} Referencias
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Ubicación:</strong> Zona frontal a nivel de cintura/pecho (A-01 a A-04). Cartulinas FBB, Couché 90/150g, Tintas CMYK Proceso, Barniz Acuoso Brillante y Planchas CTP.
            </p>
            <div className="text-[11px] font-semibold text-rose-700 pt-1 border-t border-rose-200">
              Estrategia: Conteo cíclico diario + Kitting anticipado
            </div>
          </div>

          {/* Class B Box */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase">Artículos Clase B</span>
              <span className="text-xs font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                15% Movimiento
              </span>
            </div>
            <div className="text-2xl font-black text-amber-950">
              {inventory.filter(i => i.abcClass === 'B').length} Referencias
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Ubicación:</strong> Pasillos intermedios (B-02 a B-07). Cartón SBS, Autoadhesivo Couché, Tintas Pantoneras, Barniz UV Sectorizado, Revelador CTP y Mantillas Offset.
            </p>
            <div className="text-[11px] font-semibold text-amber-700 pt-1 border-t border-amber-200">
              Estrategia: Conteo quincenal + Reabastecimiento por Milk Run
            </div>
          </div>

          {/* Class C Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase">Artículos Clase C</span>
              <span className="text-xs font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                5% Movimiento
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {inventory.filter(i => i.abcClass === 'C').length} Referencias
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Ubicación:</strong> Estanterías altas o zonas de fondo (C-05 a C-TROQ). Tintas Metálicas Dorado/Plateado, Cuchilla Polar 115, Foil Hot Stamping, Flejes de Troquelado.
            </p>
            <div className="text-[11px] font-semibold text-slate-700 pt-1 border-t border-slate-200">
              Estrategia: Conteo mensual + Pedido bajo demanda
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
