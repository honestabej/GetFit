import './SignIn.scss'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import DefaultInput from '../../components/Inputs/DefaultInput/DefaultInput'
import ButtonFill from '../../components/Buttons/ButtonFill/ButtonFill'
import ButtonText from '../../components/Buttons/ButtonText/ButtonText'
import Logo from './../../images/GetFit_Logo_White.png'

function SignIn(props) {
  // Values from input
  const [emailUsername, setemailUsername] = useState('')
  const [password, setPassword] = useState('')
  const [incorrectLogin, setIncorrectLogin] = useState(false)

  // Check if already logged in, then redirect to profile if so
  useEffect(() => {
    axios.get("http://localhost:3001/users/login").then(res => {
      if (res.data.loggedIn === true) {
        window.location.href = '/profile'
      }
    })
  })

  // Send signin details to server
  const signIn = (emailUsername, password) => {
    axios.post("http://localhost:3001/users/login", {
      "emailUsername": emailUsername,
      "password": password
    }, {
      "content-type": "application/json"
    }).then(res => {
      if (res.data.loggedIn === true) {
        window.location.href = '/profile'
      } else {
        setIncorrectLogin(true)
      }
    })
  }

  // Update values from inputs
  const emailUsernameInput = (e) => {
    setemailUsername(e.target.value)
  }

  const passwordInput = (e) => {
    setPassword(e.target.value)
  }

  return (
    <div className="signin-wrapper">
      <div className="signin-container">
        <div className="signin-center">
          <div className="signin-logo-container">
            <img className="signin-logo-img" src={Logo} alt="LOGO" onClick={() => window.location.href = '/'} />
          </div>
          <div className="signin-box-container">
            <div className="signin-box-main-text">
              <h2>Sign In</h2>
            </div>
            <div className="signin-box-sub-text">
              <p>Enter your sign in details below</p>
            </div>
            {incorrectLogin ? 
              <div className="signin-box-sub-text red">
                <p>Incorrect email/username and password</p>
              </div>
            :
              <></>
            }
            <div className="signin-input">
              <DefaultInput placeholder="Email/Username" id="Email" onChange={emailUsernameInput} />
            </div>
            <div className="signin-input">
              <DefaultInput placeholder="Password" id="Password" type="password" onChange={passwordInput} />
            </div>
            <div className="signin-btn">
              <ButtonFill value="Sign In" color="black" onClick={() => signIn(emailUsername, password)} />
            </div>
            <div className="signin-forgot-pwd-btn">
              <ButtonText value="Forgot Password?" onClick={() => window.location.href = '/forgotpassword'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn