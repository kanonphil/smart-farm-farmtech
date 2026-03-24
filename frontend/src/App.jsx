import { Route, Routes } from "react-router-dom"
import BasicLayout from "./components/layout/BasicLayout"
import Join from "./pages/member/Join"

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<BasicLayout/>}>
          <Route path='join' element={ <Join /> }/>
        </Route>
      </Routes>
    </>
  )
}

export default App
