import './Profile.scss'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Header from '../../components/Header/Header'
import ButtonNoFill from '../../components/Buttons/ButtonNoFill/ButtonNoFill'

function Profile(props) {
  // UseState variables for displaying info from the DB
  const [userInfo, setUserInfo] = useState([])
  const [userWeight, setUserWeight] = useState([])
  const [userGoal, setUserGoal] = useState([])
  const [loggedIn, setLoggedIn] = useState(false)
  const [userID, setUserID] = useState('')

  useEffect(() => {
    // Check for current session
    axios.get("http://localhost:3001/users/login").then(res => {
      setLoggedIn(res.data.loggedIn)
      setUserID(res.data.user)

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
    })
  }, [])

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
          <div className="profile-picture-wrapper">
          </div>
          {userInfo.name}
          <div className="profile-info-container">
            <div className="profile-info">
              <div className="info">{userInfo.age}</div>
              <div className="info-label">Age</div>
            </div>
            <div className="vertical-line"></div>
            <div className="profile-info">
              <div className="info">{userWeight.weight}</div>
              <div className="info-label">Weight</div>
            </div>
            <div className="vertical-line"></div>
            <div className="profile-info">
              <div className="info">{userGoal.goal}</div>
              <div className="info-label">Goal</div>
            </div>
          </div>
          <div className="profile-button">
            <button><i class="fa-solid fa-dumbbell"></i> My Exercises</button>
          </div>
          <div className="profile-button">
            <input value='Edit My Profile' type='submit' />
          </div>
          <div className="signout-button">
            <ButtonNoFill value={'Sign Out'} color={'red'} onClick={signOut} />
          </div>
        </div>
        <div className="vertical-line"></div>
        <div className="profile-stats-wrapper">
          Stats coming soon
        </div>
      </div>
    </div>
  )
}

export default Profile