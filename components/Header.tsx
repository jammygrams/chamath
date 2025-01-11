'use client'

interface HeaderProps {
  predictions: {
    true_votes: number
    false_votes: number
  }[]
}

export default function Header({ predictions }: HeaderProps) {
  const getTruthPercentage = () => {
    if (predictions.length === 0) return 0
    
    const predictionsWithVotes = predictions.filter(p => 
      p.true_votes + p.false_votes > 0
    )
    
    if (predictionsWithVotes.length === 0) return 0
    
    const predictionsWithMajorityTrue = predictionsWithVotes.filter(p => {
      const total = p.true_votes + p.false_votes
      return p.true_votes / total > 0.5
    }).length

    return (predictionsWithMajorityTrue / predictionsWithVotes.length) * 100
  }

  const truthPercentage = getTruthPercentage()

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
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        Should you trust Chamath&apos;s predictions?
      </h1>
      <p className="text-3xl md:text-4xl font-bold mb-6">
        {truthLevel.text}
      </p>
      <div className="w-full max-w-lg mx-auto bg-gray-700 rounded-full h-6">
        <div 
          className={`h-6 rounded-full transition-all duration-500 ${truthLevel.color}`}
          style={{ width: `${truthPercentage}%` }}
        />
      </div>
      <p className="text-lg font-medium text-gray-300 mt-4">
        {truthPercentage.toFixed(0)}% of his predictions are voted true 📊
      </p>
    </div>
  )
} 