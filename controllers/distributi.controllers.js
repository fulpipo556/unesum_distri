import pool from '../database/conexion.js';

// Consulta Personalizada
const getDistribu = async (req, res, next) => {
    try {
     const { id } = req.params;
     const result = await pool.query("SELECT * FROM distributivo_actividadesext WHERE codfun = $1 ORDER BY codacex ", [id]);
     if (result.rows.length === 0) {
        return res.status(200).json([]); 
     }
     res.json(result.rows);
    } catch (error) {
     next(error);
    }
 };

const getAllDistribu = async (req, res, next) => {
    try {
        const consuAlldis = await pool.query("SELECT * FROM distributivo_actividadesext ORDER BY codacex");
        res.json(consuAlldis.rows);
    } catch (error) {
        next(error);
    }
};

// Consulta antes de Guardar
const checkIDistribuExists = async (codfun, actividad, checkByCodfunOnly = false) => {
    let query;
    let params;
    if (checkByCodfunOnly) {
        query = "SELECT COUNT(*) FROM distributivo_actividadesext WHERE actividad = $1";
        params = [actividad];
    } else {
        query = "SELECT COUNT(*) FROM distributivo_actividadesext WHERE codfun = $1 AND actividad = $2";
        params = [codfun, actividad];
    }
    const result = await pool.query(query, params);
    return result.rows[0].count > 0;
};

// Almacena la información
const createDistribu = async (req, res, next) => {
    try {
        const { codfun, codacex, actividad, estadoactex } = req.body;

        const existsByCodfun = await checkIDistribuExists (codfun, actividad, true);
        const existsByCodfunAndActividad = await checkIDistribuExists (codfun, actividad);

        if (existsByCodfun || existsByCodfunAndActividad) {
            return res.status(400).json({ message: "Ya existe una actividad para esta función sustantiva" });
        }

        const result = await pool.query(
            "INSERT INTO distributivo_actividadesext (codfun, codacex, actividad, estadoactex) VALUES ($1, $2, $3, $4) RETURNING *",
            [codfun, codacex, actividad, estadoactex]
        );

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

const deleteDistribu = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query("DELETE FROM distributivo_actividadesext WHERE codacex = $1", [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Actividades extracurriculares no encontrada" });
        }
        return res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};

const updateDistribu = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { actividad, estadoactex } = req.body;
        const result = await pool.query(
            "UPDATE distributivo_actividadesext SET actividad=$1, estadoactex=$2 WHERE codacex = $3 RETURNING *",
            [actividad, estadoactex, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Actividad extracurricular no encontrada" });
        }
        return res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

export const distribucontrollers = {
    getDistribu,
    getAllDistribu,
    createDistribu,
    deleteDistribu,
    updateDistribu
};