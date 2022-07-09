const { response } = require('express');
const {obtenerOCListaCliente,obtenerDetalleOc, obtenerTodosLosProductos} = require('./downloadInfo');
const {obtenerDetalleDocumento, obtenerListaDocumentos,generarExcel,obtenerTodasLasOcBuilding,obtenerFechaActualizacion} = require('./getInfoAws');
const { asociarNv, crearDocumento,actualizarDocumento,migrar, deleteNVSherpa, deleteNVSoftnet } = require('./persistirS3');
const path = require('path');
const { getInfochina } = require('./getInfoChina');
const { saveProductOro,updateEta } = require('./persistirOro');


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
    const {id_oc_oro,id_documento,folio,mes,year,nv_sherpa} = req.body;
    const resultado = await asociarNv(id_documento,folio,year,mes,nv_sherpa);
    if(resultado.statusCod){

         await actualizarDocumento(id_documento,id_oc_oro,folio,nv_sherpa);
    
        res.json({
            ok: true,
            message: "Asociación realizada con exito",
            info: resultado.statusInfo
        });
    } else {
        res.status(500).json({
            ok:false,
            message: resultado.statusDesc,
            info: resultado.statusInfo

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

const fechaActualizacionMigracionOc = async(req, res) => {
    try {

        const fechaA = await obtenerFechaActualizacion();
        console.log(fechaA);
        if(fechaA.statusCod){
            res.json({
                ok:true,
                fecha_actualizacion : fechaA.fecha
            });
        }
     }catch(err){
         console.log(err);
         res.status(500).json({
             ok:false,
             error:err
         });
     }
}

const getInfoChinaResponse = async(req, res)=>{
    const { id } = req.body;

    const data = await getInfochina(id);

    if(data.statusCod){
       return res.json({
            ok:true,
            message:"AQUI VA LA DATA"
        });
    }

    res.status(500).json({
        ok:false,
        message:`ERROR al obtener nota de venta ${id}`
    });
}
const migracionManual= async()=>{
    
    await migrar();
    res.json({
        ok: true,
        message:"migración finalizada"
    });
}

const getProductosOro = async(req, res)=>{
    const {id} = req.params;
    const productos = await obtenerTodosLosProductos(id);
    if(productos.statusCod){
        return res.json({
             ok:true,
             message: productos
         });
     }
 
     res.status(500).json({
         ok:false,
         message:`ERROR al obtener lista de productos`
     });
}

const crearProductoOro = async (req, res) => {
    const data = req.body;
   
    const producto = await saveProductOro(data);
    if(producto.statusCod){
        return res.json({
             ok:true,
             producto
         });
     }
 
     res.status(500).json({
         ok:false,
         message:`ERROR al obtener lista de productos`
     });
}

const updateEtaOro = async(req, res) =>{
    const {nv_sherpa,fecha_eta} = req.body;
    const updateEtaRq = await updateEta(nv_sherpa,fecha_eta);

    res.json({
        ok:true,
        message: updateEtaRq
    });
}

const eliminarNV = async(req, res)=>{

    const {id_documento, nv_sherpa} = req.body;
    const nv_eliminada = await deleteNVSherpa(id_documento, nv_sherpa);

    res.json({
        ok:true,
        message: nv_eliminada.statusDesc,
        document: nv_eliminada.document,
    })
}

const eliminarNVS = async(req, res)=>{

    const {id_documento, nv_softnet} = req.body;
    const nv_eliminada = await deleteNVSoftnet(id_documento, nv_softnet);

    res.json({
        ok:true,
        message: nv_eliminada.statusDesc,
        document: nv_eliminada.document,
    })
}
module.exports = {
    getOCOro,
    getDetalleOCOro,
    getDetalleDocumento,
    asociarNV,
    obtenerListaDeDocumentos,
    exportExcelOrdenes,
    downloadExcel,
    listadoOcOro,
    fechaActualizacionMigracionOc,
    getInfoChinaResponse,
    migracionManual,
    getProductosOro,
    crearProductoOro,
    updateEtaOro,
    eliminarNV,
    eliminarNVS
};