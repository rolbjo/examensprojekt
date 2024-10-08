import React from 'react'
import Navbar from './components/Navbar'
import { routes } from './Routes'
import { Routes, Route } from 'react-router-dom'
import './app.css'

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
