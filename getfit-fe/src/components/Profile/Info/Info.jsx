import './Info.scss'
import React, { useState } from 'react'
import axios from 'axios'
import DefaultProfile from '../../../images/Default_Profile.jpg'
import LabelInput from '../../Inputs/LineInput/LabelInput'
import ButtonFill from '../../Buttons/ButtonFill/ButtonFill'

function Info(props) {
  const [name, setName] = useState(props.name)
  const [age, setAge] = useState(props.age)
  const [email, setEmail] = useState(props.email)
  const [profilePicture, setProfilePicture] = useState(props.profilePicture)
  const [weight, setWeight] = useState(props.weight)
  const [goal, setGoal] = useState(props.goal)
  const [errorMessage, setErrorMessage] = useState('')

  const nameChange = (e) => {
    if (e.target.value === '') {
      setName(props.name)
    } else {
      setName(e.target.value)
    }
  }

  const ageChange = (e) => {
    if (e.target.value === '') {
      setAge(props.age)
    } else {
      setAge(e.target.value)
    }
  }

  const profilePictureChange = (e) => {
    // console.log(e.target.files[0])
    // if (e.target.value === '') {
    //   setProfilePicture(props.profilePicture)
    // } else {
    //   setProfilePicture(e.target.files[0])
    // }
  }

  const weightChange = (e) => {
    if (e.target.value === '') {
      setWeight(props.weight)
    } else {
      setWeight(e.target.value)
    }
  }
   
  const goalChange = (e) => {
    if (e.target.value === '') {
      setGoal(props.goal)
    } else {
      setGoal(e.target.value)
    }
  }

  const emailChange = (e) => {
    if (e.target.value === '') {
      setEmail(props.email)
    } else {
      setEmail(e.target.value)
    }
  }

  const saveInfo = (name, email, age, weight, goal) => {
    setErrorMessage('')
    let isValid = validateInputs(name, email, age, weight, goal)

    // Ensure inputs are correctly formatted
    if (isValid) {
      props.saveInfo(name, email, age, weight, goal)
    }
  }

  // Validate that inputs are valid types/lengths/etc
  const validateInputs = (name, email, age, weight, goal) => {
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

    const nameSplit = name.split(' ')
    for (let i = 0; i < nameSplit.length; i++) {
      nameSplit[i] = nameSplit[i][0].toUpperCase() + nameSplit[i].substr(1)
    }
    name = nameSplit.join(' ')

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

    // Validate that age contains only numbers
    var isNumber = /^\d+$/
    if (!isNumber.test(age)) {
      setErrorMessage('Invalid age')
      return false
    }

    // Verify that weight contains only numbers
    if (!isNumber.test(weight)) {
      setErrorMessage('Invalid age')
      return false
    }

    // Verify that goal contains only numbers
    if (!isNumber.test(goal)) {
      setErrorMessage('Invalid age')
      return false
    }

    return true
  }

  return (
    <div className="info-wrapper">
      <div className="info-top-row">
        <div className="info-image-container">
          <div className="info-image-overlay"></div>
          <img className="info-image" src={DefaultProfile} alt='Profile' />
          <div className="info-image-icon">
            <label htmlFor="file-upload" className="info-file-upload">
              <i className="fa-solid fa-pen-to-square"></i>
            </label>
            <input type="file" id="file-upload" onChange={profilePictureChange} />
          </div>
        </div>
        <div className="info-name-container">
          <LabelInput placeholder={name} label={'Name'} onChange={nameChange} />
        </div>
      </div>
      <div className="info-email-container">
        <LabelInput placeholder={email} label={'Email'} onChange={emailChange} />
      </div>
      <div className="info-age-weight-goal-container">
        <div className="info-age-weight-goal-input">
          <LabelInput placeholder={age} label={'Age'} center={'center'} onChange={ageChange} />
        </div>
        <div className="info-age-weight-goal-input">
          <LabelInput placeholder={weight} label={'Weight'} center={'center'} onChange={weightChange} />
        </div>
        <div className="info-age-weight-goal-input">
          <LabelInput placeholder={goal} label={'Goal'} center={'center'} onChange={goalChange} />
        </div>
      </div>
      <div className="info-save-button-container">
        <ButtonFill value={"Save Info"} color={"black"} onClick={() => saveInfo(name, email, age, weight, goal)} />
      </div>
      <div className="info-error-message-container">
        {errorMessage}
      </div>
    </div>
  )
}

export default Info