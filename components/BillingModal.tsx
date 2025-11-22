
import React, { useState, useMemo, useEffect } from 'react';
import { Delivery, FilterState } from '../types';
import { Printer, X, Save, Loader2 } from 'lucide-react';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any, deliveryIds: number[]) => Promise<void>;
  deliveries: Delivery[];
  totalWeightKg: number;
  filters: FilterState;
  initialRate?: string;
}

const BillingModal: React.FC<BillingModalProps> = ({ isOpen, onClose, onSave, deliveries, totalWeightKg, filters, initialRate }) => {
  const [pricePerTon, setPricePerTon] = useState<string>(initialRate || '');
  const [isSaving, setIsSaving] = useState(false);
  
  // Update internal state if initialRate changes from outside while closed, 
  // or just on open (handled by key or effect if needed, but prop passing usually sufficient for open)
  useEffect(() => {
    if (isOpen && initialRate) {
      setPricePerTon(initialRate);
    }
  }, [isOpen, initialRate]);

  const totalTons = totalWeightKg / 1000;
  const priceValue = parseFloat(pricePerTon) || 0;
  const totalAmount = priceValue * totalTons;

  // Generate Invoice Number
  const invoiceNumber = useMemo(() => {
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${dateStr}-${randomPart}`;
  }, [isOpen]); 
  
  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    if (!onSave) return;
    if (!priceValue || priceValue <= 0) {
      alert("Veuillez entrer un prix par tonne valide.");
      return;
    }

    setIsSaving(true);
    try {
      const billingData = {
        billing_number: invoiceNumber,
        total_weight: totalTons,
        price_per_ton: priceValue,
        total_amount: totalAmount,
        notes: `Facture pour ${deliveries.length} livraisons`
      };
      const deliveryIds = deliveries.map(d => d.id);
      await onSave(billingData, deliveryIds);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement de la facture.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open z-50">
      <div className="modal-box w-11/12 max-w-5xl bg-base-100 p-0 overflow-hidden flex flex-col max-h-[90vh] border border-base-300">
        {/* Header - Hidden on Print */}
        <div className="flex items-center justify-between p-4 border-b border-base-200 bg-base-200/50 no-print">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">Générateur de Facture</h3>
            <span className="badge badge-sm badge-ghost">
              {deliveries.length} livraisons
            </span>
          </div>
          <button onClick={onClose} className="btn btn-circle btn-ghost btn-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls - Hidden on Print */}
        <div className="p-6 bg-base-100 border-b border-base-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end no-print shadow-sm z-10">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Prix par Tonne</span>
            </label>
            <label className="input input-bordered flex items-center gap-2 bg-base-200/30 focus-within:bg-base-100 transition-colors">
              <span className="opacity-50 font-bold text-xs">CFA</span>
              <input 
                type="number" 
                value={pricePerTon} 
                onChange={(e) => setPricePerTon(e.target.value)} 
                placeholder="0.00" 
                className="grow font-mono" 
                min="0"
                step="0.01"
              />
            </label>
          </div>
          
          <div className="flex flex-col justify-end h-full pb-1">
             <div className="text-xs uppercase tracking-wider opacity-50 mb-1">Total Estimé</div>
             <div className="text-2xl font-bold font-mono text-primary">
                {totalAmount.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-sm">CFA</span>
             </div>
          </div>

          <div className="flex justify-end items-end gap-2">
             {onSave && (
               <button 
                 onClick={handleSave} 
                 disabled={isSaving || priceValue <= 0}
                 className="btn btn-success text-white gap-2 w-full sm:w-auto"
               >
                 {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                 Enregistrer
               </button>
             )}
             <button onClick={handlePrint} className="btn btn-primary gap-2 w-full sm:w-auto">
               <Printer className="w-4 h-4" />
               Imprimer PDF
             </button>
          </div>
        </div>

        {/* Printable Content */}
        <div id="billing-content" className="p-8 sm:p-12 overflow-y-auto flex-1 bg-white text-black">
          <style>{`
            @media print {
              @page { margin: 0.5cm; size: auto; }
              body { background-color: white !important; color: black !important; -webkit-print-color-adjust: exact; }
              body > *:not(.modal) { display: none !important; }
              .modal { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; height: auto !important; background: white !important; overflow: visible !important; display: block !important; z-index: 9999 !important; }
              .modal-box { max-width: 100% !important; width: 100% !important; box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; max-height: none !important; overflow: visible !important; background: white !important; }
              .no-print { display: none !important; }
              table { width: 100%; border-collapse: collapse; }
              th { border-bottom: 2px solid #000 !important; color: #000 !important; }
              td { border-bottom: 1px solid #ddd !important; color: #000 !important; }
            }
          `}</style>

          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-4xl font-bold text-black tracking-tight">FACTURE</h1>
              <p className="text-gray-500 mt-2 text-sm font-medium uppercase tracking-widest">Fleet Delivery Tracker</p>
              <div className="mt-2 text-lg font-mono font-bold text-primary">{invoiceNumber}</div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg mb-1">Date: {new Date().toLocaleDateString()}</p>
              {filters.truckOwners.length > 0 ? (
                 <div className="mt-2 p-3 bg-gray-50 rounded-lg inline-block text-left min-w-[200px]">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Client</p>
                    <p className="font-bold text-lg">{filters.truckOwners.join(', ')}</p>
                 </div>
              ) : (
                 <div className="mt-2">
                    <p className="text-sm text-gray-500">Sélection Multiple</p>
                 </div>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="flex justify-between mb-10 border rounded-lg p-6 bg-gray-50 border-gray-100">
             <div className="text-center">
               <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Période</p>
               <p className="font-bold text-lg">
                 {filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString() : 'Début'} 
                 <span className="mx-2 text-gray-400">→</span> 
                 {filters.dateTo ? new Date(filters.dateTo).toLocaleDateString() : 'Fin'}
               </p>
             </div>
             <div className="text-center border-l border-gray-200 pl-10">
               <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Voyages</p>
               <p className="font-bold text-lg">{deliveries.length}</p>
             </div>
             <div className="text-center border-l border-gray-200 pl-10">
               <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Poids Total</p>
               <p className="font-bold text-lg">{totalWeightKg.toLocaleString()} <span className="text-sm font-normal text-gray-500">kg</span></p>
             </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-left mb-10 text-sm">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-3 font-bold uppercase text-xs tracking-wider">Date</th>
                <th className="py-3 font-bold uppercase text-xs tracking-wider">Immatriculation</th>
                <th className="py-3 font-bold uppercase text-xs tracking-wider">Chauffeur</th>
                <th className="py-3 font-bold uppercase text-xs tracking-wider">Bon #</th>
                <th className="py-3 font-bold uppercase text-xs tracking-wider text-right">Poids (kg)</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                   <td className="py-3 font-medium">{new Date(d.loading_date).toLocaleDateString()}</td>
                   <td className="py-3 font-mono text-xs bg-gray-50/50 rounded px-2 w-fit">{d.truck_immatriculation}</td>
                   <td className="py-3 capitalize">{d.driver_names}</td>
                   <td className="py-3 text-gray-600">{d.delivery_bond_number}</td>
                   <td className="py-3 text-right font-mono">{d.weight_loaded.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td colSpan={4} className="py-3 text-right uppercase text-xs tracking-wider">Sous-total Poids</td>
                <td className="py-3 text-right font-mono text-base">{totalWeightKg.toLocaleString()} kg</td>
              </tr>
            </tfoot>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-3">
              <div className="flex justify-between items-center text-gray-600">
                <span>Poids Total (Tonnes):</span>
                <span className="font-mono font-medium text-lg">{totalTons.toFixed(3)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Prix par Tonne:</span>
                <span className="font-mono font-medium">
                  {priceValue ? `${priceValue.toLocaleString('fr-FR')} CFA` : '0.00 CFA'}
                </span>
              </div>
              <div className="flex justify-between items-center border-t-2 border-black pt-4 text-2xl font-bold">
                <span>TOTAL:</span>
                <span>
                  {totalAmount.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} CFA
                </span>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Merci de votre confiance</p>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/50">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default BillingModal;
