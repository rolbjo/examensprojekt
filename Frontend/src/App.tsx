import React, { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [hej, setHej] = useState('')

  useEffect(() => {
    fetch('/data') // Update the endpoint to match your backend route
      .then((response) => response.text()) // Use response.text() to get the string response
      .then((data) => {
        setHej(data)
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
      })
  }, [])

  return (
    <>
      <h1>Vite + React</h1>
      <div className='card'>
        <p>{hej}</p>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR...... testing
        </p>
      </div>

      <p className='read-the-docs'>
        Click on the Vite and React logos to learn more.
      </p>
    </>
  )
}

export default App
