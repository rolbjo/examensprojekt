import React from 'react'
import About from './pages/About'
import Home from './pages/Home'
import Destinations from './pages/Destinations'
import AllDestinations from './pages/AllDestinations'
import TripPlanner from './pages/TripPlanner'
import Login from './pages/Login'

export const routes = [
  { path: '/', element: <Home /> },
  { path: '/home', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/:destination', element: <Destinations /> },
  { path: '/destinations', element: <AllDestinations /> },
  { path: '/planning', element: <TripPlanner /> },
  { path: '/login', element: <Login /> },
]
