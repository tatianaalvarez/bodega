import React, { createContext, useContext, useState, useMemo } from 'react';
import { 
  UserRole, 
  InventoryItem, 
  ProductionMachine, 
  ProductionOrder, 
  PullRequest, 
  PickListItem, 
  KittingOrder, 
  MilkRunRoute, 
  CyclicCountItem, 
  KPIMetrics 
} from '../types';
import { 
  INITIAL_INVENTORY, 
  PRODUCTION_MACHINES, 
  PRODUCTION_ORDERS, 
  INITIAL_PULL_REQUESTS, 
  INITIAL_KITS, 
  INITIAL_MILK_RUNS, 
  INITIAL_CYCLIC_COUNTS 
} from '../data/mockData';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  inventory: InventoryItem[];
  machines: ProductionMachine[];
  productionOrders: ProductionOrder[];
  requests: PullRequest[];
  kits: KittingOrder[];
  milkRuns: MilkRunRoute[];
  cyclicCounts: CyclicCountItem[];
  kpis: KPIMetrics;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Actions
  createPullRequest: (params: {
    opId: string;
    machineId: string;
    itemId: string;
    requestedQuantity: number;
    requiredTime: string;
    priority: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA_LINEA_PARADA';
    deliveryMethod: 'DIRECT_PULL' | 'KITTING' | 'MILK_RUN';
    notes?: string;
  }) => { success: boolean; message: string; requestId?: string };
  
  advanceRequestStatus: (requestId: string, nextStatus: PullRequest['status']) => void;
  
  confirmDeliveryWithQualityCheck: (requestId: string, check: {
    packagingOk: boolean;
    labelOk: boolean;
    humidityCheckOk: boolean;
    edgesUndamaged: boolean;
    acceptedByOperator: boolean;
    incidentReport?: string;
  }) => void;

  markPickListItemPicked: (kitId: string, itemId: string) => void;
  advanceMilkRunStop: (milkRunId: string, stopNumber: number) => void;
  recordCyclicCount: (countId: string, actualCount: number) => void;
  resetToDefaultData: () => void;
  quickSimulateEmergency: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('operario');
  const [activeTab, setActiveTab] = useState<string>('production');
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [machines] = useState<ProductionMachine[]>(PRODUCTION_MACHINES);
  const [productionOrders] = useState<ProductionOrder[]>(PRODUCTION_ORDERS);
  const [requests, setRequests] = useState<PullRequest[]>(INITIAL_PULL_REQUESTS);
  const [kits, setKits] = useState<KittingOrder[]>(INITIAL_KITS);
  const [milkRuns, setMilkRuns] = useState<MilkRunRoute[]>(INITIAL_MILK_RUNS);
  const [cyclicCounts, setCyclicCounts] = useState<CyclicCountItem[]>(INITIAL_CYCLIC_COUNTS);

  // Sync default tab when role changes
  const handleSetRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'operario') setActiveTab('production');
    else if (newRole === 'bodega') setActiveTab('warehouse');
    else if (newRole === 'admin') setActiveTab('dashboard');
  };

  // Create Pull Request with Stock Reservation and Validation
  const createPullRequest = (params: {
    opId: string;
    machineId: string;
    itemId: string;
    requestedQuantity: number;
    requiredTime: string;
    priority: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA_LINEA_PARADA';
    deliveryMethod: 'DIRECT_PULL' | 'KITTING' | 'MILK_RUN';
    notes?: string;
  }) => {
    const item = inventory.find(i => i.id === params.itemId);
    const machine = machines.find(m => m.id === params.machineId);
    const op = productionOrders.find(o => o.id === params.opId);

    if (!item) return { success: false, message: 'Material no encontrado en catálogo' };
    if (!machine) return { success: false, message: 'Máquina no válida' };
    if (!op) return { success: false, message: 'Orden de producción no encontrada' };

    // Validation: Check if requestedQuantity exceeds physical stock
    if (params.requestedQuantity > item.physicalStock) {
      return {
        success: false,
        message: `Stock insuficiente: Se solicitaron ${params.requestedQuantity} ${item.unit}, pero solo existen ${item.physicalStock} físicamente en bodega.`
      };
    }

    // Reservation check (Stock fantasma prevention)
    if (params.requestedQuantity > item.availableStock) {
      return {
        success: false,
        message: `Stock comprometido: Disponibles sin reservar: ${item.availableStock} ${item.unit}. El saldo restante está reservado para otras OPs en curso.`
      };
    }

    const newReqId = `req-${Date.now().toString().slice(-4)}`;
    const reqNum = `REQ-2026-${(requests.length + 85).toString().padStart(3, '0')}`;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRequest: PullRequest = {
      id: newReqId,
      requestNumber: reqNum,
      opId: op.id,
      opNumber: op.opNumber,
      machineId: machine.id,
      machineName: machine.name,
      costCenter: machine.costCenter,
      requestedBy: machine.assignedOperator,
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      requestedQuantity: params.requestedQuantity,
      unit: item.unit,
      requiredTime: params.requiredTime,
      priority: params.priority,
      status: 'PENDIENTE',
      deliveryMethod: params.deliveryMethod,
      notes: params.notes,
      createdAt: `Hoy ${nowStr}`,
      isOnTime: true
    };

    // Update inventory: reserve stock immediately
    setInventory(prev => prev.map(invItem => {
      if (invItem.id === item.id) {
        const newReserved = invItem.reservedStock + params.requestedQuantity;
        return {
          ...invItem,
          reservedStock: newReserved,
          availableStock: invItem.physicalStock - newReserved
        };
      }
      return invItem;
    }));

    setRequests(prev => [newRequest, ...prev]);

    return {
      success: true,
      message: `Solicitud ${reqNum} generada exitosamente. Stock reservado en ubicación ${item.locationBin}.`,
      requestId: newReqId
    };
  };

  // Advance status along the fulfillment lifecycle
  const advanceRequestStatus = (requestId: string, nextStatus: PullRequest['status']) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const updated = { ...req, status: nextStatus };
        if (nextStatus === 'EN_PICKING' && !req.pickedAt) {
          updated.pickedAt = `Hoy ${nowStr}`;
        }
        if ((nextStatus === 'EN_RUTA_MILK_RUN' || nextStatus === 'PREPARADO_KIT') && !req.dispatchedAt) {
          updated.dispatchedAt = `Hoy ${nowStr}`;
        }
        return updated;
      }
      return req;
    }));
  };

  // Confirm delivery with formal ISO quality checklist (FOR-LOG-03 / ISO 12647 / ISO 9001)
  const confirmDeliveryWithQualityCheck = (requestId: string, check: {
    packagingOk: boolean;
    labelOk: boolean;
    humidityCheckOk: boolean;
    edgesUndamaged: boolean;
    acceptedByOperator: boolean;
    incidentReport?: string;
  }) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetReq = requests.find(r => r.id === requestId);
    if (!targetReq) return;

    const isConforme = check.acceptedByOperator && check.edgesUndamaged && check.packagingOk;

    // Real-time synchronization: Deduct physical stock & release reserved stock
    setInventory(prev => prev.map(item => {
      if (item.id === targetReq.itemId) {
        const newPhysical = isConforme ? Math.max(0, item.physicalStock - targetReq.requestedQuantity) : item.physicalStock;
        const newReserved = Math.max(0, item.reservedStock - targetReq.requestedQuantity);
        return {
          ...item,
          physicalStock: newPhysical,
          reservedStock: newReserved,
          availableStock: newPhysical - newReserved
        };
      }
      return item;
    }));

    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: isConforme ? 'ENTREGADO_CONFORME' : 'RECHAZADO_NO_CONFORME',
          deliveredAt: `Hoy ${nowStr}`,
          leadTimeMinutes: 24, // simulated realistic lead time
          isOnTime: true,
          qualityCheck: {
            ...check,
            checkedAt: `Hoy ${nowStr}`
          }
        };
      }
      return r;
    }));
  };

  const markPickListItemPicked = (kitId: string, itemId: string) => {
    setKits(prev => prev.map(kit => {
      if (kit.id === kitId) {
        const updatedItems = kit.items.map(it => {
          if (it.itemId === itemId) {
            return { ...it, isPicked: true, quantityPicked: it.quantityRequested };
          }
          return it;
        });
        const allDone = updatedItems.every(it => it.isPicked);
        return {
          ...kit,
          items: updatedItems,
          status: allDone ? 'COMPLETO' : 'EN_ARMADO'
        };
      }
      return kit;
    }));
  };

  const advanceMilkRunStop = (milkRunId: string, stopNumber: number) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMilkRuns(prev => prev.map(mr => {
      if (mr.id === milkRunId) {
        const updatedStops = mr.stops.map(st => {
          if (st.stopNumber === stopNumber) {
            return { ...st, status: 'COMPLETADA' as const, actualArrival: nowStr };
          }
          return st;
        });
        const allDone = updatedStops.every(st => st.status === 'COMPLETADA');
        return {
          ...mr,
          status: allDone ? 'FINALIZADA' : 'EN_CURSO',
          stops: updatedStops
        };
      }
      return mr;
    }));
  };

  const recordCyclicCount = (countId: string, actualCount: number) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCyclicCounts(prev => prev.map(c => {
      if (c.id === countId) {
        const diff = actualCount - c.expectedSystemStock;
        return {
          ...c,
          actualCountedStock: actualCount,
          difference: diff,
          lastCountDate: `Hoy ${nowStr}`,
          status: diff === 0 ? 'CONCILIADO' : 'DISCREPANCIA'
        };
      }
      return c;
    }));
  };

  const resetToDefaultData = () => {
    setInventory(INITIAL_INVENTORY);
    setRequests(INITIAL_PULL_REQUESTS);
    setKits(INITIAL_KITS);
    setMilkRuns(INITIAL_MILK_RUNS);
    setCyclicCounts(INITIAL_CYCLIC_COUNTS);
  };

  const quickSimulateEmergency = () => {
    createPullRequest({
      opId: 'op-01',
      machineId: 'mach-01',
      itemId: 'mat-028', // Planchas CTP
      requestedQuantity: 2,
      requiredTime: 'Inmediata (Línea en Riesgo)',
      priority: 'CRITICA_LINEA_PARADA',
      deliveryMethod: 'DIRECT_PULL',
      notes: 'Plancha CTP sufrió ralladura en cuerpo de impresión 3. Se requiere reposición express.'
    });
  };

  // Real-time calculated KPI metrics
  const kpis: KPIMetrics = useMemo(() => {
    const delivered = requests.filter(r => r.status === 'ENTREGADO_CONFORME');
    const rejected = requests.filter(r => r.status === 'RECHAZADO_NO_CONFORME');
    const onTimeAndInFull = delivered.filter(r => r.isOnTime && (!r.qualityCheck || r.qualityCheck.acceptedByOperator));
    
    const otifPercentage = delivered.length > 0 ? Math.round((onTimeAndInFull.length / (delivered.length + rejected.length)) * 100) : 98;
    
    const leadTimes = delivered.filter(r => r.leadTimeMinutes).map(r => r.leadTimeMinutes as number);
    const averageLeadTimeMinutes = leadTimes.length > 0 ? Math.round(leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length) : 28;

    const criticalStockAlertsCount = inventory.filter(i => i.physicalStock <= i.minSafetyStock).length;
    const activeMilkRunsCount = milkRuns.filter(mr => mr.status === 'EN_CURSO').length;

    // Count accuracy
    const reconciled = cyclicCounts.filter(c => c.status === 'CONCILIADO').length;
    const evaluatedCounts = cyclicCounts.filter(c => c.status !== 'PENDIENTE').length;
    const inventoryAccuracyPercentage = evaluatedCounts > 0 ? Math.round((reconciled / evaluatedCounts) * 100) : 99.2;

    return {
      otifPercentage,
      totalRequestsToday: requests.length,
      completedRequests: delivered.length,
      averageLeadTimeMinutes,
      errorRatePercentage: 1.2,
      avoidedDowntimeHours: 14.5, // 14.5 hours of machine downtime avoided today
      criticalStockAlertsCount,
      activeMilkRunsCount,
      inventoryAccuracyPercentage
    };
  }, [requests, inventory, milkRuns, cyclicCounts]);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole: handleSetRole,
        inventory,
        machines,
        productionOrders,
        requests,
        kits,
        milkRuns,
        cyclicCounts,
        kpis,
        activeTab,
        setActiveTab,
        createPullRequest,
        advanceRequestStatus,
        confirmDeliveryWithQualityCheck,
        markPickListItemPicked,
        advanceMilkRunStop,
        recordCyclicCount,
        resetToDefaultData,
        quickSimulateEmergency
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
