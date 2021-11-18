const { response } = require('express');
const {registrarPago,guardarPagoNV } = require('./procesarPagos');
const {obtenetRegistroPago,obtenerListaNotaVentas} = require('../../controllers/getInfoAws');

const registrarPagoRest = async(req, res = response)=>{

    const {folio,monto,factura_asociada,descripcion,moneda,desc_movi,tipo_documento} = req.body;

    const registrar = await guardarPagoNV(folio,monto,factura_asociada,descripcion,moneda,desc_movi,tipo_documento);

    if(registrar.statusCod){
        res.json({
            ok: true,
            statusDesc: registrar.statusDesc
        });
    }else{
        res.status(500).json({
            ok:false,
            statusDesc: `Ha ocurrido un error al intentar registrar el pago`
        });
    }

}

const obtenerHistorialPagos = async (req, res=response) => {
    const folio = req.params.folio;
    
    const historial = await obtenetRegistroPago(parseInt(folio));
  

    if (historial.statusCod){
        res.json({
            ok: true,
            historial : historial.registro
        })
    }else{
        res.status(500).json({
            ok:false,
            statusDesc:`Ha ocurrido un erro al obtener el historial de pagos`
        });
    }
}

const listaNv = async(req, res = response)=>{
    const lista = await obtenerListaNotaVentas();

    if(lista.statusCod){
        res.json({
            ok:true,
            lista_nv:lista.nota_de_ventas
        });
    }else{
        res.status(500).json({
            ok:false,
            statusDesc:"Ha ocurrido en error"
        })
    }
}

module.exports={
    registrarPagoRest,
    obtenerHistorialPagos,
    listaNv
}