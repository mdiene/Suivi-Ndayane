
export type TruckType = 'Semi-Truck' | 'Box Truck' | 'Flatbed' | 'Refrigerated' | 'Tanker' | 'Other';

export interface DeliveryExpense {
  id: number;
  delivery_id: number;
  road_costs: number;
  diesel_liters: number;
  diesel_price_unit: number;
  toll_costs: number;
  extra_costs: number;
  extra_description: string;
}

export interface Delivery {
  id: number;
  truck_immatriculation: string;
  driver_names: string;
  loading_date: string; // ISO Date string YYYY-MM-DD
  unloading_date: string; // ISO Date string YYYY-MM-DD
  weight_loaded: number;
  delivery_bond_number: string;
  truck_owner: string;
  truck_type: TruckType;
  created_at?: string;
  delivery_expenses?: DeliveryExpense[]; // Joined data
  billing_id?: number | null;
}

export interface DeliveryFormData {
  truck_immatriculation: string;
  driver_names: string;
  loading_date: string;
  unloading_date: string;
  weight_loaded: number;
  delivery_bond_number: string;
  truck_owner: string;
  truck_type: TruckType;
}

export interface Billing {
  id: number;
  billing_number: string;
  created_at: string;
  total_weight: number;
  price_per_ton: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue';
  notes?: string;
}

export interface FilterState {
  search: string;
  dateFrom: string;
  dateTo: string;
  plateNumber: string;
  truckOwners: string[];
  weightMin: string;
  weightMax: string;
}

export interface DashboardMetrics {
  totalDeliveries: number;
  totalWeight: number;
  activeTrucks: number;
  recentActivityCount: number;
}
