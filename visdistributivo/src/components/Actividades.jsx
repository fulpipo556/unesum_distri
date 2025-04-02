import  { useState, useEffect } from 'react';
import { TextField, Box, InputLabel, FormControl, Select, MenuItem, Button, ButtonGroup, FormHelperText, Snackbar } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UpdateIcon from '@mui/icons-material/Update';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Axios from 'axios';
import { useSnackbar } from 'notistack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import * as XLSX from 'xlsx';
import UploadFileIcon from '@mui/icons-material/UploadFile'; // Add this import
function Actividades() {
  const [abreviatura, setAbreviatura] = useState('');
  const [texto, setTexto] = useState('');
  
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
  const [disabled, setDisabled] = useState(false);
  const [estado, setEstado] = useState('Desactivado'); 
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

  useEffect(() => {
    const loadAllActivities = async () => {
      try {
        const response = await Axios.get('http://localhost:5002/acti');
        setListaActividades(response.data);
      } catch (error) {
        console.error('Error loading activities:', error);
      }
    };
    
    loadAllActivities();
  }, []);
  
  const getAllActividades = async () => {
    try {
      const response = await Axios.get('http://localhost:5002/acti');
      setListaActividades(response.data);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };
  
  const obtenerActividades = async (codigoFuncionSustantiva) => {
    try {
      const response = await Axios.get(`http://localhost:5002/acti/${codigoFuncionSustantiva}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener las actividades:', error);
      return [];
    }
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
 // Add function to get codfun from activity code
// Update function to get codfun from activity code using distributivo_funcionsus data
const getCodfunFromCode = (codigo) => {
  const prefix = codigo?.split('.')?.[0];
  const codeMap = {
    'GES': 9,  // Updated with actual codfunsus
    'DOC': 5,
    'INV': 8,
    'TUT': 7,
    'VIN': 10
  };
  return codeMap[prefix];
};

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      const csvData = XLSX.utils.sheet_to_csv(worksheet, { 
        skipHidden: true,
        strip: true,
        blankrows: false
      });

      const rows = csvData.split('\n').slice(4);
      
      const activities = rows
        .filter(row => row.trim())
        .map(row => {
          const [, codigo, actividad] = row.split(',');
          const codfun = getCodfunFromCode(codigo?.trim());
          
          if (!codfun) {
            console.log('Código no válido:', codigo);
            return null;
          }

          return {
            codfun,
            codacex: codigo?.trim(),
            actividad: actividad?.trim(),
            estadoactex: 'Desactivado'
          };
        })
        .filter(Boolean);

      console.log('Activities to import:', activities);

      const response = await Axios.post('http://localhost:5002/acti/import', activities);
      
      if (response.data.errors?.length) {
        enqueueSnackbar(
          `Importación parcial: ${response.data.imported} exitosas, ${response.data.errors.length} errores`, 
          { variant: 'warning' }
        );
      } else {
        enqueueSnackbar(`${activities.length} actividades importadas correctamente`, { 
          variant: 'success' 
        });
      }

      await getAllActividades();
      
    } catch (error) {
      console.error('Error importing:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Error al importar actividades', 
        { variant: 'error' }
      );
    }
  };

  reader.readAsArrayBuffer(file);
};
  const handleImportXml = (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const xmlData = e.target.result;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');

    const actividadesXml = xmlDoc.querySelectorAll('actividad');
    const nuevasActividades = [];

    actividadesXml.forEach(actividadXml => {
      const codfun = actividadXml.querySelector('codfun').textContent;
      const actividad = actividadXml.querySelector('actividad').textContent;

      // Set default values for other fields if they're not in the XML
      const estadoactex = actividadXml.querySelector('estadoactex')?.textContent || 'Desactivado'; // Default: Desactivado

      nuevasActividades.push({
        codfun,
        actividad,
        estadoactex
      });
    });

    // Update the state with the imported activities
    setListaActividades(nuevasActividades);

    // Populate the form fields with the first imported activity (if any)
    if (nuevasActividades.length > 0) {
      const primeraActividad = nuevasActividades[0];
      
      // Find the corresponding function name and set it in the form
      const funcionEncontrada = listaFunciones.find(f => f.codfunsus === primeraActividad.codfun);
      if (funcionEncontrada) {
        setTexto(funcionEncontrada.funsus); // Set the function name
        setCodigoFuncionSustantiva(primeraActividad.codfun);
        generarCodigo(funcionEncontrada.funsus); // Generate the code
      }
      setAbreviatura(primeraActividad.actividad);
      setEstado(primeraActividad.estadoactex);

      // Set the action to 'agregar' if you want to automatically add the imported activities
      setAccion('agregar'); 
      setDisabled(false); // Enable the form fields

      // Clear any previous errors
      setErrores({ texto: '', abreviatura: '', estado: '' });
    }

    enqueueSnackbar('XML importado correctamente', { variant: 'success' });
  };

  reader.readAsText(file);
};
const handleDeleteAll = async () => {
  try {
    await Axios.delete('http://localhost:5002/acti-delete-all');
    enqueueSnackbar('Todas las actividades han sido eliminadas', { variant: 'success' });
    setListaActividades([]);
  } catch (error) {
    enqueueSnackbar('Error al eliminar las actividades', { variant: 'error' });
  }
};

  return (
    <>
      <div className="contenedor">
        <h2>ACTIVIDADES EXTRACURRICULARES</h2>
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
          <InputLabel id="funciones-label">Funciones Sustantivas</InputLabel>
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
          label='Código'
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
          label='Actividades'
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
          <input
            accept=".xml"
            id="import-xml"
            type="file"
            style={{ display: 'none' }}
            onChange={handleImportXml}
          />
           <Button
            color="error"
            startIcon={<DeleteForeverIcon />}
            onClick={handleDeleteAll}
            sx={{ fontWeight: 'bold' }}
          >
            Eliminar Todo
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          <input
            accept=".xlsx"
            id="import-xlsx" 
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <label htmlFor="import-xlsx">
            <Button
              variant="contained"
              component="span"
              color="primary" 
              startIcon={<UploadFileIcon />}
            >
              Importar XLSX
            </Button>
          </label>
        </Box>
         
        </Box>
      </Box>
      
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

export default Actividades;
