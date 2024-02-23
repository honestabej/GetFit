import './LabelInput.scss'
import React from 'react'

const LabelInput = (prop) => {
  return (
    <div className="label-input-container">
      <input className={"label-input "+prop.center} placeholder={prop.placeholder} onChange={prop.onChange} />
      <div className={"label "+prop.center}>{prop.label}</div>
    </div>
  )
}

export default LabelInput