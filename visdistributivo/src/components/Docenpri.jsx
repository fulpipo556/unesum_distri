import { useState, useEffect } from 'react';
import { TextField, Box, InputLabel, FormControl, Select, MenuItem, Button, ButtonGroup, FormHelperText, Snackbar } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UpdateIcon from '@mui/icons-material/Update';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Axios from 'axios';
import { useSnackbar } from 'notistack';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function Docenpri() {
  const [abreviatura, setAbreviatura] = useState('');
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState('');
  const [errores, setErrores] = useState({ texto: '', abreviatura: '', estado: '' });
  const [listaFunciones, setListaFunciones] = useState([]);
  const [listaActividades, setListaActividades] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [id, setId] = useState(null);
  const [accion, setAccion] = useState('agregar');
  const [abrirSnackbar, setAbrirSnackbar] = useState(false);
  const [mensajeSnackbar, setMensajeSnackbar] = useState('');
  const [opcionesFunciones, setOpcionesFunciones] = useState([]);
  const [codigoGenerado, setCodigoGenerado] = useState('');
  const [codigoFuncionSustantiva, setCodigoFuncionSustantiva] = useState('');
  const [fechaInicio, setFechaInicio] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [fechaFinal, setFechaFinal] = useState(null);
  const opcionesEstado = [
    { valor: 'Activado', etiqueta: 'Activado' },
    { valor: 'Desactivado', etiqueta: 'Desactivado' },
  ];

  useEffect(() => {
    mostrarFunciones();
  }, []);

  useEffect(() => {
    setOpcionesFunciones(listaFunciones.map(funcion => ({ valor: funcion.funsus, etiqueta: funcion.funsus })));
  }, [listaFunciones]);

  useEffect(() => {
    if (texto) {
      generarCodigo(texto);
    }
  }, [texto, listaFunciones]);

  useEffect(() => {
    if (codigoFuncionSustantiva) {
      mostrarActividades(codigoFuncionSustantiva);
    }
  }, [codigoFuncionSustantiva]);

  

  const obtenerActividades = async (codigoFuncionSustantiva) => {
    try {
      const response = await Axios.get(`http://localhost:5002/acti/${codigoFuncionSustantiva}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener las actividades:', error);
      return [];
    }
  };

  const handleFechaInicioChange = (newDate) => {
    setFechaInicio(newDate);
    if (fechaFinal && newDate && fechaFinal < newDate) {
      setFechaFinal(null);
    }
    setErrores({ ...errores, fechaInicio: newDate ? '' : 'La fecha de inicio es obligatoria' });
  };

  const generarCodigo = async (opcionSeleccionada) => {
    if (opcionSeleccionada) {
      const funcionSeleccionada = listaFunciones.find(funcion => funcion.funsus === opcionSeleccionada);
      if (funcionSeleccionada) {
        const abreviatura = funcionSeleccionada.abrevia;
        const codFuncionSustantiva = funcionSeleccionada.codfunsus;

        const actividades = await obtenerActividades(codFuncionSustantiva);

        let ultimoNumero = 0;

        if (Array.isArray(actividades) && actividades.length > 0) {
          ultimoNumero = actividades.length;
        }

        const numero = ultimoNumero + 1;
        const codigo = `${abreviatura}.${numero}`;

        setCodigoGenerado(codigo);
        setTexto(opcionSeleccionada);
      }
    }
  };

  const handleFuncionSustantivaChange = async (event) => {
    const opcionSeleccionada = event.target.value;
    if (opcionSeleccionada) {
      const funcionSeleccionada = listaFunciones.find(funcion => funcion.funsus === opcionSeleccionada);
      if (funcionSeleccionada) {
        setCodigoFuncionSustantiva(funcionSeleccionada.codfunsus);
        generarCodigo(opcionSeleccionada);
      } else {
        setListaActividades([]);
      }
    }
  };

  const handleChange = (event) => {
    setEstado(event.target.value);
    setErrores({ ...errores, estado: '' });
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
    setCodigoGenerado('');
    setEstado('');
    setErrores({ texto: '', abreviatura: '', estado: '' });
    setTimeout(() => {
      document.getElementById('fs').focus();
    }, 0);
    setDisabled(false);
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
  
    try {
      const response = await Axios.get(`http://localhost:5002/acti`);
      const todasActividades = response.data;
  
      const existeEnOtraFuncion = todasActividades.some(act => act.actividad === abreviatura && act.codfun !== codigoFuncionSustantiva );
  
      if (existeEnOtraFuncion) {
        enqueueSnackbar('La actividad extracurricular ya existe en otra función sustantiva', { variant: 'error' });
        limpiarFormulario();
        return;
      }
     
      // Inserción o actualización de la actividad
      if (accion === 'agregar') {
        
        await Axios.post('http://localhost:5002/acti', {
          codfun: codigoFuncionSustantiva,
          codacex: codigoGenerado,
          actividad: abreviatura,
          estadoactex: estado,
        });
        mostrarActividades(codigoFuncionSustantiva);
        enqueueSnackbar('Actividad Extracurricular registrada', { variant: 'success' });
      } else if (accion === 'editar' && codigoGenerado) {
        console.log("hola")
        await Axios.put(`http://localhost:5002/acti/${codigoGenerado}`, {
        
          codacex: codigoGenerado,
          actividad: abreviatura,
          estadoactex: estado,
        });
        mostrarActividades(id);
        enqueueSnackbar('Actividad Extracurricular actualizada', { variant: 'success' });
        limpiarFormulario();
        setAccion('agregar');
      }
    } catch (error) {
      enqueueSnackbar('Actividad Extracurricular ya existe', { variant: 'error' });
      limpiarFormulario();
    }
  };

  const mostrarFunciones = async () => {
    try {
      const response = await Axios.get('http://localhost:5002/distris');
      setListaFunciones(response.data);
    } catch (error) {
      enqueueSnackbar('Error al obtener las funciones', { variant: 'error' });
    }
  };

  const mostrarActividades = async (codfun) => {
    try {
      const response = await Axios.get(`http://localhost:5002/acti/${codfun}`);
      
      if (Array.isArray(response.data)) {
        setListaActividades(response.data);
      } else if (response.data && typeof response.data === 'object') {
        setListaActividades([response.data]);
      } else {
        setListaActividades([]);
      }
    } catch (error) {
      setListaActividades([]);
    }
  };

  const editarActividad = (actividad) => {
   setId(actividad.codfun)
   const idf=actividad.codfun;
   if (idf) {
   const funcionSeleccionada = listaFunciones.find(funcion => funcion.codfunsus === idf);
    if (funcionSeleccionada) {
      
      const mi = funcionSeleccionada.funsus;
      
      setTexto(mi);
    }
  }
    setCodigoGenerado(actividad.codacex);
    setAbreviatura(actividad.actividad);
    setEstado(actividad.estadoactex);
    setErrores({ texto: '', abreviatura: '', estado: '' });
    setAccion('editar');
    setDisabled(true);
  };

  const eliminarActividad = async (id) => {
    try {
      await Axios.delete(`http://localhost:5002/acti/${id}`);
      mostrarActividades(codigoFuncionSustantiva);
      enqueueSnackbar('Actividad Extracurricular eliminada', { variant: 'error' });
      limpiarFormulario();
    } catch (error) {
      enqueueSnackbar('Error al eliminar la Actividad Extracurricular', { variant: 'error' });
    }
  };

  return (
    <>
      <div className="contenedor">
        <h2>DOCENTES</h2>
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
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="funciones-label">Facultad</InputLabel>
          <Select
            labelId="funciones-label"
            id="funciones"
            value={texto}
            label="Texto"
            onChange={handleFuncionSustantivaChange}
            required
            disabled={disabled} 
          >
            {opcionesFunciones.map((opcion) => (
              <MenuItem value={opcion.valor} key={opcion.valor}>
                {opcion.etiqueta}
              </MenuItem>
            ))}
          </Select>
          {errores.texto && <FormHelperText error>{errores.texto}</FormHelperText>}
        </FormControl>
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="funciones-label">Carrera</InputLabel>
          <Select
            labelId="funciones-label"
            id="funciones"
            value={texto}
            label="Texto"
            onChange={handleFuncionSustantivaChange}
            required
            disabled={disabled} 
          >
            {opcionesFunciones.map((opcion) => (
              <MenuItem value={opcion.valor} key={opcion.valor}>
                {opcion.etiqueta}
              </MenuItem>
            ))}
          </Select>
          {errores.texto && <FormHelperText error>{errores.texto}</FormHelperText>}
        </FormControl>
        <TextField
          id='fs'
          label='Cédula'
          variant='outlined'
          fullWidth
          required
          error={Boolean(errores.texto)}
          helperText={errores.texto || ''}
          disabled
          value={codigoGenerado}
        
        />
        <TextField
          id='fs1'
          label='Nombres y Apellidos'
          variant='outlined'
          fullWidth
          required
          error={Boolean(errores.abreviatura)}
          helperText={errores.abreviatura || ''}
          value={abreviatura}
          onChange={handleAbreviaturaChange}
        />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Fecha de Nacimiento"
            value={fechaInicio}
            onChange={handleFechaInicioChange}
            renderInput={(params) => <TextField {...params} fullWidth />}
            required
            error={Boolean(errores.fechaInicio)}
            helperText={errores.fechaInicio || ''}
          />
        </LocalizationProvider>
        <TextField
          id='fs2'
          label='Teléfono'
          variant='outlined'
          fullWidth
          required
          error={Boolean(errores.abreviatura)}
          helperText={errores.abreviatura || ''}
          value={abreviatura}
          onChange={handleAbreviaturaChange}
        />
        <TextField
          id='fs3'
          label='Dirección'
          variant='outlined'
          fullWidth
          required
          error={Boolean(errores.abreviatura)}
          helperText={errores.abreviatura || ''}
          value={abreviatura}
          onChange={handleAbreviaturaChange}
        />
        <TextField
          id='fs4'
          label='Email'
          variant='outlined'
          fullWidth
          required
          error={Boolean(errores.abreviatura)}
          helperText={errores.abreviatura || ''}
          value={abreviatura}
          onChange={handleAbreviaturaChange}
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
      {listaActividades && listaActividades.length > 0 && (
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
                  <TableCell align="center"><b>Actividad</b></TableCell>
                  <TableCell align="center"><b>Estado</b></TableCell>
                  <TableCell align="center"><b>Acciones</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {listaActividades.map((actividad, index) => (
                  <TableRow key={actividad.codacex} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row" align="center">{index + 1}</TableCell>
                    <TableCell align="center">{actividad.codacex}</TableCell>
                    <TableCell align="center">{actividad.actividad}</TableCell>
                    <TableCell align="center">{actividad.estadoactex}</TableCell>
                    <TableCell align="center">
                      <ButtonGroup variant="contained" aria-label="button group">
                        <Button
                          color="success"
                          startIcon={<UpdateIcon sx={{ ml: '0.5rem' }} />}
                          onClick={() => editarActividad(actividad)}
                        />
                        <Button
                          color="error"
                          startIcon={<DeleteForeverIcon sx={{ ml: '0.5rem' }} />}
                          onClick={() => {
                            setId(actividad.codacex);
                            setMensajeSnackbar(`¿Seguro que desea eliminar la actividad "${actividad.actividad}"?`);
                            setAbrirSnackbar(true);
                          }}
                        />
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
                eliminarActividad(id);
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

export default Docenpri;