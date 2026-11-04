import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Layers, 
  Package, 
  Truck, 
  ClipboardList, 
  QrCode, 
  Check, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  CheckCircle2, 
  Sparkles,
  BarChart2,
  ScanLine
} from 'lucide-react';
import { ABCCategory } from '../../types';

export const WarehouseView: React.FC = () => {
  const { 
    inventory, 
    requests, 
    kits, 
    milkRuns, 
    cyclicCounts, 
    advanceRequestStatus, 
    markPickListItemPicked, 
    advanceMilkRunStop,
    recordCyclicCount 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'picklists' | 'kitting' | 'milkrun' | 'cyclic'>('picklists');
  const [filterABC, setFilterABC] = useState<ABCCategory | 'ALL'>('ALL');
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);
  const [countingInput, setCountingInput] = useState<{ [key: string]: number }>({});

  // Filter requests that are in warehouse stage
  const pendingWarehouseRequests = requests.filter(r => 
    r.status === 'PENDIENTE' || r.status === 'EN_PICKING'
  );

  // Group pending pick items by ABC Priority sequence
  const sortedPickItems = [...pendingWarehouseRequests].sort((a, b) => {
    const itemA = inventory.find(i => i.id === a.itemId);
    const itemB = inventory.find(i => i.id === b.itemId);
    const priorityWeight: Record<string, number> = {
      'CRITICA_LINEA_PARADA': 1,
      'ALTA': 2,
      'MEDIA': 3,
      'BAJA': 4
    };
    // First by request priority
    if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
      return priorityWeight[a.priority] - priorityWeight[b.priority];
    }
    // Then by ABC classification (A first, then B, then C)
    const abcWeight: Record<string, number> = { 'A': 1, 'B': 2, 'C': 3 };
    const classA = itemA?.abcClass || 'C';
    const classB = itemB?.abcClass || 'C';
    return (abcWeight[classA] || 3) - (abcWeight[classB] || 3);
  });

  const handleSimulateScan = (reqId: string, itemName: string, bin: string) => {
    advanceRequestStatus(reqId, 'EN_RUTA_MILK_RUN');
    setScannedFeedback(`Código de barra verificado en rack ${bin}. Insumo [${itemName}] cargado para despacho.`);
    setTimeout(() => setScannedFeedback(null), 4000);
  };

  const handleSaveCyclicCount = (id: string) => {
    const val = countingInput[id];
    if (val !== undefined && !isNaN(val)) {
      recordCyclicCount(id, Number(val));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Industrial Strategy ABC & Warehouse Engineering */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 p-5 rounded-2xl border border-amber-800 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-500/30 text-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-wide">
              Módulo 2: Operaciones de Bodega y Logística Interna
            </span>
            <span className="text-xs text-amber-200">Layout Ergonómico & Lean Manufacturing</span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-white">Surtido Inteligente ABC, Kitting y Rutas Lecheras</h2>
          <p className="text-xs text-slate-300 max-w-3xl mt-1">
            Optimización de recorridos según clasificación ABC (80% de movimientos en zona frontal A a nivel de cintura/pecho). Despacho en kits pre-ensamblados o tren logístico recurrente cada 2 horas para eliminar tiempos muertos.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 text-xs">
          <div className="text-center px-2 border-r border-slate-700">
            <div className="text-amber-400 font-bold text-base">
              {inventory.filter(i => i.abcClass === 'A').length}
            </div>
            <div className="text-[10px] text-slate-400">Artículos A (80% rot.)</div>
          </div>
          <div className="text-center px-2 border-r border-slate-700">
            <div className="text-blue-400 font-bold text-base">
              {inventory.filter(i => i.abcClass === 'B').length}
            </div>
            <div className="text-[10px] text-slate-400">Artículos B (Media)</div>
          </div>
          <div className="text-center px-2">
            <div className="text-slate-400 font-bold text-base">
              {inventory.filter(i => i.abcClass === 'C').length}
            </div>
            <div className="text-[10px] text-slate-400">Artículos C (Baja)</div>
          </div>
        </div>
      </div>

      {/* Subtabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSubTab('picklists')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'picklists'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Listas de Surtido ABC ({pendingWarehouseRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('kitting')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'kitting'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Kits de Producción ({kits.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('milkrun')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'milkrun'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Rutas Lecheras (Milk Runs)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('cyclic')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'cyclic'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Conteo Cíclico Diario ABC</span>
          </button>
        </div>

        {/* Scan feedback toast */}
        {scannedFeedback && (
          <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{scannedFeedback}</span>
          </div>
        )}
      </div>

      {/* SUBTAB 1: ABC PICK LISTS */}
      {activeSubTab === 'picklists' && (
        <div className="space-y-4">
          {/* ABC Algorithm Explanation Callout */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3 text-xs text-blue-900">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Algoritmo de Extracción Secuencial (Walk-Path Optimization):</span>
              <p className="mt-0.5 text-blue-800 leading-relaxed">
                El sistema secuencia automáticamente las extracciones respetando: <strong>1° Urgencia de la Línea</strong> &rarr; <strong>2° Pasillo A (Artículos A: Nivel Ergonómico Pecho/Cintura)</strong> &rarr; <strong>3° Pasillo B (Químicos y Sustratos Medios)</strong> &rarr; <strong>4° Pasillo C (Artículos C en Racks Altos)</strong>. Esto reduce hasta un <strong>42% los pasos del auxiliar</strong> y previene fatiga muscular bajo norma ISO 45001.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Cola de Picking Activa (Ordenada por Ruta Óptima)
                </span>
                <span className="text-xs text-slate-500">
                  {sortedPickItems.length} materiales requeridos
                </span>
              </div>

              {/* ABC Filter pills */}
              <div className="flex items-center space-x-1 text-xs">
                <span className="text-slate-500 text-[11px] mr-1">Filtrar:</span>
                {(['ALL', 'A', 'B', 'C'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterABC(cat)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer transition ${
                      filterABC === cat
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat === 'ALL' ? 'Todos' : `Clase ${cat}`}
                  </button>
                ))}
              </div>
            </div>

            {sortedPickItems.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-700">No hay órdenes de picking pendientes en este momento.</p>
                <p className="text-xs text-slate-500 mt-1">Todos los requerimientos han sido alistados o despachados a las máquinas.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sortedPickItems
                  .filter(req => {
                    if (filterABC === 'ALL') return true;
                    const item = inventory.find(i => i.id === req.itemId);
                    return item?.abcClass === filterABC;
                  })
                  .map((req, idx) => {
                    const item = inventory.find(i => i.id === req.itemId);
                    const isUrgent = req.priority === 'CRITICA_LINEA_PARADA' || req.priority === 'ALTA';

                    return (
                      <div 
                        key={req.id} 
                        className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-slate-50/80 ${
                          isUrgent ? 'bg-rose-50/20' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3.5">
                          {/* Walk sequence number */}
                          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            #{idx + 1}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{req.itemName}</span>
                              <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {req.itemCode}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                item?.abcClass === 'A'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : item?.abcClass === 'B'
                                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                ABC: {item?.abcClass || 'C'}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                req.priority === 'CRITICA_LINEA_PARADA'
                                  ? 'bg-rose-600 text-white'
                                  : req.priority === 'ALTA'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {req.priority.replace('_', ' ')}
                              </span>
                            </div>

                            <div className="mt-1.5 flex flex-wrap items-center text-xs text-slate-600 gap-x-4 gap-y-1">
                              <span className="flex items-center gap-1 font-semibold text-slate-800">
                                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                Ubicación Bodega: <strong className="text-amber-800 font-mono">{item?.locationBin}</strong>
                              </span>
                              <span>
                                Nivel Ergonómico: <strong>{item?.ergonomicLevel.replace('_', ' ')}</strong>
                              </span>
                              <span>
                                Destino: <strong className="text-slate-800">{req.machineName}</strong> ({req.opNumber})
                              </span>
                              {item?.hazardousClassification && (
                                <span className="text-amber-700 font-medium">
                                  ⚠️ {item.hazardousClassification}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quantities & Scan Action */}
                        <div className="flex items-center justify-between md:justify-end space-x-4 border-t md:border-t-0 pt-2 md:pt-0">
                          <div className="text-left md:text-right">
                            <div className="text-base font-black text-slate-900">
                              {req.requestedQuantity.toLocaleString()} {req.unit}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Stock en rack: {item?.physicalStock.toLocaleString()} {item?.unit}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {req.status === 'PENDIENTE' ? (
                              <button
                                onClick={() => advanceRequestStatus(req.id, 'EN_PICKING')}
                                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                              >
                                <Play className="w-3.5 h-3.5" />
                                <span>Iniciar Picking</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSimulateScan(req.id, req.itemName, item?.locationBin || 'A-01')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                              >
                                <ScanLine className="w-3.5 h-3.5" />
                                <span>Escanear Código / Completar</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: KITTING (KITS DE PRODUCCIÓN) */}
      {activeSubTab === 'kitting' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-900">
            <Package className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Estrategia de Kitting (Agrupación por Orden de Producción):</span>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                En lugar de que el operario de prensa solicite insumo por insumo, la bodega consolida <strong>todos los componentes de la OP en un solo carro o estiba rotulada con código QR</strong> (Sustrato + Tintas de la cuatricromía + Barniz + Planchas CTP). Esto garantiza que la máquina no arranque sin tener el 100% de insumos listos, eliminando micro-paradas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kits.map(kit => (
              <div key={kit.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{kit.kitNumber}</span>
                      <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded">
                        {kit.opNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Destino: {kit.machineName}</p>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    kit.status === 'COMPLETO' || kit.status === 'ENTREGADO'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {kit.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Items in the kit */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">
                    Insumos del Kit ({kit.items.length} componentes):
                  </div>
                  {kit.items.map(item => (
                    <div 
                      key={item.itemId} 
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        item.isPicked 
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-800' 
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          item.isPicked ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                        }`}>
                          {item.isPicked ? '✓' : item.walkSequence}
                        </span>
                        <div>
                          <div className="font-medium text-slate-900">{item.itemName}</div>
                          <div className="text-[10px] text-slate-500">
                            Bin: <strong className="text-slate-700">{item.locationBin}</strong> • Cant: {item.quantityRequested} {item.unit}
                          </div>
                        </div>
                      </div>

                      {!item.isPicked && (
                        <button
                          onClick={() => markPickListItemPicked(kit.id, item.itemId)}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg transition cursor-pointer"
                        >
                          Confirmar Picking
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1 font-mono">
                    <QrCode className="w-3.5 h-3.5 text-slate-600" />
                    <span>{kit.containerBarcode}</span>
                  </div>
                  <span>Auxiliar: {kit.assignedPicker.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: MILK RUNS (RUTAS LECHERAS) */}
      {activeSubTab === 'milkrun' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-start gap-3 text-xs text-purple-900">
            <Truck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Metodología Milk Run (Tren Logístico Interno Recurrente):</span>
              <p className="mt-0.5 text-purple-800 leading-relaxed">
                El carro logístico multidireccional recorre un circuito predefinido <strong>cada 2 horas</strong> (10:00, 12:00, 14:00) abasteciendo las estaciones de manufactura con insumos programados y recogiendo taras vacías o recipientes de retorno Kanban. Evita que los operarios abandonen sus puestos de impresión.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {milkRuns.map(mr => (
              <div key={mr.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{mr.routeCode}</span>
                        <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                          Salida: {mr.departureTime}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Conductor: {mr.driverName} • Vehículo: {mr.vehicleType} (ISO 45001 Tránsito Seguro)
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                    mr.status === 'FINALIZADA'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-purple-100 text-purple-800 animate-pulse'
                  }`}>
                    {mr.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Circuit Stops Flow */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {mr.stops.map(stop => {
                    const isDone = stop.status === 'COMPLETADA';
                    return (
                      <div 
                        key={stop.stopNumber}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 transition ${
                          isDone 
                            ? 'bg-emerald-50/60 border-emerald-200' 
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-700 text-[11px]">
                            Parada #{stop.stopNumber}
                          </span>
                          {isDone ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-0.5 text-[10px]">
                              <Check className="w-3 h-3" /> Llegó {stop.actualArrival}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">
                              Est. {stop.scheduledArrival}
                            </span>
                          )}
                        </div>

                        <div className="font-bold text-slate-900 text-xs">
                          {stop.machineName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {stop.area}
                        </div>

                        {!isDone && mr.status === 'EN_CURSO' && (
                          <button
                            onClick={() => advanceMilkRunStop(mr.id, stop.stopNumber)}
                            className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded text-[11px] transition cursor-pointer"
                          >
                            Registrar Llegada
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: CYCLIC COUNTING (PREVENCIÓN DE STOCK FANTASMA) */}
      {activeSubTab === 'cyclic' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3 text-xs text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Conteo Cíclico Preventivo (Eliminación de Stock Fantasma):</span>
              <p className="mt-0.5 text-emerald-800 leading-relaxed">
                Conteo diario y continuo iniciando por las <strong>referencias Clase A</strong> (20% de referencias que concentran el 80% de consumos y costos). Asegura que el stock digital coincida 100% con la existencia física en estantería para evitar paradas imprevistas de producción por falta de material.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Plan de Conteos Cíclicos de la Semana
              </span>
              <span className="text-xs text-slate-500">Frecuencia Clase A: Diaria / Semanal</span>
            </div>

            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Descripción de Insumo</th>
                  <th className="p-3">Ubicación</th>
                  <th className="p-3">Clase</th>
                  <th className="p-3 text-right">Stock en Sistema</th>
                  <th className="p-3 text-right">Conteo Físico Real</th>
                  <th className="p-3 text-center">Diferencia</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cyclicCounts.map(cnt => {
                  const isDone = cnt.status !== 'PENDIENTE';
                  const hasDiscrepancy = cnt.status === 'DISCREPANCIA';

                  return (
                    <tr key={cnt.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-mono font-bold text-slate-800">{cnt.itemCode}</td>
                      <td className="p-3 font-medium text-slate-900">{cnt.itemName}</td>
                      <td className="p-3 font-mono text-slate-600">{cnt.locationBin}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          cnt.abcClass === 'A' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          Clase {cnt.abcClass}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-800">
                        {cnt.expectedSystemStock.toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        {isDone ? (
                          <span className="font-bold text-slate-900">
                            {cnt.actualCountedStock?.toLocaleString()}
                          </span>
                        ) : (
                          <input
                            type="number"
                            placeholder="Cantidad contada"
                            value={countingInput[cnt.id] ?? ''}
                            onChange={e => setCountingInput({ ...countingInput, [cnt.id]: Number(e.target.value) })}
                            className="w-24 text-right p-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-amber-500"
                          />
                        )}
                      </td>
                      <td className="p-3 text-center font-bold">
                        {isDone ? (
                          <span className={cnt.difference === 0 ? 'text-emerald-600' : 'text-rose-600'}>
                            {cnt.difference > 0 ? `+${cnt.difference}` : cnt.difference}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cnt.status === 'CONCILIADO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cnt.status === 'DISCREPANCIA'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {cnt.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {!isDone ? (
                          <button
                            onClick={() => handleSaveCyclicCount(cnt.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded text-[11px] cursor-pointer"
                          >
                            Registrar
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Conciliado</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
