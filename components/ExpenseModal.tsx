
import React, { useState, useEffect } from 'react';
import { Delivery, DeliveryExpense } from '../types';
import { X, Save, Loader2, Calculator, Fuel, Coins, AlertCircle } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Partial<DeliveryExpense>) => Promise<void>;
  delivery: Delivery | null;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSave, delivery }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<DeliveryExpense>>({
    road_costs: 0,
    diesel_liters: 0,
    diesel_price_unit: 755, // Default per requirement
    toll_costs: 0,
    extra_costs: 0,
    extra_description: ''
  });

  useEffect(() => {
    const expenses = delivery?.delivery_expenses;
    
    if (expenses) {
       // Handle both array (1:N default) and object (1:1 joined) response
       const expenseData = Array.isArray(expenses) ? expenses[0] : (expenses as any);
       
       if (expenseData) {
         setFormData(expenseData);
         return;
       }
    }
    
    // Reset defaults for new entry or if no expense exists
    setFormData({
      road_costs: 0,
      diesel_liters: 0,
      diesel_price_unit: 755,
      toll_costs: 0,
      extra_costs: 0,
      extra_description: ''
    });
  }, [delivery, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'extra_description' ? value : (parseFloat(value) || 0)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivery) return;
    
    setLoading(true);
    try {
      await onSave({
        ...formData,
        delivery_id: delivery.id
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const dieselTotal = (formData.diesel_liters || 0) * (formData.diesel_price_unit || 0);
  const grandTotal = (formData.road_costs || 0) + 
                     dieselTotal + 
                     (formData.toll_costs || 0) + 
                     (formData.extra_costs || 0);

  if (!isOpen || !delivery) return null;

  return (
    <dialog className="modal modal-open z-50">
      <div className="modal-box w-11/12 max-w-2xl bg-base-100">
        <div className="flex items-center justify-between mb-6 border-b border-base-200 pb-4">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Coins className="w-5 h-5 text-warning" />
              Gestion des Frais
            </h3>
            <p className="text-xs opacity-60">Livraison: {delivery.truck_immatriculation} (Bond: {delivery.delivery_bond_number})</p>
          </div>
          <button onClick={onClose} className="btn btn-circle btn-ghost btn-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section Gazoil */}
          <div className="bg-base-200/50 p-4 rounded-lg border border-base-200">
            <h4 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-info">
              <Fuel className="w-4 h-4" /> Carburant (Gasoil)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label pt-0"><span className="label-text text-xs">Nb. Litres</span></label>
                <input 
                  type="number" 
                  name="diesel_liters" 
                  value={formData.diesel_liters || ''} 
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full" 
                  placeholder="0"
                />
              </div>
              <div className="form-control">
                <label className="label pt-0"><span className="label-text text-xs">Prix Unitaire (CFA)</span></label>
                <input 
                  type="number" 
                  name="diesel_price_unit" 
                  value={formData.diesel_price_unit || ''} 
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full" 
                />
              </div>
              <div className="form-control">
                <label className="label pt-0"><span className="label-text text-xs font-bold">Coût Total Gasoil</span></label>
                <div className="input input-bordered input-sm w-full bg-base-300 flex items-center font-mono font-bold text-info">
                  {dieselTotal.toLocaleString()} CFA
                </div>
              </div>
            </div>
          </div>

          {/* Autres Frais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Frais de Route</span></label>
              <label className="input input-bordered flex items-center gap-2">
                <span className="text-xs font-bold opacity-50">CFA</span>
                <input 
                  type="number" 
                  name="road_costs" 
                  value={formData.road_costs || ''} 
                  onChange={handleChange}
                  className="grow text-right" 
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Frais de Péages</span></label>
              <label className="input input-bordered flex items-center gap-2">
                <span className="text-xs font-bold opacity-50">CFA</span>
                <input 
                  type="number" 
                  name="toll_costs" 
                  value={formData.toll_costs || ''} 
                  onChange={handleChange}
                  className="grow text-right" 
                />
              </label>
            </div>
          </div>

          {/* Extras */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Extras</span></label>
              <label className="input input-bordered flex items-center gap-2">
                <span className="text-xs font-bold opacity-50">CFA</span>
                <input 
                  type="number" 
                  name="extra_costs" 
                  value={formData.extra_costs || ''} 
                  onChange={handleChange}
                  className="grow text-right" 
                />
              </label>
            </div>
            <div className="form-control sm:col-span-2">
               <label className="label"><span className="label-text font-medium">Libellé des Extras</span></label>
               <input 
                  type="text" 
                  name="extra_description" 
                  value={formData.extra_description || ''} 
                  onChange={handleChange}
                  placeholder="Description (ex: Réparation pneu...)"
                  className="input input-bordered w-full" 
                />
            </div>
          </div>

          {/* Total Footer */}
          <div className="bg-neutral text-neutral-content p-4 rounded-lg flex justify-between items-center mt-6">
            <div className="flex items-center gap-2">
              <Calculator className="w-6 h-6" />
              <span className="font-bold uppercase tracking-wider">Total Frais</span>
            </div>
            <div className="text-2xl font-mono font-bold">
              {grandTotal.toLocaleString()} <span className="text-sm font-normal">CFA</span>
            </div>
          </div>

          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn">Annuler</button>
            <button type="submit" disabled={loading} className="btn btn-primary gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/50">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default ExpenseModal;
