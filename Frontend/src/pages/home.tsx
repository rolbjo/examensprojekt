import React, { useEffect, useState } from 'react'
import Carousel from '../components/carousel'
import styles from '../styles/pages/home.module.scss'

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
      <h1 className={styles.homeHeader}>What is your next travel goal?</h1>
      <p>{hej}</p>

      <Carousel interval={3000} />
    </>
  )
}

export default Home
