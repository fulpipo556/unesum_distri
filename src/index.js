import express from 'express';
import morgan from 'morgan';
import 'dotenv/config';
import distriRouter from '../routes/distri.routes.js';
import actiRouter from '../routes/acti.routes.js';
import periRouter from '../routes/peri.routes.js';
import docentRouter from '../routes/doce.routes.js';
import bodyParser from 'body-parser';
import cors from 'cors'

const app = express();


app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(distriRouter);
app.use(actiRouter);
app.use(periRouter);
app.use(docentRouter);

app.use((err, req, res,next) => {
    return res.json({
        message: err.message
    })
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('servidor conectado en puerto' + PORT);
});