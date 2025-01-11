'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { getFingerprint } from '../lib/fingerprint'

interface PredictionProps {
  id: number
  index: number
  content: string
  source: string
  true_votes: number
  false_votes: number
  evaluation_date: string
  prediction_date: string
  userVote?: boolean
}

export default function Prediction({ id, index, content, source, true_votes, false_votes, evaluation_date, prediction_date, userVote: initialUserVote }: PredictionProps) {
  const [userVote, setUserVote] = useState<boolean | null>(initialUserVote ?? null)
  const [localTrueVotes, setLocalTrueVotes] = useState(true_votes)
  const [localFalseVotes, setLocalFalseVotes] = useState(false_votes)

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
    <div className={`
      grid grid-cols-12 gap-4 items-center px-4 py-3
      hover:bg-gray-700/20
      ${index % 2 === 0 ? 'bg-gray-800/40' : ''}
      border-b border-gray-700
    `}>
      <div className="col-span-8">
        <div>{content}</div>
        <div className="flex gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
          <a
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400 underline"
          >
            Predicted in {prediction_date ? new Date(prediction_date).getFullYear() : 'TBD'}
          </a>
          <span>To come true in {evaluation_date ? new Date(evaluation_date).getFullYear() : 'TBD'}</span>
        </div>
      </div>
      <div className="col-span-2 flex gap-2">
        <button
          onClick={() => handleVote(true)}
          className={`px-3 py-1 rounded text-sm transition-all ${
            userVote !== null 
              ? userVote === true 
                ? 'opacity-100 border border-gray-400 dark:border-gray-600' 
                : 'opacity-40'
              : 'hover:bg-gray-800/40'
          }`}
        >
          ✅
        </button>
        <button
          onClick={() => handleVote(false)}
          className={`px-3 py-1 rounded text-sm transition-all ${
            userVote !== null 
              ? userVote === false 
                ? 'opacity-100 border border-gray-400 dark:border-gray-600' 
                : 'opacity-40'
              : 'hover:bg-gray-800/40'
          }`}
        >
          ❌
        </button>
      </div>
      <div className="col-span-2">
        <span className={`text-lg font-semibold ${
          truePercentage >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {truePercentage.toFixed(0)}%
        </span>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {totalVotes} votes
        </div>
      </div>
    </div>
  )
}

