import './ProfileButton.scss'
import React from 'react'

function ProfileButton(props) {

  return (
    <div className="profile-button">
      <button onClick={props.onClick} className={props.active+' '+props.color}>
        {props.icon}{props.value}{props.arrow}
      </button>
    </div>
  )
}
export default ProfileButton