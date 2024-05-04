import React from 'react'
import Carousel from '../components/Carousel'
import RandomDest from '../components/RandomDestButton'
import '../styles/pages/home.css'

function Home() {
  return (
    <>
      <h1 className='HomeHeader'>What is your next travel goal?</h1>
      <Carousel interval={3000} />
      <RandomDest />
    </>
  )
}

export default Home
