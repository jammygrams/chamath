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
  const [userVotes, setUserVotes] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchPredictions()
    const subscription = supabase
      .channel('public:predictions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, fetchPredictions)
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const fetchUserVotes = async () => {
      const visitorId = await getFingerprint()
      const { data } = await supabase
        .from('votes')
        .select('prediction_id, vote')
        .eq('fingerprint', visitorId)

      if (data) {
        const votesMap = data.reduce((acc, vote) => ({
          ...acc,
          [vote.prediction_id]: vote.vote
        }), {})
        setUserVotes(votesMap)
      }
    }

    fetchUserVotes()
  }, [])

  const fetchPredictions = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_vote_counts')

      if (error) {
        console.error('Error fetching predictions:', error)
        return
      }

      console.log('Fetched predictions:', data.length)
      setPredictions(data)
    } catch (err) {
      console.error('Unexpected error:', err)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <Header predictions={predictions} />
      {predictions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-4"></div>
          <p className="text-gray-400">Loading predictions...</p>
        </div>
      ) : (
        <div className="w-full">
          <div className="grid grid-cols-12 gap-4 font-semibold text-base text-gray-400 px-4 border-b border-gray-700 pb-3">
            <div className="col-span-8">Chamath predicted...</div>
            <div className="col-span-2">Vote</div>
            <div className="col-span-2">Results</div>
          </div>
          {predictions.map((prediction, index) => (
            <Prediction
              key={prediction.id}
              id={prediction.id}
              index={index}
              content={prediction.content}
              source={prediction.source}
              true_votes={prediction.true_votes}
              false_votes={prediction.false_votes}
              evaluation_date={prediction.evaluation_date}
              prediction_date={prediction.prediction_date}
              userVote={userVotes[prediction.id]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

