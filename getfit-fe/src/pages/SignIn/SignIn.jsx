import './SignIn.scss'
import React from 'react'
import axios from 'axios'

function SignIn(props) {
  const temp = () => {
    axios.post("http://localhost:3001/users/login", {
      "emailUsername": "test1@gmail.com",
      "password": "password"
    }, {
      "content-type": "application/json"
    }).then(res => {
      console.log(res)
    })
  }

  return (
    <>
      SignIn
      <button onClick={temp}> TEMP </button>
    </>
  )
}

export default SignIn