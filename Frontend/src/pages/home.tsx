import React, { useEffect, useState } from 'react'
import Carousel from '../components/carousel'
import RandomDest from '../components/randomDestButton'
import '../styles/pages/home.scss'

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
