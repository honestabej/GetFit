import './SignUp.scss'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import DefaultInput from '../../components/Inputs/DefaultInput/DefaultInput'
import ButtonFill from '../../components/Buttons/ButtonFill/ButtonFill'
import ButtonText from '../../components/Buttons/ButtonText/ButtonText'
import Logo from './../../images/GetFit_Logo_White.png'

function SignUp(props) {
  // Values from the inputs
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setpassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Check if already logged in, then redirect to profile if so
  useEffect(() => {
    axios.get("http://localhost:3001/users/login").then(res => {
      if (res.data.loggedIn === true) {
        window.location.href = '/profile'
      }
    })
  })

  // Send signup details to server
  const signUp = (name, age, email, username, password, confirmPassword) => {
    // Reset error message
    setErrorMessage('')

    // Ensure that all fields are filled out
    if (name !== '' && age !== '' && email !== '' && username !== '' && password !== '' && confirmPassword !== '') {
      let isValid = validateInputs(name, age, email, username, password, confirmPassword)
      if (isValid) {
        axios.post("http://localhost:3001/users/create", {
          "name": name,
          "age": age,
          "email": email,
          "username": username,
          "password": password
        }, {
          "content-type": "application/json"
        }).then(res => {
          if (res.data.loggedIn === true) {
            window.location.href = '/profile'
          } else {
            setErrorMessage(res.data.error)
          }
        })
      } 
    } else {
      setErrorMessage('Please fill out all fields')
    }
  }

  // Validate that inputs are valid types/lengths/etc
  const validateInputs = (name, age, email, username, password, confirmPassword) => {
    // Validate that name has no numbers, isnt too long, and capitalize properly
    var hasNumber = /\d/
    if (hasNumber.test(name)) {
      setErrorMessage('Name cannot contain numbers')
      return false
    }
    
    if (name.length > 90) {
      setErrorMessage('Name is too long')
      return false
    }

    // Get rid of space at end if it is there
    let newName = name.trim() 

    const nameSplit = newName.split(' ')
    for (let i = 0; i < nameSplit.length; i++) {
      nameSplit[i] = nameSplit[i][0].toUpperCase() + nameSplit[i].substr(1)
    }
    name = nameSplit.join(' ')

    // Validate that age contains only numbers
    var isNumber = /^\d+$/
    if (!isNumber.test(age)) {
      setErrorMessage('Invalid age')
      return false
    }

    // Validate that email is actually an email and isnt too long
    // eslint-disable-next-line
    var isEmail = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/
    if (!isEmail.test(email)) {
      setErrorMessage('Invalid email')
      return false
    }

    if(email.length > 90) {
      setErrorMessage('Email is too long')
      return false
    }

    // Verify that username isnt too long
    if(username.length > 90) {
      setErrorMessage('Username is too long')
      return false
    }

    // Verify that password contains between 8 and 20 characters, a lowercase and capital letter, a number, a special character, and matches the confirmPassword
    var isValidPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/
    if (!isValidPassword.test(password)) {
      setErrorMessage('Password does not fit criteria')
      return false
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      return false
    }

    return true
  }

  // Update values from inputs
  const nameInput = (e) => {
    setName(e.target.value)
  }

  const ageInput = (e) => {
    setAge(e.target.value)
  }

  const emailInput = (e) => {
    setEmail(e.target.value)
  }

  const usernameInput = (e) => {
    setUsername(e.target.value)
  }

  const passwordInput = (e) => {
    setpassword(e.target.value)
  }

  const confirmPasswordInput = (e) => {
    setConfirmPassword(e.target.value)
  }

  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        <div className="signup-center">
          <div className="signup-logo-container">
            <img className="signup-logo-img" src={Logo} alt="LOGO" onClick={() => window.location.href = '/'} />
          </div>
          <div className="signup-box-container">
            <div className="signup-box-main-text">
              <h2>Sign Up</h2>
            </div>
            <div className="signup-box-sub-text">
              <p>{errorMessage}</p>
            </div>
            <div className="signup-input-container">
              <div className="signup-input half">
                <DefaultInput placeholder="Name" onChange={nameInput} />
              </div>
              <div className="signup-input half">
                <DefaultInput placeholder="Age" onChange={ageInput} />
              </div>
            </div>
            <div className="signup-input">
              <DefaultInput placeholder="Email" onChange={emailInput} />
            </div>
            <div className="signup-input">
              <DefaultInput placeholder="Username" onChange={usernameInput} />
            </div>
            <div className="signup-input">
              <DefaultInput placeholder="Password" type="password" onChange={passwordInput} />
            </div>
            <div className="signup-input">
              <DefaultInput placeholder="Confirm Password" type="password" onChange={confirmPasswordInput} />
            </div>
            <div className="signup-password-text">
              Password must contain between 8 & 20 characters, a lowercase & capital letter, a number, and a special character (!@#$%^&*?)
            </div>
            <div className="signup-btn">
              <ButtonFill value="Sign Up" color="black" onClick={() => signUp(name, age, email, username, password, confirmPassword)} />
            </div>
            <div className="signup-have-account">
              Have an account? &nbsp; <span><ButtonText value="Sign In" /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp