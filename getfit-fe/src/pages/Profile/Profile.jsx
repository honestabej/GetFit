import './Profile.scss'
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Header from '../../components/Header/Header'
import ProfileInfo from '../../components/ProfileInfo/ProfileInfo'
import ProfileButton from '../../components/Buttons/ProfileButton/ProfileButton'
import WorkouButton from '../../components/Buttons/WorkoutButton/WorkoutButton'
import Exercises from '../../components/Profile/Exercises/Exercises'
import Stats from '../../components/Profile/Stats/Stats'
import Info from '../../components/Profile/Info/Info'

function Profile(props) {
  const userID = useRef()
  const [userInfo, setUserInfo] = useState({})
  const [userWeight, setUserWeight] = useState({})
  const [userGoal, setUserGoal] = useState({})
  // const [profilePictureDisplay, setProfilePictureDisplay] = useState()
  const [activeButton, setActiveButton] = useState(['active', '', '', ''])
  const [width, setWidth] = useState(undefined)
  const [arrowIcon, setArrowIcon] = useState(<></>)
  const [right, setRight] = useState(<></>)

  useEffect(() => {
    console.log("new profile rendered")
    // Check for current session
    axios.get("http://localhost:3001/users/login").then(res => {
      userID.current = res.data.user
      // console.log(userID.current)

      // Get user data if logged in
      if (res.data.loggedIn) {
        axios.get("http://localhost:3001/users?userID="+res.data.user).then(res => {
          setUserInfo(res.data[0])
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

      // Default to exercises tab
      setRight(<Exercises userid={userID.current} />)
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
      setRight(<Exercises userid={userID.current} />)
    } else if (btn === 1) {
      setRight(<Stats />)
    } else if (btn === 2) {
      setRight(<Info userid={userID.current} name={userInfo.name} email={userInfo.email} age={userInfo.age} profilepicture={userInfo.profilepicture} 
        weight={userWeight.weight} goal={userGoal.goal} setuserinfo={setUserInfo} setuserweight={setUserWeight} setusergoal={setUserGoal} setright={setRight} />)
    } else {
      setRight("An Error Has Occurred")
    }
  }

  // Sign the user out and destroy the session
  const signOut = () => {
    axios.get("http://localhost:3001/users/logout").then(res => {
      console.log("You have been logged out")
      window.location.href = '/'
    })
  }

  return (
    <div className='profile-wrapper'>
      <Header loggedIn={true} white={false} />
      <div className="profile-container">
        <div className="profile-info-wrapper">
          <div className="profile-info-left">
            <div className="profile-picture-wrapper">
              <img className="profile-picture" src={userInfo.profilepicture} key={userInfo.profilepicture} alt="Profile"/>
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