import { Route, Routes } from "react-router-dom"
import BasicLayout from "./components/layout/BasicLayout"

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<BasicLayout/>}>
          
        </Route>
      </Routes>
    </>
  )
}

export default App
