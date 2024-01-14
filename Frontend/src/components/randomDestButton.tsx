import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/components/randomDestButton.scss'

interface DestinationData {
  id: number
  name: string
  sights: string[]
  when_to_travel: string[]
  img: string
}

const RandomDest: React.FC = () => {
  const [randomDest, setRandomDest] = useState<DestinationData | null>(null)
  const navigate = useNavigate()

  const fetchRandomDestination = async () => {
    try {
      const response = await fetch('/data/destinations')
      const data = await response.json()

      if (data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length)
        const randomDestination = data[randomIndex]

        setRandomDest(randomDestination)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }
  useEffect(() => {
    fetchRandomDestination()
  }, [])

  const navigateToRandomDestination = () => {
    fetchRandomDestination()
    if (randomDest) {
      navigate(`/${randomDest.name}?fromRandom=true`)
    }
  }

  return (
    <div className='ButtonContainer'>
      <button className='RandomButton' onClick={navigateToRandomDestination}>
        Random Destination
      </button>
    </div>
  )
}

export default RandomDest
