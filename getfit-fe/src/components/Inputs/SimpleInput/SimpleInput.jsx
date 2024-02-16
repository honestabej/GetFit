import './SimpleInput.scss'
import React from 'react'

const SimpleInput = (prop) => {
  return (
    <div className="simple-input-container">
      <div className="simple-input-overlay"></div>
      <input className="simple-input" placeholder=" " type={prop.type} onChange={prop.onChange} />
      <div className="simple-input-overlay-text">{prop.placeholder}</div>
    </div>
  )
}

export default SimpleInput