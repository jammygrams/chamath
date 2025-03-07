'use client'

import { useMemo } from 'react'

interface Person {
  id: number
  slug: string
  name: string
  full_name: string
  wikipedia_url: string
  image_url: string
}

interface HeaderProps {
  predictions: {
    id: number
    calculatedDecision: boolean | null
  }[]
  selectedPerson: Person | null
}

export default function Header({ predictions, selectedPerson }: HeaderProps) {
  const truthPercentage = useMemo(() => {
    if (predictions.length === 0) return 0;
    
    const truePredictions = predictions.filter(p => p.calculatedDecision === true);
    const percentage = (truePredictions.length / predictions.length) * 100;
    return percentage;
  }, [predictions]);

  const getTruthLevel = (percentage: number) => {
    if (percentage < 40) {
      return {
        text: "👎 Nah.",
        color: "bg-red-500"
      }
    }
    if (percentage < 60) {
      return {
        text: `🪙 He's as good as a coin flip`,
        color: "bg-yellow-500"
      }
    }
    return {
      text: "✨ Maybe they know something...",
      color: "bg-green-500"
    }
  }

  const truthLevel = getTruthLevel(truthPercentage);

  if (!selectedPerson) return null;

  // Count predictions by calculated decision
  const trueCount = predictions.filter(p => p.calculatedDecision === true).length;
  const falseCount = predictions.filter(p => p.calculatedDecision === false).length;
  const unclearCount = predictions.filter(p => p.calculatedDecision === null).length;
  const totalCount = predictions.length;

  return (
    <div className="min-h-[35vh] flex flex-col justify-center mb-8 text-center text-gray-100">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-center">
        <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent text-left md:text-center">
          Should you trust <a 
            href={selectedPerson.wikipedia_url}
            target="_blank"
            rel="noopener noreferrer"
          >{selectedPerson.name}</a>&apos;s predictions?
        </span>
      </h1>
      <p className="text-3xl md:text-4xl font-bold mb-6">
        {truthLevel.text}
      </p>
      <div className="w-full max-w-lg mx-auto bg-gray-800 rounded-full h-6 overflow-hidden flex">
        <div 
          className="h-6 bg-green-400 transition-all duration-500"
          style={{ width: `${(trueCount / totalCount) * 100}%` }}
        />
        <div 
          className="h-6 bg-gray-400 transition-all duration-500"
          style={{ width: `${(unclearCount / totalCount) * 100}%` }}
        />
        <div 
          className="h-6 bg-red-400 transition-all duration-500"
          style={{ width: `${(falseCount / totalCount) * 100}%` }}
        />
      </div>
      <div className="text-lg font-medium mt-4">
        <p className="text-gray-300">
          <span className="text-green-400">
            {((trueCount / totalCount) * 100).toFixed(0)}%
          </span> of {selectedPerson.name}&apos;s {totalCount} predictions came true.
        </p>
        <p className="text-gray-400">
          {((unclearCount / totalCount) * 100).toFixed(0)}% are unclear.
        </p>
      </div>
    </div>
  )
} 