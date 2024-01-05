import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import RandomDest from '../components/randomDestButton'
import '../styles/pages/destinations.scss'

interface DestinationData {
  id: number
  name: string
  sights: string[]
  when_to_travel: string[]
  img: string
}

const Destinations: React.FC = () => {
  const { destination } = useParams<{ destination: string }>()
  const [destinationData, setDestinationData] =
    useState<DestinationData | null>(null)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/data/${destination}`)
        const data = await response.json()
        setDestinationData(data[0])
        console.log('Destination Data:', data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [destination])

  const fromRandom = searchParams.get('fromRandom') === 'true'

  return (
    <>
      {destinationData ? (
        <>
          <div>
            <h1>{destinationData.name}</h1>
            <div className='MainContainer'>
              <img
                src={`/${destinationData.img}`}
                alt=''
                className='DestinationImg'
              />
              <div className='ListDiv'>
                <div>
                  <h2>When to Travel</h2>
                  <ul>
                    {destinationData.when_to_travel.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2>Sights</h2>
                  <ul>
                    {destinationData.sights.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {fromRandom && <RandomDest />}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  )
}

export default Destinations
