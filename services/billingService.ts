
import { supabase } from './supabaseClient';
import { Billing } from '../types';

export const billingService = {
  async createBilling(
    billingData: Omit<Billing, 'id' | 'created_at' | 'status'>,
    deliveryIds: number[]
  ): Promise<Billing> {
    // 1. Create the Billing record
    const { data: billing, error: billingError } = await supabase
      .from('billings')
      .insert([{
        ...billingData,
        status: 'pending'
      }])
      .select()
      .single();

    if (billingError) throw billingError;

    // 2. Update Deliveries with the new billing_id
    const { error: updateError } = await supabase
      .from('deliveries')
      .update({ billing_id: billing.id })
      .in('id', deliveryIds);

    if (updateError) {
      // If linking fails, we might want to delete the created billing or throw error
      // For now, throwing error
      throw updateError;
    }

    return billing;
  },

  async fetchBillings(): Promise<Billing[]> {
    const { data, error } = await supabase
      .from('billings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
