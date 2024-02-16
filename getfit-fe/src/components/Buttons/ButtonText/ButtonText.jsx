import './ButtonText.scss'
import React from 'react'

const ButtonText = (prop) => {
  return (
    <div className={"button-text bt-"+prop.color}>
      <input type="submit" value={prop.value} onClick={prop.onClick} />
    </div>
  )
}

export default ButtonText