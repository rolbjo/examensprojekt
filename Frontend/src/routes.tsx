import React from 'react'
import About from './pages/about'
import Home from './pages/home'
import Destinations from './pages/destinations'
import AllDestinations from './pages/allDestinations'
import TripPlanner from './pages/TripPlanner'
import Login from './pages/login'

export const routes = [
  { path: '/', element: <Home /> },
  { path: '/home', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/:destination', element: <Destinations /> },
  { path: '/destinations', element: <AllDestinations /> },
  { path: '/planning', element: <TripPlanner /> },
  { path: '/login', element: <Login /> },
]
