import React, { useEffect, useState } from 'react'
import '../styles/pages/tripPlanner.css'

const TripPlanner = () => {
  const [tripStep, setTripStep] = useState(0)

  const [tripName, setTripName] = useState('')
  const [tripDescription, setTripDescription] = useState('')

  const [tripDetails, setTripDetails] = useState(null)
  const [trips, setTrips] = useState([])

  const [selectedTripId, setSelectedTripId] = useState(null)

  const [viewingTrip, setViewingTrip] = useState(false)

  const handleBackButton = () => {
    if (viewingTrip) {
      setViewingTrip(false)
      setSelectedTripId(null)
      setTripName('')
      fetchTrips()
    } else {
      setTripStep(tripStep - 1)
    }
  }

  const fetchTrips = async () => {
    const response = await fetch('/api/userTrips', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    })
    const allTrips = await response.json()
    console.log('trips', allTrips)
    setTrips(allTrips)
  }

  useEffect(() => {
    fetchTrips()
  }, [])

  async function handleTripSelect(tripId) {
    const response = await fetch(`/api/tripDetails/${tripId}`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    })
    const data = await response.json()
    setTripDetails(data)
    console.log('Selected trip name:', data.tripname)
    setSelectedTripId(tripId)
    setViewingTrip(true)
  }

  const submitTripDetails = async (event) => {
    event.preventDefault()
    if (tripStep === 2) {
      const tripDetails = {
        tripName,
        tripDescription,
      }
      const response = await fetch('/api/tripDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify(tripDetails),
      })
      const data = await response.json()
      console.log(data)
      setTripDetails(data)
      fetchTrips()

      handleTripSelect(data.id)

      setTripName('')
      setTripDescription('')
      setTripStep(0)
    } else {
      setTripStep(tripStep + 1)
    }
  }

  return (
    <>
      <div>
        {tripStep === 0 && !selectedTripId && (
          <button
            className='NewTripButton'
            onClick={() => {
              setTripStep(tripStep + 1)
              setTripName('')
            }}
          >
            Plan a new trip
          </button>
        )}

        {(tripStep >= 1 || viewingTrip) && (
          <button className='BackButton' onClick={handleBackButton}>
            Back
          </button>
        )}

        {tripStep === 0 && (
          <div>
            {tripDetails && tripDetails.description && viewingTrip ? (
              <div>
                <h2 className='OnTripHeader'>{tripDetails.tripname}</h2>
                <p className='OnTripDescription'>
                  {tripDetails.description
                    .replace(/\\n/g, '\n')
                    .split('\n')
                    .map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                </p>
              </div>
            ) : (
              <div style={{ marginLeft: '20px' }}>
                <h2 style={{ marginBottom: '20px' }}>My trips</h2>
                {trips.map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => handleTripSelect(trip.id)}
                    style={{
                      display: 'block',
                      marginBottom: '10px',
                      padding: '10px',
                      borderRadius: '5px',
                    }}
                  >
                    {trip.tripname}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {tripStep === 1 && (
          <div className='TripPlanner'>
            <h1 className='TripH1'>Name your next adventure</h1>
            <form onSubmit={submitTripDetails}>
              <input
                style={{ textAlign: 'center' }}
                type='text'
                placeholder='Your trip name'
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
              />
              <button type='submit'>Next</button>
            </form>
          </div>
        )}
        {tripStep === 2 && (
          <div className='TripPlanner'>
            <h1 className='TripH1'>Give your trip a description</h1>
            <form onSubmit={submitTripDetails}>
              <textarea
                style={{ textAlign: 'center' }}
                placeholder='Your trip description'
                value={tripDescription}
                onChange={(e) => setTripDescription(e.target.value)}
              />
              <button type='submit'>Next</button>
            </form>
          </div>
        )}
      </div>
    </>
  )
}

export default TripPlanner
