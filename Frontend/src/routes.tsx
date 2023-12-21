import React from 'react'
import About from './pages/about'
import Home from './pages/home'

export const routes = [
  { path: '/', element: <Home /> },
  { path: '/home', element: <Home /> },
  { path: '/about', element: <About /> },
]
