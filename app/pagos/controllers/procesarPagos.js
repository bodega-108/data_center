const {obtenerDetalleNv} = require('../../controllers/infoSoftne');
const {guardarPago} = require('../../controllers/persistirS3');
const {obtenetRegistroPago} = require('../../controllers/getInfoAws');


/**
 * Funcion para guardar registros de pagos
 * @param {*} monto 
 * @param {*} folio 
 * @param {*} sku 
 * @returns 
 */
const registrarPago = async(monto,folio,sku,factura_asociada)=>{

    let respuesta = {
        statusCod:true,
        statusDesc: ""
    }

    try {
        
        const calculosPago = await calculos(monto,folio,sku,factura_asociada); 
       
        if(calculosPago.statusCod){
             const nuevoRegistro = await guardarPago(folio,calculosPago.calculosResultado);
             respuesta.statusCod = true;
             respuesta.statusDesc = `Se ha registrado un nuevo pago para la nota de venta ${folio}`
        }else{
            respuesta.statusCod = false;
            respuesta.statusDesc =calculosPago.statusDesc
        }
       

    } catch (error) {
        console.log(error);
        respuesta.statusCod = false;
        respuesta.statusDesc ="ha ocurrido un error al guardar el pago"
    }

    return respuesta;
}


/**
 * Calcular cantidades y saldo pendiete por item
 * @param {*} monto 
 */
const calculos = async(monto,folio,sku,factura_asociada)=>{

    let respuesta = {
        statusCod:true,
        statusDesc:"",
        calculosResultado:[]
    }

    try {
        const detalleNV = await obtenerDetalleNv(folio,"2021","06");   
        let montoNetoNv = detalleNV.data.totales.MntTotal;
        let skuProcesar = detalleNV.data.Detalle.filter(producto => producto.VlrCodigo === sku);

        // console.log(skuProcesar[0]);

        const historial = await obtenetRegistroPago(folio);

        if(historial.statusCod){
            //  console.log(historial.registro);

            let pagosAcumulados = [];

            for(let i=0; i < historial.registro.length; i++) {
                pagosAcumulados.push(historial.registro[i].monto);
                respuesta.calculosResultado.push(historial.registro[i]);
            }
            
            let totalPagosAcumulados = pagosAcumulados.reduce((a,b)=>a+b,0);         
            let montoPendiente = skuProcesar[0].MontoItem - (monto + parseInt(totalPagosAcumulados));
            let uPagadas = Math.round( monto/skuProcesar[0].PrcItem);
            let uPendientes = historial.registro[historial.registro.length -1].unidadesPendientes - uPagadas;
            let totalUnidadesPagadas = historial.registro[historial.registro.length -1].totalUnidadesPagadas + uPagadas;;
            let today = new Date();

            // if(!historial.registro[historial.registro.length - 1].montoPendiente === 0){
                
                let newPay = {
                    sku,
                    monto,
                    montoPendiente,
                    unidadesPagadas:uPagadas,
                    totalUnidadesPagadas,
                    unidadesPendientes:uPendientes,
                    factura_asc: factura_asociada ? factura_asociada : "No hay factura asociada",
                    fecha :new Date().toLocaleDateString(),
                    hora: `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`
                }
                respuesta.calculosResultado.push(newPay);
            // }else{
                // respuesta.statusCod= false;
                // respuesta.statusDesc=`La nota de venta ha sido cancelada en su totalidad`
            // }


        }else{
            //Calculos
            let montoPendiente = skuProcesar[0].MontoItem - monto;
            let uPagadas = Math.round(monto / skuProcesar[0].PrcItem);
            let uPendientes = skuProcesar[0].QtyItem - uPagadas;
            let totalUnidadesPagadas = uPagadas;
            let today = new Date();
            //Resultados
            let newPay = {
                sku,
                monto,
                montoPendiente,
                unidadesPagadas:uPagadas,
                totalUnidadesPagadas,
                unidadesPendientes:uPendientes,
                factura_asc: factura_asociada ? factura_asociada : "No hay factura asociada",
                fecha :new Date().toLocaleDateString(),
                hora: `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`
            }
            respuesta.calculosResultado.push(newPay);
        }
    } catch (error) {
        console.log(error);
        respuesta.statusCod = false;
        respuesta.statusDesc = "Error al calcular pago";
    }
    // console.log(respuesta);
    return respuesta;
}

module.exports = {
    registrarPago,
    calculos

}