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
import Home from './pages/Home'
import About from './pages/Info/About'
import EditPassword from './pages/member/EditPassword'
import Payments from './pages/payments/Payments'
import PaymentSuccess from './pages/payments/PaymentSuccess'
import PaymentFail from './pages/payments/PaymentFail'
import ProductList from "./pages/product/ProductList"
import ProductDetail from "./pages/product/ProductDetail"
import Cart from "./pages/product/Cart"
import Order from "./pages/product/Order"
import FindAccount from "./pages/member/FindAccount"

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
          <Route path='products' element={<ProductList />} />
          <Route path='products/:productId' element={<ProductDetail/>}/>
          <Route path="cart" element={<Cart/>}/>
          <Route path="order" element={<Order/>}/>
          <Route path="find-account" element={<FindAccount />} />
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

        {/* 결제 페이지 (test) */}
        <Route path="/payment" element={<BasicLayout />}>
          <Route index element={<Payments />} />
          <Route path="success" element={<PaymentSuccess />} />
          <Route path="fail" element={<PaymentFail />} />
        </Route>

      </Routes>
    </>
  )
}

export default App
