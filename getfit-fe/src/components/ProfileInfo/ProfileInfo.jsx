import './ProfileInfo.scss'
import React from 'react'
import Info from './Info/Info'

function ProfileInfo(props) {

  return (
    <div className="profile-info">
      <Info info={props.age} label={props.age_lbl} />
      <div className="vertical-line"></div>
      <Info info={props.weight} label={props.weight_lbl} />
      <div className="vertical-line"></div>
      <Info info={props.goal} label={props.goal_lbl} />
    </div>
  )
}

export default ProfileInfo