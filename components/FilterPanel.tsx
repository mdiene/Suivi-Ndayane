import React from 'react';
import { FilterState } from '../types';
import { Search } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  owners: string[];
  onReset: () => void;
  isOpen: boolean;
  loading?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters, owners, onReset, isOpen, loading }) => {
  if (!isOpen) return null;

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

  const skeletonClass = "h-[48px] w-full bg-base-300 rounded animate-pulse";

  return (
    <div className="card bg-base-100 shadow-sm mb-6 border border-base-200">
      <div className="card-body p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm uppercase tracking-wider opacity-70">Advanced Filters</h3>
          <button 
            onClick={onReset} 
            disabled={loading}
            className="btn btn-link btn-xs no-underline text-info hover:no-underline hover:opacity-80"
          >
            Reset All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Global Search */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4">
            {loading ? (
              <div className={skeletonClass} />
            ) : (
              <label className="input input-bordered flex items-center gap-2 w-full">
                <Search className="w-4 h-4 opacity-50" />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleInputChange}
                  className="grow"
                  placeholder="Search by plate, driver, bond #, or owner..."
                />
              </label>
            )}
          </div>

          {/* Date Range */}
          <div>
            <div className="label pt-0 pb-1">
              <span className="label-text text-xs font-medium">Loading Date Range</span>
            </div>
            <div className="flex gap-2">
              {loading ? (
                <>
                  <div className={skeletonClass} />
                  <div className={skeletonClass} />
                </>
              ) : (
                <>
                  <input
                    type="date"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleInputChange}
                    className="input input-bordered w-full text-sm"
                  />
                  <input
                    type="date"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleInputChange}
                    className="input input-bordered w-full text-sm"
                  />
                </>
              )}
            </div>
          </div>

          {/* Plate Number */}
          <div>
            <div className="label pt-0 pb-1">
              <span className="label-text text-xs font-medium">Plate Number</span>
            </div>
            {loading ? (
              <div className={skeletonClass} />
            ) : (
              <input
                type="text"
                name="plateNumber"
                value={filters.plateNumber}
                onChange={handleInputChange}
                placeholder="e.g. AB-123-CD"
                className="input input-bordered w-full"
              />
            )}
          </div>

          {/* Weight Range */}
          <div>
            <div className="label pt-0 pb-1">
              <span className="label-text text-xs font-medium">Weight (kg)</span>
            </div>
            <div className="flex gap-2">
              {loading ? (
                <>
                  <div className={skeletonClass} />
                  <div className={skeletonClass} />
                </>
              ) : (
                <>
                  <input
                    type="number"
                    name="weightMin"
                    placeholder="Min"
                    value={filters.weightMin}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                  />
                  <input
                    type="number"
                    name="weightMax"
                    placeholder="Max"
                    value={filters.weightMax}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                  />
                </>
              )}
            </div>
          </div>
          
          {/* Truck Owners */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4">
            <div className="label pt-0 pb-1">
              <span className="label-text text-xs font-medium">Truck Owners</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {loading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                   <div key={i} className="h-8 w-20 bg-base-300 rounded-full animate-pulse" />
                 ))
              ) : (
                owners.map(owner => (
                  <button
                    key={owner}
                    onClick={() => toggleTruckOwner(owner)}
                    className={`btn btn-sm rounded-full ${
                      filters.truckOwners.includes(owner)
                        ? 'btn-primary'
                        : 'btn-ghost border-base-300 bg-base-100'
                    }`}
                  >
                    {owner}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;