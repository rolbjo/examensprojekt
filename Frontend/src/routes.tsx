import React from 'react'
import Home from './pages/Home'
import TripPlanner from './pages/TripPlanner'

export const routes = [
  { path: '/', element: <Home /> },
  { path: '/home', element: <Home /> },
  { path: '/planning', element: <TripPlanner /> },
]
