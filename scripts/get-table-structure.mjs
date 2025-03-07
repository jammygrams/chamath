// Script to fetch the structure of the predictions table
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getTableStructure() {
  try {
    // Fetch a single row to see the structure
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching table structure:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Table structure:');
      console.log(Object.keys(data[0]));
      console.log('\nSample data:');
      console.log(data[0]);
    } else {
      console.log('No data found in the predictions table');
      
      // Try to get the table definition using RPC if available
      const { data: definition, error: defError } = await supabase.rpc('get_table_definition', {
        table_name: 'predictions'
      });
      
      if (defError) {
        console.error('Error fetching table definition:', defError);
      } else if (definition) {
        console.log('Table definition:', definition);
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

getTableStructure(); 