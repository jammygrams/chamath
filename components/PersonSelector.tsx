import Image from 'next/image'

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
}

export default function PersonSelector({ people, selectedPerson, onPersonChange }: PersonSelectorProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex space-x-6">
        {people.map((person) => (
          <div 
            key={person.id} 
            className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
              selectedPerson.id === person.id 
                ? 'transform scale-110' 
                : 'opacity-70 hover:opacity-100'
            }`}
            onClick={() => onPersonChange(person)}
          >
            <div className={`relative w-20 h-20 rounded-full overflow-hidden border-4 ${
              selectedPerson.id === person.id ? 'border-blue-500' : 'border-gray-700'
            }`}>
              <Image
                src={person.image_url}
                alt={person.name}
                fill
                className="object-cover"
              />
            </div>
            <span className="mt-2 text-sm font-medium text-gray-300">
              {person.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
} 