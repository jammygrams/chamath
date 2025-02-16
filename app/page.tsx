'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import Prediction from '../components/Prediction'
import Header from '../components/Header'
import { Evidence } from '@/types'

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
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'business' | 'politics'>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedDecision, setSelectedDecision] = useState<'all' | 'true' | 'false' | 'unclear'>('all')
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

      if (predictionsResult.data) {
        setPredictions(predictionsResult.data)
      }

      if (evidenceResult.data) {
        const evidenceByPrediction = evidenceResult.data.reduce((acc, evidence) => {
          acc[evidence.prediction_id] = acc[evidence.prediction_id] || []
          acc[evidence.prediction_id].push(evidence)
          return acc
        }, {} as Record<number, Evidence[]>)
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

  const filteredPredictions = predictions
    .filter(prediction => 
      (activeTab === 'all' || prediction.category.toLowerCase() === activeTab) &&
      (selectedYear === 'all' || new Date(prediction.evaluation_date).getFullYear().toString() === selectedYear) &&
      (selectedDecision === 'all' || 
       (selectedDecision === 'true' && prediction.decision === true) ||
       (selectedDecision === 'false' && prediction.decision === false) ||
       (selectedDecision === 'unclear' && prediction.decision === null))
    )
    .sort((a, b) => {
      // Convert boolean/null to number for easy sorting (true: 2, null: 1, false: 0)
      const decisionValue = (d: boolean | null) => d === true ? 2 : d === null ? 1 : 0;
      return decisionValue(b.decision) - decisionValue(a.decision) || 
             new Date(b.prediction_date).getTime() - new Date(a.prediction_date).getTime();
    });

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
                  <span className="hidden sm:inline">Business </span>💼
                </button>
                <button
                  onClick={() => setActiveTab('politics')}
                  className={`px-6 py-2 rounded-t-lg ${
                    activeTab === 'politics' 
                      ? 'bg-gray-800 text-white border-t border-l border-r border-gray-700' 
                      : 'bg-gray-900 text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <span className="hidden sm:inline">Politics </span>👑
                </button>
              </div>
              
              <div className="flex gap-4">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-transparent text-gray-300 px-4 py-2 focus:outline-none"
                >
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year === 'all' ? 'All Years' : year}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedDecision}
                  onChange={(e) => setSelectedDecision(e.target.value as 'all' | 'true' | 'false' | 'unclear')}
                  className="bg-transparent text-gray-300 px-4 py-2 focus:outline-none"
                >
                  <option value="all">All Outcomes</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                  <option value="unclear">Unclear</option>
                </select>
              </div>
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

