export type UserRole = 'operario' | 'bodega' | 'admin';

export type ABCCategory = 'A' | 'B' | 'C';

export type ItemCategory = 
  | 'Sustratos y Papeles'
  | 'Tintas y Solventes'
  | 'Barnices y Adhesivos'
  | 'Insumos CTP y MRO';

export type RequestStatus = 
  | 'PENDIENTE'
  | 'EN_PICKING'
  | 'PREPARADO_KIT'
  | 'EN_RUTA_MILK_RUN'
  | 'ENTREGADO_CONFORME'
  | 'RECHAZADO_NO_CONFORME'
  | 'CANCELADO';

export type RequestPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA_LINEA_PARADA';

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: ItemCategory;
  abcClass: ABCCategory;
  unit: string;
  physicalStock: number;
  reservedStock: number;
  availableStock: number; // physicalStock - reservedStock
  minSafetyStock: number;
  reorderPoint: number;
  locationBin: string; // e.g., 'A-01-E1' (Aisle, Rack, Ergonomic level)
  ergonomicLevel: 'CINTURA_PECHO' | 'NIVEL_SUELO' | 'NIVEL_ALTO';
  maxStackHeightLayers?: number;
  hazardousClassification?: string; // ISO 14001 / Derrames
  monthlyMovementPicks: number;
  costUnitUSD: number;
}

export interface ProductionMachine {
  id: string;
  code: string;
  name: string;
  area: 'IMPRESION_OFFSET' | 'TROQUELADO' | 'CORTE_GUILLOTINA' | 'ACABADOS_PEGADO' | 'PREPRENSA';
  costCenter: string;
  status: 'OPERATIVA' | 'EN_PREPARACION' | 'PARADA_POR_INSUMO' | 'MANTENIMIENTO';
  assignedOperator: string;
}

export interface ProductionOrder {
  id: string;
  opNumber: string;
  clientName: string;
  productName: string;
  runQuantity: number;
  machineId: string;
  startDate: string;
  targetEndDate: string;
  status: 'PROGRAMADA' | 'EN_PROCESO' | 'DETENIDA' | 'COMPLETADA';
  requiredItems: {
    itemCode: string;
    quantity: number;
    unit: string;
  }[];
}

export interface PullRequest {
  id: string;
  requestNumber: string; // e.g. REQ-2026-089
  opId: string;
  opNumber: string;
  machineId: string;
  machineName: string;
  costCenter: string;
  requestedBy: string; // Operator name
  itemId: string;
  itemCode: string;
  itemName: string;
  requestedQuantity: number;
  unit: string;
  requiredTime: string; // e.g. "14:30" or ISO string
  priority: RequestPriority;
  status: RequestStatus;
  deliveryMethod: 'DIRECT_PULL' | 'KITTING' | 'MILK_RUN';
  kitId?: string;
  milkRunId?: string;
  notes?: string;
  createdAt: string;
  pickedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  leadTimeMinutes?: number;
  isOnTime?: boolean;
  qualityCheck?: {
    packagingOk: boolean;
    labelOk: boolean;
    humidityCheckOk: boolean; // ISO 12647
    edgesUndamaged: boolean; // Previene no conformidad auditoría
    acceptedByOperator: boolean;
    incidentReport?: string;
    checkedAt: string;
  };
}

export interface PickListItem {
  requestId: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  abcClass: ABCCategory;
  locationBin: string;
  quantityRequested: number;
  quantityPicked: number;
  unit: string;
  machineDestination: string;
  opNumber: string;
  isPicked: boolean;
  walkSequence: number; // Optimized route order
}

export interface KittingOrder {
  id: string;
  kitNumber: string;
  opNumber: string;
  machineName: string;
  status: 'ASIGNADO' | 'EN_ARMADO' | 'COMPLETO' | 'ENTREGADO';
  assignedPicker: string;
  items: PickListItem[];
  containerBarcode: string;
  estimatedPrepTimeMin: number;
  createdAt: string;
}

export interface MilkRunRoute {
  id: string;
  routeCode: string; // e.g. MR-RUTA-01 (Turno Mañana)
  departureTime: string; // "10:00 AM"
  status: 'PROGRAMADA' | 'EN_CURSO' | 'FINALIZADA';
  driverName: string;
  vehicleType: 'Carro Multidireccional' | 'Estibador Hidráulico' | 'Transpaleta Eléctrica';
  stops: {
    stopNumber: number;
    machineName: string;
    area: string;
    scheduledArrival: string;
    actualArrival?: string;
    requestIds: string[];
    status: 'PENDIENTE' | 'COMPLETADA' | 'SALTADA';
  }[];
}

export interface CyclicCountItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  locationBin: string;
  abcClass: ABCCategory;
  expectedSystemStock: number;
  actualCountedStock: number | null;
  difference: number;
  lastCountDate: string;
  status: 'PENDIENTE' | 'CONCILIADO' | 'DISCREPANCIA';
}

export interface KPIMetrics {
  otifPercentage: number; // On-Time In-Full %
  totalRequestsToday: number;
  completedRequests: number;
  averageLeadTimeMinutes: number; // Target < 25 min
  errorRatePercentage: number; // Target < 1.5%
  avoidedDowntimeHours: number; // Estimated hours saved
  criticalStockAlertsCount: number;
  activeMilkRunsCount: number;
  inventoryAccuracyPercentage: number; // Conteo cíclico %
}
