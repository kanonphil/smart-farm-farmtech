import { Route, Routes } from "react-router-dom"
import BasicLayout from "./components/layout/BasicLayout"
import Join from "./pages/member/Join"
import Login from './pages/member/Login'
import Dashboard from "./pages/manager/Dashboard"
import ActuatorControl from "./pages/manager/ActuatorControl"
import ManagerLayout from "./components/layout/ManagerLayout"

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<BasicLayout/>}>
          <Route path='join' element={ <Join /> }/>
          <Route path='login' element={<Login />} />
        </Route>

        <Route path="/manager" element={<ManagerLayout />}>
          <Route path='dashboard' element={<Dashboard/>} />
          <Route path='actuator' element={<ActuatorControl />} />
        </Route>
        
      </Routes>
    </>
  )
}

export default App
