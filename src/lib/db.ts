import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_POSTGRES_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

let isConnected = false;
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Present' : 'Missing');

export async function checkConnection() {
  try {
    if (isConnected) return true;

    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .limit(1);

    if (error) throw error;
    
    isConnected = true;
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export async function getMessages() {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    return [];
  }
}

export async function saveMessage({ text, isBot }: { text: string; isBot: boolean }) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ text, isBot }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error saving message:', error);
    return null;
  }
}