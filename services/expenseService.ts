
import { supabase } from './supabaseClient';
import { DeliveryExpense } from '../types';

export const expenseService = {
  async upsertExpense(expense: Partial<DeliveryExpense>): Promise<DeliveryExpense> {
    // We use upsert based on delivery_id (assuming 1:1 relationship or unique constraint on delivery_id)
    // If your table uses 'id' as PK and doesn't enforce unique delivery_id, logic might differ.
    // Ideally, use onConflict: 'delivery_id' if you set that unique constraint in SQL.
    
    const { data, error } = await supabase
      .from('delivery_expenses')
      .upsert(expense, { onConflict: 'delivery_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
