import pool from '../database/conexion.js'



const getAllPeri = async (req, res, next) => {
    try {
        const consuAllper = await pool.query("SELECT * FROM periodo ORDER BY peri");
        res.status(200).json(consuAllper.rows);
    } catch (error) {
        next(error);
    }
};


const getPeris = async (req,res,next) => {
   try {
    
    const {id} = req.params;
    const result = await pool.query("SELECT * FROM periodo WHERE codpre = $1", [id]);
    if(result.rows.length===0)
    return res.status(404).json({
        message: "Período no encontrado",
});
    res.json(result.rows[0]);
   } catch (error) {
    next(error)
   }
};

const checkIfPeriExists = async (abre, peri, checkByCodfunOnly = false) => {
    let query;
    let params;
    if (checkByCodfunOnly) {        
        query = "SELECT COUNT(*) FROM periodo WHERE abre = $1";
        params = [abre];
    } else {
        query = "SELECT COUNT(*) FROM periodo WHERE abre = $1 AND peri = $2";
        params = [abre, peri];
    }
    const result = await pool.query(query, params);
    return result.rows[0].count > 0;
};

//Almacena la información 
const createPeri = async (req, res, next) => {
    try {
        
        const { abre, peri, fechai, fechaf, estaperi } = req.body;
        
        const fechaInicioFormatted = new Date(fechai).toLocaleDateString('en-US');
        const fechaFinalFormatted = new Date(fechaf).toLocaleDateString('en-US');

        const existsByCodper = await checkIfPeriExists(abre, null, true); 
        const existsByCodfunAndPeri = await checkIfPeriExists(abre, peri); 

        if (existsByCodper || existsByCodfunAndPeri) {
            return res.status(400).json({ message: "Ya existe un período" });
        }

        const result = await pool.query(
            "INSERT INTO periodo (abre, peri, fechai, fechaf, estaperi) VALUES ($1, $2, $3, $4, $5 ) RETURNING *",
            [abre, peri, fechaInicioFormatted, fechaFinalFormatted, estaperi]
        );

        res.json(result.rows[0]); 
    } catch (error) {
        next(error); 
        
    }
};



const deletePeri = async (req,res,next) => {
    try {
     
     const {id} = req.params;
     const result = await pool.query("DELETE FROM periodo WHERE codpre = $1", [id]);
     if(result.rowCount===0)
     return res.status(404).json({
         message: "Período no encontrado",
 });
     return res.sendStatus(204);
    } catch (error) {
        next(error)
    }
 };

const updatePeri = async (req,res,next) => {
    try {
        
        const {id} = req.params;
        const {abre, peri, fechai, fechaf, estaperi} = req.body
        
        const fechaInicioFormatted = new Date(fechai).toLocaleDateString('en-US');
        const fechaFinalFormatted = new Date(fechaf).toLocaleDateString('en-US');


        const result = await pool.query("UPDATE periodo SET abre=$1, peri=$2, fechai=$3, fechaf=$4, estaperi=$5 WHERE codpre = $6 RETURNING *", [abre, peri, fechaInicioFormatted, fechaFinalFormatted, estaperi, id]
        );
        if(result.rows.length === 0)
        return res.status(404).json({
            message: "Período no encontrado",
    });
        return res.json(result.rows[0]);

    } catch (error) {
        next(error)
    }
}

export const pericontrollers = {
getAllPeri,
getPeris,
createPeri,
deletePeri,
updatePeri
}