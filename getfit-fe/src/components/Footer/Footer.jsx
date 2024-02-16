import './Footer.scss'
import React from 'react'
import Logo from './../../images/GetFit_Logo.png'
// import ButtonText from '../Buttons/ButtonText/ButtonText'

const Footer = (prop) => {

  return (
    <div className="footer-wrapper">
      <div className="footer-container">
        <div className="footer-left">
          <div className="footer-logo-container">
            <img className="footer-logo" src={Logo} alt="LOGO" />
          </div>
          Built by Abe Johnson.
        </div>
        {/* <div className="footer-right">
          <div className="footer-right-text">
            Directory
          </div>
          <div className="footer-button">
            <ButtonText value={"Home"} color={"black"} onClick={true} />
          </div>
          <div className="footer-button">
            <ButtonText value={"Resources"} color={"black"} onClick={true} />
          </div>
          <div className="footer-button">
            <ButtonText value={"Contact"} color={"black"} onClick={true} />
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default Footer