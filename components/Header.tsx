'use client'

import Image from 'next/image'
import { useMemo } from 'react'

interface HeaderProps {
  predictions: {
    true_votes: number
    false_votes: number
    decision: boolean | null
  }[]
}

export default function Header({ predictions }: HeaderProps) {
  const truthPercentage = useMemo(() => {
    const validPredictions = predictions.filter(pred => 
      pred.decision !== null || (pred.true_votes + pred.false_votes) > 0
    )
    
    if (validPredictions.length === 0) return 0

    const truePredictions = validPredictions.reduce((count, pred) => {
      if (pred.decision !== null) {
        // For decided predictions, use the decision value
        return count + (pred.decision ? 1 : 0)
      } else {
        // For undecided predictions, use vote counts
        const totalVotes = pred.true_votes + pred.false_votes
        const truePercentage = (pred.true_votes / totalVotes) * 100
        return count + (truePercentage >= 50 ? 1 : 0)
      }
    }, 0)

    return (truePredictions / validPredictions.length) * 100
  }, [predictions])

  const getTruthLevel = (percentage: number) => {
    if (percentage < 40) {
      return {
        text: "👎 Nah.",
        color: "bg-red-500"
      }
    }
    if (percentage < 60) {
      return {
        text: "🪙 He's as good as a coin flip",
        color: "bg-yellow-500"
      }
    }
    return {
      text: "✨ Maybe he knows something...",
      color: "bg-green-500"
    }
  }

  const truthLevel = getTruthLevel(truthPercentage)

  return (
    <div className="min-h-[35vh] flex flex-col justify-center mb-8 text-center text-gray-100">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-2 flex items-center justify-center md:justify-center gap-6 md:gap-8">
        <a 
          href="https://en.wikipedia.org/wiki/Chamath_Palihapitiya"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/chamath_cropped.png"
            alt="Chamath"
            width={96}
            height={96}
            className="rounded-full inline-block"
          />
        </a>
        <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent text-left md:text-center">
          Should you trust <a 
            href="https://en.wikipedia.org/wiki/Chamath_Palihapitiya"
            target="_blank"
            rel="noopener noreferrer"
          >Chamath</a>&apos;s predictions?
        </span>
      </h1>
      <p className="text-3xl md:text-4xl font-bold mb-6">
        {truthLevel.text}
      </p>
      <div className="w-full max-w-lg mx-auto bg-gray-800 rounded-full h-6 overflow-hidden flex">
        <div 
          className="h-6 bg-green-400 transition-all duration-500"
          style={{ width: `${predictions.filter(p => p.decision === true).length / predictions.length * 100}%` }}
        />
        <div 
          className="h-6 bg-gray-400 transition-all duration-500"
          style={{ width: `${predictions.filter(p => p.decision === null).length / predictions.length * 100}%` }}
        />
      </div>
      <div className="text-lg font-medium mt-4">
        <p className="text-gray-300">
          <span className="text-green-400">{truthPercentage.toFixed(0)}%</span> of his {predictions.length} predictions came true.
        </p>
        <p className="text-gray-400">
          {(predictions.filter(p => p.decision === null).length / predictions.length * 100).toFixed(0)}% are unclear.
        </p>
      </div>
    </div>
  )
} 