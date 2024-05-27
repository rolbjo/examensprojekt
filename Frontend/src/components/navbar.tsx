import React, { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Login from './Login'

function NavbarComponent() {
  const [loginPop, setLoginPop] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))

  const handleLogin = useCallback(() => {
    setIsLoggedIn(true)
    window.location.reload()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    window.location.reload()
  }
  console.log(typeof handleLogin)
  return (
    <div
      className='navbar'
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: '#f8f9fa',
      }}
    >
      <div>
        <Link to='/' className='btn btn-ghost text-xl'>
          Home
        </Link>

        <Link to='/planning' className='btn btn-ghost text-xl'>
          Trip Planner
        </Link>
      </div>
      <div>
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className='btn btn-ghost text-xl navbar-end'
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => setLoginPop(true)}
            className='btn btn-ghost text-xl navbar-end'
          >
            Login
          </button>
        )}
        <Login
          loginPop={loginPop}
          setLoginPop={setLoginPop}
          onLogin={handleLogin}
        />

        <div
          tabIndex={0}
          role='button'
          className='btn btn-ghost btn-circle avatar'
        >
          <div className='w-10 rounded-full'>
            <img
              alt='Tailwind CSS Navbar component'
              src='https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default NavbarComponent
