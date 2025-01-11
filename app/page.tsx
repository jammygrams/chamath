'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Prediction from '../components/Prediction'
import Header from '../components/Header'

interface PredictionData {
  id: number
  content: string
  source: string
  true_votes: number
  false_votes: number
  evaluation_date: string
  prediction_date: string
}

export default function Home() {
  const [predictions, setPredictions] = useState<PredictionData[]>([])

  useEffect(() => {
    fetchPredictions()
    const subscription = supabase
      .channel('public:predictions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'predictions' }, fetchPredictions)
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchPredictions = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_vote_counts')

      if (error) {
        console.error('Error fetching predictions:', error)
        return
      }

      console.log('Fetched predictions:', data.map((p: PredictionData) => p.id))
      setPredictions(data)
    } catch (err) {
      console.error('Unexpected error:', err)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header predictions={predictions} />
      {predictions.length === 0 && <p>Loading predictions...</p>}
      <div className="w-full">
        <div className="grid grid-cols-12 gap-4 mb-4 font-semibold text-sm text-gray-600 px-4">
          <div className="col-span-8">Chamath predicts...</div>
          <div className="col-span-2">Results</div>
          <div className="col-span-2">Vote</div>
        </div>
        {predictions.map(prediction => (
          <Prediction
            key={prediction.id}
            id={prediction.id}
            content={prediction.content}
            source={prediction.source}
            true_votes={prediction.true_votes}
            false_votes={prediction.false_votes}
            evaluation_date={prediction.evaluation_date}
            prediction_date={prediction.prediction_date}
          />
        ))}
      </div>
    </div>
  )
}

