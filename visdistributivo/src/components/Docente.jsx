import { useState, useEffect } from 'react';
import {
  TextField, Box, InputLabel, FormControl, Select, MenuItem, Button,
  ButtonGroup, Snackbar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UpdateIcon from '@mui/icons-material/Update';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Axios from 'axios';
import { useSnackbar } from 'notistack';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function Docente() {
  const [cedula, setCedula] = useState('');
  const [primerNombre, setPrimerNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState(null);
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [correo, setCorreo] = useState('');
  const [facultad, setFacultad] = useState('');
  const [carrera, setCarrera] = useState('');
  const [estado, setEstado] = useState('');
  const [errores, setErrores] = useState({});
  const [listaDocentes, setListaDocentes] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [accion, setAccion] = useState('agregar');
  const [abrirSnackbar, setAbrirSnackbar] = useState(false);
  const [mensajeSnackbar, setMensajeSnackbar] = useState('');
  const [idEliminar, setIdEliminar] = useState(null);
  const [loading, setLoading] = useState(false);
  const facultades = [
    { id: 1, nombre: 'CIENCIAS TÉCNICAS' },
    { id: 2, nombre: 'CIENCIAS ECONÓMICAS' }
  ];

  const carreras = {
    1: [
      { id: 1, nombre: 'TECNOLOGÍAS DE LA INFORMACIÓN' },
      { id: 2, nombre: 'INGENIERÍA CIVIL' },
      { id: 3, nombre: 'TELEMÁTICA' }
    ],
    2: [
      { id: 4, nombre: 'ADMINISTRACIÓN DE EMPRESAS' },
      { id: 5, nombre: 'INGENIERÍA EN CONTABILIDAD Y AUDITORÍA' },
      { id: 6, nombre: 'TURISMO' }
    ]
  };

  const opcionesEstado = [
    { valor: 'Activado', etiqueta: 'Activado' },
    { valor: 'Desactivado', etiqueta: 'Desactivado' },
  ];
  const [uploadLoading, setUploadLoading] = useState(false);



  useEffect(() => {
    mostrarDocentes();
  }, []);

  const mostrarDocentes = async () => {
    setLoading(true);
    try {
      const response = await Axios.get('http://localhost:5002/docent');
      console.log('Docentes:', response.data); // Debug
      setListaDocentes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error:', error);
      enqueueSnackbar('Error al cargar docentes', { variant: 'error' });
      setListaDocentes([]);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setCedula('');
    setPrimerNombre('');
    setPrimerApellido('');
    setFechaNacimiento(null);
    setTelefono('');
    setDireccion('');
    setCorreo('');
    setFacultad('');
    setCarrera('');
    setEstado('');
    setErrores({});
    setAccion('agregar');
  };

// Update handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();

  const validationErrors = {};
  if (!cedula || cedula.length !== 10) validationErrors.cedula = 'La cédula debe tener 10 dígitos';
  if (!primerNombre) validationErrors.primerNombre = 'El nombre es requerido';
  if (!primerApellido) validationErrors.primerApellido = 'El apellido es requerido';
  if (!fechaNacimiento) validationErrors.fechaNacimiento = 'La fecha es requerida';
  if (!telefono || telefono.length !== 10) validationErrors.telefono = 'El teléfono debe tener 10 dígitos';
  if (!direccion) validationErrors.direccion = 'La dirección es requerida';
  if (!correo) validationErrors.correo = 'El correo es requerido';
  if (!estado) validationErrors.estado = 'El estado es requerido';

  if (Object.keys(validationErrors).length > 0) {
    setErrores(validationErrors);
    enqueueSnackbar('Por favor complete todos los campos requeridos', { variant: 'error' });
    return;
  }

  try {
    const formattedDate = fechaNacimiento ? fechaNacimiento.toISOString().split('T')[0] : null;
    
    const docenteData = {
      ced: cedula,
      nomape: `${primerNombre} ${primerApellido}`,
      fechana: formattedDate,
      tele: telefono,
      dire: direccion,
      correo: correo,
      estadoc: estado
    };

    if (accion === 'agregar') {
      await Axios.post('http://localhost:5002/docent', docenteData);
      enqueueSnackbar('Docente registrado exitosamente', { variant: 'success' });
    } else {
      await Axios.put(`http://localhost:5002/docent/${cedula}`, docenteData);
      enqueueSnackbar('Docente actualizado exitosamente', { variant: 'success' });
    }

    limpiarFormulario();
    mostrarDocentes();
  } catch (error) {
    console.error('Error:', error);
    enqueueSnackbar(error.response?.data?.message || 'Error al procesar la solicitud', { variant: 'error' });
  }
};

// Update table section

  const eliminarDocente = async (id) => {
    try {
      await Axios.delete(`http://localhost:5002/docent/${id}`);
      mostrarDocentes();
      enqueueSnackbar('Docente eliminado exitosamente', { variant: 'success' });
      setAbrirSnackbar(false);
    } catch (error) {
      enqueueSnackbar('Error al eliminar el docente', { variant: 'error' });
    }
  };

  const editarDocente = (docente) => {
    setCedula(docente.ced);
    setPrimerNombre(docente.primer_nombre);
    setPrimerApellido(docente.primer_apellido);
    setFechaNacimiento(new Date(docente.fechana));
    setTelefono(docente.tele);
    setDireccion(docente.dire);
    setCorreo(docente.correo);
    setFacultad(docente.facultad);
    setCarrera(docente.carrera);
    setEstado(docente.estado);
    setAccion('editar');
  };
  
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await Axios.post('http://localhost:5002/docent/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      enqueueSnackbar(`${response.data.count} docentes importados exitosamente`, {
        variant: 'success'
      });
      mostrarDocentes();
    } catch (error) {
      console.error('Error:', error);
      enqueueSnackbar(error.response?.data?.message || 'Error al cargar el archivo', {
        variant: 'error'
      });
    } finally {
      setUploadLoading(false);
      event.target.value = null;
    }
  };
  return (
    <>
      <div className="contenedor">
        <h2 style={{ textAlign: 'center' }}>DOCENTES</h2>
      </div>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '50%', // Reduced from 80%
          maxWidth: '600px',
          margin: '2rem auto',
          padding: '2rem',
          border: '2px solid grey',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          '& .MuiFormControl-root': {
            minWidth: '100%'
          }
        }}
      >
        {/* Row 1 - Faculty and Career */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <FormControl required error={Boolean(errores.facultad)}>
            <InputLabel>Facultad</InputLabel>
            <Select
              value={facultad}
              onChange={(e) => {
                setFacultad(e.target.value);
                setCarrera('');
              }}
              label="Facultad"
            >
              {facultades.map((fac) => (
                <MenuItem key={fac.id} value={fac.id}>{fac.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
  
          <FormControl required error={Boolean(errores.carrera)} disabled={!facultad}>
            <InputLabel>Carrera</InputLabel>
            <Select
              value={carrera}
              onChange={(e) => setCarrera(e.target.value)}
              label="Carrera"
            >
              {facultad && carreras[facultad]?.map((car) => (
                <MenuItem key={car.id} value={car.id}>{car.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
    <TextField
      label="Nombre"
      value={primerNombre}
      onChange={(e) => {
        const value = e.target.value.replace(/[^A-Za-zÁ-ÿ\s]/g, '');
        setPrimerNombre(value);
      }}
      error={Boolean(errores.primerNombre)}
      helperText={errores.primerNombre}
      required
    />
    <TextField
      label="Apellido" 
      value={primerApellido}
      onChange={(e) => {
        const value = e.target.value.replace(/[^A-Za-zÁ-ÿ\s]/g, '');
        setPrimerApellido(value);
      }}
      error={Boolean(errores.primerApellido)}
      helperText={errores.primerApellido}
      required
    />
  </Box>
        {/* Row 2 - Personal Info */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            label="Cédula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value.replace(/[^0-9]/g, ''))}
            error={Boolean(errores.cedula)}
            helperText={errores.cedula}
            required
            inputProps={{ maxLength: 10 }}
          />
          <TextField
            label="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value.replace(/[^0-9]/g, ''))}
            error={Boolean(errores.telefono)}
            helperText={errores.telefono}
            required
            inputProps={{ maxLength: 10 }}
          />
        </Box>
  
        {/* Row 3 - Date and Email */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Fecha de Nacimiento"
              value={fechaNacimiento}
              onChange={setFechaNacimiento}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  error={Boolean(errores.fechaNacimiento)}
                  helperText={errores.fechaNacimiento}
                />
              )}
            />
          </LocalizationProvider>
          <TextField
            label="Correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            error={Boolean(errores.correo)}
            helperText={errores.correo}
            required
          />
        </Box>
  
        {/* Row 4 - Address and Status */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            label="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            error={Boolean(errores.direccion)}
            helperText={errores.direccion}
            required
          />
          <FormControl required error={Boolean(errores.estado)}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              label="Estado"
            >
              {opcionesEstado.map((opcion) => (
                <MenuItem key={opcion.valor} value={opcion.valor}>
                  {opcion.etiqueta}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
  
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', mt: 2 }}>
  {/* CRUD Buttons */}
  <ButtonGroup>
    <Button
      type="submit"
      variant="contained"
      color="primary"
      startIcon={<SaveIcon />}
    >
      {accion === 'agregar' ? 'Guardar' : 'Actualizar'}
    </Button>
    <Button
      variant="contained"
      color="secondary"
      startIcon={<AddCircleOutlineIcon />}
      onClick={limpiarFormulario}
    >
      Nuevo
    </Button>
  </ButtonGroup>

<Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
  <input
    accept=".csv,.xlsx,.xls"
    style={{ display: 'none' }}
    id="file-upload"
    type="file"
    onChange={handleFileUpload}
    disabled={uploadLoading}
  />
  <label htmlFor="file-upload">
    <Button
      component="span"
      variant="contained"
      color="primary"
      startIcon={<CloudUploadIcon />}
      disabled={uploadLoading}
      sx={{ minWidth: '200px' }}
    >
      {uploadLoading ? 'Procesando...' : 'Importar Docentes'}
    </Button>
  </label>
  {uploadLoading && (
    <CircularProgress size={24} sx={{ ml: 1 }} />
  )}
</Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}></Box>
        </Box>
      </Box>
    
      <TableContainer component={Paper} sx={{ margin: '2rem' }}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>N°</TableCell>
        <TableCell>Cédula</TableCell>
        <TableCell>Nombre y Apellido</TableCell>
        <TableCell>Fecha Nacimiento</TableCell>
        <TableCell>Teléfono</TableCell>
        <TableCell>Dirección</TableCell>
        <TableCell>Correo</TableCell>
        <TableCell>Estado</TableCell>
        <TableCell>Acciones</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {loading ? (
        <TableRow>
          <TableCell colSpan={9} align="center">Cargando...</TableCell>
        </TableRow>
      ) : listaDocentes.length === 0 ? (
        <TableRow>
          <TableCell colSpan={9} align="center">No hay docentes registrados</TableCell>
        </TableRow>
      ) : (
        listaDocentes.map((docente, index) => (
          <TableRow key={docente.ced}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{docente.ced}</TableCell>
            <TableCell>{docente.nomape}</TableCell>
            <TableCell>{new Date(docente.fechana).toLocaleDateString()}</TableCell>
            <TableCell>{docente.tele}</TableCell>
            <TableCell>{docente.dire}</TableCell>
            <TableCell>{docente.correo}</TableCell>
            <TableCell>{docente.estadoc}</TableCell>
            <TableCell>
              <ButtonGroup>
                <Button
                  color="primary"
                  onClick={() => editarDocente(docente)}
                  startIcon={<UpdateIcon />}
                />
                <Button
                  color="error"
                  onClick={() => {
                    setIdEliminar(docente.ced);
                    setMensajeSnackbar(`¿Desea eliminar al docente ${docente.nomape}?`);
                    setAbrirSnackbar(true);
                  }}
                  startIcon={<DeleteForeverIcon />}
                />
              </ButtonGroup>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
</TableContainer>

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
              onClick={() => eliminarDocente(idEliminar)}
            >
              Confirmar
            </Button>
          </>
        }
      />
    </>
  );
}

export default Docente;