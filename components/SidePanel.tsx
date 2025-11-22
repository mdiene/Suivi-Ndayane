import React from 'react';
import { FilterState } from '../types';
import { Search, Plus, Download, Filter, X } from 'lucide-react';

interface SidePanelProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  owners: string[];
  onReset: () => void;
  loading?: boolean;
  onNewDelivery: () => void;
  onExport: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ 
  filters, setFilters, owners, onReset, loading, onNewDelivery, onExport 
}) => {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const toggleTruckOwner = (owner: string) => {
    if (loading) return;
    setFilters(prev => {
      const newOwners = prev.truckOwners.includes(owner)
        ? prev.truckOwners.filter(o => o !== owner)
        : [...prev.truckOwners, owner];
      return { ...prev, truckOwners: newOwners };
    });
  };

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
      {/* Actions Card */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-4 gap-3">
          <button
            onClick={onNewDelivery}
            className="btn btn-primary w-full shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Livraison
          </button>
          
          <button
            onClick={onExport}
            className="btn btn-outline w-full"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
        <div className="collapse collapse-arrow bg-base-100 rounded-box">
          <input type="checkbox" className="peer" /> 
          <div className="collapse-title font-bold text-sm uppercase tracking-wider flex items-center gap-2 p-4 peer-checked:bg-base-200/50">
            <Filter className="w-4 h-4" />
            Filtres Avancés
          </div>
          <div className="collapse-content p-4 space-y-4 border-t border-base-200">
            
            {/* Reset */}
            <div className="flex justify-end">
               <button 
                onClick={onReset}
                disabled={loading}
                className="btn btn-ghost btn-xs text-info"
              >
                Réinitialiser
              </button>
            </div>

            {/* Global Search */}
            <div className="form-control">
               <label className="label pt-0"><span className="label-text text-xs font-medium">Recherche</span></label>
               <label className="input input-bordered flex items-center gap-2 input-sm">
                <Search className="w-4 h-4 opacity-50" />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleInputChange}
                  className="grow"
                  placeholder="..."
                />
              </label>
            </div>

            {/* Date Range */}
            <div className="form-control">
              <label className="label pt-0"><span className="label-text text-xs font-medium">Date Chargement</span></label>
              <div className="flex flex-col gap-2">
                <input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleInputChange}
                  className="input input-bordered input-sm w-full"
                />
                <input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleInputChange}
                  className="input input-bordered input-sm w-full"
                />
              </div>
            </div>

            {/* Plate Number */}
            <div className="form-control">
              <label className="label pt-0"><span className="label-text text-xs font-medium">Immatriculation</span></label>
              <input
                type="text"
                name="plateNumber"
                value={filters.plateNumber}
                onChange={handleInputChange}
                placeholder="ex: AA-123-BB"
                className="input input-bordered input-sm w-full"
              />
            </div>

            {/* Weight Range */}
            <div className="form-control">
              <label className="label pt-0"><span className="label-text text-xs font-medium">Poids (kg)</span></label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="weightMin"
                  placeholder="Min"
                  value={filters.weightMin}
                  onChange={handleInputChange}
                  className="input input-bordered input-sm w-full"
                />
                <input
                  type="number"
                  name="weightMax"
                  placeholder="Max"
                  value={filters.weightMax}
                  onChange={handleInputChange}
                  className="input input-bordered input-sm w-full"
                />
              </div>
            </div>

            {/* Owners */}
            <div className="form-control">
              <label className="label pt-0"><span className="label-text text-xs font-medium">Propriétaires</span></label>
              <div className="flex flex-wrap gap-1.5">
                {owners.map(owner => (
                  <button
                    key={owner}
                    onClick={() => toggleTruckOwner(owner)}
                    className={`btn btn-xs ${
                      filters.truckOwners.includes(owner)
                        ? 'btn-primary'
                        : 'btn-outline border-base-300'
                    }`}
                  >
                    {owner}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidePanel;