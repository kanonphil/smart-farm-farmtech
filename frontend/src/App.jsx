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
import MemberLayout from "./components/layout/MemberLayout"
import EditInfo from "./pages/member/EditInfo"
import OrderList from "./pages/member/OrderList"
import Reviews from "./pages/member/Reviews"
import EditPassword from "./pages/member/EditPassword"
import About from "./pages/Info/about"
import Home from "./pages/Home"


function App() {
  return (
    <>
      <Routes>

        {/* 모두가 보는 페이지 */}
        <Route path='/' element={<BasicLayout/>}>
          <Route index element={<Home/>}/>
          <Route path='join' element={ <Join /> }/>
          <Route path='login' element={<Login />} />
          <Route path='pw-confirm' element={<PasswordConfirm/>}/>
          <Route path="about" element={<About/>}/>
        </Route>

        {/* 관리자 페이지 */}
        <Route path="/manager" element={<ManagerLayout />}>
          <Route path='dashboard' element={<Dashboard/>} />
          <Route path='reg-product' element={<ProductRegister />} />
          <Route path='actuator' element={<ActuatorControl />} />
          <Route path='threshold' element={<ThresholdPreset />} />
          <Route path='alerts' element={<AlertHistory />} />
        </Route>

        {/* 일반 회원 마이페이지 */}
        <Route path="/mypage" element={<MemberLayout/>}>
          <Route index element={<EditInfo/>}/>
          <Route path="orders" element={<OrderList/>}/>
          <Route path="pw" element={<EditPassword/>}/>
          <Route path="reviews" element={<Reviews/>}/>
        </Route>

      </Routes>
    </>
  )
}

export default App
