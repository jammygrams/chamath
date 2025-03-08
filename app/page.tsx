'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import Prediction from '../components/Prediction'
import Header from '../components/Header'
import { Evidence } from '@/types'
import PersonSelector from '../components/PersonSelector'

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
  person_id: number
}

interface Person {
  id: number
  slug: string
  name: string
  full_name: string
  wikipedia_url: string
  image_url: string
}

// First, let's add a type for the calculated decision
interface PredictionWithDecision extends PredictionData {
  calculatedDecision: boolean | null;
}

export default function Home() {
  const [predictions, setPredictions] = useState<PredictionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'business' | 'politics'>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedDecision, setSelectedDecision] = useState<'all' | 'true' | 'false' | 'unclear'>('all')
  const [evidenceMap, setEvidenceMap] = useState<Record<number, Evidence[]>>({})
  const [people, setPeople] = useState<Person[]>([])
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)

  const years = useMemo(() => {
    const uniqueYears = new Set(predictions.map(p => 
      new Date(p.evaluation_date).getFullYear()
    ))
    return ['all', ...Array.from(uniqueYears).sort()]
  }, [predictions])

  // Calculate decisions once when predictions or evidence change
  const predictionsWithDecisions = useMemo<PredictionWithDecision[]>(() => {
    return predictions.map(prediction => {
      const evidence = evidenceMap[prediction.id] || [];
      let calculatedDecision = null;
      
      if (evidence.length > 0) {
        const supportingEvidence = evidence.filter(e => e.supports);
        const contradictingEvidence = evidence.filter(e => !e.supports);
        
        if (supportingEvidence.length === evidence.length) {
          calculatedDecision = true;
        } else if (contradictingEvidence.length === evidence.length) {
          calculatedDecision = false;
        }
      }

      return {
        ...prediction,
        calculatedDecision
      };
    });
  }, [predictions, evidenceMap]);

  // Create a map of predictions by person_id for PersonSelector
  const predictionsMapWithDecisions = useMemo(() => {
    return predictionsWithDecisions.reduce((acc, pred) => {
      acc[pred.person_id] = acc[pred.person_id] || [];
      acc[pred.person_id].push(pred);
      return acc;
    }, {} as Record<number, PredictionWithDecision[]>);
  }, [predictionsWithDecisions]);

  const fetchLatestData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch people first
      const peopleResult = await supabase.from('people').select('*').order('id', { ascending: true });
      
      if (peopleResult.data && peopleResult.data.length > 0) {
        setPeople(peopleResult.data);
        // Set default selected person to Chamath (first person)
        setSelectedPerson(peopleResult.data[0]);
        
        // Fetch predictions for ALL people and evidence
        const [predictionsResult, evidenceResult] = await Promise.all([
          supabase.from('predictions')
            .select('*')
            .order('evaluation_date', { ascending: true }),
          supabase.from('evidence').select('*').order('evidence_date', { ascending: true })
        ]);

        if (predictionsResult.data) {
          setPredictions(predictionsResult.data);
        }

        if (evidenceResult.data) {
          const evidenceByPrediction = evidenceResult.data.reduce((acc, evidence) => {
            acc[evidence.prediction_id] = acc[evidence.prediction_id] || [];
            acc[evidence.prediction_id].push(evidence);
            return acc;
          }, {} as Record<number, Evidence[]>);
          setEvidenceMap(evidenceByPrediction);
        }
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setIsLoading(false);
    }
  };

  const handlePersonChange = async (person: Person) => {
    setIsLoading(true);
    setSelectedPerson(person);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLatestData();
  }, []);

  // Filter predictions for the current view
  const filteredPredictions = predictionsWithDecisions
    .filter(prediction => {
      if (prediction.person_id !== selectedPerson?.id) return false;
      
      return (
        (activeTab === 'all' || prediction.category.toLowerCase() === activeTab) &&
        (selectedYear === 'all' || new Date(prediction.evaluation_date).getFullYear().toString() === selectedYear) &&
        (selectedDecision === 'all' || 
         (selectedDecision === 'true' && prediction.calculatedDecision === true) ||
         (selectedDecision === 'false' && prediction.calculatedDecision === false) ||
         (selectedDecision === 'unclear' && prediction.calculatedDecision === null))
      );
    })
    .sort((a, b) => {
      // Convert boolean/null to number for easy sorting (true: 2, null: 1, false: 0)
      const decisionValue = (d: boolean | null) => d === true ? 2 : d === null ? 1 : 0;
      return decisionValue(b.calculatedDecision) - decisionValue(a.calculatedDecision) || 
             new Date(b.prediction_date).getTime() - new Date(a.prediction_date).getTime();
    });

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
      <div className="flex-grow">
        {people.length > 0 && selectedPerson && (
          <PersonSelector 
            people={people} 
            selectedPerson={selectedPerson} 
            onPersonChange={handlePersonChange}
            predictionsMap={predictionsMapWithDecisions}
            evidenceMap={evidenceMap}
          />
        )}
        
        {!isLoading && (
          <Header 
            predictions={predictionsWithDecisions.filter(p => p.person_id === selectedPerson?.id)}
            selectedPerson={selectedPerson} 
          />
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">
              Here&apos;s what {selectedPerson?.name} predicted...
            </h2>

            <div className="flex justify-start items-center mb-8 gap-4">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as 'all' | 'business' | 'politics')}
                  className="bg-gray-800 text-gray-100 px-3 py-2 rounded border border-gray-700"
                >
                  <option value="all">All Categories</option>
                  <option value="business">Business</option>
                  <option value="politics">Politics</option>
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-gray-800 text-gray-100 px-3 py-2 rounded border border-gray-700"
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
                  className="bg-gray-800 text-gray-100 px-3 py-2 rounded border border-gray-700"
                >
                  <option value="all">All Results</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                  <option value="unclear">Unclear</option>
                </select>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {filteredPredictions.map(prediction => (
                  <Prediction
                    key={prediction.id}
                    id={prediction.id}
                    content={prediction.content}
                    source={prediction.source}
                    evaluation_date={prediction.evaluation_date}
                    prediction_date={prediction.prediction_date}
                    decision={prediction.calculatedDecision}
                    person_id={prediction.person_id}
                    evidence={evidenceMap[prediction.id] || []}
                  />
                ))}
              </div>
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

