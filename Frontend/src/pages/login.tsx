import React, { useState } from 'react'

const Login = () => {
  const [registerUsername, setRegisterUsername] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const register = () => {
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
      .then((response) => response.json())
      .then((data) => {
        console.log('Registration response:', data)
        alert('Registered successfully')
      })
      .catch((error) => alert('Error registering'))
  }

  const login = () => {
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
        alert('Logged in successfully')
      })
      .catch((error) => alert('Error logging in'))
  }

  return (
    <div>
      <h1>Register</h1>
      <input
        type='text'
        placeholder='Username'
        onChange={(e) => setRegisterUsername(e.target.value)}
      />
      <input
        type='password'
        placeholder='Password'
        onChange={(e) => setRegisterPassword(e.target.value)}
      />
      <button onClick={register}>Register</button>

      <h1>Login</h1>
      <input
        type='text'
        placeholder='Username'
        onChange={(e) => setLoginUsername(e.target.value)}
      />
      <input
        type='password'
        placeholder='Password'
        onChange={(e) => setLoginPassword(e.target.value)}
      />
      <button onClick={login}>Login</button>
    </div>
  )
}

export default Login
