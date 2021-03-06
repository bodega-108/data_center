const {obtenerDetalleNv} = require('../../controllers/infoSoftne');
const {guardarPago,guardarMontoDeuda} = require('../../controllers/persistirS3');
const {obtenetRegistroPago,obtenerMontoPendiente} = require('../../controllers/getInfoAws');
const { v4: uuidv4 } = require('uuid');

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
       console.log(detalleNV);
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
                let subFamilia = detalleNV.data.receptor.RznSocRecep;
                console.log(detalleNV);
                let montoPendiente = montoTotalNV - (monto + parseInt(totalPagosAcumulados));
                let today = new Date();

                let nuevoPago = {
                    id: uuidv4(),
                    subFamilia,
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
                let subFamilia = detalleNV.data.receptor.RznSocRecep;
                let montoPendiente = montoTotalNV - monto;
                let today = new Date();
    
                let nuevoPago = {
                    id:uuidv4(),
                    CCTVTS,
                    totalMontoNV: montoTotalNV,
                    monto,
                    subFamilia,
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
    //console.log(respuesta);
    return respuesta;
}

/**
 * Funcion para guardar pagos
 * @param {*} folio 
 * @param {*} monto 
 * @param {*} factura_asociada 
 * @param {*} descripcion 
 * @param {*} moneda 
 * @param {*} desc_movi 
 * @param {*} tipo_documento 
 * @param {*} tipo_cambio 
 * @param {*} CCTVTS 
 * @param {*} fecha_pago 
 * @returns 
 */
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

const calcularPagoVDos = async (folio,monto,tipo)=>{
   
    let respuesta = {
        statusCod:true,
        statusDesc:""
    }

    try{
        const detalleNV = await obtenerDetalleNv(folio,"2021","06");   
        
        let montoTotal = detalleNV.data.totales.MntTotal;
        let montoPendiente = await obtenerMontoPendiente(folio);
        
        if(montoPendiente.statusCod){
            if(tipo === "abono"){
          
                let nuevoMontoPendiente = montoPendiente.montoDeuda.montoPendiente - monto;
               
                let newMontoPendiente = {
                    folio,  
                    nuevoMontoPendiente
                };

                respuesta.statusCod = true;
                respuesta.statusDesc = `Resultado de deducci??n`;
                respuesta.montoDeuda = newMontoPendiente;
            }else{

                let nuevoMontoPendiente = montoPendiente.montoDeuda.montoPendiente + monto;
                let newMontoPendiente = {
                    folio,  
                    nuevoMontoPendiente
                };

                respuesta.statusCod = true;
                respuesta.statusDesc = `Resultado de devolucion de pago`;
                respuesta.montoDeuda = newMontoPendiente;
            }
        }else{
          let nuevoMontoPendiente = montoTotal - monto;
          let newMontoPendiente = {
            folio,  
            nuevoMontoPendiente
        };
            
          respuesta.statusCod = true;
          respuesta.statusDesc = `Resultado de primer calculo`;
          respuesta.montoDeuda = newMontoPendiente;
        }

    }catch(err){
        console.log(err);
        respuesta.statusCod = false;
        respuesta.statusDesc = `Ha ocurrido un error al calcular.`
    }
    console.log(respuesta);
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

const eliminarPago = async(id,folio)=>{
    
    let respuesta = {
        statusCod: true,
        statusDesc:""
    }

    try {
       let pago = await obtenetRegistroPago(folio);
       
       if(pago.statusCod){
        console.log(pago);
        let pagoEliminado = pago.registro.filter(registro => registro.id !== id);
        const registroEliminado = await guardarPago(folio,pagoEliminado);
        if(registroEliminado.statusCod){
            respuesta.statusCod = true;
            respuesta.statusDesc = "Registro eliminado con exito"
        }else{
            respuesta.statusCod = false;
            respuesta.statusDesc = "No se ha podido eliminar el pago"
        }

       }else{
        respuesta.statusCod = false;
        respuesta.statusDesc = "Ha ocurrido error al elimar el pago"
       }

    } catch (error) {
        console.log(error);
        respuesta.statusCod = false;
        respuesta.statusDesc = "Ha ocurrido error al elimar el pago"
    }
    return respuesta;
}

const persistirPago = async(folio,monto,tipo)=>{

    let respuesta = {
        statusCod:true,
        statusDesc: ""
    }

    try{
        const calcularPagoVDosResult = await calcularPagoVDos(folio,monto,tipo);
      
        if(calcularPagoVDosResult.statusCod){
            const resultPersistencia = await guardarMontoDeuda(calcularPagoVDosResult.montoDeuda);
            
            if(resultPersistencia.statusCod){
                respuesta.statusCod = true;
                respuesta.statusDesc = `Se ha registrado el pago con exito.`
            }else{
                respuesta.statusCod = false;
                respuesta.statusDesc = `No se puede registrar este pago.`
            }
        }else{
            respuesta.statusCod = false;
            respuesta.statusDesc = `Ha ocurrido un error al calcular.`
        }
       

    }catch(e){
        console.log(e);
        respuesta.statusCod = true;
        respuesta.statusDesc = `Ha ocurrido un error al calcular.`
    }

    console.log(respuesta);

    return respuesta;
}

module.exports = {
    registrarPago,
    calculos,
    registrarPagoNV,
    guardarPagoNV,
    eliminarPago,
    calcularPagoVDos,
    persistirPago

}