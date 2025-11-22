import React, { useState, useEffect, useMemo } from 'react';
import { billingService } from '../services/billingService';
import { Billing } from '../types';
import { X, ArrowUpDown, Loader2, FileText } from 'lucide-react';

interface BillingHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

type SortField = 'created_at' | 'total_amount' | 'status' | 'billing_number';

const BillingHistory: React.FC<BillingHistoryProps> = ({ isOpen, onClose }) => {
  const [billings, setBillings] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (isOpen) {
      loadBillings();
    }
  }, [isOpen]);

  const loadBillings = async () => {
    setLoading(true);
    try {
      const data = await billingService.fetchBillings();
      setBillings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedBillings = useMemo(() => {
    return [...billings].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [billings, sortField, sortDirection]);

  const totalAmountSum = useMemo(() => {
    return sortedBillings.reduce((sum, bill) => sum + Number(bill.total_amount), 0);
  }, [sortedBillings]);

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open z-50">
      <div className="modal-box w-11/12 max-w-4xl bg-base-100 border border-base-300">
        <div className="flex items-center justify-between mb-4 border-b border-base-200 pb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Historique des Factures
          </h3>
          <button onClick={onClose} className="btn btn-circle btn-ghost btn-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200/50">
                <th className="cursor-pointer hover:bg-base-200" onClick={() => handleSort('billing_number')}>
                  <div className="flex items-center gap-1">Numéro <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                </th>
                <th className="cursor-pointer hover:bg-base-200" onClick={() => handleSort('created_at')}>
                  <div className="flex items-center gap-1">Date <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                </th>
                <th>Poids (T)</th>
                <th>Prix/T</th>
                <th className="cursor-pointer text-right hover:bg-base-200" onClick={() => handleSort('total_amount')}>
                   <div className="flex items-center justify-end gap-1">Montant <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                </th>
                <th className="cursor-pointer text-center hover:bg-base-200" onClick={() => handleSort('status')}>
                   <div className="flex items-center justify-center gap-1">Statut <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                    <span className="text-xs opacity-50">Chargement...</span>
                  </td>
                </tr>
              ) : sortedBillings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 opacity-50 italic">Aucune facture trouvée</td>
                </tr>
              ) : (
                sortedBillings.map(bill => (
                  <tr key={bill.id} className="hover">
                    <td className="font-mono font-bold text-xs">{bill.billing_number}</td>
                    <td className="text-sm">{new Date(bill.created_at).toLocaleDateString()}</td>
                    <td className="text-sm font-mono">{bill.total_weight.toLocaleString()}</td>
                    <td className="text-sm font-mono">{bill.price_per_ton.toLocaleString()}</td>
                    <td className="text-right font-bold font-mono text-primary">
                      {bill.total_amount.toLocaleString()} <span className="text-xs text-base-content/50">CFA</span>
                    </td>
                    <td className="text-center">
                      <div className={`badge badge-sm gap-1 ${
                        bill.status === 'paid' ? 'badge-success text-white' : 
                        bill.status === 'overdue' ? 'badge-error text-white' : 'badge-warning text-warning-content'
                      }`}>
                        {bill.status === 'paid' ? 'Payé' : 
                         bill.status === 'overdue' ? 'En retard' : 'En attente'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {!loading && sortedBillings.length > 0 && (
              <tfoot>
                <tr className="bg-base-200/50 font-bold text-base">
                  <td colSpan={4} className="text-right uppercase text-xs tracking-wider opacity-70">Total Facturé</td>
                  <td className="text-right font-mono text-lg text-primary">
                    {totalAmountSum.toLocaleString()} <span className="text-xs text-base-content/50 font-normal">CFA</span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/50">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default BillingHistory;