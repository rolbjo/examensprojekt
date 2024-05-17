import React, { Dispatch, SetStateAction, useState } from 'react'
import Register from './register'
import '../styles/components/login.css'

interface LoginProps {
  loginPop: boolean
  setLoginPop: Dispatch<SetStateAction<boolean>>
  onLogin: () => void
  message: string
}

const Login: React.FC<LoginProps> = ({
  loginPop,
  setLoginPop,
  onLogin,
  message,
}) => {
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showRegister, setShowRegister] = useState(false)

  const login = (e: React.FormEvent) => {
    e.preventDefault()
    fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: loginUsername,
        password: loginPassword,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then((data) => {
        console.log('Login response:', data)
        localStorage.setItem('token', data.token) // Save the token in local storage

        onLogin()
      })
      .catch((error) => alert('Error logging in'))
  }

  return (
    <div className='form-container'>
      <dialog id='login_modal' className='modal' open={loginPop}>
        <div className='modal-box'>
          <form
            style={{ margin: 'auto' }}
            className='login-form'
            onSubmit={(e) => {
              login(e)
              setLoginPop(false)
            }}
          >
            <p style={{ textAlign: 'center' }}>{message}</p>
            <h1>Login</h1>

            <label>
              Username
              <input
                type='text'
                placeholder='Username'
                onChange={(e) => setLoginUsername(e.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type='password'
                placeholder='Password'
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </label>
            <a
              href=''
              onClick={(e) => {
                e.preventDefault()
                setShowRegister(true)
                setLoginPop(false)
              }}
            >
              Create account
            </a>
            <button type='submit'>Login</button>
          </form>
        </div>
        <form method='dialog' className='modal-backdrop'>
          <button onClick={() => setLoginPop(false)}>close</button>
        </form>
      </dialog>
      <Register showRegister={showRegister} setShowRegister={setShowRegister} />
    </div>
  )
}
export default Login
