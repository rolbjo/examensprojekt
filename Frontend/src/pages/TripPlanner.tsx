import React, { useState, useEffect } from 'react'
import '../styles/pages/tripPlanner.scss'

interface Trip {
  id: number
  destination: string
  start_date: string
  end_date: string
}

const TripPlanner: React.FC = () => {
  const [tripDetails, setTripDetails] = useState({
    destination: '',
    startDate: '',
    endDate: '',
  })

  const [savedTrips, setSavedTrips] = useState<Trip[]>([])

  const fetchTrip = async () => {
    try {
      const response = await fetch('/trips', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'), // Include the JWT in the Authorization header
        },
      })

      const data = await response.json()

      setSavedTrips(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    fetchTrip()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTripDetails((prevDetails) => ({ ...prevDetails, [name]: value }))
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/data/saveTrip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'), // Include the JWT in the Authorization header
        },
        body: JSON.stringify(tripDetails),
      })

      if (response.ok) {
        const savedTrip = await response.json()

        setSavedTrips((prevTrips) => [...prevTrips, savedTrip])
      } else {
        console.error('Failed to save trip')
      }
    } catch (error) {
      console.error('Error saving trip:', error)
    }
  }

  return (
    <div className='TripPlanner'>
      <h2>Trip Planner</h2>
      <form>
        <label>
          Destination:
          <input
            className='SavedTripsInput'
            type='text'
            name='destination'
            value={tripDetails.destination}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Start Date:
          <input
            className='SavedTripsInput'
            type='date'
            name='startDate'
            value={tripDetails.startDate}
            onChange={handleInputChange}
          />
        </label>
        <label>
          End Date:
          <input
            className='SavedTripsInput'
            type='date'
            name='endDate'
            value={tripDetails.endDate}
            onChange={handleInputChange}
          />
        </label>

        <button className='PlanTripsButton' type='button' onClick={handleSave}>
          Save Trip
        </button>
      </form>

      <div>
        <h3 className='SavedTripsh3'>Saved Trips</h3>
        <ul className='MySavedTrips'>
          {savedTrips.map((trip) => (
            <li key={trip.id}>
              {trip.destination} -
              {new Date(trip.start_date).toLocaleDateString()} to
              {new Date(trip.end_date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default TripPlanner
