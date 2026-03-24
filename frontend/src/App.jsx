import { Route, Routes } from "react-router-dom"
import BasicLayout from "./components/layout/BasicLayout"
import Login from './pages/member/Login'

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<BasicLayout/>}>
          <Route path='login' element={<Login />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
