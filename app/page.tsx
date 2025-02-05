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
  decision: boolean | null
  category: string
}

export default function Home() {
  const [predictions, setPredictions] = useState<PredictionData[]>([])
  const [userVotes, setUserVotes] = useState<Record<number, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({})
  const [activeTab, setActiveTab] = useState<'all' | 'business' | 'politics'>('all')

  const fetchLatestData = async () => {
    try {
      const [predictionsResult, commentCountsResult, visitorId] = await Promise.all([
        supabase.rpc('get_vote_counts'),
        supabase.rpc('get_comment_counts'),
        getFingerprint()
      ])

      if (predictionsResult.data) {
        console.log('Vote counts updated')
        setPredictions(predictionsResult.data)
      }

      if (commentCountsResult.data) {
        const counts = Object.fromEntries(
          commentCountsResult.data.map(({ prediction_id, count }: { prediction_id: number; count: number }) => [prediction_id, count])
        )
        setCommentCounts(counts)
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

  const filteredPredictions = predictions.filter(prediction => 
    activeTab === 'all' || prediction.category.toLowerCase() === activeTab
  )

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
      <div className="flex-grow">
        <Header predictions={predictions} />
        {isLoading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">
              Here&apos;s what he predicted...
            </h2>
            <p className="text-gray-400 mb-6">
              Vote or contribute evidence to settle whether his prediction came true or not
            </p>

            <div className="flex gap-1 mb-8 border-b border-gray-700">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-2 rounded-t-lg ${
                  activeTab === 'all' 
                    ? 'bg-gray-800 text-white border-t border-l border-r border-gray-700' 
                    : 'bg-gray-900 text-gray-400 hover:text-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('business')}
                className={`px-6 py-2 rounded-t-lg ${
                  activeTab === 'business' 
                    ? 'bg-gray-800 text-white border-t border-l border-r border-gray-700' 
                    : 'bg-gray-900 text-gray-400 hover:text-gray-300'
                }`}
              >
                💼 Business
              </button>
              <button
                onClick={() => setActiveTab('politics')}
                className={`px-6 py-2 rounded-t-lg ${
                  activeTab === 'politics' 
                    ? 'bg-gray-800 text-white border-t border-l border-r border-gray-700' 
                    : 'bg-gray-900 text-gray-400 hover:text-gray-300'
                }`}
              >
                👑 Politics 
              </button>
            </div>

            <div className="space-y-6">
              {filteredPredictions.map((prediction) => (
                <Prediction
                  key={prediction.id}
                  id={prediction.id}
                  content={prediction.content}
                  source={prediction.source}
                  true_votes={prediction.true_votes}
                  false_votes={prediction.false_votes}
                  evaluation_date={prediction.evaluation_date}
                  prediction_date={prediction.prediction_date}
                  userVote={userVotes[prediction.id]}
                  decision={prediction.decision}
                  commentCount={commentCounts[prediction.id] || 0}
                  category={prediction.category}
                />
              ))}
            </div>
          </>
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

