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
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
      <div className="mb-4">
        <p className="text-lg text-gray-100 mb-2">{content}</p>
        <p className="text-sm text-gray-400">
          <a href={source} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
            source ↗
          </a>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Predicted in {new Date(prediction_date).getFullYear()}, 
          to come true in {new Date(evaluation_date).getFullYear()}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleVote(true)}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-medium ${
              userVote === true
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            True
          </button>
          <button
            onClick={() => handleVote(false)}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-medium ${
              userVote === false
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            False
          </button>
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          <div className="text-center">
            <div className={`text-xl font-bold mb-1 ${
              truePercentage >= 50 ? 'text-green-400' : 'text-red-400'
            }`}>
              {truePercentage.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-400">
              {totalVotes} votes
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

