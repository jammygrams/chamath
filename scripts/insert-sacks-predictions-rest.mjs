// Script to insert Sacks' 2023 predictions using the Supabase REST API
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Supabase API details
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
    // Insert predictions one by one to avoid potential issues
    for (const prediction of sacksPredictions) {
      const response = await fetch(`${supabaseUrl}/rest/v1/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(prediction)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error inserting prediction "${prediction.content}":`, errorData);
        continue;
      }
      
      // Successfully inserted
      console.log(`Successfully inserted prediction: "${prediction.content}"`);
    }
    
    console.log('Finished processing all predictions');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

insertPredictions(); 