import pool from '../database/conexion.js';
import multer from 'multer';
import xlsx from 'xlsx';
import { parse } from 'csv-parse/sync';
// Consulta Personalizada
const getDoces = async (req, res, next) => {
    try {
     const { id } = req.params;
     const result = await pool.query("SELECT * FROM distributivo_docente WHERE ced = $1", [id]);
     if (result.rows.length === 0) {
        return res.status(200).json([]); 
     }
     res.json(result.rows);
    } catch (error) {
     next(error);
    }
 };

const getAllDoces = async (req, res, next) => {
    try {
        const consuAlldis = await pool.query("SELECT * FROM distributivo_docente ORDER BY nomape");
        res.json(consuAlldis.rows);
    } catch (error) {
        next(error);
    }
};

// Consulta antes de Guardar
const checkIfActiviExists = async (ced, nomape, checkByCodfunOnly = false) => {
    let query;
    let params;
    if (checkByCodfunOnly) {
        query = "SELECT COUNT(*) FROM distributivo_docente WHERE nomape = $1";
        params = [nomape];
    } else {
        query = "SELECT COUNT(*) FROM distributivo_docente WHERE ced = $1 AND nomape = $2";
        params = [ced, nomape];
    }
    const result = await pool.query(query, params);
    return result.rows[0].count > 0;
};

// Almacena la información
const createDoces = async (req, res, next) => {
    try {
        const { ced, nomape, fechana, tele, dire, correo, estadoc } = req.body;

        const existsByCodfun = await checkIfActiviExists(ced, nomape, true);
        const existsByCodfunAndActividad = await checkIfActiviExists(ced, nomape);

        if (existsByCodfun || existsByCodfunAndActividad) {
            return res.status(400).json({ message: "Ya existe este nombre en la base de datos" });
        }

        const result = await pool.query(
            "INSERT INTO distributivo_docente (ced, nomape, fechana, tele, dire, correo, estadoc) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [ced, nomape, fechana, tele, dire, correo, estadoc]
        );

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

const deleteDoces = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query("DELETE FROM distributivo_docente WHERE ced = $1", [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Cédula no encontrada" });
        }
        return res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};

const updateDoces = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nomape, fechana, tele, dire, correo, estadoc } = req.body;
        const result = await pool.query(
            "UPDATE distributivo_docente SET nomape=$1, fechana=$2, tele=$3, dire=$4, correo=$5, estadoc=$6  WHERE ced = $7 RETURNING *",
            [nomape, fechana, tele, dire, correo, estadoc, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Cédula no encontrada" });
        }
        return res.json(result.rows);
    } catch (error) {
        next(error);
    }
};



const uploadDoces = async (req, res, next) => {
    const client = await pool.connect();
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No se ha subido ningún archivo" });
        }

        // Validate file type
        const validMimes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv'
        ];
        if (!validMimes.includes(req.file.mimetype)) {
            return res.status(400).json({ message: "Formato de archivo no válido. Use Excel o CSV" });
        }

        const buffer = req.file.buffer;
        let data = [];

        // Parse file based on type
        if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            const workbook = xlsx.read(buffer);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            data = xlsx.utils.sheet_to_json(worksheet);
        } else {
            const content = buffer.toString();
            data = parse(content, { columns: true, skip_empty_lines: true });
        }

        // Validate data structure
        if (!data.length) {
            return res.status(400).json({ message: "El archivo está vacío" });
        }

        await client.query('BEGIN');
        let count = 0;

        for (const row of data) {
            // Validate required fields
            if (!row.cedula || !row.nombre_apellido || !row.fecha_nacimiento) {
                await client.query('ROLLBACK');
                return res.status(400).json({ 
                    message: "Datos incompletos en la fila " + (count + 1) 
                });
            }

            const docenteData = {
                ced: row.cedula?.trim(),
                nomape: row.nombre_apellido?.trim(),
                fechana: row.fecha_nacimiento,
                tele: row.telefono?.trim(),
                dire: row.direccion?.trim(),
                correo: row.correo?.trim(),
                estadoc: row.estado?.trim() || 'Activado'
            };

            // Validate cédula format
            if (!/^\d{10}$/.test(docenteData.ced)) {
                await client.query('ROLLBACK');
                return res.status(400).json({ 
                    message: `Cédula inválida en la fila ${count + 1}: ${docenteData.ced}` 
                });
            }

            await client.query(
                `INSERT INTO distributivo_docente 
                (ced, nomape, fechana, tele, dire, correo, estadoc) 
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (ced) DO UPDATE SET
                nomape = $2, fechana = $3, tele = $4, 
                dire = $5, correo = $6, estadoc = $7`,
                Object.values(docenteData)
            );
            count++;
        }

        await client.query('COMMIT');
        res.json({ 
            message: "Archivo procesado exitosamente", 
            count,
            details: `${count} docentes procesados`
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en uploadDoces:', error);
        next(error);
    } finally {
        client.release();
    }
};


export const docentcontrollers = {
    getDoces,
    getAllDoces,
    createDoces,
    deleteDoces,
    updateDoces,
    uploadDoces
};