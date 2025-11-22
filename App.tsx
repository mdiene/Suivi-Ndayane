
import React, { useState, useEffect, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { deliveryService } from './services/deliveryService';
import { expenseService } from './services/expenseService';
import { billingService } from './services/billingService';
import { Delivery, DeliveryFormData, FilterState, DeliveryExpense } from './types';
import { THEMES } from './constants';
import Dashboard from './components/Dashboard';
import DeliveryTable from './components/DeliveryTable';
import SidePanel from './components/SidePanel';
import DeliveryForm from './components/DeliveryForm';
import Auth from './components/Auth';
import BillingModal from './components/BillingModal';
import BillingHistory from './components/BillingHistory';
import ExpenseModal from './components/ExpenseModal';
import TruckDetailsModal from './components/TruckDetailsModal';
import { Filter, Truck, LogOut, Palette, ChevronDown, ReceiptText, History } from 'lucide-react';

const initialFilterState: FilterState = {
  search: '',
  dateFrom: '',
  dateTo: '',
  plateNumber: '',
  truckOwners: [],
  weightMin: '',
  weightMax: '',
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isBillingHistoryOpen, setIsBillingHistoryOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [expenseDelivery, setExpenseDelivery] = useState<Delivery | null>(null);
  const [detailsDelivery, setDetailsDelivery] = useState<Delivery | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [billingRate, setBillingRate] = useState<string>('');

  // Theme State
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('fleet_theme');
      return savedTheme || 'corporate';
    }
    return 'corporate';
  });

  // Apply Theme Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fleet_theme', theme);
  }, [theme]);

  // Auth State Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when session is active
  useEffect(() => {
    if (session) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await deliveryService.fetchDeliveries();
      setDeliveries(data);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      showToast("Échec du chargement des livraisons", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setDeliveries([]);
  };

  // Toast handler
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filter Logic
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(d => {
      // Global Search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const match =
          d.truck_immatriculation.toLowerCase().includes(searchLower) ||
          d.driver_names.toLowerCase().includes(searchLower) ||
          d.delivery_bond_number.toLowerCase().includes(searchLower) ||
          d.truck_owner.toLowerCase().includes(searchLower);
        if (!match) return false;
      }

      // Date Range
      if (filters.dateFrom && new Date(d.loading_date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(d.loading_date) > new Date(filters.dateTo)) return false;

      // Plate Number (Specific Filter)
      if (filters.plateNumber && !d.truck_immatriculation.toLowerCase().includes(filters.plateNumber.toLowerCase())) return false;

      // Truck Owners (Multi-select)
      if (filters.truckOwners.length > 0 && !filters.truckOwners.includes(d.truck_owner)) return false;

      // Weight
      if (filters.weightMin && d.weight_loaded < Number(filters.weightMin)) return false;
      if (filters.weightMax && d.weight_loaded > Number(filters.weightMax)) return false;

      return true;
    });
  }, [deliveries, filters]);

  // Calculate Total Weight for filtered results
  const filteredWeight = useMemo(() => {
    return filteredDeliveries.reduce((sum, d) => sum + Number(d.weight_loaded), 0);
  }, [filteredDeliveries]);

  // Unique owners for filter dropdown
  const uniqueOwners = useMemo(() => {
    return Array.from(new Set(deliveries.map(d => d.truck_owner))).sort();
  }, [deliveries]);

  // CRUD Handlers
  const handleCreate = async (data: DeliveryFormData) => {
    try {
      const newDelivery = await deliveryService.createDelivery(data);
      setDeliveries(prev => [newDelivery, ...prev]);
      showToast("Livraison créée avec succès", 'success');
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleUpdate = async (data: DeliveryFormData) => {
    if (!editingDelivery) return;
    try {
      // Update in Supabase
      await deliveryService.updateDelivery(editingDelivery.id, data);
      
      // Refresh data from server to ensure consistency
      await fetchData();
      
      showToast("Livraison mise à jour avec succès", 'success');
      setEditingDelivery(null);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleSaveExpense = async (expenseData: Partial<DeliveryExpense>) => {
    try {
      await expenseService.upsertExpense(expenseData);
      await fetchData(); // Refresh to show updated total in table
      showToast("Frais enregistrés avec succès", 'success');
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de l'enregistrement des frais", 'error');
    }
  };

  const handleSaveBilling = async (billingData: any, deliveryIds: number[]) => {
    try {
      await billingService.createBilling(billingData, deliveryIds);
      await fetchData();
      showToast("Facture créée et enregistrée avec succès", 'success');
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de l'enregistrement de la facture", 'error');
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    // Find the delivery to show details in the confirmation
    const deliveryToDelete = deliveries.find(d => d.id === id);
    const identifier = deliveryToDelete 
      ? `Livraison #${id} pour le camion ${deliveryToDelete.truck_immatriculation}` 
      : `Livraison #${id}`;

    setDeleteConfirmation({
      isOpen: true,
      id,
      title: "Supprimer la livraison ?",
      message: `Êtes-vous sûr de vouloir supprimer ${identifier} ?\n\nCette action supprimera définitivement l'enregistrement de la base de données et ne peut pas être annulée.`
    });
  };

  const confirmDeleteAction = async () => {
    if (!deleteConfirmation.id) return;
    
    try {
      await deliveryService.deleteDelivery(deleteConfirmation.id);
      
      // Refresh data from server to ensure consistency
      await fetchData();
      
      showToast("Livraison supprimée définitivement", 'success');
      setIsFormOpen(false);
      setEditingDelivery(null);
    } catch (error: any) {
      console.error("Delete error:", error);
       // Check for RLS policy violation
      if (error.message && error.message.includes("policy")) {
        showToast("Permission refusée : Impossible de supprimer l'enregistrement (Sécurité au niveau des lignes)", 'error');
      } else {
        showToast(error.message || "Échec de la suppression de la livraison", 'error');
      }
    } finally {
      setDeleteConfirmation(prev => ({ ...prev, isOpen: false }));
    }
  };

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    id: number | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    id: null,
    title: '',
    message: ''
  });

  // Export CSV
  const handleExport = () => {
    if (filteredDeliveries.length === 0) {
      showToast("Aucune donnée à exporter", 'error');
      return;
    }
    const headers = ["ID", "Immatriculation", "Chauffeur", "Date Chargement", "Date Déchargement", "Poids", "Bon #", "Propriétaire", "Type", "Frais Totaux", "Facturé"];
    const csvContent = [
      headers.join(","),
      ...filteredDeliveries.map(d => {
        const expenses = d.delivery_expenses;
        const e = (expenses && Array.isArray(expenses)) ? expenses[0] : (expenses as any);
        const totalExpenses = e ? (e.road_costs || 0) + ((e.diesel_liters || 0) * (e.diesel_price_unit || 755)) + (e.toll_costs || 0) + (e.extra_costs || 0) : 0;
        const billedStatus = d.billing_id ? "Oui" : "Non";
        return [d.id, d.truck_immatriculation, `"${d.driver_names}"`, d.loading_date, d.unloading_date, d.weight_loaded, d.delivery_bond_number, `"${d.truck_owner}"`, d.truck_type, totalExpenses, billedStatus].join(",")
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "livraisons_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!session) {
    return (
      <>
        <Auth />
        {/* Theme Switcher for Auth Page */}
         <div className="fixed top-4 right-4 z-50 dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-circle btn-ghost">
            <Palette className="w-5 h-5" />
          </div>
          <ul tabIndex={0} className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52">
            {THEMES.map((t) => (
              <li key={t}>
                <button 
                  className={`btn btn-sm btn-block btn-ghost justify-start ${theme === t ? 'btn-active' : ''}`}
                  onClick={() => setTheme(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 transition-colors duration-200" id="app-root">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 alert shadow-lg w-auto animate-fade-in-down ${toast.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="navbar bg-base-100 shadow-sm sticky top-0 z-30 border-b border-base-300">
        <div className="flex-1 gap-2 px-2 lg:px-4">
          <div className="bg-primary p-1.5 rounded-md">
            <Truck className="w-6 h-6 text-primary-content" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Suivi des livraison</h1>
        </div>
        <div className="flex-none gap-2">
          {/* Theme Dropdown */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost gap-2">
              <Palette className="w-5 h-5" />
              <span className="hidden sm:inline font-normal capitalize">{theme}</span>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52">
              {THEMES.map((t) => (
                <li key={t}>
                  <input 
                    type="radio" 
                    name="theme-dropdown" 
                    className="theme-controller btn btn-sm btn-block btn-ghost justify-start" 
                    aria-label={t.charAt(0).toUpperCase() + t.slice(1)} 
                    value={t} 
                    checked={theme === t}
                    onChange={() => setTheme(t)}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="border-l border-base-300 h-8 mx-2"></div>

          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-xs font-medium opacity-70">
              {session.user.email}
            </span>
            <span className="text-[10px] badge badge-ghost badge-xs uppercase tracking-wider">Authentifié</span>
          </div>
          <button 
            onClick={handleSignOut}
            className="btn btn-ghost btn-circle text-error"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
        {/* Side Panel */}
        <div className="lg:border-r border-base-300 p-4 lg:p-6 bg-base-100/50">
          <SidePanel
             filters={filters}
             setFilters={setFilters}
             owners={uniqueOwners}
             onReset={() => setFilters(initialFilterState)}
             loading={loading}
             onNewDelivery={() => { setEditingDelivery(null); setIsFormOpen(true); }}
             onExport={handleExport}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {/* Dashboard */}
          <Dashboard deliveries={deliveries} />

          {/* Filter Results Summary & Billing */}
          <div className="card bg-base-100 shadow-sm mb-6 border border-base-200">
            <div className="card-body flex flex-col md:flex-row items-center justify-between p-4 gap-4">
              {/* Left: Active Filter Info */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="p-2 bg-primary/10 rounded-full text-primary shrink-0">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Résultats</p>
                  <p className="text-xs opacity-60 truncate max-w-xs">
                    {filters.truckOwners.length > 0 ? `${filters.truckOwners.length} Propriétaire(s)` : 'Tous'}
                    {filters.plateNumber && ` • ${filters.plateNumber}`}
                  </p>
                </div>
              </div>

              {/* Right: Actions & Stats */}
              <div className="flex flex-wrap items-center justify-end gap-4 w-full md:w-auto">
                <div className="flex items-center gap-4 bg-base-200/30 p-2 rounded-xl">
                  <div className="text-right">
                     <p className="text-[10px] uppercase tracking-wider opacity-50 font-bold">Poids Total</p>
                     <p className="text-lg font-bold leading-none">
                        {(filteredWeight / 1000).toLocaleString()} <span className="text-xs font-normal opacity-60">T</span>
                     </p>
                  </div>
                  <div className="h-8 w-px bg-base-300"></div>
                  <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider opacity-50 font-bold">Est. Facture</p>
                      <p className="text-lg font-bold leading-none text-success">
                         {((filteredWeight/1000) * (parseFloat(billingRate)||0)).toLocaleString(undefined, {maximumFractionDigits:0})} <span className="text-[10px]">CFA</span>
                      </p>
                  </div>
                </div>

                <div className="join">
                   <input 
                     type="number" 
                     className="input input-sm input-bordered join-item w-24 text-right" 
                     placeholder="Prix/T"
                     value={billingRate}
                     onChange={e => setBillingRate(e.target.value)}
                   />
                   <button 
                     onClick={() => setIsBillingOpen(true)}
                     className="btn btn-sm btn-secondary join-item"
                   >
                     <ReceiptText className="w-4 h-4" />
                     Facture
                   </button>
                   <button 
                     onClick={() => setIsBillingHistoryOpen(true)}
                     className="btn btn-sm btn-neutral join-item"
                     title="Historique"
                   >
                     <History className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <DeliveryTable
            deliveries={filteredDeliveries}
            loading={loading}
            onEdit={(item) => { setEditingDelivery(item); setIsFormOpen(true); }}
            onDelete={handleDelete}
            onManageExpenses={(item) => { setExpenseDelivery(item); setIsExpenseOpen(true); }}
            onViewDetails={(item) => setDetailsDelivery(item)}
          />
        </main>
      </div>

      {/* Modal Form */}
      <DeliveryForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingDelivery(null); }}
        onSubmit={editingDelivery ? handleUpdate : handleCreate}
        onDelete={handleDelete}
        initialData={editingDelivery}
        availableOwners={uniqueOwners}
      />

      {/* Billing Modal */}
      <BillingModal
        isOpen={isBillingOpen}
        onClose={() => setIsBillingOpen(false)}
        onSave={handleSaveBilling}
        deliveries={filteredDeliveries}
        totalWeightKg={filteredWeight}
        filters={filters}
        initialRate={billingRate}
      />

      {/* Billing History Modal */}
      <BillingHistory
        isOpen={isBillingHistoryOpen}
        onClose={() => setIsBillingHistoryOpen(false)}
      />

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseOpen}
        onClose={() => { setIsExpenseOpen(false); setExpenseDelivery(null); }}
        onSave={handleSaveExpense}
        delivery={expenseDelivery}
      />

      {/* Truck Details Modal */}
      <TruckDetailsModal 
        isOpen={!!detailsDelivery}
        onClose={() => setDetailsDelivery(null)}
        delivery={detailsDelivery}
      />

       {/* Custom Delete Confirmation Modal */}
       {deleteConfirmation.isOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{deleteConfirmation.title}</h3>
            <p className="py-4 whitespace-pre-line opacity-80">{deleteConfirmation.message}</p>
            <div className="modal-action">
              <button 
                className="btn" 
                onClick={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
              >
                Annuler
              </button>
              <button 
                className="btn btn-error"
                onClick={confirmDeleteAction}
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black/50" onClick={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}></div>
        </dialog>
      )}
    </div>
  );
};

export default App;
