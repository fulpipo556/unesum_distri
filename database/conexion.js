import 'dotenv/config'; 

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORTP, 
  ssl: {
    rejectUnauthorized: true,
    mode: 'require'
}

});

try {
    await pool.query('SELECT NOW()');
    console.log('conectada base de datos');
} catch (error) {
    console.log(error)
}


export default pool;
