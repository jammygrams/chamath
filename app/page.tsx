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
  const [isLoading, setIsLoading] = useState(true)

  const fetchLatestData = async () => {
    try {
      const [predictionsResult, visitorId] = await Promise.all([
        supabase.rpc('get_vote_counts'),
        getFingerprint()
      ])

      if (predictionsResult.data) {
        console.log('Vote counts updated')
        setPredictions(predictionsResult.data)
      }

      const votesResult = await supabase
        .from('votes')
        .select('prediction_id, vote')
        .eq('fingerprint', visitorId)

      if (votesResult.data) {
          const votesMap = votesResult.data.reduce((acc: Record<number, boolean>, vote: { prediction_id: number; vote: boolean }) => ({
          ...acc,
          [vote.prediction_id]: vote.vote
        }), {})
        console.log('Updating user votes:', Object.keys(votesMap).length)
        setUserVotes(votesMap)
      }
    } catch (err) {
      console.error('Error fetching latest data:', err)
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      await fetchLatestData()
      setIsLoading(false)
    }

    loadInitialData()
    
    const subscription = supabase
      .channel('public:votes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        (payload) => {
          console.log('Vote change detected:', payload)
          fetchLatestData()
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    console.log('Subscription set up for votes table')

    return () => {
      console.log('Unsubscribing from votes table')
      subscription.unsubscribe()
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
      <div className="flex-grow">
        <Header predictions={predictions} />
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-4"></div>
            <p className="text-gray-400">Loading predictions...</p>
          </div>
        ) : (
          <div className="w-full space-y-4">
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
      
      <footer className="text-center text-gray-400 text-sm py-8">
        <div className="flex justify-center items-center gap-4">
          <a 
            href="https://github.com/jammygrams/chamath" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-gray-300"
          >
            GitHub ↗
          </a>
          <span>•</span>
          <a 
            href="mailto:jmahbubani@gmail.com"
            className="hover:text-gray-300"
          >
            Contact
          </a>
        </div>
      </footer>
    </div>
  )
}

