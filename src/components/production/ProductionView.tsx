import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers, 
  CheckSquare, 
  PackageCheck, 
  Truck, 
  ShieldAlert, 
  Sparkles, 
  Filter,
  FileCheck2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { PullRequest, RequestPriority } from '../../types';

export const ProductionView: React.FC = () => {
  const { 
    inventory, 
    machines, 
    productionOrders, 
    requests, 
    createPullRequest, 
    confirmDeliveryWithQualityCheck 
  } = useApp();

  // Form state
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0]?.id || '');
  const [selectedOpId, setSelectedOpId] = useState<string>(productionOrders[0]?.id || '');
  const [selectedItemId, setSelectedItemId] = useState<string>(inventory[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1000);
  const [requiredTime, setRequiredTime] = useState<string>('En 30 minutos (10:30 AM)');
  const [priority, setPriority] = useState<RequestPriority>('ALTA');
  const [deliveryMethod, setDeliveryMethod] = useState<'DIRECT_PULL' | 'KITTING' | 'MILK_RUN'>('KITTING');
  const [notes, setNotes] = useState<string>('');
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal for Quality Inspection at Press
  const [inspectingRequest, setInspectingRequest] = useState<PullRequest | null>(null);
  const [packagingOk, setPackagingOk] = useState<boolean>(true);
  const [labelOk, setLabelOk] = useState<boolean>(true);
  const [humidityCheckOk, setHumidityCheckOk] = useState<boolean>(true);
  const [edgesUndamaged, setEdgesUndamaged] = useState<boolean>(true);
  const [acceptedByOperator, setAcceptedByOperator] = useState<boolean>(true);
  const [incidentReport, setIncidentReport] = useState<string>('');

  // Selected item reference for stock validation
  const currentItem = inventory.find(i => i.id === selectedItemId);
  const currentMachine = machines.find(m => m.id === selectedMachineId);
  const currentOp = productionOrders.find(o => o.id === selectedOpId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || quantity <= 0) {
      setFormFeedback({ type: 'error', text: 'Por favor ingresa una cantidad válida.' });
      return;
    }

    const res = createPullRequest({
      opId: selectedOpId,
      machineId: selectedMachineId,
      itemId: selectedItemId,
      requestedQuantity: Number(quantity),
      requiredTime,
      priority,
      deliveryMethod,
      notes: notes.trim() || undefined
    });

    if (res.success) {
      setFormFeedback({ type: 'success', text: res.message });
      setNotes('');
      setTimeout(() => setFormFeedback(null), 6000);
    } else {
      setFormFeedback({ type: 'error', text: res.message });
    }
  };

  const openInspectionModal = (req: PullRequest) => {
    setInspectingRequest(req);
    setPackagingOk(true);
    setLabelOk(true);
    setHumidityCheckOk(true);
    setEdgesUndamaged(true);
    setAcceptedByOperator(true);
    setIncidentReport('');
  };

  const handleConfirmInspection = () => {
    if (!inspectingRequest) return;
    confirmDeliveryWithQualityCheck(inspectingRequest.id, {
      packagingOk,
      labelOk,
      humidityCheckOk,
      edgesUndamaged,
      acceptedByOperator,
      incidentReport: acceptedByOperator ? undefined : incidentReport
    });
    setInspectingRequest(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Industrial Pull System explanation */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 rounded-2xl border border-blue-800 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-500/30 text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-400/30 uppercase tracking-wide">
              Módulo 1: Pull System (JIT)
            </span>
            <span className="text-xs text-blue-200">Requerimiento Digital Estandarizado</span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-white">Solicitudes Digitales y Suministro a Pie de Máquina</h2>
          <p className="text-xs text-slate-300 max-w-3xl mt-1">
            Reemplazo estricto de notas en papel y mensajes informales de chat. Validación inmediata de stock disponible contra inventario físico en bodega, reserva automática y recepción con control de calidad bajo normas <strong>ISO 9001</strong> e <strong>ISO 12647</strong>.
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-xs space-y-1 min-w-[240px]">
          <div className="flex justify-between text-slate-300">
            <span>Máquina activa:</span>
            <span className="font-semibold text-blue-400">{currentMachine?.name.split(' ')[0]} {currentMachine?.name.split(' ')[1]}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Centro de Costo:</span>
            <span className="font-mono text-[11px] text-slate-200">{currentMachine?.costCenter.split(' ')[0]}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Operario a cargo:</span>
            <span className="text-slate-200 font-medium">{currentMachine?.assignedOperator.split('(')[0]}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Pull Request Creation Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Send className="w-4 h-4 text-blue-600" />
              Nuevo Requerimiento de Insumo (Pull)
            </h3>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              FOR-LOG-02
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            
            {/* Machine Destination */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                1. Máquina de Destino (Línea de Producción)
              </label>
              <select
                value={selectedMachineId}
                onChange={e => setSelectedMachineId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {machines.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.costCenter})
                  </option>
                ))}
              </select>
            </div>

            {/* Production Order OP */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                2. Orden de Producción (OP Asociada)
              </label>
              <select
                value={selectedOpId}
                onChange={e => setSelectedOpId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {productionOrders.map(op => (
                  <option key={op.id} value={op.id}>
                    {op.opNumber} - {op.clientName} ({op.productName.slice(0, 32)}...)
                  </option>
                ))}
              </select>
            </div>

            {/* Material / Inventory Item */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  3. Insumo o Materia Prima Requerida
                </label>
                {currentItem && (
                  <span className={`text-[10px] px-2 py-0.2 rounded font-bold ${
                    currentItem.abcClass === 'A' 
                      ? 'bg-rose-100 text-rose-700' 
                      : currentItem.abcClass === 'B' 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    Clase ABC: {currentItem.abcClass} ({currentItem.ergonomicLevel.replace('_', ' ')})
                  </span>
                )}
              </div>
              <select
                value={selectedItemId}
                onChange={e => setSelectedItemId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>
                    [{item.code}] {item.name} — Disp: {item.availableStock} {item.unit}
                  </option>
                ))}
              </select>

              {/* Instant Stock Availability Gauge */}
              {currentItem && (
                <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Stock Físico en Bodega:</span>
                    <span className="font-semibold text-slate-900">{currentItem.physicalStock.toLocaleString()} {currentItem.unit}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Stock Comprometido (Otras OPs):</span>
                    <span className="text-amber-600 font-medium">{currentItem.reservedStock.toLocaleString()} {currentItem.unit}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-800 font-bold">
                    <span>Stock Disponible Inmediato:</span>
                    <span className={currentItem.availableStock <= currentItem.minSafetyStock ? 'text-rose-600 font-black' : 'text-emerald-700 font-black'}>
                      {currentItem.availableStock.toLocaleString()} {currentItem.unit}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                    <span>Ubicación: <strong className="text-slate-700">{currentItem.locationBin}</strong></span>
                    {currentItem.maxStackHeightLayers && (
                      <span className="text-amber-700 font-medium">Límite apilamiento: {currentItem.maxStackHeightLayers} niveles</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity & Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4. Cantidad Requerida
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={currentItem?.availableStock || 99999}
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-slate-800 font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs text-slate-500 font-medium">
                    {currentItem?.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  5. Hora Requerida en Línea
                </label>
                <select
                  value={requiredTime}
                  onChange={e => setRequiredTime(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="En 20 minutos (Prioritario)">En 20 minutos (Prioritario)</option>
                  <option value="En 45 minutos (Siguiente tanda)">En 45 minutos (Siguiente tanda)</option>
                  <option value="Próximo ciclo Milk Run (12:00 PM)">Próximo ciclo Milk Run (12:00 PM)</option>
                  <option value="Cambio de turno (14:00 PM)">Cambio de turno (14:00 PM)</option>
                  <option value="Inmediata (Línea en Riesgo)">Inmediata (Línea en Riesgo)</option>
                </select>
              </div>
            </div>

            {/* Priority & Delivery Method */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6. Prioridad del Pedido
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as RequestPriority)}
                  className="w-full text-xs rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="BAJA">Baja (Reaprovisionamiento regular)</option>
                  <option value="MEDIA">Media (Secuencia estándar OP)</option>
                  <option value="ALTA">Alta (Arranque próximo de tiraje)</option>
                  <option value="CRITICA_LINEA_PARADA">🚨 CRÍTICA (Línea Parada)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  7. Metodología de Entrega
                </label>
                <select
                  value={deliveryMethod}
                  onChange={e => setDeliveryMethod(e.target.value as any)}
                  className="w-full text-xs rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="KITTING">Kit de Producción (Kitting)</option>
                  <option value="MILK_RUN">Ruta Lechera (Milk Run 2h)</option>
                  <option value="DIRECT_PULL">Entrega Directa Express</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notas y Cuidados Especiales (SST / Calidad)
              </label>
              <input
                type="text"
                placeholder="Ej. Revisar ausencia de pandeo en bordes o termo-higrometría según ISO 12647"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Validation Message */}
            {formFeedback && (
              <div className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2 ${
                formFeedback.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {formFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{formFeedback.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!currentItem || currentItem.availableStock < quantity}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                currentItem && currentItem.availableStock >= quantity
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Emitir Solicitud Digital a Bodega</span>
            </button>
          </form>
        </div>

        {/* Right column: Active Pull Requests & Machine Delivery Confirmation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Tablero de Solicitudes en Curso (Kanban de Surtido)
                </h3>
                <p className="text-xs text-slate-500">Trazabilidad en tiempo real desde la petición hasta el pie de máquina</p>
              </div>
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                {requests.length} Solicitudes hoy
              </span>
            </div>

            {/* Requests List */}
            <div className="mt-4 space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {requests.map(req => {
                const isUrgent = req.priority === 'CRITICA_LINEA_PARADA' || req.priority === 'ALTA';
                const isDelivered = req.status === 'ENTREGADO_CONFORME';
                const isRejected = req.status === 'RECHAZADO_NO_CONFORME';

                return (
                  <div 
                    key={req.id}
                    className={`p-4 rounded-xl border transition ${
                      isUrgent && !isDelivered
                        ? 'border-rose-300 bg-rose-50/40'
                        : isDelivered 
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : isRejected
                        ? 'border-rose-200 bg-rose-50/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-800">{req.requestNumber}</span>
                        <span className="text-xs text-slate-400 font-mono">[{req.opNumber}]</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          req.priority === 'CRITICA_LINEA_PARADA'
                            ? 'bg-rose-600 text-white animate-pulse'
                            : req.priority === 'ALTA'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {req.priority.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {req.status === 'PENDIENTE' && (
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pendiente en Bodega
                          </span>
                        )}
                        {req.status === 'EN_PICKING' && (
                          <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                            <Layers className="w-3 h-3" /> Extracción / Picking Activo
                          </span>
                        )}
                        {req.status === 'PREPARADO_KIT' && (
                          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <PackageCheck className="w-3 h-3" /> Kit Listo en Estiba
                          </span>
                        )}
                        {req.status === 'EN_RUTA_MILK_RUN' && (
                          <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Truck className="w-3 h-3 text-purple-600 animate-bounce" /> En Ruta Lechera (Hacia prensa)
                          </span>
                        )}
                        {req.status === 'ENTREGADO_CONFORME' && (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Entregado Conforme (Pie de Máquina)
                          </span>
                        )}
                        {req.status === 'RECHAZADO_NO_CONFORME' && (
                          <span className="text-xs font-semibold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Rechazado (No Conforme)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-700 gap-2">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">
                          {req.itemName}
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          Código: <span className="font-mono text-slate-700">{req.itemCode}</span> • Destino: <span className="font-medium text-slate-800">{req.machineName}</span>
                        </p>
                      </div>
                      <div className="text-right sm:text-right shrink-0">
                        <span className="text-base font-bold text-slate-900">
                          {req.requestedQuantity.toLocaleString()} {req.unit}
                        </span>
                        <div className="text-[11px] text-slate-500">
                          Método: <strong className="text-slate-700">{req.deliveryMethod}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Notes & Quality status */}
                    {req.notes && (
                      <p className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 italic">
                        &quot;{req.notes}&quot;
                      </p>
                    )}

                    {/* Quality inspection details if delivered */}
                    {req.qualityCheck && (
                      <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-emerald-800 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                          <CheckSquare className="w-3 h-3" /> Inspección ISO 12647 Conforme
                        </span>
                        <span className="text-slate-500">Bordes de pliego intactos ✓</span>
                        <span className="text-slate-500">Empaque sin humedad ✓</span>
                        <span className="text-slate-500 font-mono text-[10px]">Lead Time: {req.leadTimeMinutes} min</span>
                      </div>
                    )}

                    {/* Operator Action Button: Receipt Confirmation */}
                    {(req.status === 'EN_RUTA_MILK_RUN' || req.status === 'PREPARADO_KIT' || req.status === 'EN_PICKING') && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-end">
                        <button
                          onClick={() => openInspectionModal(req)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Recepción en Prensa & Chequeo ISO</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ISO Quality Receipt Modal (FOR-LOG-03) */}
      {inspectingRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded uppercase">
                  FOR-LOG-03 • Control de Recepción
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Inspección y Aceptación en Pie de Máquina
                </h3>
                <p className="text-xs text-slate-500">
                  {inspectingRequest.requestNumber} &mdash; {inspectingRequest.machineName}
                </p>
              </div>
              <button 
                onClick={() => setInspectingRequest(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="font-semibold text-slate-800">{inspectingRequest.itemName}</div>
              <div className="text-slate-600 mt-0.5">
                Cantidad a recibir: <strong className="text-slate-900">{inspectingRequest.requestedQuantity.toLocaleString()} {inspectingRequest.unit}</strong>
              </div>
              <div className="text-[11px] text-slate-500">
                OP: {inspectingRequest.opNumber} • Operario receptor: {inspectingRequest.requestedBy}
              </div>
            </div>

            {/* Checklist of Quality & Safety */}
            <div className="mt-4 space-y-3">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Lista de Chequeo Obligatoria (Auditoría ISO 9001 / ISO 12647)
              </div>

              {/* Edge damage prevention check (Audit finding!) */}
              <label className="flex items-start space-x-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={edgesUndamaged}
                  onChange={e => setEdgesUndamaged(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-semibold text-slate-800">
                    Bordes y Esquinas del Material Intactos (Sin daños por sobre-apilamiento)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Verificación de hallazgo N°LOG-2026-004: Asegura que no hubo aplastamiento en estiba por exceso de altura.
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={packagingOk}
                  onChange={e => setPackagingOk(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-semibold text-slate-800">
                    Empaque sellado e integridad física
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Sin rasgaduras, sin roturas, sin signos de contaminación o polvo.
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={humidityCheckOk}
                  onChange={e => setHumidityCheckOk(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-semibold text-slate-800">
                    Control Higrométrico y Aclimatación (ISO 12647)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Papeles y cartulinas aclimatados a la humedad relativa de la sala de prensas litográficas.
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={labelOk}
                  onChange={e => setLabelOk(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-semibold text-slate-800">
                    Rotulación y Trazabilidad de Lote
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Etiqueta visible con número de OP, código de insumo y lote del fabricante.
                  </p>
                </div>
              </label>

              <div className="pt-2">
                <label className="flex items-center space-x-2 text-xs font-bold text-slate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedByOperator}
                    onChange={e => setAcceptedByOperator(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Aceptación Conforme del Operario de Prensa</span>
                </label>
                {!acceptedByOperator && (
                  <div className="mt-2">
                    <label className="block text-xs font-semibold text-rose-700 mb-1">
                      Motivo del Rechazo / Incidente de Calidad:
                    </label>
                    <textarea
                      rows={2}
                      value={incidentReport}
                      onChange={e => setIncidentReport(e.target.value)}
                      placeholder="Indique la no conformidad para segregar el material y solicitar reposición a bodega..."
                      className="w-full text-xs rounded-lg border border-rose-300 p-2 text-slate-800 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal actions */}
            <div className="mt-6 flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setInspectingRequest(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmInspection}
                className={`px-4 py-2 text-xs font-bold rounded-xl text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  acceptedByOperator
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>
                  {acceptedByOperator ? 'Firmar Entrega Conforme y Descontar Stock' : 'Registrar Rechazo por No Conformidad'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
