import './Profile.scss'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Header from '../../components/Header/Header'
import ProfileInfo from '../../components/ProfileInfo/ProfileInfo'
import ProfileButton from '../../components/Buttons/ProfileButton/ProfileButton'
import WorkouButton from '../../components/Buttons/WorkoutButton/WorkoutButton'
// import DefaultProfile from '../../images/Default_Profile.jpg'
import Exercises from '../../components/Profile/Exercises/Exercises'
import Stats from '../../components/Profile/Stats/Stats'
import Info from '../../components/Profile/Info/Info'

// Get the newly saved info from the database
async function getInfo(userID, setUserInfo, setUserWeight, setUserGoal, setRight, saveInfo, setProfilePictureDisplay, isNewProfilePicture) {
  let info = {name: '', email: '', age: 0, profilepicture: '', weight: 0, goal: 0}
  if (isNewProfilePicture) setProfilePictureDisplay('')

  await axios.get("http://localhost:3001/users?userID="+userID).then(res => {
    setUserInfo(res.data[0])
    info.name = res.data[0].name
    info.email = res.data[0].email
    info.age = res.data[0].age
    info.profilepicture = res.data[0].profilepicture
    setProfilePictureDisplay(res.data[0].profilepicture)
  })

  await axios.get("http://localhost:3001/users/weight?userID="+userID).then(res => {
    setUserWeight(res.data[0])
    info.weight = res.data[0].weight
  }) 

  await axios.get("http://localhost:3001/users/goal?userID="+userID).then(res => {
    setUserGoal(res.data[0])
    info.goal = res.data[0].goal
  }) 

  setRight(<Info userid={userID} name={info.name} email={info.email} age={info.age} profilePicture={info.profilepicture} weight={info.weight} goal={info.goal} saveInfo={saveInfo} />)
}

function Profile(props) {
  const [userInfo, setUserInfo] = useState({})
  const [userWeight, setUserWeight] = useState({})
  const [userGoal, setUserGoal] = useState({})
  const [loggedIn, setLoggedIn] = useState(false)
  const [userID, setUserID] = useState('')
  const [profilePictureDisplay, setProfilePictureDisplay] = useState()
  const [activeButton, setActiveButton] = useState(['active', '', '', ''])
  const [width, setWidth] = useState(undefined)
  const [arrowIcon, setArrowIcon] = useState(<></>)
  const [right, setRight] = useState(<Exercises />)

  useEffect(() => {
    // Check for current session
    axios.get("http://localhost:3001/users/login").then(res => {
      setLoggedIn(res.data.loggedIn)
      setUserID(res.data.user)

      // Get user data if logged in
      if (res.data.loggedIn) {
        axios.get("http://localhost:3001/users?userID="+res.data.user).then(res => {
          setUserInfo(res.data[0])
          setProfilePictureDisplay(res.data[0].profilepicture)
        })
        
        axios.get("http://localhost:3001/users/weight?userID="+res.data.user).then(res => {
          setUserWeight(res.data[0])
        })

        axios.get("http://localhost:3001/users/goal?userID="+res.data.user).then(res => { 
          setUserGoal(res.data[0])
        })
      } else {
        window.location.href = '/' // TODO: change to error page when created
      }
    })

    // Get width of window on load
    setWidth(window.innerWidth)

    // Set the width of the window for changing header icons
    window.addEventListener('resize', () => setWidth(window.innerWidth))

    // Handle arrow icon
    if (width > 870) {
      setArrowIcon(<i className="fa-solid fa-arrow-right arrow-display"></i>)
    } else {
      setArrowIcon(<i className="fa-solid fa-arrow-down arrow-display"></i>)
    }

    return () => {
      window.removeEventListener('resize', () => setWidth(window.innerWidth))
    }
  }, [width])

  // Swap which component is rendered
  const profileButtonClicked = (btn) => {
    let arr = ['', '', '', '']
    for (let i = 0; i < activeButton.length; i++) {
      if (btn === i) {
        arr[i] = 'active'
      }
    }
    setActiveButton(arr)

    if (btn === 0) {
      setRight(<Exercises />)
    } else if (btn === 1) {
      setRight(<Stats />)
    } else if (btn === 2) {
      setRight(<Info userid={userID} name={userInfo.name} email={userInfo.email} age={userInfo.age} profilePicture={userInfo.profilepicture} weight={userWeight.weight} goal={userGoal.goal} saveInfo={saveInfo} />)
    } else {
      setRight("An Error Has Occurred")
    }
  }

  // Save new info to the database
  const saveInfo = (name, email, age, profilePicture, isNewProfilePicture, weight, goal) => {
    

    if (name !== userInfo.name || email !== userInfo.email || age !== userInfo.age || profilePicture !== userInfo.profilepicture || isNewProfilePicture) {
      axios.put("http://localhost:3001/users/update-user-info", {
        "userID": userID, 
        "name": name,
        "email": email,
        "age": age, 
        "profilePicture": profilePicture
      }, {
        "content-type": "application/json"
      }).then(res => {
        getInfo(userID, setUserInfo, setUserWeight, setUserGoal, setRight, saveInfo, setProfilePictureDisplay, isNewProfilePicture)
      })
    }

    if (weight !== userWeight.weight) {
      axios.post("http://localhost:3001/users/update-weight", {
        "userID": userID,
        "weight": weight
      }, {
        "content-type": "application/json"
      }).then(res => {
        getInfo(userID, setUserInfo, setUserWeight, setUserGoal, setRight, saveInfo, setProfilePictureDisplay)
      })
    }

    if (goal !== userGoal.goal) {
      axios.post("http://localhost:3001/users/update-goal", {
        "userID": userID,
        "goal": goal
      }, {
        "content-type": "application/json"
      }).then(res => {
        getInfo(userID, setUserInfo, setUserWeight, setUserGoal, setRight, saveInfo, setProfilePictureDisplay)
      })
    }
  }

  const signOut = () => {
    axios.get("http://localhost:3001/users/logout").then(res => {
      console.log("You have been logged out")
      window.location.href = '/'
    })
  }

  return (
    <div className='profile-wrapper'>
      <Header loggedIn={loggedIn} white={false} />
      <div className="profile-container">
        <div className="profile-info-wrapper">
          <div className="profile-info-left">
            <div className="profile-picture-wrapper">
              <img className="profile-picture" src={profilePictureDisplay} key={profilePictureDisplay} alt="Profile"/>
            </div>
            {userInfo.name}
            <div className="profile-info-container">
              <ProfileInfo age={userInfo.age} age_lbl={'Age'} weight={userWeight.weight} weight_lbl={'Weight'} goal={userGoal.goal} goal_lbl={'Goal'} />
            </div>
          </div>
          <div className="profile-info-right">
            <div className="profile-buttons-container">
              <div className="profile-button-container">
                <ProfileButton onClick={() => profileButtonClicked(0)} icon={<i className="fa-solid fa-dumbbell icon"></i>} value={'My Exercises'} arrow={arrowIcon} active={activeButton[0]} />
              </div>
              <div className="profile-button-container">
                <ProfileButton onClick={() => profileButtonClicked(1)} icon={<i className="fa-solid fa-chart-simple icon"></i>} value={'My Stats'} arrow={arrowIcon} active={activeButton[1]} />
              </div>
              <div className="profile-button-container">
                <ProfileButton onClick={() => profileButtonClicked(2)} icon={<i className="fa-solid fa-address-card icon"></i>} value={'My Info'} arrow={arrowIcon} active={activeButton[2]} />
              </div>
              <div className="profile-button-container">
                <ProfileButton onClick={signOut} icon={<i className="fa-solid fa-right-from-bracket icon"></i>} value={'Sign Out'} arrow={''} active={activeButton[3]} color={'red'} />
              </div>
              <div className="profile-button-container workout">
                <WorkouButton onClick={() => window.location.href = '/workout'} value={'Workout Now'} />
              </div>
            </div>
          </div>
        </div>
        <div className="vertical-line-two"></div>
        <div className="horizontal-line"></div>
        <div className="profile-display-wrapper">
          {right}
        </div>
      </div>
    </div>
  )
}

export default Profile