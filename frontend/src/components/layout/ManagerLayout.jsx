import React from 'react'
import { Outlet } from 'react-router-dom'

const ManagerLayout = () => {
  return (
    <>
      <div>ManagerLayout</div>
      <Outlet />
    </>
  )
}

export default ManagerLayout