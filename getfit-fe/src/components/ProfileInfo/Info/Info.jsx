import './Info.scss'
import React from 'react'

function Info(props) {

  return (
    <div className="info-container">
      <div className="info">{props.info}</div>
      <div className="info-label">{props.label}</div>
    </div>
  )
}

export default Info