import pool from '../database/conexion.js'



const getAlldistris = async (req, res, next) => {
    try {
        const consuAlldis = await pool.query("SELECT * FROM distributivo_funcionsus ORDER BY funsus");
        res.status(200).json(consuAlldis.rows);
    } catch (error) {
        next(error);
    }
};


const getDistris = async (req,res,next) => {
   try {
    
    const {id} = req.params;
    const result = await pool.query("SELECT * FROM distributivo_funcionsus WHERE codfunsus = $1", [id]);
    if(result.rows.length===0)
    return res.status(404).json({
        message: "Función Sustantiva no encontrada",
});
    res.json(result.rows[0]);
   } catch (error) {
    next(error)
   }
};

const checkIfActiviExists = async (abrevia, funsus, checkByCodfunOnly = false) => {
    let query;
    let params;
    if (checkByCodfunOnly) {        
        query = "SELECT COUNT(*) FROM distributivo_funcionsus WHERE abrevia = $1";
        params = [abrevia];
    } else {
        query = "SELECT COUNT(*) FROM distributivo_funcionsus WHERE abrevia = $1 AND funsus = $2";
        params = [abrevia, funsus];
    }
    const result = await pool.query(query, params);
    return result.rows[0].count > 0;
};

//Almacena la información 
const createDistris = async (req, res, next) => {
    try {
        const { abrevia, funsus, estadofun } = req.body;

        const existsByCodfun = await checkIfActiviExists(abrevia, null, true); 
        const existsByCodfunAndActividad = await checkIfActiviExists(abrevia, funsus); 

        if (existsByCodfun || existsByCodfunAndActividad) {
            return res.status(400).json({ message: "Ya existe una función sustantiva" });
        }

        const result = await pool.query(
            "INSERT INTO distributivo_funcionsus (abrevia, funsus, estadofun) VALUES ($1, $2, $3) RETURNING *",
            [abrevia, funsus, estadofun]
        );

        res.json(result.rows[0]); 
    } catch (error) {
        next(error); 
    }
};



const deleteDistris = async (req,res,next) => {
    try {
     
     const {id} = req.params;
     const result = await pool.query("DELETE FROM distributivo_funcionsus WHERE codfunsus = $1", [id]);
     if(result.rowCount===0)
     return res.status(404).json({
         message: "Función Sustantiva no encontrada",
 });
     return res.sendStatus(204);
    } catch (error) {
        next(error)
    }
 };

const updateDistris = async (req,res,next) => {
    try {
        
        const {id} = req.params;
        const {abrevia,funsus, estadofun} = req.body
        const result = await pool.query("UPDATE distributivo_funcionsus SET abrevia=$1,  funsus=$2, estadofun=$3 WHERE codfunsus = $4 RETURNING *", [abrevia, funsus, estadofun, id]
        );
        if(result.rows.length === 0)
        return res.status(404).json({
            message: "Función Sustantiva no encontrada",
    });
        return res.json(result.rows[0]);

    } catch (error) {
        next(error)
    }
}

export const districontrollers = {
getAlldistris,
getDistris,
createDistris,
deleteDistris,
updateDistris
}