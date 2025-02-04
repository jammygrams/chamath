'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { getFingerprint } from '../lib/fingerprint'
import { LinkIcon } from '@heroicons/react/24/outline'
import Comments from './Comments'

interface PredictionProps {
  id: number
  content: string
  source: string
  true_votes: number
  false_votes: number
  evaluation_date: string
  prediction_date: string
  userVote?: boolean
  decision: boolean | null
  commentCount: number
}

export default function Prediction({ id, content, source, true_votes, false_votes, evaluation_date, prediction_date, userVote: initialUserVote, decision, commentCount }: PredictionProps) {
  const [userVote, setUserVote] = useState<boolean | null>(initialUserVote ?? null)

  const handleVote = async (vote: boolean) => {
    const fingerprint = await getFingerprint()
    if (!fingerprint) return

    // If clicking the same vote again, remove it
    const isRemovingVote = vote === userVote

    const { error } = await supabase
      .rpc('handle_vote', {
        p_prediction_id: id,
        p_fingerprint: fingerprint,
        p_vote: isRemovingVote ? null : vote
      })

    if (!error) {
      setUserVote(isRemovingVote ? null : vote)
    }
  }

  const totalVotes = true_votes + false_votes
  const truePercentage = totalVotes > 0 ? (true_votes / totalVotes) * 100 : 0

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
      <div className="mb-4">
        <p className="text-lg text-gray-100 mb-2">
          {content}{' '}
          <a href={source} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-300 inline-flex">
            <LinkIcon className="w-4 h-4" />
          </a>
        </p>
        <div className="text-sm text-gray-500">
          Predicted in {new Date(prediction_date).getFullYear()}, 
          to come true in {new Date(evaluation_date).getFullYear()}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {decision !== null ? (
          <div className="text-center w-full">
            <div className={`text-xl font-bold ${decision ? 'text-green-400' : 'text-red-400'}`}>
              {decision ? 'True' : 'False'}
            </div>
            <div className="text-sm text-gray-400">
              Conclusive evidence
            </div>
          </div>
        ) : (
          <>
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
                  totalVotes === 0 
                    ? 'text-gray-500' 
                    : truePercentage >= 50 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {totalVotes === 0 ? '-' : `${truePercentage.toFixed(0)}%`}
                </div>
                <div className="text-sm text-gray-400">
                  {totalVotes} votes
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Comments 
        predictionId={id} 
        initialCommentCount={commentCount} 
      />
    </div>
  )
}

