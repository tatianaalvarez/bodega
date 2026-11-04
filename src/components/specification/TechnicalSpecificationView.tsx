import React, { useState } from 'react';
import { 
  FileCode2, 
  Database, 
  Server, 
  Calendar, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  Network,
  Workflow
} from 'lucide-react';

export const TechnicalSpecificationView: React.FC = () => {
  const [activeSpecSection, setActiveSpecSection] = useState<'architecture' | 'database' | 'endpoints' | 'schedule'>('architecture');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 3000);
  };

  const SQL_DDL_SCHEMA = `-- ============================================================================
-- PROYECTO: OPTIFLOW BODEGA A PRODUCCIÓN (IMPRESOS EL DÍA S.A.S.)
-- MOTOR: PostgreSQL 16+ con Extensiones de Alta Disponibilidad y Concurrencia
-- ESQUEMA RELACIONAL Y TRANSACCIONAL (ACID) CON CONTROL DE STOCK FANTASMA
-- ============================================================================

-- Habilitar extensión para UUID v4
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE CENTROS DE COSTOS Y MÁQUINAS DE PRODUCCIÓN
CREATE TABLE production_machines (
    machine_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL, -- Ej: PR-OFF-01, BOBST-01, POLAR-115
    name VARCHAR(120) NOT NULL,
    area VARCHAR(50) NOT NULL, -- IMPRESION_OFFSET, TROQUELADO, CORTE, ACABADOS
    cost_center VARCHAR(50) NOT NULL, -- CC-3101, CC-3201
    status VARCHAR(30) DEFAULT 'OPERATIVA',
    assigned_operator VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CATÁLOGO MAESTRO DE MATERIALES E INSUMOS (ESTRATEGIA ABC)
CREATE TABLE inventory_items (
    item_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(40) UNIQUE NOT NULL, -- Ej: SUS-FBB-14, TIN-OFF-CYAN
    name VARCHAR(200) NOT NULL,
    category VARCHAR(60) NOT NULL, -- Sustratos, Tintas, Barnices, CTP/MRO
    abc_class CHAR(1) NOT NULL CHECK (abc_class IN ('A', 'B', 'C')),
    unit VARCHAR(20) NOT NULL, -- pliegos, kg, litros, bobinas, rollos
    physical_stock NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (physical_stock >= 0),
    reserved_stock NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
    min_safety_stock NUMERIC(12, 2) NOT NULL DEFAULT 0,
    reorder_point NUMERIC(12, 2) NOT NULL DEFAULT 0,
    location_bin VARCHAR(30) NOT NULL, -- Ej: A-01-E1 (Pasillo A, Rack 01, Nivel Ergonómico)
    ergonomic_level VARCHAR(30) DEFAULT 'CINTURA_PECHO',
    max_stack_height_layers INT DEFAULT 8, -- Regla ISO auditoría daño de papel
    hazardous_classification VARCHAR(100), -- ISO 14001 control ambiental
    monthly_picks INT DEFAULT 0,
    cost_unit_usd NUMERIC(10, 4) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_available_stock CHECK (physical_stock >= reserved_stock)
);

-- 3. ÓRDENES DE PRODUCCIÓN (OP)
CREATE TABLE production_orders (
    op_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    op_number VARCHAR(40) UNIQUE NOT NULL, -- Ej: OP-2026-4421
    client_name VARCHAR(120) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    run_quantity INT NOT NULL CHECK (run_quantity > 0),
    machine_id VARCHAR(36) REFERENCES production_machines(machine_id),
    status VARCHAR(30) DEFAULT 'PROGRAMADA',
    start_time TIMESTAMP WITH TIME ZONE,
    target_end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. SOLICITUDES DIGITALES DE INSUMO (PULL SYSTEM / KANBAN)
CREATE TABLE pull_requests (
    request_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number VARCHAR(40) UNIQUE NOT NULL, -- REQ-2026-001
    op_id VARCHAR(36) REFERENCES production_orders(op_id),
    machine_id VARCHAR(36) REFERENCES production_machines(machine_id),
    item_id VARCHAR(36) REFERENCES inventory_items(item_id),
    requested_by VARCHAR(100) NOT NULL,
    requested_quantity NUMERIC(12, 2) NOT NULL CHECK (requested_quantity > 0),
    required_time VARCHAR(50) NOT NULL,
    priority VARCHAR(30) NOT NULL DEFAULT 'MEDIA', -- BAJA, MEDIA, ALTA, CRITICA_LINEA_PARADA
    status VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE, EN_PICKING, PREPARADO_KIT, EN_RUTA_MILK_RUN, ENTREGADO_CONFORME, RECHAZADO_NO_CONFORME
    delivery_method VARCHAR(30) NOT NULL DEFAULT 'KITTING', -- DIRECT_PULL, KITTING, MILK_RUN
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    picked_at TIMESTAMP WITH TIME ZONE,
    dispatched_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    lead_time_minutes INT,
    is_on_time BOOLEAN DEFAULT TRUE
);

-- 5. KITS DE PRODUCCIÓN (KITTING ORDERS)
CREATE TABLE kitting_orders (
    kit_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    kit_number VARCHAR(40) UNIQUE NOT NULL, -- KIT-2026-014
    op_id VARCHAR(36) REFERENCES production_orders(op_id),
    container_barcode VARCHAR(50) NOT NULL, -- CARRO-KITTING-04
    status VARCHAR(30) DEFAULT 'EN_ARMADO',
    assigned_picker VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. RUTAS LECHERAS (MILK RUNS RECURRENTES CADA 2 HORAS)
CREATE TABLE milk_runs (
    milk_run_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_code VARCHAR(40) UNIQUE NOT NULL, -- MR-RUTA-1000
    departure_time VARCHAR(30) NOT NULL,
    driver_name VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(60) NOT NULL,
    status VARCHAR(30) DEFAULT 'PROGRAMADA',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE milk_run_stops (
    stop_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    milk_run_id VARCHAR(36) REFERENCES milk_runs(milk_run_id) ON DELETE CASCADE,
    stop_number INT NOT NULL,
    machine_id VARCHAR(36) REFERENCES production_machines(machine_id),
    scheduled_arrival VARCHAR(30) NOT NULL,
    actual_arrival TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) DEFAULT 'PENDIENTE'
);

-- 7. LIBRO MAYOR DE KARDEX Y TRAZABILIDAD (LEDGER INMUTABLE)
CREATE TABLE inventory_transactions_ledger (
    transaction_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id VARCHAR(36) REFERENCES inventory_items(item_id),
    request_id VARCHAR(36) REFERENCES pull_requests(request_id),
    transaction_type VARCHAR(40) NOT NULL, -- RESERVA, DESRESERVA, CONSUMO_PIE_MAQUINA, AJUSTE_CONTEO_CICLICO, ENTRADA_RECEPCION
    quantity_changed NUMERIC(12, 2) NOT NULL,
    physical_stock_after NUMERIC(12, 2) NOT NULL,
    reserved_stock_after NUMERIC(12, 2) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. ACTAS DE INSPECCIÓN DE CALIDAD A PIE DE MÁQUINA (FOR-LOG-03 / ISO 9001 / ISO 12647)
CREATE TABLE quality_inspections (
    inspection_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id VARCHAR(36) REFERENCES pull_requests(request_id),
    edges_undamaged BOOLEAN NOT NULL DEFAULT TRUE, -- Auditoría LOG-2026-004
    packaging_ok BOOLEAN NOT NULL DEFAULT TRUE,
    humidity_check_ok BOOLEAN NOT NULL DEFAULT TRUE, -- ISO 12647
    label_ok BOOLEAN NOT NULL DEFAULT TRUE,
    accepted_by_operator BOOLEAN NOT NULL DEFAULT TRUE,
    incident_report TEXT,
    inspected_by VARCHAR(100) NOT NULL,
    inspected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES DE ALTO RENDIMIENTO PARA BÚSQUEDA Y SEMÁFOROS EN TIEMPO REAL
CREATE INDEX idx_items_abc_bin ON inventory_items(abc_class, location_bin);
CREATE INDEX idx_pull_req_status ON pull_requests(status, priority);
CREATE INDEX idx_pull_req_machine ON pull_requests(machine_id);
CREATE INDEX idx_trans_item_date ON inventory_transactions_ledger(item_id, created_at DESC);`;

  const API_ENDPOINTS_SPEC = `{
  "openapi": "3.0.3",
  "info": {
    "title": "OptiFlow API - Abastecimiento Bodega a Producción",
    "version": "1.0.0",
    "description": "API REST y WebSockets para gestión de Pull Kanban, surtido ABC, Kitting y sincronización de inventario en Impresos El Día S.A.S."
  },
  "paths": {
    "/api/v1/pull-requests": {
      "post": {
        "summary": "Crear Requerimiento de Insumo con Reserva Atómica",
        "description": "Crea la solicitud, valida stock disponible, bloquea cantidad reservada en PostgreSQL y emite evento WebSocket a Bodega.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["op_id", "machine_id", "item_id", "requested_quantity", "required_time", "priority"],
                "properties": {
                  "op_id": { "type": "string", "example": "op-01" },
                  "machine_id": { "type": "string", "example": "mach-01" },
                  "item_id": { "type": "string", "example": "mat-001" },
                  "requested_quantity": { "type": "number", "example": 1500 },
                  "required_time": { "type": "string", "example": "09:30" },
                  "priority": { "type": "string", "enum": ["BAJA", "MEDIA", "ALTA", "CRITICA_LINEA_PARADA"] },
                  "delivery_method": { "type": "string", "enum": ["DIRECT_PULL", "KITTING", "MILK_RUN"] },
                  "notes": { "type": "string", "example": "Aclimatar material 24h previas" }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Solicitud creada y stock comprometido exitosamente",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "request_id": { "type": "string" },
                    "request_number": { "type": "string", "example": "REQ-2026-086" },
                    "reserved_stock": { "type": "number", "example": 1500 },
                    "available_stock_remaining": { "type": "number", "example": 9500 },
                    "status": { "type": "string", "example": "PENDIENTE" }
                  }
                }
              }
            }
          },
          "409": {
            "description": "Conflicto por Stock Insuficiente o Comprometido (Prevención Stock Fantasma)"
          }
        }
      }
    },
    "/api/v1/pick-lists/optimized": {
      "get": {
        "summary": "Obtener Lista de Surtido Ordenada por Secuencia ABC",
        "parameters": [
          { "name": "zone", "in": "query", "schema": { "type": "string", "enum": ["A", "B", "C", "ALL"] } }
        ],
        "responses": {
          "200": {
            "description": "Lista de extracciones ordenada por prioridad de urgencia y ruta física A -> B -> C"
          }
        }
      }
    },
    "/api/v1/pull-requests/{id}/confirm-delivery": {
      "post": {
        "summary": "Confirmación de Recepción en Línea y Descuento Físico en Kardex",
        "description": "Registra inspección de calidad (ISO 12647 / FOR-LOG-03), descuenta físico, libera reservas y actualiza métricas OTIF.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["edges_undamaged", "packaging_ok", "humidity_check_ok", "accepted_by_operator"],
                "properties": {
                  "edges_undamaged": { "type": "boolean", "example": true },
                  "packaging_ok": { "type": "boolean", "example": true },
                  "humidity_check_ok": { "type": "boolean", "example": true },
                  "accepted_by_operator": { "type": "boolean", "example": true },
                  "incident_report": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Entrega confirmada, stock descontado en tiempo real"
          }
        }
      }
    },
    "/api/v1/kpis/control-tower": {
      "get": {
        "summary": "Métricas en Tiempo Real para Tablero de Gestión",
        "responses": {
          "200": {
            "description": "Métricas de OTIF, Lead Time, Horas Evitadas y Alertas Críticas"
          }
        }
      }
    }
  }
}`;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-5 rounded-2xl border border-indigo-800 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-500/30 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-400/30 uppercase tracking-wide">
              Documento de Arquitectura de Software & Especificación Técnica
            </span>
            <span className="text-xs text-indigo-200">Ingeniería Industrial & Sistemas</span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-white">Diseño Funcional, Esquema DDL y Cronograma ABC</h2>
          <p className="text-xs text-slate-300 max-w-3xl mt-1">
            Arquitectura de alta disponibilidad, concurrencia transaccional ACID, sincronización en tiempo real para eliminar inventario fantasma y guía de despliegue en 8 semanas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(SQL_DDL_SCHEMA, 'ddl-all')}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
          >
            {copiedSection === 'ddl-all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copiar DDL SQL</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs for specification sections */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSpecSection('architecture')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeSpecSection === 'architecture'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>1. Arquitectura & Perfiles de Acceso</span>
        </button>

        <button
          onClick={() => setActiveSpecSection('database')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeSpecSection === 'database'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>2. Esquema Relacional PostgreSQL (DDL)</span>
        </button>

        <button
          onClick={() => setActiveSpecSection('endpoints')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeSpecSection === 'endpoints'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>3. Endpoints REST & Contratos JSON</span>
        </button>

        <button
          onClick={() => setActiveSpecSection('schedule')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeSpecSection === 'schedule'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>4. Cronograma ABC (8 Semanas)</span>
        </button>
      </div>

      {/* SECTION 1: ARCHITECTURE & ROLES */}
      {activeSpecSection === 'architecture' && (
        <div className="space-y-6">
          
          {/* User Roles Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              1. Matriz de Roles y Privilegios Operativos (RBAC)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Role 1: Operario */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 text-xs">Operario de Prensa / Producción</span>
                  <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded">
                    Móvil / Tablet Puesto
                  </span>
                </div>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
                  <li>Creación de solicitudes Pull para su máquina y OP específica.</li>
                  <li>Visualización del stock disponible garantizado (sin stock fantasma).</li>
                  <li>Seguimiento de pedidos en curso (En Picking, En Ruta Lechera, En Kit).</li>
                  <li><strong>Aceptación física en pie de máquina</strong> mediante checklist de calidad ISO 12647 y control de aplastamiento en bordes (auditoría LOG-2026-004).</li>
                </ul>
              </div>

              {/* Role 2: Auxiliar Bodega */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 text-xs">Auxiliar de Bodega / Logística</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">
                    PDA / Terminal Códigos
                  </span>
                </div>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
                  <li>Acceso a Pick Lists secuenciadas automáticamente por ruta ABC óptima.</li>
                  <li>Módulo de Kitting: armado y consolidación de estibas por OP.</li>
                  <li>Rutas Lecheras (Milk Run): control de despachos cada 2 horas y paradas de tren logístico.</li>
                  <li>Ejecución de conteos cíclicos continuos (prioridad Clase A).</li>
                </ul>
              </div>

              {/* Role 3: Jefe de Planta */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-xs">Jefe de Planta / Coordinador Logística</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded">
                    Web Desktop
                  </span>
                </div>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
                  <li>Torre de control ejecutiva en tiempo real (OTIF, Lead Times, Horas Paradas Evitadas).</li>
                  <li>Gestión de stock de seguridad, puntos de reorden y clasificación ABC.</li>
                  <li>Auditoría de mermas y no conformidades de materiales.</li>
                  <li>Monitoreo de layouts, zonas de químicos (ISO 14001) y pasillos seguros (ISO 45001).</li>
                </ul>
              </div>

            </div>
          </div>

          {/* Technology Stack Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              2. Stack Tecnológico de Grado Industrial y Alta Disponibilidad
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">Frontend Web & PWA</div>
                <div className="text-blue-600 font-semibold">React 19 + TypeScript + Vite + Tailwind</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Diseño ultra-responsivo apto para tablets industriales en prensas (Speedmaster/Komori) y pantallas de bodega. PWA instalable con sincronización offline momentánea si cae el Wi-Fi de planta.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">App Móvil / Colectores</div>
                <div className="text-emerald-600 font-semibold">Flutter / React Native (Zebra SDK)</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Integración nativa con lectores de código de barras 1D/2D por láser (Zebra, Honeywell), cámaras para escaneo de QR en estibas y retroalimentación háptica/acústica en entornos ruidosos.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">Backend & Eventos</div>
                <div className="text-purple-600 font-semibold">Node.js (Express/Fastify) o Python (FastAPI)</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Microservicios modulares con WebSockets / SSE para notificación push instantánea de solicitudes urgentes y WebSocket room por máquina.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">Base de Datos & Cache</div>
                <div className="text-amber-600 font-semibold">PostgreSQL 16 + Redis Cache</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  PostgreSQL para consistencia transaccional ACID estricta en el Kardex y ledger de movimientos; Redis para colas de picking en memoria y bloqueos pesimistas de stock en milisegundos.
                </p>
              </div>

            </div>
          </div>

          {/* Mathematical & Industrial Logistics Models */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Workflow className="w-4 h-4 text-indigo-600" />
              3. Modelos Matemáticos de Ingeniería Logística Integrados
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <span className="font-bold text-slate-900 text-xs">Cálculo de Stock de Seguridad Dinámico:</span>
                <div className="p-2 bg-white rounded font-mono text-indigo-700 border border-slate-200 text-[11px]">
                  SS = Z &times; &radic;( (LT &times; &sigma;d&sup2;) + (d&#772;&sup2; &times; &sigma;LT&sup2;) )
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Donde <strong>Z = 2.05 (Nivel de Servicio 98% para Clase A)</strong>, LT es el Lead Time de reposición del proveedor y &sigma;d es la variabilidad del consumo en planta.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <span className="font-bold text-slate-900 text-xs">Frecuencia y Takt Time de Milk Runs:</span>
                <div className="p-2 bg-white rounded font-mono text-purple-700 border border-slate-200 text-[11px]">
                  Intervalo MR = Capacidad de Almacenamiento en Máquina / Tasa de Consumo Horario
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Para Impresos El Día S.A.S., se fija en <strong>120 minutos (2 horas)</strong> para abastecer 1 tanda de producción sin saturar de estibas los pasillos de las prensas.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SECTION 2: RELATIONAL DATABASE DDL */}
      {activeSpecSection === 'database' && (
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                Script DDL PostgreSQL 16 (Normalizado en 3FN con Transacciones ACID)
              </h3>
              <p className="text-xs text-slate-400">
                Incluye tablas de inventario ABC, reservas pesimistas, ledger inmutable y auditoría de calidad
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(SQL_DDL_SCHEMA, 'ddl-code')}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {copiedSection === 'ddl-code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copiar Código SQL</span>
            </button>
          </div>

          <pre className="text-xs font-mono text-emerald-300 bg-slate-950 p-4 rounded-xl overflow-x-auto max-h-[500px] border border-slate-800 leading-relaxed">
            {SQL_DDL_SCHEMA}
          </pre>
        </div>
      )}

      {/* SECTION 3: REST & WEBSOCKET ENDPOINTS */}
      {activeSpecSection === 'endpoints' && (
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-emerald-400" />
                Especificación OpenAPI 3.0 / Contratos JSON
              </h3>
              <p className="text-xs text-slate-400">
                Endpoints para Pull Requests, cálculo de stock disponible, Kitting y cierre de ciclo
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(API_ENDPOINTS_SPEC, 'api-code')}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {copiedSection === 'api-code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copiar JSON OpenAPI</span>
            </button>
          </div>

          <pre className="text-xs font-mono text-cyan-300 bg-slate-950 p-4 rounded-xl overflow-x-auto max-h-[500px] border border-slate-800 leading-relaxed">
            {API_ENDPOINTS_SPEC}
          </pre>
        </div>
      )}

      {/* SECTION 4: 8-WEEK ABC SCHEDULE */}
      {activeSpecSection === 'schedule' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Cronograma de Implementación Logística basado en el Sistema ABC (8 Semanas)
                </h3>
                <p className="text-xs text-slate-500">
                  Transición escalonada para no interrumpir el tiraje continuo de impresión y empaque
                </p>
              </div>
            </div>

            <div className="space-y-4">
              
              {/* Phase 1 */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      Semanas 1 - 2
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Fase 1: Análisis General & Diagnóstico VSM
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    Clasificación ABC volumétrica y por costo de todo el maestro de insumos. Mapeo de la cadena de valor (VSM - Value Stream Mapping) desde muelle de recepción hasta boca de alimentador de máquina.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-lg">
                    Entregable: Matriz ABC & Reporte de Criticidad
                  </span>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      Semanas 3 - 4
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Fase 2: Zona Artículos &quot;A&quot; & Kitting Activo
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    Reubicación ergonómica del 20% de ítems críticos (80% del movimiento) cerca de las salidas hacia producción, a la altura de cintura/pecho. Despliegue de la preparación de Kits de Producción para Prensa Heidelberg y Komori.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1 rounded-lg">
                    Entregable: Layout A Optimizado + Kitting en Vivo
                  </span>
                </div>
              </div>

              {/* Phase 3 */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      Semanas 5 - 6
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Fase 3: Zona Artículos &quot;B&quot; & Rutas Lecheras (Milk Runs)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    Reorganización de pasillos intermedios. Establecimiento de puntos de reorden automáticos y puesta en marcha del tren logístico recurrente cada 2 horas con carro multidireccional.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-lg">
                    Entregable: Reglas de Stock Mínimo + Circuito Milk Run
                  </span>
                </div>
              </div>

              {/* Phase 4 */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      Semanas 7 - 8
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Fase 4: Zona Artículos &quot;C&quot;, Conteos Cíclicos & Tableros
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    Traslado de referencias de baja rotación a estanterías altas. Señalización definitiva con códigos de barras. Activación del módulo de conteos cíclicos diarios y dashboards ejecutivos de OTIF.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
                    Entregable: Bodega 100% Digitalizada & OTIF en Tiempo Real
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
