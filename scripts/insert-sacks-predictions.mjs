// Script to insert Sacks' 2023 predictions into the Supabase database
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Initialize Supabase client with service role key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key if available, otherwise fall back to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Sacks' predictions for 2023
const sacksPredictions = [
  {
    content: "Ron DeSantis will be the biggest political winner in 2023.",
    category: "politics",
    prediction_date: "2023-01-01", // Assuming prediction was made at the start of 2023
    evaluation_date: "2023-12-31", // Evaluation at the end of 2023
    source: "", // Add source URL if available
    decision: null, // null = unclear, true = correct, false = incorrect
    person_id: 2 // Sacks has ID 2 according to the people table
  },
  {
    content: "Nancy Pelosi will be the biggest political loser in 2023.",
    category: "politics",
    prediction_date: "2023-01-01",
    evaluation_date: "2023-12-31",
    source: "",
    decision: null,
    person_id: 2
  },
  {
    content: "Rise of the Rest will be the biggest winner in business in 2023.",
    category: "business",
    prediction_date: "2023-01-01",
    evaluation_date: "2023-12-31",
    source: "",
    decision: null,
    person_id: 2
  },
  {
    content: "Beneficiaries of government pumps will be the biggest loser in business in 2023.",
    category: "business",
    prediction_date: "2023-01-01",
    evaluation_date: "2023-12-31",
    source: "",
    decision: null,
    person_id: 2
  },
  {
    content: "Strange new respect for Bill Clinton will be the most contrarian belief in 2023.",
    category: "politics",
    prediction_date: "2023-01-01",
    evaluation_date: "2023-12-31",
    source: "",
    decision: null,
    person_id: 2
  },
  {
    content: "Series A Venture will be the best-performing asset in 2023.",
    category: "business",
    prediction_date: "2023-01-01",
    evaluation_date: "2023-12-31",
    source: "",
    decision: null,
    person_id: 2
  }
];

async function insertPredictions() {
  try {
    console.log('Using Supabase URL:', supabaseUrl);
    console.log('Using service role key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    const { data, error } = await supabase
      .from('predictions')
      .insert(sacksPredictions)
      .select();
    
    if (error) {
      console.error('Error inserting predictions:', error);
      return;
    }
    
    console.log('Successfully inserted predictions:', data);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

insertPredictions(); 