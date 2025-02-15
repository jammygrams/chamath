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
  evaluation_date: string
  prediction_date: string
  decision: boolean | null
  category: string
  evidence: Evidence[]
}

export default function Prediction({ 
  id, 
  content, 
  source,
  evaluation_date,
  prediction_date,
  decision,
  category,
  evidence
}: PredictionProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="mb-4">
        <p className="text-lg text-gray-100 mb-2">
          {category.toLowerCase() === 'business' ? '💼 ' : '👑 '}
          {content}{' '}
          <a href={source} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-300 inline-flex">
            <LinkIcon className="w-4 h-4" />
          </a>
        </p>
        <div className="text-sm text-gray-400">
          Predicted: {new Date(prediction_date).toLocaleDateString()}
          {evaluation_date && ` • Due: ${new Date(evaluation_date).toLocaleDateString()}`}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="text-center w-full">
          <div className={`text-xl font-bold ${
            decision === true ? 'text-green-400' : 
            decision === false ? 'text-red-400' : 
            'text-gray-400'
          }`}>
            {decision === true ? 'True' : 
             decision === false ? 'False' : 
             'Undecided'}
          </div>
        </div>
      </div>

      {evidence.length > 0 && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          <div className="text-sm font-medium text-gray-300 mb-2">Evidence:</div>
          <div className="space-y-2">
            {evidence.map((e) => (
              <div key={e.id} className="text-sm">
                <a 
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  {e.title}
                </a>
                <span className="text-gray-500 ml-2">
                  {new Date(e.evidence_date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Comments predictionId={id} />
    </div>
  )
}

