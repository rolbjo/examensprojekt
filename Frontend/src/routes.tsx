import React from 'react'
import About from './pages/About'
import Home from './pages/Home'
import Destinations from './pages/Destinations'
import TripPlanner from './pages/TripPlanner'

export const routes = [
  { path: '/', element: <Home /> },
  { path: '/home', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/:destination', element: <Destinations /> },

  { path: '/planning', element: <TripPlanner /> },
]
