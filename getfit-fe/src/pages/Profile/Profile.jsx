import './Profile.scss'
import React, { useState, useEffect } from 'react'
import axios from 'axios'

function Profile(props) {
  const [loggedIn, setLoggedIn] = useState(false)
  const [userID, setUserID] = useState('')

  useEffect(() => {
    // Check for current session
    axios.get("http://localhost:3001/users/login").then(res => {
      console.log(res.data.user)
      if (res.data.loggedIn === false) { 
        setLoggedIn(false)
      } else {
        setLoggedIn(true)
        setUserID(res.data.user)
      }
    })
  })

  return (
    <>
      Profile
      {loggedIn ? userID : "None"}
    </>
  )
}

export default Profile