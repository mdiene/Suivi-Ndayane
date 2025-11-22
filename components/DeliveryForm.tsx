import React, { useState, useEffect } from 'react';
import { Delivery, DeliveryFormData } from '../types';
import { TRUCK_TYPES } from '../constants';
import { X, Save, Loader2, Trash2 } from 'lucide-react';

interface DeliveryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DeliveryFormData) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  initialData?: Delivery | null;
  availableOwners: string[];
}

const initialFormState: DeliveryFormData = {
  truck_immatriculation: '',
  driver_names: '',
  loading_date: '',
  unloading_date: '',
  weight_loaded: 0,
  delivery_bond_number: '',
  truck_owner: '',
  truck_type: 'Semi-Truck',
};

const DeliveryForm: React.FC<DeliveryFormProps> = ({ isOpen, onClose, onSubmit, onDelete, initialData, availableOwners }) => {
  const [formData, setFormData] = useState<DeliveryFormData>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        truck_immatriculation: initialData.truck_immatriculation,
        driver_names: initialData.driver_names,
        loading_date: initialData.loading_date,
        unloading_date: initialData.unloading_date,
        weight_loaded: initialData.weight_loaded,
        delivery_bond_number: initialData.delivery_bond_number,
        truck_owner: initialData.truck_owner,
        truck_type: initialData.truck_type,
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof DeliveryFormData, string>> = {};
    let isValid = true;

    if (!formData.truck_immatriculation.trim() || formData.truck_immatriculation.length > 20) {
      newErrors.truck_immatriculation = "Required (max 20 chars)";
      isValid = false;
    }
    if (!formData.driver_names.trim() || formData.driver_names.length < 3) {
      newErrors.driver_names = "Required (min 3 chars)";
      isValid = false;
    }
    if (!formData.loading_date) {
      newErrors.loading_date = "Required";
      isValid = false;
    }
    
    if (!formData.unloading_date) {
      newErrors.unloading_date = "Required";
      isValid = false;
    } else if (formData.loading_date && new Date(formData.unloading_date) < new Date(formData.loading_date)) {
      newErrors.unloading_date = "Must be on/after loading date";
      isValid = false;
    }

    if (formData.weight_loaded <= 0 || formData.weight_loaded > 100000) {
      newErrors.weight_loaded = "1-100,000 kg";
      isValid = false;
    }
    if (!formData.delivery_bond_number.trim()) {
      newErrors.delivery_bond_number = "Required";
      isValid = false;
    }
    if (!formData.truck_owner.trim()) {
      newErrors.truck_owner = "Required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error(err);
      // Handle API errors (e.g., duplicate bond number)
      setErrors(prev => ({ ...prev, delivery_bond_number: "Error saving. ID might exist." }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weight_loaded' ? parseFloat(value) || 0 : value
    }));
    // Clear error for field when edited
    if (errors[name as keyof DeliveryFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl p-0 bg-base-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-base-200 bg-base-200/50">
          <h3 className="font-bold text-lg">
            {initialData ? 'Edit Delivery' : 'New Delivery'}
          </h3>
          <button onClick={onClose} className="btn btn-circle btn-ghost btn-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Truck Immatriculation */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Plate Number</span>
              </label>
              <input
                type="text"
                name="truck_immatriculation"
                value={formData.truck_immatriculation}
                onChange={handleChange}
                className={`input input-bordered w-full ${errors.truck_immatriculation ? 'input-error' : ''}`}
              />
              {errors.truck_immatriculation && <span className="text-error text-xs mt-1">{errors.truck_immatriculation}</span>}
            </div>

            {/* Truck Type */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Truck Type</span>
              </label>
              <select
                name="truck_type"
                value={formData.truck_type}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                {TRUCK_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Driver Names */}
            <div className="form-control w-full md:col-span-2">
              <label className="label">
                <span className="label-text">Driver Name(s)</span>
              </label>
              <input
                type="text"
                name="driver_names"
                value={formData.driver_names}
                onChange={handleChange}
                className={`input input-bordered w-full ${errors.driver_names ? 'input-error' : ''}`}
              />
              {errors.driver_names && <span className="text-error text-xs mt-1">{errors.driver_names}</span>}
            </div>

            {/* Loading Date */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Loading Date</span>
              </label>
              <input
                type="date"
                name="loading_date"
                value={formData.loading_date}
                onChange={handleChange}
                className={`input input-bordered w-full ${errors.loading_date ? 'input-error' : ''}`}
              />
              {errors.loading_date && <span className="text-error text-xs mt-1">{errors.loading_date}</span>}
            </div>

            {/* Unloading Date */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Unloading Date</span>
              </label>
              <input
                type="date"
                name="unloading_date"
                value={formData.unloading_date}
                onChange={handleChange}
                className={`input input-bordered w-full ${errors.unloading_date ? 'input-error' : ''}`}
              />
              {errors.unloading_date && <span className="text-error text-xs mt-1">{errors.unloading_date}</span>}
            </div>

            {/* Weight */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Weight Loaded (kg)</span>
              </label>
              <input
                type="number"
                name="weight_loaded"
                value={formData.weight_loaded === 0 ? '' : formData.weight_loaded}
                onChange={handleChange}
                className={`input input-bordered w-full ${errors.weight_loaded ? 'input-error' : ''}`}
              />
              {errors.weight_loaded && <span className="text-error text-xs mt-1">{errors.weight_loaded}</span>}
            </div>

            {/* Bond Number */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Bond Number</span>
              </label>
              <input
                type="text"
                name="delivery_bond_number"
                value={formData.delivery_bond_number}
                onChange={handleChange}
                className={`input input-bordered w-full ${errors.delivery_bond_number ? 'input-error' : ''}`}
              />
              {errors.delivery_bond_number && <span className="text-error text-xs mt-1">{errors.delivery_bond_number}</span>}
            </div>

            {/* Truck Owner */}
            <div className="form-control w-full md:col-span-2">
              <label className="label">
                <span className="label-text">Truck Owner</span>
              </label>
              <input
                type="text"
                name="truck_owner"
                list="owners-list"
                value={formData.truck_owner}
                onChange={handleChange}
                className={`input input-bordered w-full ${errors.truck_owner ? 'input-error' : ''}`}
                placeholder="Select or type owner name"
                autoComplete="off"
              />
              <datalist id="owners-list">
                {availableOwners.map(owner => (
                  <option key={owner} value={owner} />
                ))}
              </datalist>
              {errors.truck_owner && <span className="text-error text-xs mt-1">{errors.truck_owner}</span>}
            </div>
          </div>

          <div className="modal-action justify-between mt-6">
             {initialData && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(initialData.id)}
                className="btn btn-error btn-outline gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            ) : (
              <div></div> 
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {initialData ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default DeliveryForm;