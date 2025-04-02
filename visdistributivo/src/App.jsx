import { BrowserRouter, Routes, Route } from "react-router-dom";
import {Container} from "@mui/material";
import Distrifunc from "./components/Distrifunc";
import Actividades from "./components/Actividades";
import Distribu from "./components/Distribu";
import Docenpri from "./components/Docenpri";
import Docente from "./components/Docente";
import HorasEx from "./components/HorasEx";
import PlanTra from "./components/PlanTra";
import Navegac from "./components/Navegac";
import { SnackbarProvider } from "notistack";
import './App.css'


function App() {
  

  return (
    <BrowserRouter>
     
        <Navegac />
        <Container >
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={3000}
        >
          <Routes>
            <Route path="/distrif" element={<Distrifunc />} />               
            <Route path="/act" element={<Actividades />} />
            
            <Route path="/distrib" element={<Distribu />} />
            <Route path="/doc" element={<Docente />} />
            <Route path="/doce" element={<Docenpri />} />
            <Route path="/he" element={<HorasEx />} />
            <Route path="/plan" element={<PlanTra />} />
          </Routes>
          </SnackbarProvider>
        </Container>
     
    </BrowserRouter>
  )
}

export default App
