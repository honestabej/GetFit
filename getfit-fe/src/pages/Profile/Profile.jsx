import './Profile.scss'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Header from '../../components/Header/Header'

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

      if (!res.data.loggedIn) {
        window.location.href = '/' // TODO: change to error page when created
      } else {
        axios.get("http://localhost:3001/users?userID="+userID).then(res => {
          setUserInfo(res.data)
        })
  
        axios.get("http://localhost:3001/users/weight?userID="+userID).then(res => {
          setUserWeight(res.data)
        }) 
  
        axios.get("http://localhost:3001/users/goal?userID="+userID).then(res => {
          setUserGoal(res.data)
        })
      }
    })
  }, [userID])

  const logout = () => {
    axios.get("http://localhost:3001/users/logout").then(res => {
      console.log("You have been logged out")
      window.location.href = '/'
    })
  }

  return (
    <div className='profile-wrapper'>
      <Header loggedIn={loggedIn} color={'fa-black'} />
    </div>
  )
}

export default Profile