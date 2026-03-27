import { Route, Routes } from "react-router-dom"
import BasicLayout from "./components/layout/BasicLayout"
import Join from "./pages/member/Join"
import Login from './pages/member/Login'
import Dashboard from "./pages/manager/Dashboard"
import ActuatorControl from "./pages/manager/ActuatorControl"
import ManagerLayout from "./components/layout/ManagerLayout"
import ThresholdPreset from "./pages/manager/ThresholdPreset"
import ProductRegister from "./pages/manager/ProductRegister"
import AlertHistory from "./pages/manager/AlertHistory"
import PasswordConfirm from "./pages/member/PasswordConfirm"

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<BasicLayout/>}>
          <Route path='join' element={ <Join /> }/>
          <Route path='login' element={<Login />} />
          <Route path='pw-confirm' element={<PasswordConfirm/>}/>
        </Route>

        <Route path="/manager" element={<ManagerLayout />}>
          <Route path='dashboard' element={<Dashboard/>} />
          <Route path='reg-product' element={<ProductRegister />} />
          <Route path='actuator' element={<ActuatorControl />} />
          <Route path='threshold' element={<ThresholdPreset />} />
          <Route path='alerts' element={<AlertHistory />} />
        </Route>
        
      </Routes>
    </>
  )
}

export default App
