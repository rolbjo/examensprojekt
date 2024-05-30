import React, { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import '../styles/pages/tripPlanner.css'

type DayPlannerProps = { tripId: string }
interface ActivityDetail {
  id: number
  text: string
}
type Day = {
  date: Date
  activityDetails: ActivityDetail[]
}

const DayPlanner: React.FC<DayPlannerProps> = ({ tripId }) => {
  const [tripStartDate, setTripStartDate] = useState<Date | null>(null)
  const [tripEndDate, setTripEndDate] = useState<Date | null>(null)
  const [daysToPlan, setDaysToPlan] = useState<Day[]>([])
  const [currentDescription, setCurrentDescription] = useState<string[]>([])
  const [showInput, setShowInput] = useState<number | null>(null)
  const [showDeleteButtons, setShowDeleteButtons] = useState(false)

  // Function to generate an array of dates between the start and end dates
  function generateDates(startDate: Date, endDate: Date) {
    let dates = []
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      dates.push({ date: new Date(currentDate), activityDetails: [] })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
  }

  useEffect(() => {
    fetch(`/api/trips/${tripId}`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    })
      .then((response) => response.json())
      .then((trip) => {
        console.log(trip)
        if (Date.parse(trip.start_date) && Date.parse(trip.end_date)) {
          setTripStartDate(new Date(trip.start_date))
          setTripEndDate(new Date(trip.end_date))
          setDaysToPlan(
            generateDates(new Date(trip.start_date), new Date(trip.end_date))
          )
        } else {
          console.error('Invalid date string')
        }
      })
  }, [tripId])

  useEffect(() => {
    const fetchActivities = async () => {
      const response = await fetch(`/api/activities/${tripId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      })

      if (response.ok) {
        const activities = await response.json()
        console.log('activities', activities)
        // Parse date strings into Date objects
        const activitiesWithDates = activities.map((activity) => ({
          ...activity,
          date: new Date(activity.date),
          activityDetails: activity.activity
            ? [{ id: activity.id, text: activity.activity }]
            : [],
        }))

        setDaysToPlan((prevDays) => {
          const mergedDays = [...prevDays]
          activitiesWithDates.forEach((activity) => {
            const dayIndex = mergedDays.findIndex(
              (day) => day.date.getTime() === activity.date.getTime()
            )
            if (dayIndex !== -1) {
              mergedDays[dayIndex].activityDetails.push(
                ...(activity.activityDetails || [])
              )
            } else {
              // Check if activity date is within the date range
              if (
                activity.date >= tripStartDate &&
                activity.date <= tripEndDate
              ) {
                mergedDays.push(activity)
              }
            }
          })
          return mergedDays
        })
      }
    }

    fetchActivities()
  }, [tripId])

  async function updateTripDates(startDate: Date, endDate: Date) {
    // Adjust the dates to UTC
    const startDateUTC = new Date(
      Date.UTC(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      )
    )
    const endDateUTC = new Date(
      Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    )

    // Create date strings in the format YYYY-MM-DD
    const startDateString = startDateUTC.toISOString().split('T')[0]
    const endDateString = endDateUTC.toISOString().split('T')[0]

    await fetch(`/api/trips/${tripId}/dates`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify({
        startDate: startDateString,
        endDate: endDateString,
      }),
    })
  }

  async function handleAddActivity(index: number) {
    const activityDescription = currentDescription[index]

    // Adjust the date to UTC and add one day
    const date = new Date(daysToPlan[index].date)
    const dateUTC = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    )

    const response = await fetch(`/api/activities/${tripId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify({
        date: dateUTC,
        description: activityDescription,
      }),
    })

    // Update the local state if the post was successful
    if (response.ok) {
      const activity = await response.json()
      setDaysToPlan((prev) => {
        const newDays = [...prev]
        newDays[index].activityDetails.push({
          id: activity.id,
          text: activityDescription,
        })
        return newDays
      })
      setCurrentDescription((prev) => {
        const newDescriptions = [...prev]
        newDescriptions[index] = ''
        return newDescriptions
      })
      setShowInput(null)
    }
  }

  async function handleDeleteActivity(day: Day, activityIndex: number) {
    const activityId = day.activityDetails[activityIndex].id

    // Delete the activity from the server
    const response = await fetch(`/api/activities/${tripId}/${activityId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    })

    // Update the local state if the delete was successful
    if (response.ok) {
      setDaysToPlan((prev) => {
        const newDays = [...prev]
        const dayIndex = newDays.findIndex((d) => d.date === day.date)
        newDays[dayIndex].activityDetails.splice(activityIndex, 1)
        return newDays
      })
    }
  }

  return (
    <div>
      <h1 className='DateMainHeader'>Day Planner</h1>
      <DatePicker
        className='DatePicker'
        selected={tripStartDate}
        onChange={(date) => setTripStartDate(date)}
        placeholderText='Select start date'
      />
      <DatePicker
        className='DatePicker'
        selected={tripEndDate}
        onChange={(date) => {
          setTripEndDate(date)
          if (tripStartDate && date) {
            setDaysToPlan(generateDates(tripStartDate, date))
            updateTripDates(tripStartDate, date)
          }
        }}
        placeholderText='Select end date'
      />

      <button
        className='ShowDeleteButtons'
        onClick={() => setShowDeleteButtons(!showDeleteButtons)}
      >
        {showDeleteButtons ? 'Hide Delete Buttons' : 'Delete an activity'}
      </button>

      {daysToPlan.map((day, index) => (
        <div className='DateWithActivities' key={index}>
          <h3 className='dateHeader'>{day.date.toDateString()}</h3>
          {showInput === index ? (
            <>
              <input
                type='text'
                value={currentDescription[index] || ''}
                onChange={(e) =>
                  setCurrentDescription((prev) => {
                    const newDescriptions: string[] = [...prev]
                    newDescriptions[index] = e.target.value

                    return newDescriptions
                  })
                }
              />
              <button
                className='SaveActivity'
                onClick={() => handleAddActivity(index)}
              >
                Save
              </button>
              <button
                className='CancelActivity'
                onClick={() => setShowInput(null)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className='AddActivityButton'
              onClick={() => setShowInput(index)}
            >
              Add Activity
            </button>
          )}
          <ul>
            {day.activityDetails?.map((activityDetail, i) => {
              console.log('Activity Detail:', activityDetail)
              console.log('yoyoyo', day)
              return (
                <li style={{ listStyle: 'inside' }} key={i}>
                  {activityDetail.text}
                  {showDeleteButtons && (
                    <button
                      className='DeleteActivity'
                      onClick={() => handleDeleteActivity(day, i)}
                    >
                      Delete
                    </button>
                  )}
                </li>
              )
            }) || []}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default DayPlanner
