import React, { useState } from 'react'
import Navbar from './components/navbar'
import { routes } from './routes'
import { Routes, Route } from 'react-router-dom'
import './app.scss'

function App() {
  return (
    <div className='AppWrapper'>
      <Navbar />
      <div className='ContentWrapper'>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </div>
      <div className='Footer'>
        <div className='FooterFlex'>
          <a href=''>Home</a>
          <a href=''>About</a>
          <a href=''>Team</a>
          <a href=''>Contact</a>
        </div>
        <div>©2024 Roland Björndahl</div>
      </div>
    </div>
  )
}

export default App
