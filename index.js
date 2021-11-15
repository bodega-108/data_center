
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
 const { obtenerOCListaCliente, obtenerTodasLasOc,ultimaOc,nuevosRegistrosDiarios,obtenerProductosOC } = require('./app/controllers/downloadInfo');
 const {migrateOroCommerce,crearDocumento,setOcOro,asociarNv,actualizarDocumento, nuevasOc,obtenerUltimoNumeroTabla,guardarPago} = require('./app/controllers/persistirS3');
 const {obtenerDetalleDocumento, obtenerIdDocumento,obtenerListaDocumentos,obtenetRegistroPago} = require('./app/controllers/getInfoAws');
 const {obtenerListaNv,autenticacion,obtenerDetalleNv} = require('./app/controllers/infoSoftne');
 const {registrarPago,calculos} = require('./app/pagos/controllers/procesarPagos');

 const cron = require('node-cron');
require('dotenv').config();

const port = process.env.PORT;
const app = express();


//  registrarPago(50000,1,"9-000044-001");
 //calculos(150000,1,"9-000044-001");

 //obtenetRegistroPago(1)
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
