import React from 'react';
import { Delivery } from '../types';
import { X, Printer, Truck, Calendar, User, Scale, FileText, Coins, Fuel, MapPin, AlertCircle } from 'lucide-react';

interface TruckDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: Delivery | null;
}

const TruckDetailsModal: React.FC<TruckDetailsModalProps> = ({ isOpen, onClose, delivery }) => {
  if (!isOpen || !delivery) return null;

  // Helper to handle expenses array or object structure
  const getExpenses = () => {
    if (!delivery.delivery_expenses) return null;
    if (Array.isArray(delivery.delivery_expenses)) {
        return delivery.delivery_expenses.length > 0 ? delivery.delivery_expenses[0] : null;
    }
    return delivery.delivery_expenses;
  };

  const expenses = getExpenses();

  const dieselTotal = expenses ? (expenses.diesel_liters * expenses.diesel_price_unit) : 0;
  const totalExpenses = expenses 
    ? ((expenses.road_costs || 0) + dieselTotal + (expenses.toll_costs || 0) + (expenses.extra_costs || 0))
    : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <dialog className="modal modal-open z-50">
      <div className="modal-box w-11/12 max-w-4xl bg-base-100 p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header - Hidden on Print */}
        <div className="flex items-center justify-between p-4 border-b border-base-200 bg-base-200/50 no-print">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Détails de la Livraison
          </h3>
          <div className="flex gap-2">
             <button onClick={handlePrint} className="btn btn-sm btn-ghost gap-2 text-primary">
               <Printer className="w-4 h-4" /> Imprimer
             </button>
            <button onClick={onClose} className="btn btn-circle btn-ghost btn-sm">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div id="details-content" className="p-6 sm:p-10 overflow-y-auto bg-white text-base-content flex-1">
             {/* Print Styles */}
            <style>{`
            @media print {
              @page { margin: 1cm; size: auto; }
              body { background-color: white !important; color: black !important; -webkit-print-color-adjust: exact; }
              body > *:not(.modal) { display: none !important; }
              .modal { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; height: auto !important; background: white !important; overflow: visible !important; display: block !important; z-index: 9999 !important; }
              .modal-box { max-width: 100% !important; width: 100% !important; box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; max-height: none !important; overflow: visible !important; background: white !important; }
              .no-print { display: none !important; }
            }
          `}</style>

          {/* Header Section for Print/View */}
          <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
             <div>
                <h1 className="text-4xl font-extrabold text-primary mb-2 tracking-tight">{delivery.truck_immatriculation}</h1>
                <span className="badge badge-lg badge-outline uppercase tracking-wide text-xs font-bold border-gray-400 text-gray-600">
                  {delivery.truck_type}
                </span>
             </div>
             <div className="text-right">
               <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Bon de Livraison</p>
               <p className="text-2xl font-mono font-bold text-gray-800">{delivery.delivery_bond_number}</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
             {/* Info Colonne 1 */}
             <div className="space-y-6">
                <h4 className="font-bold text-sm uppercase text-gray-400 flex items-center gap-2 border-b border-gray-100 pb-2">
                   <User className="w-4 h-4" /> Informations Générales
                </h4>
                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Chauffeur</p>
                      <p className="font-medium text-lg capitalize text-gray-800">{delivery.driver_names}</p>
                   </div>
                   <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Propriétaire</p>
                      <p className="font-medium text-lg capitalize text-gray-800">{delivery.truck_owner}</p>
                   </div>
                </div>
             </div>

             {/* Info Colonne 2 */}
             <div className="space-y-6">
                <h4 className="font-bold text-sm uppercase text-gray-400 flex items-center gap-2 border-b border-gray-100 pb-2">
                   <Calendar className="w-4 h-4" /> Dates & Poids
                </h4>
                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Chargement</p>
                      <p className="font-medium text-gray-800">{new Date(delivery.loading_date).toLocaleDateString()}</p>
                   </div>
                   <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Déchargement</p>
                      <p className="font-medium text-gray-800">{new Date(delivery.unloading_date).toLocaleDateString()}</p>
                   </div>
                   <div className="col-span-2 pt-2">
                      <p className="text-gray-400 text-xs flex items-center gap-1 mb-1"><Scale className="w-3 h-3" /> Poids Chargé</p>
                      <p className="font-mono font-bold text-2xl text-gray-900">{delivery.weight_loaded.toLocaleString()} <span className="text-sm font-normal text-gray-500">kg</span></p>
                   </div>
                </div>
             </div>
          </div>

          {/* Expenses Section */}
          <div className="bg-base-200/30 rounded-2xl p-8 border border-base-200 print:bg-gray-50 print:border-gray-200">
             <h4 className="font-bold text-lg flex items-center gap-2 mb-8 text-primary">
                <Coins className="w-5 h-5" /> Détails des Frais
             </h4>

             {expenses ? (
               <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-dashed border-gray-300 pb-3">
                     <span className="text-sm font-medium flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center text-info"><Fuel className="w-4 h-4" /></div>
                        Carburant <span className="text-xs text-gray-400 font-normal">({expenses.diesel_liters} L x {expenses.diesel_price_unit})</span>
                     </span>
                     <span className="font-mono font-bold text-gray-800">{dieselTotal.toLocaleString()} CFA</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-dashed border-gray-300 pb-3">
                     <span className="text-sm font-medium flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success"><MapPin className="w-4 h-4" /></div>
                        Frais de Route
                     </span>
                     <span className="font-mono font-bold text-gray-800">{(expenses.road_costs || 0).toLocaleString()} CFA</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-dashed border-gray-300 pb-3">
                     <span className="text-sm font-medium flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center text-warning"><FileText className="w-4 h-4" /></div>
                        Péages
                     </span>
                     <span className="font-mono font-bold text-gray-800">{(expenses.toll_costs || 0).toLocaleString()} CFA</span>
                  </div>

                   <div className="flex justify-between items-center border-b border-dashed border-gray-300 pb-3">
                     <span className="text-sm font-medium flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center text-error"><AlertCircle className="w-4 h-4" /></div>
                        Extras
                        {expenses.extra_description && <span className="text-xs text-gray-400 italic ml-1">({expenses.extra_description})</span>}
                     </span>
                     <span className="font-mono font-bold text-gray-800">{(expenses.extra_costs || 0).toLocaleString()} CFA</span>
                  </div>

                  <div className="pt-6 mt-4 flex justify-between items-center">
                     <span className="font-bold text-lg uppercase tracking-wide text-gray-700">Total Frais</span>
                     <span className="font-mono text-3xl font-extrabold text-primary print:text-black">{totalExpenses.toLocaleString()} <span className="text-sm font-normal text-gray-500">CFA</span></span>
                  </div>
               </div>
             ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                   <p className="text-gray-400 italic font-medium">Aucun frais enregistré pour cette livraison.</p>
                </div>
             )}
          </div>

          <div className="mt-12 text-center text-[10px] text-gray-300 uppercase tracking-widest print:block hidden">
             Document généré par Fleet Delivery Tracker • {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/50">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default TruckDetailsModal;