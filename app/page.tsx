'use client'

import { useEffect, useState, useMemo } from 'react'
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

interface Evidence {
  id: number
  prediction_id: number
  evidence_date: string
  evidence: string
}

export default function Home() {
  const [predictions, setPredictions] = useState<PredictionData[]>([])
  const [userVotes, setUserVotes] = useState<Record<number, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'business' | 'politics'>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [evidenceMap, setEvidenceMap] = useState<Record<number, Evidence[]>>({})

  const years = useMemo(() => {
    const uniqueYears = new Set(predictions.map(p => 
      new Date(p.evaluation_date).getFullYear()
    ))
    return ['all', ...Array.from(uniqueYears).sort()]
  }, [predictions])

  const fetchLatestData = async () => {
    try {
      const [predictionsResult, evidenceResult] = await Promise.all([
        supabase.from('predictions').select('*').order('evaluation_date', { ascending: true }),
        supabase.from('evidence').select('*').order('evidence_date', { ascending: true })
      ])

      console.log('Evidence result:', evidenceResult)
      console.log('Predictions result:', predictionsResult)

      if (predictionsResult.data) {
        setPredictions(predictionsResult.data)
      }

      if (evidenceResult.data) {
        const evidenceByPrediction = evidenceResult.data.reduce((acc, evidence) => {
          acc[evidence.prediction_id] = acc[evidence.prediction_id] || []
          acc[evidence.prediction_id].push(evidence)
          return acc
        }, {} as Record<number, Evidence[]>)
        console.log('Evidence map:', evidenceByPrediction)
        setEvidenceMap(evidenceByPrediction)
      }
      
      setIsLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLatestData()
  }, [])

  const filteredPredictions = predictions.filter(prediction => 
    (activeTab === 'all' || prediction.category.toLowerCase() === activeTab) &&
    (selectedYear === 'all' || new Date(prediction.evaluation_date).getFullYear().toString() === selectedYear)
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

            <div className="flex justify-between items-center mb-8 border-b border-gray-700">
              <div className="flex gap-1">
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
              
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border border-gray-700"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year === 'all' ? 'All Years' : year}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-6">
              {filteredPredictions.map((prediction) => (
                <Prediction
                  key={prediction.id}
                  id={prediction.id}
                  content={prediction.content}
                  source={prediction.source}
                  evaluation_date={prediction.evaluation_date}
                  prediction_date={prediction.prediction_date}
                  decision={prediction.decision}
                  category={prediction.category}
                  evidence={evidenceMap[prediction.id] || []}
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

