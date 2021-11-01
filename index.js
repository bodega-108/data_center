
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
 const { obtenerOCListaCliente, obtenerTodasLasOc,ultimaOc,nuevosRegistrosDiarios } = require('./app/controllers/downloadInfo');
 const {migrateOroCommerce,crearDocumento,setOcOro,asociarNv,actualizarDocumento} = require('./app/controllers/persistirS3');
 const {obtenerDetalleDocumento, obtenerIdDocumento} = require('./app/controllers/getInfoAws');
 const {obtenerListaNv,autenticacion,obtenerDetalleNv} = require('./app/controllers/infoSoftne');

 const cron = require('node-cron');
require('dotenv').config();

const port = process.env.PORT;
const app = express();

//asociarNv(68,70,"2021","07");

/**
 * Middleware
 */
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

/**
 * Routes
 */
app.use('/api',require('./app/routes/routes'));

/**
 * Start servidor
 */
app.listen(port,()=>{
   console.log(`Server Runing in port ${port}`); 
});


cron.schedule('0 0 * * * ',async()=>{
     console.log("Actualizando Sistema");
     const nuevasOc = await nuevosRegistrosDiarios();
     if(nuevasOc.data.length > 1){
      try {
         for(let i=0; i < nuevasOc.data.length;i++){
            
            const documentoRegistrado = await crearDocumento(nuevasOc.data[i].id);
              if(documentoRegistrado.statusCod){
               await setOcOro(parseInt(nuevasOc.data[i].id));
              }
         }
      } catch (error) {
         console.log(error);
      }
     }



});
