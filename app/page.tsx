'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Prediction from '../components/Prediction'
import Header from '../components/Header'
import { getFingerprint } from '../lib/fingerprint'

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
  const [error, setError] = useState<string | null>(null)

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
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {predictions.length === 0 && !error && <p>Loading predictions...</p>}
      <div className="w-full">
        <div className="grid grid-cols-12 gap-4 mb-4 font-semibold text-sm text-gray-600 px-4">
          <div className="col-span-5">Chamath predicts...</div>
          <div className="col-span-1">Predicted in</div>
          <div className="col-span-1">To come true in</div>
          <div className="col-span-3">Results</div>
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

