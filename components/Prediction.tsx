'use client'

import { LinkIcon } from '@heroicons/react/24/outline'
import Comments from './Comments'

interface PredictionProps {
  id: number
  content: string
  source: string
  evaluation_date: string
  prediction_date: string
  decision: boolean | null
  person_id: number
}

export default function Prediction({ 
  id, 
  content, 
  source,
  evaluation_date,
  prediction_date,
  decision,
}: PredictionProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="mb-4">
        <p className="text-lg text-gray-100 mb-2">
          {content}{' '}
          <a href={source} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-300 inline-flex">
            <LinkIcon className="w-4 h-4" />
          </a>
        </p>
        <div className="text-sm text-gray-400">
          Predicted: {new Date(prediction_date).getFullYear()}
          {evaluation_date && ` • Due: ${new Date(evaluation_date).getFullYear()}`}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
        <div className="text-center w-full">
          <div className={`text-xl font-bold ${
            decision === true ? 'text-green-400' : 
            decision === false ? 'text-red-400' : 
            'text-gray-400'
          }`}>
            {decision === true ? 'True' : 
             decision === false ? 'False' : 
             'Unclear'}
          </div>
        </div>
      </div>

      <Comments predictionId={id} />
    </div>
  )
}

