'use client'

import Image from 'next/image'
import { useMemo } from 'react'
import { Evidence } from '@/types'

interface Person {
  id: number
  slug: string
  name: string
  full_name: string
  wikipedia_url: string
  image_url: string
}

interface PersonSelectorProps {
  people: Person[]
  selectedPerson: Person
  onPersonChange: (person: Person) => void
  predictionsMap: Record<number, {
    id: number
    calculatedDecision: boolean | null
  }[]>
  evidenceMap: Record<number, Evidence[]>
}

export default function PersonSelector({ 
  people, 
  selectedPerson, 
  onPersonChange,
  predictionsMap,
}: PersonSelectorProps) {
  const peopleWithScores = useMemo(() => {
    return people.map(person => {
      const predictions = predictionsMap[person.id] || [];
      const score = predictions.filter(p => p.calculatedDecision === true).length;
      const totalPredictions = predictions.length;
      const scorePercentage = totalPredictions > 0 ? (score / totalPredictions) * 100 : 0;

      return {
        ...person,
        score,
        scorePercentage,
        totalPredictions
      };
    }).sort((a, b) => b.scorePercentage - a.scorePercentage);
  }, [people, predictionsMap]);

  const getRankingEmoji = (index: number, totalPeople: number) => {
    switch(index) {
      case 0: return "🥇";
      case 1: return "🥈";
      case 2: return "🥉";
      case totalPeople - 1: return "😢";
      default: return null;
    }
  };

  return (
    <div className="flex justify-between items-end mb-8 h-[300px] max-w-[95vw] mx-auto">
      {peopleWithScores.map((person, index) => {
        const podiumHeight = Math.max(20, person.scorePercentage * 2);
        const isSelected = selectedPerson.id === person.id;
        const rankingEmoji = getRankingEmoji(index, peopleWithScores.length);
        
        return (
          <div 
            key={person.id}
            className="flex flex-col items-center cursor-pointer w-[20%]"
            onClick={() => onPersonChange(person)}
          >
            {/* Profile section - constant size */}
            <div className={`relative w-16 h-16 sm:w-20 sm:h-20 mb-2 rounded-full overflow-hidden border-4 transition-all duration-300 ${
              isSelected ? 'border-blue-500 transform scale-110' : 'border-gray-700 hover:border-gray-500'
            }`}>
              <Image
                src={person.image_url}
                alt={person.name}
                fill
                className="object-cover"
              />
            </div>
            {/* Stats section - constant size */}
            <div className={`text-center transition-all duration-300 ${
              isSelected ? 'transform scale-110' : ''
            }`}>
              <div className="font-medium text-gray-300 text-sm sm:text-base">
                {person.name} {rankingEmoji}
              </div>
              <div className="text-xs sm:text-sm text-green-400 font-bold">
                {person.scorePercentage.toFixed(0)}%
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500">
                {person.score} / {person.totalPredictions}
              </div>
            </div>
            {/* Podium section - variable height */}
            <div className="flex-grow w-full flex items-end justify-center">
              <div 
                className={`w-full max-w-[4rem] sm:max-w-[6rem] rounded-t-lg transition-all duration-300 ${
                  isSelected ? 'bg-blue-500/20' : 'bg-gray-700/20'
                }`}
                style={{ height: `${podiumHeight}px` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
} 