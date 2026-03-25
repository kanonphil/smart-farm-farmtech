import { Route, Routes } from "react-router-dom"
import BasicLayout from "./components/layout/BasicLayout"
import Join from "./pages/member/Join"
import Login from './pages/member/Login'
import Dashboard from "./pages/manager/Dashboard"

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
      </Routes>
    </>
  )
}

export default App
