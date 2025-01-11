'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getFingerprint } from '../lib/fingerprint'

interface PredictionProps {
  id: number
  content: string
  source: string
  true_votes: number
  false_votes: number
  evaluation_date: string
  prediction_date: string
}

export default function Prediction({ id, content, source, true_votes, false_votes, evaluation_date, prediction_date }: PredictionProps) {
  const [userVote, setUserVote] = useState<boolean | null>(null)
  const [fingerprint, setFingerprint] = useState<string | null>(null)
  const [localTrueVotes, setLocalTrueVotes] = useState(true_votes)
  const [localFalseVotes, setLocalFalseVotes] = useState(false_votes)

  useEffect(() => {
    getFingerprint().then(visitorId => {
      setFingerprint(visitorId)
      checkUserVote(visitorId)
    })
  }, [id])

  const checkUserVote = async (visitorId: string) => {
    const { data } = await supabase
      .from('votes')
      .select('vote')
      .eq('prediction_id', id)
      .eq('fingerprint', visitorId)
      .single()

    if (data) {
      setUserVote(data.vote)
    }
  }

  const handleVote = async (vote: boolean) => {
    const fingerprint = await getFingerprint()
    if (!fingerprint) return

    const { error } = await supabase
      .rpc('handle_vote', {
        p_prediction_id: id,
        p_fingerprint: fingerprint,
        p_vote: vote
      })

    if (!error) {
      if (userVote !== null) {
        if (userVote) {
          setLocalTrueVotes(prev => prev - 1)
        } else {
          setLocalFalseVotes(prev => prev - 1)
        }
      }
      
      setUserVote(vote)
      if (vote) {
        setLocalTrueVotes(prev => prev + 1)
      } else {
        setLocalFalseVotes(prev => prev + 1)
      }
    }
  }

  const totalVotes = localTrueVotes + localFalseVotes
  const truePercentage = totalVotes > 0 ? (localTrueVotes / totalVotes) * 100 : 0

  return (
    <div className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-gray-50">
      <div className="col-span-5">{content}</div>
      <div className="col-span-1">
        <a
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          {prediction_date ? new Date(prediction_date).getFullYear() : 'TBD'}
        </a>
      </div>
      <div className="col-span-1 text-sm text-gray-600">
        {evaluation_date ? new Date(evaluation_date).getFullYear() : 'TBD'}
      </div>
      <div className="col-span-3">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600"
            style={{ width: `${truePercentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {totalVotes} votes | {truePercentage.toFixed(1)}% true
        </div>
      </div>
      <div className="col-span-2 flex gap-2">
        <button
          onClick={() => handleVote(true)}
          className={`px-3 py-1 rounded text-sm transition-all ${
            userVote !== null 
              ? userVote === true 
                ? 'opacity-100 border border-gray-400' 
                : 'opacity-40'
              : 'hover:bg-gray-50'
          }`}
        >
          ✅
        </button>
        <button
          onClick={() => handleVote(false)}
          className={`px-3 py-1 rounded text-sm transition-all ${
            userVote !== null 
              ? userVote === false 
                ? 'opacity-100 border border-gray-400' 
                : 'opacity-40'
              : 'hover:bg-gray-50'
          }`}
        >
          ❌
        </button>
      </div>
    </div>
  )
}

