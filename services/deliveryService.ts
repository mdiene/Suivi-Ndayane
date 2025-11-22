
import { supabase } from './supabaseClient';
import { Delivery, DeliveryFormData } from '../types';

export const deliveryService = {
  async fetchDeliveries(): Promise<Delivery[]> {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*, delivery_expenses(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createDelivery(delivery: DeliveryFormData): Promise<Delivery> {
    const { data, error } = await supabase
      .from('deliveries')
      .insert([delivery])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateDelivery(id: number, delivery: DeliveryFormData): Promise<Delivery> {
    const { data, error } = await supabase
      .from('deliveries')
      .update(delivery)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteDelivery(id: number): Promise<void> {
    const { error } = await supabase
      .from('deliveries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
