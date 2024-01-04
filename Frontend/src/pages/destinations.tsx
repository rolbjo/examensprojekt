import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styles from '../styles/pages/destinations.module.scss'

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

  return (
    <>
      {destinationData ? (
        <>
          <div>
            <h1>{destinationData.name}</h1>
            <div className={styles.mainContainer}>
              <img
                src={`/${destinationData.img}`}
                alt=''
                className={styles.destinationImg}
              />
              <div className={styles.listDiv}>
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
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  )
}

export default Destinations
