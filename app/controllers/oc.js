const { response } = require('express');
const {obtenerOCListaCliente,obtenerDetalleOc} = require('./downloadInfo');
const {obtenerDetalleDocumento, obtenerListaDocumentos,generarExcel,obtenerTodasLasOcBuilding} = require('./getInfoAws');
const { asociarNv, crearDocumento,actualizarDocumento } = require('./persistirS3');
const path = require('path');

const getOCOro = async (req, res = response) => {
   let id = req.params.id;

   //iniciamos llamada a servicio
   const listaOC = await obtenerOCListaCliente(id);
   
   if(listaOC.statusCod){
        res.json({
            listaOC
        });
    }else{
        return res.status(400).json({
            ok: false,
            message: 'Ha ocurrido un error.'
        });
    }
}

const getDetalleOCOro = async (req, res = response) => {
    let id = req.params.id;
 
    //iniciamos llamada a servicio
    const listaOC = await obtenerDetalleOc(id);
    
    if(listaOC.statusCod){
         res.json({
             listaOC
         });
     }else{
         return res.status(400).json({
             ok: false,
             message: 'Ha ocurrido un error.'
         });
     }
 }

const getDetalleDocumento = async(req,res =response) => {
    const id = req.params.id;
    //iniciamos lladama a aws
    const oc = await obtenerDetalleDocumento(id);
    
    if(oc.statusCod){
        res.json({
            ok: true,
            detalleDocumento : oc
        });
    }else{
        res.status(500).json({
            ok: false,
            message: oc
        })
    }
}

const asociarNV = async(req, res= response) => {
    const {id_oc_oro,id_documento,folio,mes,year} = req.body;
    
    const resultado = await asociarNv(id_documento,folio,year,mes);


    if(resultado.statusCod){

         await actualizarDocumento(id_documento,id_oc_oro,folio,"SIN REGISTRO");
    
        res.json({
            ok: true,
            message: "Asociación realizada con exito"
        });
    } else {
        res.status(500).json({
            ok:false,
            message: "Ha ocurrido un error en asociar nv"
        });
    }
}

const obtenerListaDeDocumentos = async (req, res= response) => {
    const resultado = await obtenerListaDocumentos();
    if(resultado.statusCod){
        res.json({
            ok: true,
            documentos: resultado.documentos.Items
        });
    } else {
        res.status(500).json({
            ok:false,
            message: "Ha ocurrido un error en obtener lista"
        });
    }
}
const exportExcelOrdenes = async (req, res= response) => {

    let fecha = new Date();

    const filePath =path.join(__dirname,`../../outputFiles/ordenes-${fecha.getTime()}.xlsx`);
   
    const nombre = (filePath.slice(-28)).split('.');
    const archivo = await generarExcel(filePath);
    if(archivo.statusCod){
        res.json({
            ok: true,
            message:"arhivo creado",
            nombre:`${nombre[0]}`
        });
    }else{
        res.status(500).json({
            ok: false,
            message:"Ha ocurrido un error",
        });
    }

}

const downloadExcel = async(req, res = response)=>{
    const nombre = req.params.nombre;

    try {
        const url = path.join(__dirname,`../../outputFiles/${nombre}.xlsx`);
        console.log(url);
        res.sendFile(url);
     }catch(err){
         console.log(err);
         res.status(500).json({
             ok:false,
             error:err
         });
     }

}

const listadoOcOro = async (req, res) =>{
console.log('probando')
    const listaDeOrdenes = await obtenerTodasLasOcBuilding();
    console.log(listaDeOrdenes);
    if(listaDeOrdenes.statusCod){
        res.json({
            ok:true,
            listaDeOrdenes: listaDeOrdenes.listaOrdenes
        })
    }else{
        res.status(500).json({
            ok:true,
            message:"Ha ocurrido un error obeteniendo la lista"
        });
    }
}
module.exports = {
    getOCOro,
    getDetalleOCOro,
    getDetalleDocumento,
    asociarNV,
    obtenerListaDeDocumentos,
    exportExcelOrdenes,
    downloadExcel,
    listadoOcOro
};