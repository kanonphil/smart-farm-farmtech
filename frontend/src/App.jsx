import { Route, Routes } from "react-router-dom"
import BasicLayout from "./components/layout/BasicLayout"
import Join from "./pages/member/Join"
import Login from './pages/member/Login'
import Dashboard from "./pages/manager/Dashboard"
import ActuatorControl from "./pages/manager/ActuatorControl"

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<BasicLayout/>}>
          <Route path='join' element={ <Join /> }/>
          <Route path='login' element={<Login />} />
        </Route>

        <Route path='/manager' element={<Dashboard/>}>
        </Route>

        {/* 임시 페이지 */}
        <Route path='/manager/actuator' element={<ActuatorControl />} />
      </Routes>
    </>
  )
}

export default App
