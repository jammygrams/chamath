// Script to disable RLS for the predictions table
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function disableRLS() {
  try {
    // Note: This won't work with the anon key, but we'll try anyway
    // Normally you would need the service role key or direct database access
    const { data, error } = await supabase.rpc('disable_rls_for_predictions');
    
    if (error) {
      console.error('Error disabling RLS:', error);
      console.log('\nAlternative approach:');
      console.log('1. Go to the Supabase dashboard');
      console.log('2. Navigate to the SQL editor');
      console.log('3. Run the following SQL:');
      console.log('   ALTER TABLE predictions DISABLE ROW LEVEL SECURITY;');
      return;
    }
    
    console.log('Successfully disabled RLS for predictions table:', data);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

disableRLS(); 