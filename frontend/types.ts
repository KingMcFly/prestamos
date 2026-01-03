export type Shift = 'A' | 'B' | 'C' | 'Administrativo';
export type EquipmentStatus = 'disponible' | 'prestado' | 'mantenimiento' | 'baja';
export type LoanStatus = 'activo' | 'devuelto';

export interface Employee {
  id: string;
  name: string;
  rut: string;
  area: string;
  shift: Shift;
}

export interface Equipment {
  id: string;
  serial: string;
  type: string;
  brand: string;
  model: string;
  value: number;
  status: EquipmentStatus;
  description: string;
}

export interface LoanItem {
  equipmentId: string;
  quantity: number; // En caso de consumibles o genéricos, aunque idealmente es 1 por serial
  equipmentSnapshot: Equipment; // Copia del estado del equipo al momento del préstamo
}

export interface Loan {
  id: string;
  date: string;
  employeeId: string;
  employeeSnapshot: Employee; // Para historial histórico
  items: LoanItem[];
  observations: string;
  totalValue: number;
  status: LoanStatus;
  signature?: string; // Base64 string (Firma de recepción al crear)
  generatedBy: string;
  
  // Campos de Devolución
  returnDate?: string;
  receivedBy?: string; // Quien recibe la devolución (IT)
  returnObservations?: string;
  returnSignature?: string; // Firma del empleado devolviendo
}

export type TabView = 'new-loan' | 'employees' | 'equipment' | 'history';