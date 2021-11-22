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

const registrarPagoNV = async(folio,monto,factura_asociada,descripcion,moneda,desc_movi,tipo_documento, tipo_cambio,CCTVTS,fecha_pago)=>{
    console.log("EL TIPO DE CAMBIO ES " + tipo_cambio);
    let respuesta = {
        statusCod : true,
        statusDesc:"",
        calculosResultado:[]
    }

    try {
        const detalleNV = await obtenerDetalleNv(folio,"2021","06");   
       
        if(detalleNV.statusCod){
            const historial = await obtenetRegistroPago(folio);
            
            if(historial.statusCod){

                let pagosAcumulados = [];

                for(let i=0; i < historial.registro.length; i++) {
                    pagosAcumulados.push(historial.registro[i].monto);
                    respuesta.calculosResultado.push(historial.registro[i]);
                }
                if(moneda === "USD"){
                    monto = monto * tipo_cambio;
                }else{
                    tipo_cambio = "NO APLICA"
                }
                let totalPagosAcumulados = pagosAcumulados.reduce((a,b)=>a+b,0);
                let montoTotalNV = detalleNV.data.totales.MntTotal;
                let montoPendiente = montoTotalNV - (monto + parseInt(totalPagosAcumulados));
                let today = new Date();

                let nuevoPago = {
                    totalMontoNV: montoTotalNV,
                    monto,
                    montoPendiente,
                    factura_asc: factura_asociada ? factura_asociada : "No hay factura asociada",
                    fecha_pago,
                    fecha_registro_sistema :new Date().toLocaleDateString(),
                    hora: `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`,
                    mes: getMontString(today.getMonth()),
                    descripcion: descripcion ? descripcion : "ABONO ha nota de venta",
                    moneda: moneda ? moneda  : "CLP",
                    tipo_cambio: tipo_cambio ? tipo_cambio : 1,
                    desc_movi: desc_movi ? desc_movi :"Pago nota de venta folio " + folio,
                    tipo_documento : tipo_documento ? tipo_documento : "FACTURA",
                    
                };
                respuesta.calculosResultado.push(nuevoPago);
                respuesta.statusDesc = "Abono";
            }else{

                if(moneda === "USD"){
                    monto = monto * tipo_cambio;
                }else{
                    tipo_cambio = "NO APLICA"
                }
                let montoTotalNV = detalleNV.data.totales.MntTotal;
                let montoPendiente = montoTotalNV - monto;
                let today = new Date();
    
                let nuevoPago = {
                    CCTVTS,
                    totalMontoNV: montoTotalNV,
                    monto,
                    montoPendiente,
                    factura_asc: factura_asociada ? factura_asociada : "No hay factura asociada",
                    fecha_pago,
                    fecha_registro_sistema :new Date().toLocaleDateString(),
                    hora: `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`,
                    mes: getMontString(today.getMonth()),
                    descripcion: descripcion ? descripcion : "ABONO ha nota de venta",
                    moneda: moneda ? moneda  : "CLP",
                    tipo_cambio,
                    desc_movi: desc_movi ? desc_movi :"Pago nota de venta folio " + folio,
                    tipo_documento : tipo_documento ? tipo_documento : "FACTURA"
                };

                respuesta.calculosResultado.push(nuevoPago);
                respuesta.statusDesc = "Primer pago";
            }
        }else{
            
            respuesta.statusCod =false;
            respuesta.statusDesc = `Error al obtener la nota de venta con el folio ${folio}`;
        }

    } catch (error) {
        console.log(error);
    }
    console.log(respuesta);
    return respuesta;
}

const guardarPagoNV = async(folio,monto,factura_asociada,descripcion,moneda,desc_movi,tipo_documento,tipo_cambio,CCTVTS,fecha_pago)=>{
    let respuesta = {
        statusCod:true,
        statusDesc: ""
    };

    try {
       const calculosPago = await registrarPagoNV(folio,monto,factura_asociada,descripcion,moneda,desc_movi,tipo_documento,tipo_cambio,CCTVTS,fecha_pago);
        console.log(calculosPago);
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

const getMontString = (month)=>{
    let mes = "";
    switch (month) {
        case 1:
            mes = "Enero";
            break;
        case 2:
            mes = "Febrero";
            break;
        case 3:
            mes = "Marzo";
            break;
        case 4:
            mes = "Abril";
            break;
        case 5:
            mes = "Mayo";
            break;
        case 6:
            mes = "Junio";
            break;
        case 7:
            mes = "Julio";
            break;
        case 8:
            mes = "Agosto";
            break;
        case 9:
            mes = "Septiembre";
            break;
        case 10:
            mes = "Octubre";
            break;
        case 11:
            mes = "Noviembre";
            break;
        case 12:
            mes = "Diciembre";
            break;
        default:
            mes = "Unknown";
            break;       
    }
    return mes;
}

module.exports = {
    registrarPago,
    calculos,
    registrarPagoNV,
    guardarPagoNV

}