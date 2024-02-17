import './Header.scss'
import React, { useState, useEffect } from 'react'
import LargeLogoWhite from './../../images/GetFit_Logo_White.png'
import LargeLogo from './../../images/GetFit_Logo.png'
import SmallLogoWhite from './../../images/GetFit_Logo_White_Small.png'
import SmallLogo from './../../images/GetFit_Logo_Small.png'
import ButtonText from '../Buttons/ButtonText/ButtonText'
import ButtonNoFill from '../Buttons/ButtonNoFill/ButtonNoFill'
import ButtonFill from '../Buttons/ButtonFill/ButtonFill'

const Header = (prop) => {
  const [width, setWidth] = useState(undefined)
  const [isWideMenu, setIsWideMenu] = useState(false)
  const [isWideLogo, setIsWideLogo] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [icon, setIcon] = useState(<i className={"fa-solid fa-bars fa-xl "+prop.color}></i>)

  useEffect(() => {
    // Disable scrolling when menu is open
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    }    

    // Get width of window on load 
    setWidth(window.innerWidth)

    // Set the width of the window for changing header icons
    window.addEventListener('resize', () => setWidth(window.innerWidth))

    // Handle buttons for menu on right side of header
    if (width > 672) {
      setIsWideMenu(true)
    } else {
      setIsWideMenu(false)
    }

    // Handle site logo on left side of menu
    if (width > 390) {
      setIsWideLogo(true)
    } else {
      setIsWideLogo(false)
    }

    return () => {
      document.body.style.overflow = "scroll"
      window.removeEventListener('resize', () => setWidth(window.innerWidth))
    }
  }, [isMenuOpen, width])

  const menuClick = () => {
    setIsMenuOpen(!isMenuOpen)

    if (!isMenuOpen) {
      setIcon(<i className={"fa-solid fa-xmark fa-xl fa-black"}></i>)
    } else {
      setIcon(<i className={"fa-solid fa-bars fa-xl "+prop.color}></i>)
    }
  }

  return (
    <>
    <div className="header-wrapper">
      <div className="header-container">
        <div className="header-logo-wrapper">
          {isWideLogo ? <>
            {prop.white ? 
              <img className="header-logo-img" src={LargeLogoWhite} alt="LOGO" onClick={() => {window.location.href = "/"}} /> 
            : 
              <img className="header-logo-img" src={LargeLogo} alt="LOGO" onClick={() => {window.location.href = "/"}} /> 
            } </>
          :<>
            {prop.white ? 
              <img className="header-logo-img" src={SmallLogoWhite} alt="LOGO" onClick={() => {window.location.href = "/"}} /> 
            : 
              <img className="header-logo-img" src={SmallLogo} alt="LOGO" onClick={() => {window.location.href = "/"}} />
            }</>
          }
        </div>
        <div className="header-buttons-container">
          {prop.loggedIn ?
            <div className="header-button">
              <button onClick={() => {window.location.href = "/profile"}}><i className={"fa-solid fa-user fa-xl "+prop.color}></i></button>
            </div>
          :
            <>
              {isWideMenu ?
                <>
                  <div className="header-button">
                    <ButtonText value={"Sign In"} color={"white"} onClick={() => window.location.href = "/signin"} />
                  </div>
                  <div className="header-button">
                    <ButtonNoFill value={"Sign Up"} color={"white"} onClick={() => window.location.href = "/signup"} />
                  </div>
                </>
              :
                <div className="header-button">
                  <button onClick={menuClick} >{icon}</button>
                </div>
              }
            </>
          }
        </div>
      </div>
    </div>
    {isMenuOpen ?
      <>
        <div className="header-menu-background"></div>
        <div className="header-menu-wrapper">
          <div className="header-menu-container">
            <div className="header-menu-button">
              <ButtonText value={"Sign In"} color={"black"} onClick={() => window.location.href = "/signin"} />
            </div>
            <div className="header-menu-button bottom">
              <ButtonFill value={"Sign Up"} color={"black"} onClick={() => window.location.href = "/signup"} />
            </div>
          </div>
        </div>
      </>
    :
      <></>
    }
    </>
  )
}

export default Header