import './Home.scss'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Header from './../../components/Header/Header'
import Footer from './../../components/Footer/Footer'
import HomeImg from './../../images/home-img.png'
import SimpleInput from '../../components/Inputs/SimpleInput/SimpleInput'
import ButtonFill from './../../components/Buttons/ButtonFill/ButtonFill'

function Home(props) {
  const [loggedIn, setLoggedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check for current session
    axios.get("http://localhost:3001/users/login").then(res => {
      console.log(res)
      if (res.data.loggedIn === false) { 
        setLoggedIn(false)
      } else {
        setLoggedIn(true)
      }
    })
  }, [])

  const emailChange = (e) => {
    props.setEmail(e.target.value)
  }

  const joinNow = (email) => {
    navigate('/signup')
  }

  return (
    <div className="home-wrapper">
      <Header loggedIn={loggedIn} color={"fa-white"} />
      <div className="home-container">
        <div className="home-display">
          <div className="home-text-container">
            <div className="home-main-text">
              Ready, Set, <br />
              GetFit
            </div>
            <div className="home-sub-text">
              Easily plan, track, and analyze your workouts and goals to keep you on track and advancing
            </div>
            <div className="home-signup-container">
              <div className="home-signup">
                <div className="home-signup-input">
                  <SimpleInput placeholder={"Email"} onChange={emailChange} />
                </div>
                <div className="home-signup-button">
                  <ButtonFill value={"Join Now!"} color={"orange"} onClick={joinNow} />
                </div>
              </div>
            </div>
          </div>
          <div className="home-img-container">
            <img className="home-img" src={HomeImg} alt="LOGO"/>
          </div>
        </div>
        <Footer/>
      </div>
    </div>
  )
}

export default Home