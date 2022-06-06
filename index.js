
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const {crearDocumento,setOcOro,nuevasOc,obtenerUltimoNumeroTabla,guardarOcConstruida,guardarActualizacionListaOc,updateDataOroSherpa} = require('./app/controllers/persistirS3');
const {buildDetailOc} = require('./app/controllers/downloadInfo');
const path = require('path');

//sawgger
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const cron = require('node-cron');
require('dotenv').config();

const port = process.env.PORT;
const app = express();

//obtenerTodasLasOcBuildingCliente("Insumos medicos MyM SPA");

const migracion = async () =>{
   cron.schedule('*/30 * * * *',async()=>{
      const migrate = await buildDetailOc();
      console.log("Actualizando lista de ordenes");
      console.log(migrate);

      for(let i = 0; i < migrate.listOc.length; i++){
         const guardado = await guardarOcConstruida(migrate.listOc[i]);
         if(guardado.statusCod){
            console.log(`Guardado con exito oc ${migrate.listOc[i].id}`);
         }
      }
      console.log("========== FIN DE ACTUALIZACIÓN ==========")
      await guardarActualizacionListaOc(1);
   })
}
guardarActualizacionListaOc(1);

 migracion();

 const swaggerSpec ={
   definition:{
      openapi:"3.0.0",
      info:{
         title:"EMONK PANEL ADMINISTRATIVO API",
         version:"1.0.0"
      },
      servers:[
         {
         url:`http://localhost:${process.env.PORT}`,
         },
         {
            url:`http://54.203.82.32:${process.env.PORT}`,
         }
   ]
   },
   apis:[`${path.join(__dirname,"./app/routes/routes.js")}`]
}

/**
 * Middleware
 */
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use("/api-doc",swaggerUI.serve, swaggerUI.setup(swaggerJsDoc(swaggerSpec)));
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
// CRON JOB TO UPDATE ETA INFO
cron.schedule('*/15  * * * *', async()=>{
   await updateDataOroSherpa();
   return;
});
const migrar = async()=>{
   console.log("Migrando DB");
   const nuevosRegistros = await nuevasOc();
   
   if(nuevosRegistros.statusCod){
      for(let i = 0; i < nuevosRegistros.nuevasOc.length; i++){
       const documentoRegistrado = await crearDocumento((nuevosRegistros.nuevasOc[i]).toString(),"SIN NV ASOCIADA","SIN NV SHERPA ASOCIADA");
       if(documentoRegistrado.statusCod){
          const obtenerId =await obtenerUltimoNumeroTabla();
          
          await setOcOro(obtenerId.idUltimoDocumento - 1,nuevosRegistros.nuevasOc[i]);  
       }
      }
   } 
   return;
}
//migrar();
