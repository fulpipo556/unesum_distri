import {Button} from '@mui/material'
import  {useNavigate} from "react-router-dom"
function Navegac() {
  
    const navigate = useNavigate()
    return (
      <div>
        <Button variant ='contained' color='secondary' id="boton" onClick={() => navigate("/distrif")}>Funciones Sustantivas</Button>
        <Button variant ='contained' color='success' id="boton1" onClick={() => navigate("/act")}>Actividades</Button>
        <Button variant ='contained' color='info' id="boton2" onClick={() => navigate("/doc")}>Período</Button>
        <Button variant ='contained' color='info' id="boton6" onClick={() => navigate("/doce")}>Docente</Button>
        <Button variant ='contained' color='secondary' id="boton3" onClick={() => navigate("/distrib")}>Distributivo</Button>
        <Button variant ='contained' color='success' id="boton4" onClick={() => navigate("/he")}>Horas Extracurriculares</Button>
        <Button variant ='contained' color='info' id="boton5" onClick={() => navigate("/plan")}>Plan de Trabajo</Button>

      </div>
           
    )
  }
  
  export default Navegac