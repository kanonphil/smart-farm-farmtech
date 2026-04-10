import { Route, Routes } from "react-router-dom"
import BasicLayout from "./components/layout/BasicLayout"
import Join from "./pages/member/Join"
import Login from './pages/member/Login'
import ActuatorControl from "./pages/manager/ActuatorControl"
import ManagerLayout from "./components/layout/ManagerLayout"
import ManagerHome from "./pages/manager/ManagerHome"
import PasswordConfirm from "./pages/member/PasswordConfirm"
import MemberLayout from "./components/layout/MemberLayout"
import EditInfo from "./pages/member/EditInfo"
import OrderList from "./pages/member/OrderList"
import Reviews from "./pages/member/Reviews"
import Home from './pages/Home'
import About from './pages/Info/About'
import UserReview from './pages/Info/UserReview'
import EditPassword from './pages/member/EditPassword'
import Payments from './pages/payments/Payments'
import PaymentSuccess from './pages/payments/PaymentSuccess'
import PaymentFail from './pages/payments/PaymentFail'
import ProductList from "./pages/product/ProductList"
import ProductDetail from "./pages/product/ProductDetail"
import Cart from "./pages/product/Cart"
import Order from "./pages/product/Order"
import Products from "./pages/manager/Products"
import FindAccount from "./pages/member/FindAccount"
import AiChef from "./pages/ai/AiChef"
import useAuthStore from "./store/authStore"
import { useEffect } from "react"
import { axiosInstance } from "./api/axiosInstance"
import Stock from "./pages/manager/Stock"
import OrderManage from './pages/manager/OrderManage'
import SensorChart from "./pages/manager/SensorChart"
import AlertModal from "./components/common/AlertModal"
import Toast from './components/common/Toast'


function App() {
  const { setToken, alertModal, closeAlert, toast, closeToast } = useAuthStore()
  const { setToken, setAuthReady, alertModal, closeAlert } = useAuthStore()

  useEffect(()=>{
    // 앱 시작 시 딱 한 번 실행
    // 로그인 여부와 관계없이 항상 Refresh Token 발급
    // 자동로그인 OFF → 세션 쿠키 (브라우저 닫으면 삭제) → 짧은 유효기간
    // 자동로그인 ON  → 영구 쿠키 (30일 유지) → 긴 유효기간
    // 브라우저 닫고 재접속 시
    //   - 자동로그인 OFF → 세션 쿠키 사라짐 → 재발급 실패 → 비로그인 상태
    //   - 자동로그인 ON  → 영구 쿠키 살아있음 → 재발급 성공 → 로그인 유지
    const silentRefresh = async () => {
      try{
        const response = await axiosInstance.post('/members/refresh')
        const newToken = response.headers['authorization']
        if(newToken) {
          // 발급받은 Access Token을 Zustand store에 저장
          setToken(newToken)
        }
      }catch (e){
        // Refresh Token 없거나 만료 → 비로그인 상태 유지
      } finally {
        setAuthReady() // 성공/실패 상관없이 준비 완료 표시
      }
    }
    silentRefresh()
  }, [])

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
          <Route path="ai-chef" element={<AiChef/>} />
          <Route path="user-reviews" element={<UserReview/>} />
        </Route>

        {/* 관리자 페이지 */}
        <Route path="/manager" element={<ManagerLayout />}>
          <Route index element={<ManagerHome/>} />
          {/* <Route path='reg-product' element={<ProductRegister />} /> */}
          <Route path='actuator' element={<ActuatorControl />} />
          <Route path='products' element={<Products/>} />
          <Route path='stock' element={<Stock />} />
          <Route path='orders' element={<OrderManage />} />
          <Route path='sensor-chart' element={<SensorChart />} />
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

      <AlertModal
        show={alertModal.show}
        message={alertModal.message}
        onClose={() => {
          alertModal.callback?.()
          closeAlert()
        }}
      />
      <Toast
        show={toast.show}
        message={toast.message}
        onClose={closeToast}
      />
    </>
  )
}

export default App
