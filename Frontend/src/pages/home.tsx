import React, { useEffect, useState } from 'react'
import '../App.css'
import Carousel from '../components/carousel'
import '../styles/pages/home.scss'

function Home() {
  const [hej, setHej] = useState('')

  useEffect(() => {
    fetch('/data')
      .then((response) => response.text())
      .then((data) => {
        setHej(data)
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
      })
  }, [])

  return (
    <>
      <h1>What is your next travel goal?</h1>
      <p>{hej}</p>

      <Carousel interval={2000} />
    </>
  )
}

export default Home
