import './Info.scss'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { storage } from '../../../Firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import LabelInput from '../../Inputs/LineInput/LabelInput'
import ButtonFill from '../../Buttons/ButtonFill/ButtonFill'

// Post info to DB, and after posted, rerender this component to set the new defaults
async function postInfoToDB(userID, propsName, newName, propsEmail, newEmail, propsAge, newAge, propsProfilePicture, newProfilePicture, propsWeight, newWeight, propsGoal, newGoal, setUserInfo, setUserWeight, setUserGoal, setRight, setSaveMessage, setFile) {
  // Initialie temp object with all of the original data, and change it as needed below
  let temp = {'userid': userID, 'name': propsName, 'email': propsEmail, 'age': propsAge, 'profilepicture': propsProfilePicture, 'weight': propsWeight, 'goal': propsGoal }
  setUserInfo({'userid': userID, 'name': newName, 'email': newEmail, 'age': newAge, 'profilepicture': ''})

  if (propsName !== newName || propsEmail !== newEmail || propsAge !== newAge || propsProfilePicture !== newProfilePicture) {
    await axios.put("http://localhost:3001/users/update-user-info", {
      "userID": userID, 
      "name": newName,
      "email": newEmail,
      "age": newAge, 
      "profilePicture": newProfilePicture
    }, {
      "content-type": "application/json"
    }).then(() => {
      // Update the values in the profile component
      setUserInfo({'userid': userID, 'name': newName, 'email': newEmail, 'age': newAge, 'profilepicture': newProfilePicture})
    })

    // Update the temp object with the new data
    temp.name = newName
    temp.email = newEmail
    temp.age = newAge
    temp.profilepicture = newProfilePicture
  }

  if (propsWeight !== newWeight) {
    await axios.post("http://localhost:3001/users/update-weight", {
      "userID": userID,
      "weight": newWeight
    }, {
      "content-type": "application/json"
    }).then(() => {
      // Update the values in the profile component
      setUserWeight({'weight': newWeight})
    })

    // Update the temp object with the new data
    temp.weight = newWeight
  }

  if (propsGoal !== newGoal) {
    await axios.post("http://localhost:3001/users/update-goal", {
      "userID": userID,
      "goal": newGoal
    }, {
      "content-type": "application/json"
    }).then(() => {
      // Update the values in the profile component
      setUserGoal({'goal': newGoal})
    })

    // Update the temp object with the new data
    temp.goal = newGoal
  }

  // Update the placeholders in this component
  setRight(<Info userid={temp.userid} name={temp.name} age={temp.age} email={temp.email} profilepicture={temp.profilepicture} 
    weight={temp.weight} goal={temp.goal} setuserinfo={setUserInfo} setuserweight={setUserWeight} setusergoal={setUserGoal} setright={setRight} />)

  setFile(null)
  setSaveMessage('Saved!')
}

function Info(props) {
  const [name, setName] = useState(props.name)
  const [age, setAge] = useState(props.age)
  const [email, setEmail] = useState(props.email)
  const [profilePicture, setProfilePicture] = useState(props.profilepicture)
  const [weight, setWeight] = useState(props.weight)
  const [goal, setGoal] = useState(props.goal)
  const [file, setFile] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    console.log("New info rendered")
  }, [])

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
      setAge(Number(e.target.value))
    }
  }

  const profilePictureChange = (e) => {
    setFile(e.target.files[0])
    setProfilePicture(URL.createObjectURL(e.target.files[0]))
  }

  const weightChange = (e) => {
    if (e.target.value === '') {
      setWeight(props.weight)
    } else {
      setWeight(Number(e.target.value))
    }
  }
   
  const goalChange = (e) => {
    if (e.target.value === '') {
      setGoal(props.goal)
    } else {
      setGoal(Number(e.target.value))
    }
  }

  const emailChange = (e) => {
    if (e.target.value === '') {
      setEmail(props.email)
    } else {
      setEmail(e.target.value)
    }
  }

  // Process of saving new user info
  const saveInfo = (name, email, age, profilePicture, weight, goal) => {
    let isValidAndName = validateFormatInputs(name, email, age, weight, goal)

    // Ensure inputs are correctly formatted
    if (isValidAndName[0]) {
      setSaveMessage('Saving...')
      var pictureUrl = props.profilepicture
      // If file was changed, upload selected phot to firebase and get the url before posting to DB
      if (file !== null) {
        const imageRef = ref(storage, `profilePictures/${props.userid}`)
        uploadBytes(imageRef, file).then((snapshot) => {
          getDownloadURL(snapshot.ref).then((url) => {
            pictureUrl = url
          }).then(() => {
            // Save the new userInfo after the image has uploaded and url has been retrieved
            postInfoToDB(props.userid, props.name, isValidAndName[1], props.email, email, props.age, age, props.profilepicture, pictureUrl, props.weight, weight, props.goal, goal, props.setuserinfo, props.setuserweight, props.setusergoal, props.setright, setSaveMessage, setFile)
          })
        })
      } else {
        // Save the new userInfo after the image has uploaded
        postInfoToDB(props.userid, props.name, isValidAndName[1], props.email, email, props.age, age, props.profilepicture, pictureUrl, props.weight, weight, props.goal, goal, props.setuserinfo, props.setuserweight, props.setusergoal, props.setright, setSaveMessage, setFile)
      }
    }
  }

  // Validate and format inputs
  const validateFormatInputs = (name, email, age, weight, goal) => {
    // Reset error message
    setErrorMessage('')

    // Validate that name has no numbers, isnt too long, and then capitalize it properly
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
      console.log(nameSplit[i])
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
      setErrorMessage('Invalid weight')
      return false
    }

    // Verify that goal contains only numbers
    if (!isNumber.test(goal)) {
      setErrorMessage('Invalid goal')
      return false
    }

    return [true, name]
  }

  return (
    <div className="info-wrapper">
      <div className="info-top-row">
        <div className="info-image-container">
          <div className="info-image-overlay"></div>
          <img className="info-image" src={profilePicture} alt='Profile' />
          <div className="info-image-icon">
            <label htmlFor="file-upload" className="info-file-upload">
              <i className="fa-solid fa-pen-to-square"></i>
            </label>
            <input type="file" id="file-upload" accept="image/*" onChange={profilePictureChange} />
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
        <ButtonFill value={"Save Info"} color={"black"} onClick={() => saveInfo(name, email, age, profilePicture, weight, goal)} />
      </div>
      <div className="info-message-container error">
        {errorMessage}
      </div>
      <div className="info-message-container save">
        {saveMessage}
      </div>
    </div>
  )
}

export default Info