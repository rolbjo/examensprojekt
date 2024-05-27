import React, { Dispatch, SetStateAction } from 'react'
import { useState } from 'react'

interface RegisterProps {
  showRegister: boolean
  setShowRegister: Dispatch<SetStateAction<boolean>>
}

const Register: React.FC<RegisterProps> = ({
  setShowRegister,
  showRegister,
}) => {
  const [registerUsername, setRegisterUsername] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')

  const register = (e: React.FormEvent) => {
    e.preventDefault()
    fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: registerUsername,
        password: registerPassword,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.error)
          })
        }
        return response.json()
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error)
        }
        console.log('Registration response:', data)
        // Store the JWT token in localStorage
        localStorage.setItem('token', data.token)
        alert('Registered successfully')
      })
      .catch((error) => {
        console.error('Error:', error)
        alert(error.message)
      })
  }
  return (
    <div className='form-container'>
      <dialog id='login_modal' className='modal' open={showRegister}>
        <div className='modal-box'>
          <form
            className='register-form'
            onSubmit={(e) => {
              register(e)
              setShowRegister(false)
            }}
            style={{ margin: 'auto' }}
          >
            <h1>Register</h1>
            <label>
              Username
              <input
                type='text'
                placeholder='Username'
                onChange={(e) => setRegisterUsername(e.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type='password'
                placeholder='Password'
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
              />
            </label>
            <button type='submit'>Register</button>
          </form>
        </div>
        <form method='dialog' className='modal-backdrop'>
          <button onClick={() => setShowRegister(false)}>close</button>
        </form>
      </dialog>
    </div>
  )
}

export default Register
