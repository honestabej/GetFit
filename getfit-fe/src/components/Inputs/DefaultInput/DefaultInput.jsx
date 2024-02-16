import './DefaultInput.scss'
import React from 'react'

const DefaultInput = (props) => {
  return (
    <div className="default-input-container">
      <input className="input" id={props.id} placeholder={props.placeholder} type={props.type} onChange={props.onChange} required />
    </div>
  )
}

export default DefaultInput