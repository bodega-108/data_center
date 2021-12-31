
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

 const {crearDocumento,setOcOro,nuevasOc,obtenerUltimoNumeroTabla} = require('./app/controllers/persistirS3');


 const cron = require('node-cron');
require('dotenv').config();

const port = process.env.PORT;
const app = express();

// persistirPago(1,1000,"abono");
//buildDetailOc();
// obtenerTodasLasOcBuilding();
//generarExcel();
//guardarPagoNV(1,10000,21,"Abono de goma eva","CLP","Abono","FACTURA");

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


cron.schedule('0 0 * * *',async()=>{
     console.log("Actualizando Sistema");
     const nuevosRegistros = await nuevasOc();
    console.log(nuevosRegistros);

     const obtenerId =await obtenerUltimoNumeroTabla();

     if(nuevosRegistros.statusCod){

        for(let i = 0; i < nuevosRegistros.nuevasOc.length; i++){

         const documentoRegistrado = await crearDocumento((nuevosRegistros.nuevasOc[i]).toString(),"SIN NV ASOCIADA","SIN NV SHERPA ASOCIADA");
         if(documentoRegistrado.statusCod){
            const obtenerId =await obtenerUltimoNumeroTabla();
            await setOcOro(obtenerId.idUltimoDocumento - 1,nuevosRegistros.nuevasOc[i]);
         }
        }
        console.log("Ha concluido la actualizacion");
     
     }else{
        console.log("No hay registros nuevos");
     }
});

const migrar = async()=>{
   console.log("Migrando DB");
   const nuevosRegistros = await nuevasOc();
   const obtenerId =await obtenerUltimoNumeroTabla();
   if(nuevosRegistros.statusCod){
      for(let i = 0; i < nuevosRegistros.nuevasOc.length; i++){
       const documentoRegistrado = await crearDocumento((nuevosRegistros.nuevasOc[i]).toString(),"SIN NV ASOCIADA","SIN NV SHERPA ASOCIADA");
       if(documentoRegistrado.statusCod){
          const obtenerId =await obtenerUltimoNumeroTabla();
          
          await setOcOro(obtenerId.idUltimoDocumento - 1,nuevosRegistros.nuevasOc[i]);
       }
      }
   
   } 
}
