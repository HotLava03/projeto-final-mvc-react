import { useRouter } from 'next/dist/client/router'
import React, { useEffect, useState } from 'react'
import { useConfig } from '../config'

export const Nav = (props) => {
  const config = useConfig()
  const [loggedIn, setLoggedIn] = useState(false)
  const [permissions, setPermissions] = useState([])

  useEffect(() => {
    if (loggedIn) return
    fetch(config.apiUri + '/auth').then(res => {
      if (res.ok) {
        setLoggedIn(true)
        // Now fetch permissions.
        fetch(config.apiUri + '/permissions').then(async pRes => {
          if (pRes.ok) {
            const json = await res.json()
            setPermissions(json.permissions)
          }
        })
      }
    }).catch(() => console.log('User is not logged in.'))
  }, [config.apiUri, loggedIn, setLoggedIn]) 

  const { page } = props

  return (
    <nav className='menu clearfix'>
      <ul>
        <NavItem name='' page={page}>Home</NavItem>
        <NavItem name='events' page={page}>Events</NavItem>
        <NavItem name='news' page={page}>News</NavItem>
        <NavItem name='associations' page={page}>Associations</NavItem>
        <NavItem name='images' page={page}>Image Gallery</NavItem>
        {permissions.includes('admin') && <NavItem name='manage' page={page}>Admin Dashboard</NavItem>}
        <NavItem login loggedIn={loggedIn} />
      </ul>
    </nav>
  )
}

const NavItem = (props) => {
  const router = useRouter()
  const config = useConfig()

  const handleClick = (e) => {
    let target = e.target
    if (target.tagName === 'SPAN') target = target.parentElement
    router.push(`${config.homeUri}/${target.id}`)
  }

  return <li id={props.name} className={props.page === props.name && 'active'} onClick={handleClick}><span>{props.children}</span></li>
}