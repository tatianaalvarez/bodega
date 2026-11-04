import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  MapPin, 
  Layers, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  PackageCheck, 
  Truck, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { InventoryItem } from '../../types';

export const WarehouseLayoutView: React.FC = () => {
  const { inventory } = useApp();
  const [selectedZone, setSelectedZone] = useState<string>('ZONA_A');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Filter items in zones
  const zoneAItems = inventory.filter(i => i.locationBin.startsWith('A-'));
  const zoneBItems = inventory.filter(i => i.locationBin.startsWith('B-'));
  const zoneCItems = inventory.filter(i => i.locationBin.startsWith('C-'));

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-5 rounded-2xl border border-purple-800 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-500/30 text-purple-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-400/30 uppercase tracking-wide">
              Módulo 4: Layout y Seguridad Operacional
            </span>
            <span className="text-xs text-purple-200">Ingeniería de Planta & Ergonomía</span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-white">Mapa 2D de Bodega y Rutas de Despacho Seguro</h2>
          <p className="text-xs text-slate-300 max-w-3xl mt-1">
            Reorganización física bajo estrategia ABC (cercanía a salida hacia prensas) y cumplimiento estricto de normas <strong>ISO 45001</strong> (rutas segregadas peatón/montacargas) e <strong>ISO 14001</strong> (bandejas anti-derrames).
          </p>
        </div>

        {/* Audit Warning Reminder */}
        <div className="bg-rose-950/80 p-3 rounded-xl border border-rose-800/80 text-xs max-w-sm space-y-1">
          <div className="flex items-center gap-1.5 text-rose-300 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Control Auditoría N°LOG-2026-004</span>
          </div>
          <p className="text-[11px] text-rose-200 leading-tight">
            Señalización activa de límite de altura de apilamiento en estibas para evitar daño en bordes de papel esmaltado.
          </p>
        </div>
      </div>

      {/* Main Interactive 2D Layout Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Floorplan (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl p-6 border border-slate-800 text-white shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-200">Plano General de Almacén</span>
              <span className="text-xs text-slate-400">| Superficie: 480 m²</span>
            </div>
            
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Zona A (Ergonómica)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Zona B (Intermedia)
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-slate-500"></span> Zona C (Racks Altos)
              </span>
            </div>
          </div>

          {/* 2D Grid Visualizer */}
          <div className="space-y-4">
            
            {/* STAGING & DISPATCH AREA (Bottom / Near Production) */}
            <div className="p-3 rounded-xl border-2 border-dashed border-emerald-500/60 bg-emerald-950/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <PackageCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Zona de Salida & Staging (Kitting y Milk Run)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Conexión directa al pasillo principal hacia Prensa Heidelberg CD 102 y Troqueladora Bobst
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs bg-emerald-900/50 text-emerald-200 px-3 py-1.5 rounded-lg border border-emerald-700">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Salida Ruta Lechera cada 2h</span>
              </div>
            </div>

            {/* SEGREGATED LOGISTIC TRANSIT AISLE (ISO 45001) */}
            <div className="py-1 px-4 bg-yellow-500/10 border-y border-yellow-500/30 rounded text-center text-[10px] font-mono tracking-widest text-yellow-400 uppercase flex items-center justify-center gap-2">
              <span>⚠ PASILLO EXCLUSIVO TRANSPALETAS & CARROS MULTIDIRECCIONALES (ISO 45001) ⚠</span>
            </div>

            {/* RACKS ZONE A (FAST PICK - NEAR EXIT) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  ZONA A: Racks de Alta Rotación (Nivel Cintura/Pecho - Acceso Rápido)
                </span>
                <button
                  onClick={() => setSelectedZone('ZONA_A')}
                  className={`text-[11px] px-2 py-0.5 rounded cursor-pointer ${
                    selectedZone === 'ZONA_A' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Ver {zoneAItems.length} referencias
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {zoneAItems.slice(0, 8).map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setSelectedItem(item); setSelectedZone('ZONA_A'); }}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      selectedItem?.id === item.id
                        ? 'border-rose-400 bg-rose-950/60 shadow-md shadow-rose-900/20'
                        : 'border-rose-900/40 bg-slate-800/80 hover:border-rose-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{item.locationBin}</span>
                      <span className="text-rose-400 font-bold">Clase A</span>
                    </div>
                    <div className="text-xs font-bold text-slate-100 truncate mt-1">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
                      {item.physicalStock.toLocaleString()} {item.unit}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* RACKS ZONE B (MEDIUM PICK - INTERMEDIATE AISLES) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  ZONA B: Pasillos Intermedios (Tintas Especiales & Químicos Controlados)
                </span>
                <button
                  onClick={() => setSelectedZone('ZONA_B')}
                  className={`text-[11px] px-2 py-0.5 rounded cursor-pointer ${
                    selectedZone === 'ZONA_B' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Ver {zoneBItems.length} referencias
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {zoneBItems.slice(0, 8).map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setSelectedItem(item); setSelectedZone('ZONA_B'); }}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      selectedItem?.id === item.id
                        ? 'border-amber-400 bg-amber-950/60 shadow-md shadow-amber-900/20'
                        : 'border-amber-900/40 bg-slate-800/80 hover:border-amber-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{item.locationBin}</span>
                      <span className="text-amber-400 font-bold">Clase B</span>
                    </div>
                    <div className="text-xs font-bold text-slate-100 truncate mt-1">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
                      {item.physicalStock.toLocaleString()} {item.unit}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* RACKS ZONE C (LOW VELOCITY - HIGH SHELVES) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                  ZONA C: Estanterías Superiores & Fondo (MRO, Flejes Troquel, Foils)
                </span>
                <button
                  onClick={() => setSelectedZone('ZONA_C')}
                  className={`text-[11px] px-2 py-0.5 rounded cursor-pointer ${
                    selectedZone === 'ZONA_C' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Ver {zoneCItems.length} referencias
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {zoneCItems.slice(0, 8).map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setSelectedItem(item); setSelectedZone('ZONA_C'); }}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      selectedItem?.id === item.id
                        ? 'border-indigo-400 bg-indigo-950/60 shadow-md shadow-indigo-900/20'
                        : 'border-slate-800 bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{item.locationBin}</span>
                      <span className="text-slate-400 font-bold">Clase C</span>
                    </div>
                    <div className="text-xs font-bold text-slate-200 truncate mt-1">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1 font-semibold">
                      {item.physicalStock.toLocaleString()} {item.unit}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Selected Bin / Item Inspector (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              Inspector de Ubicación & Ficha Técnica
            </h3>
          </div>

          {selectedItem ? (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  Ubicación Física en Bodega
                </span>
                <div className="text-xl font-black text-slate-900 font-mono">
                  {selectedItem.locationBin}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Nivel Ergonómico: <strong className="text-slate-900">{selectedItem.ergonomicLevel.replace('_', ' ')}</strong>
                </div>
              </div>

              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  selectedItem.abcClass === 'A'
                    ? 'bg-rose-100 text-rose-800'
                    : selectedItem.abcClass === 'B'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  Estrategia ABC: Clase {selectedItem.abcClass}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  {selectedItem.name}
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Código: {selectedItem.code} • Cat: {selectedItem.category}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-500 text-[10px]">Stock Físico</div>
                  <div className="text-base font-bold text-slate-900">
                    {selectedItem.physicalStock.toLocaleString()} {selectedItem.unit}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-500 text-[10px]">Stock Disponible</div>
                  <div className="text-base font-bold text-emerald-700">
                    {selectedItem.availableStock.toLocaleString()} {selectedItem.unit}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-500 text-[10px]">Stock de Seguridad</div>
                  <div className="text-sm font-semibold text-slate-800">
                    {selectedItem.minSafetyStock.toLocaleString()} {selectedItem.unit}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-500 text-[10px]">Rotación Mensual</div>
                  <div className="text-sm font-semibold text-slate-800">
                    {selectedItem.monthlyMovementPicks} picks/mes
                  </div>
                </div>
              </div>

              {/* Safety & Audit specifications */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                {selectedItem.maxStackHeightLayers && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Límite de Apilamiento Máximo: {selectedItem.maxStackHeightLayers} niveles
                    </div>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Medida correctiva según informe de auditoría N°LOG-2026-004 para prevenir aplastamiento de bordes en pliegos de papel.
                    </p>
                  </div>
                )}

                {selectedItem.hazardousClassification && (
                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900">
                    <div className="font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                      Protocolo Ambiental ISO 14001:
                    </div>
                    <p className="text-[11px] text-blue-800 mt-0.5">
                      {selectedItem.hazardousClassification}. Requiere bandeja de contención y kit anti-derrames en el pasillo de almacenamiento.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">
                Haz clic en cualquier estante o rack del mapa 2D para inspeccionar sus insumos, stock disponible y protocolos de seguridad.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
