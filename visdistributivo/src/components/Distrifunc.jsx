import  { useState, useEffect } from 'react';
import { TextField, Box, InputLabel, FormControl, Select, MenuItem, Button, ButtonGroup, FormHelperText, Snackbar } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UpdateIcon from '@mui/icons-material/Update';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Axios from 'axios';
import { useSnackbar } from "notistack";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function Distrifunc() {
  const [abreviatura, setAbreviatura] = useState('');
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState('');
  const [errores, setErrores] = useState({ texto: '', abreviatura: '', estado: '' });
  const [listaFunciones, setListaFunciones] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [id, setId] = useState(null);
  const [accion, setAccion] = useState('agregar');
  const [abrirSnackbar, setAbrirSnackbar] = useState(false);
  const [mensajeSnackbar, setMensajeSnackbar] = useState('');


  const opcionesEstado = [
    { valor: 'Activado', etiqueta: 'Activado' },
    { valor: 'Desactivado', etiqueta: 'Desactivado' },
  ];

  useEffect(() => {
    mostrarFunciones();
  }, []);



  const handleChange = (event) => {
    setEstado(event.target.value);
    setErrores({ ...errores, estado: '' });
  };

  const handleTextChange = (event) => {
    const newTexto = event.target.value.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ\s]/g, '');
    setTexto(newTexto);
    setErrores({ ...errores, texto: newTexto.trim() === '' ? 'Ingrese texto' : '' });
  };

  const handleAbreviaturaChange = (event) => {
    const nuevaAbreviatura = event.target.value.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ\s]/g, '');
    setAbreviatura(nuevaAbreviatura);
    setErrores({ ...errores, abreviatura: nuevaAbreviatura.trim() === '' ? 'Ingrese texto' : '' });
  };

  const handleAgregar = () => {
    setAccion('agregar');
    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    setTexto('');
    setAbreviatura('');
    setEstado('');
    setErrores({ texto: '', abreviatura: '', estado: '' });
    setTimeout(() => {
      document.getElementById('fs').focus();
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const textoError = texto.trim() === '' ? 'Ingrese texto' : '';
    const abreviaturaError = abreviatura.trim() === '' ? 'Ingrese texto' : '';
    const estadoError = estado === '' ? 'Seleccione una opción' : '';

    setErrores({ texto: textoError, abreviatura: abreviaturaError, estado: estadoError });

    if (textoError || abreviaturaError || estadoError) {
      return;
    }

    if (accion === 'agregar') {
      const existe = listaFunciones.some(func => func.funsus === texto);
      if (existe) {
        enqueueSnackbar("La función sustantiva ya existe", { variant: 'error' });
        limpiarFormulario();
        return;
      }

      try {
        await Axios.post("http://localhost:5002/distris", {
          abrevia: abreviatura,
          funsus: texto,
          estadofun: estado,
        });
        mostrarFunciones();
        enqueueSnackbar("Función Sustantiva registrada", { variant: 'success' });
      } catch (error) {
        enqueueSnackbar("Función Sustantiva ya existe", { variant: 'error' });
        limpiarFormulario();
      }
    } else if (accion === 'editar' && id) {
      try {
        await Axios.put(`http://localhost:5002/distris/${id}`, {
          abrevia: abreviatura,
          funsus: texto,
          estadofun: estado,
        });
        mostrarFunciones();
        enqueueSnackbar("Función Sustantiva actualizada", { variant: 'success' });
        limpiarFormulario();
        setAccion('agregar');
      } catch (error) {
        enqueueSnackbar("Error al actualizar la Función Sustantiva", { variant: 'error' });
      }
    }
  };

  const mostrarFunciones = async () => {
    try {
      const response = await Axios.get("http://localhost:5002/distris");
      if (Array.isArray(response.data)) {
        setListaFunciones(response.data);
      } else {
        console.error("La respuesta del servidor no es una matriz:", response.data);
        enqueueSnackbar("Error: La respuesta del servidor no está en el formato esperado.", { variant: 'error' });
      }
    } catch (error) {
      console.error("Error al obtener las funciones:", error);
      enqueueSnackbar("Error al obtener las funciones", { variant: 'error' });
    }
  };

  const editarFuncion = (funcion) => {
    setId(funcion.codfunsus);
    setAbreviatura(funcion.abrevia);
    setTexto(funcion.funsus);
    setEstado(funcion.estadofun);
    setErrores({ texto: '', abreviatura: '', estado: '' });
    setAccion('editar');
  };

  const eliminarFuncion = async (id) => {
    try {
      await Axios.delete(`http://localhost:5002/distris/${id}`);
      mostrarFunciones();
      enqueueSnackbar('Función Sustantiva eliminada', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error al eliminar la Función Sustantiva', { variant: 'error' });
    }
  };

 

  return (
    <>
      <div className="contenedor">
        <h2>FUNCIONES SUSTANTIVAS</h2>
      </div>
      <Box
        component="form"
        width={500}
        display="flex"
        flexDirection="column"
        gap={2}
        p={2}
        sx={{ border: '2px solid grey', m: 30, mx: 60, mt: 5 }}
        onSubmit={handleSubmit}
      >
        <TextField
          id='fs'
          label='Código'
          variant='outlined'
          fullWidth
          required
          error={Boolean(errores.abreviatura)}
          helperText={errores.abreviatura || ''}
          value={abreviatura}
          onChange={handleAbreviaturaChange}
        />
        <TextField
          id='fs1'
          label='Función Sustantiva'
          variant='outlined'
          fullWidth
          required
          error={Boolean(errores.texto)}
          helperText={errores.texto || ''}
          value={texto}
          onChange={handleTextChange}
        />
        <FormControl fullWidth>
          <InputLabel id="dl" sx={{ mt: 0 }}>Opción</InputLabel>
          <Select
            labelId="dl"
            id="ds"
            value={estado}
            variant='outlined'
            label="Estado"
            sx={{ mt: 0 }}
            onChange={handleChange}
            error={Boolean(errores.estado)}
            required
          >
            {opcionesEstado.map((opcion) => (
              <MenuItem value={opcion.valor} key={opcion.valor}>
                {opcion.etiqueta}
              </MenuItem>
            ))}
          </Select>
          {errores.estado && <FormHelperText error>{errores.estado}</FormHelperText>}
        </FormControl>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          <Button
            type="submit"
            color="success"
            startIcon={<SaveIcon sx={{ ml: '0.5rem' }} />}
            sx={{ fontWeight: 'bold' }}
          >
            Guardar
          </Button>
          <Button
            color="info"
            startIcon={<AddCircleOutlineIcon sx={{ ml: '0.5rem' }} />}
            onClick={handleAgregar}
            sx={{ fontWeight: 'bold' }}
          >
            Nuevo
          </Button>
        </Box>
      </Box>
      {listaFunciones && listaFunciones.length > 0 && (
        <Box
          component="div"
          width={1000}
          display="flex"
          alignItems="center"
          gap={2}
          p={2}
          sx={{ border: '2px solid grey', m: 20, mx: 26, mt: -25 }}
        >
          <TableContainer component={Paper} sx={{ margin: '0 auto' }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="center"><b>N.</b></TableCell>
                  <TableCell align="center"><b>Código</b></TableCell>
                  <TableCell align="center"><b>Función Sustantiva</b></TableCell>
                  <TableCell align="center"><b>Estado</b></TableCell>
                  <TableCell align="center"><b>Acciones</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {listaFunciones.map((funcion, index) => (
                  <TableRow
                    key={index}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" align="center">
                      {index + 1}
                    </TableCell>
                    <TableCell align="center">
                      {funcion.abrevia}
                    </TableCell>
                    <TableCell align="center">
                      {funcion.funsus}
                    </TableCell>
                    <TableCell align="center">{funcion.estadofun}</TableCell>
                    <TableCell align="center">
                      <ButtonGroup variant="contained" aria-label="button group">
                        <Button
                          color="success"
                          startIcon={<UpdateIcon sx={{ ml: '0.5rem' }} />}
                          onClick={() => editarFuncion(funcion)}
                        >
                          
                        </Button>
                        <Button
                          color="error"
                          startIcon={<DeleteForeverIcon sx={{ ml: '0.5rem' }} />}
                          onClick={() => {
                            setId(funcion.codfunsus);
                            setMensajeSnackbar(`¿Seguro que desea eliminar la función sustantiva "${funcion.funsus}"?`);
                            setAbrirSnackbar(true);
                          }}
                        >
                          
                        </Button>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      <Snackbar
        open={abrirSnackbar}
        autoHideDuration={6000}
        onClose={() => setAbrirSnackbar(false)}
        message={mensajeSnackbar}
        action={
          <>
            <Button color="secondary" size="small" onClick={() => setAbrirSnackbar(false)}>
              Cancelar
            </Button>
            <Button
              color="primary"
              size="small"
              onClick={() => {
                eliminarFuncion(id);
                setAbrirSnackbar(false);
              }}
            >
              Confirmar
            </Button>
          </>
        }
      />
    </>
  );
}

export default Distrifunc;
