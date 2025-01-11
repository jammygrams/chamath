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
  
  const getTitle = () => {
    if (truthPercentage < 40) return "No"
    if (truthPercentage < 60) return "He's as good as a coin flip"
    return "Maybe"
  }

  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold mb-6">Should you trust Chamath's predictions?</h1>
      <p className="text-2xl font-semibold mb-4">{getTitle()}</p>
      <div className="w-full max-w-lg mx-auto bg-gray-200 rounded-full h-4">
        <div 
          className="bg-blue-600 h-4 rounded-full transition-all duration-500"
          style={{ width: `${truthPercentage}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 mt-2">
        {truthPercentage.toFixed(1)}% of voted predictions have majority "True" votes
      </p>
    </div>
  )
} 