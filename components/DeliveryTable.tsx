
import React, { useState, useMemo } from 'react';
import { Delivery } from '../types';
import { Edit2, ArrowUpDown, ArrowUp, ArrowDown, Inbox, Trash2, Coins, Layers } from 'lucide-react';

interface DeliveryTableProps {
  deliveries: Delivery[];
  onEdit: (delivery: Delivery) => void;
  onDelete: (id: number) => void;
  onManageExpenses: (delivery: Delivery) => void;
  onViewDetails: (delivery: Delivery) => void;
  loading: boolean;
}

type SortField = keyof Delivery | 'expenses_total';
type SortDirection = 'asc' | 'desc';

const DeliveryTable: React.FC<DeliveryTableProps> = ({ deliveries, onEdit, onDelete, onManageExpenses, onViewDetails, loading }) => {
  const [sortField, setSortField] = useState<SortField>('loading_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // Increased for grouping view

  // Helper to calculate total expenses for a delivery
  const calculateExpenses = (d: Delivery) => {
    const expenses = d.delivery_expenses;
    if (!expenses) return 0;
    
    const e = Array.isArray(expenses) ? expenses[0] : (expenses as any);
    if (!e) return 0;

    const diesel = (e.diesel_liters || 0) * (e.diesel_price_unit || 755);
    return (e.road_costs || 0) + diesel + (e.toll_costs || 0) + (e.extra_costs || 0);
  };

  // Grouping Logic
  const groupedData = useMemo(() => {
    // Sort by owner first to group them
    const sortedByOwner = [...deliveries].sort((a, b) => a.truck_owner.localeCompare(b.truck_owner));
    
    const groups: { [key: string]: Delivery[] } = {};
    sortedByOwner.forEach(d => {
      if (!groups[d.truck_owner]) groups[d.truck_owner] = [];
      groups[d.truck_owner].push(d);
    });
    return groups;
  }, [deliveries]);

  // Flatten for pagination but keep group structure logic in rendering? 
  // For simple table with grouping headers, we usually render entire groups.
  // To keep it simple with pagination, we will paginate the GROUPS or just list them if not too many.
  // Given the requirement "group the item by truck owner", standard sorting + headers is best.
  
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />;
  };

  const SortHeader = ({ field, label, width }: { field: SortField, label: string, width?: string }) => (
    <th
      className={`cursor-pointer hover:bg-base-200 group ${width}`}
      onClick={() => !loading && handleSort(field)}
    >
      <div className="flex items-center gap-1 uppercase text-xs opacity-70">
        {label}
        {!loading && renderSortIcon(field)}
      </div>
    </th>
  );

  const handleSort = (field: SortField) => {
      if (field === sortField) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
  };

  if (!loading && deliveries.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center bg-base-100 rounded-box border border-base-200 border-dashed">
        <div className="bg-base-200 p-4 rounded-full mb-4">
          <Inbox className="w-8 h-8 opacity-50" />
        </div>
        <h3 className="text-lg font-bold">Aucune livraison trouvée</h3>
        <p className="text-sm opacity-60 mt-1 text-center max-w-xs">
          Essayez d'ajuster vos filtres ou ajoutez votre première livraison.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-box shadow-sm border border-base-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <SortHeader field="truck_immatriculation" label="Immatriculation" width="w-[12%]" />
              <SortHeader field="driver_names" label="Chauffeur" width="w-[12%]" />
              <SortHeader field="loading_date" label="Chargement" width="w-[10%]" />
              <SortHeader field="unloading_date" label="Déchargement" width="w-[10%]" />
              <SortHeader field="weight_loaded" label="Poids (kg)" width="w-[10%]" />
              <SortHeader field="delivery_bond_number" label="Bon #" width="w-[12%]" />
              <SortHeader field="truck_owner" label="Propriétaire" width="w-[12%]" />
              <SortHeader field="expenses_total" label="Frais Totaux" width="w-[10%]" />
              <th className="text-right uppercase text-xs opacity-70 w-[12%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={9}><div className="h-12 w-full bg-base-300 rounded animate-pulse"></div></td>
                </tr>
              ))
            ) : (
              Object.keys(groupedData).map(owner => {
                const ownerDeliveries = groupedData[owner];
                const ownerTotalWeight = ownerDeliveries.reduce((sum, d) => sum + d.weight_loaded, 0);
                const ownerTotalExpenses = ownerDeliveries.reduce((sum, d) => sum + calculateExpenses(d), 0);

                return (
                  <React.Fragment key={owner}>
                    {/* Group Header */}
                    <tr className="bg-base-200/50 border-b border-base-300">
                      <td colSpan={9} className="py-3 px-4">
                        <div className="flex items-center gap-2 font-bold text-primary">
                          <Layers className="w-4 h-4" />
                          {owner}
                          <span className="badge badge-sm badge-ghost ml-2">{ownerDeliveries.length} livraisons</span>
                        </div>
                      </td>
                    </tr>

                    {/* Rows */}
                    {ownerDeliveries.map((item) => {
                      const totalExpenses = calculateExpenses(item);
                      return (
                        <tr key={item.id} className="hover border-b border-base-100">
                          <td className="font-bold font-mono text-sm">
                            <button 
                              onClick={() => onViewDetails(item)}
                              className="btn btn-link btn-xs p-0 h-auto text-primary no-underline hover:underline"
                            >
                              {item.truck_immatriculation}
                            </button>
                          </td>
                          <td className="text-sm">{item.driver_names}</td>
                          <td className="text-sm opacity-80">{new Date(item.loading_date).toLocaleDateString()}</td>
                          <td className="text-sm opacity-80">{new Date(item.unloading_date).toLocaleDateString()}</td>
                          <td className="font-mono text-sm">{item.weight_loaded.toLocaleString()}</td>
                          <td className="text-sm">{item.delivery_bond_number}</td>
                          <td className="text-sm opacity-50">{item.truck_owner}</td>
                          <td className="font-mono text-sm text-warning font-bold">
                            {totalExpenses > 0 ? totalExpenses.toLocaleString() : '-'}
                          </td>
                          <td className="text-right">
                            <div className="join">
                              <button
                                onClick={() => onManageExpenses(item)}
                                className="btn btn-ghost btn-xs join-item text-warning"
                              >
                                <Coins className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onEdit(item)}
                                className="btn btn-ghost btn-xs join-item text-info"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(item.id);
                                }}
                                className="btn btn-ghost btn-xs join-item text-error"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Group Footer (Subtotal) */}
                    <tr className="bg-base-200/20 border-t-2 border-base-300 font-bold text-sm">
                      <td colSpan={4} className="text-right uppercase text-xs opacity-60 tracking-wider">Sous-total ({owner})</td>
                      <td className="font-mono text-primary">{ownerTotalWeight.toLocaleString()} kg</td>
                      <td colSpan={2}></td>
                      <td className="font-mono text-warning">{ownerTotalExpenses.toLocaleString()}</td>
                      <td></td>
                    </tr>
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="p-2 text-center text-xs opacity-50">
        Affichage groupé par propriétaire • {deliveries.length} enregistrements
      </div>
    </div>
  );
};

export default DeliveryTable;
