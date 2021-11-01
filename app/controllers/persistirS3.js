const AWS = require("aws-sdk");
const { v4: uuidv4 } = require('uuid');
const {ultimaOc,obtenerDetalleOc} = require('./downloadinfo');
const { obtenerDetalleDocumento,obtenerIdDocumento } = require("./getInfoAws");
const {obtenerDetalleNv} = require('./infoSoftne');


AWS_ACCESS_KEY_ID="AKIARR52ZBJVOD6O5KHE";
AWS_SECRET_ACCESS_KEY="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";
AWS_DEFAULT_REGION="us-east-2";


AWS.config.update({
    region:AWS_DEFAULT_REGION,
    accessKeyId:AWS_ACCESS_KEY_ID,
    secretAccessKey:AWS_SECRET_ACCESS_KEY
});

/**
 * Crear Documento
 * @param idOcOro
 * @param idNVSoftnet
 * @param idNVSherpa
 */
const crearDocumento = async(idOcOro,idNVSoftnet,idNVSherpa)=>{
    
    let DynamoDB = new AWS.DynamoDB.DocumentClient();
    const tablaDynamo = "tbDocumentoOc-dev";

    var respuesta={
        statusCod:true,
        statusDesc:""
      }

    let params = {
        TableName:tablaDynamo,
        Item:{
            "id_documento":0,
            "oc_oro": idOcOro,
            "nv_sherpa":idNVSherpa,
            "nv_sofnet":idNVSoftnet
        }
      };
    
      try{     
        //Obtenemos el ultimo ID de documento
        let ultimo_documento_id = await obtenerUltimoNumeroTabla();

        if(ultimo_documento_id.idUltimoDocumento != 0){
            params.Item.id_documento = ultimo_documento_id.idUltimoDocumento;
            const data= await DynamoDB.put(params).promise();
            respuesta.statusDesc = data;
            respuesta.statusCod=true;

        }else{
            respuesta.statusCod = false;
            respuesta.statusDesc="Ha ocurrido un error al buscar el ultimo id de documento";
        }      
    }catch(e){/**Error*/
       console.log(e);
        respuesta.statusCod="ERR";
        respuesta.statusDesc=e.message;
      }
      return respuesta;
} 

/**
 * Obtener ultimo numero de documento
 */
const obtenerUltimoNumeroTabla = async()=>{
    let DynamoDB = new AWS.DynamoDB.DocumentClient();
    const tablaDynamo = "tbDocumentoOc-dev";

    var respuesta={
        statusCod:"Ok",
        statusDesc:"",
        idUltimoDocumento:0
      }

    let arregloIdDocumentos = [];

    let params = {
        TableName:tablaDynamo
      };

      try{
        const data= await DynamoDB.scan(params).promise();
        //Extraemos ultimo id
        for(let i=0; i < data.Items.length; i++){
            arregloIdDocumentos.push(data.Items[i].id_documento);
        }
        respuesta.statusCod="OK";
        respuesta.statusDesc="";
        respuesta.idUltimoDocumento = Math.max(...arregloIdDocumentos) + 1;
    }catch(e){/**Error*/
       
        respuesta.statusCod="ERR";
        respuesta.statusDesc=e.message;
      }
      return respuesta;
}

/**
 * Migrar Oro comerce to aws
 */
const migrateOroCommerce = async()=>{

  const listaDeId = await ultimaOc();
  console.log(listaDeId);
  try {
   // await crearDocumento(listaDeId.idListaOcOro[1].toString(),"","");
   //await setOcOro(parseInt(listaDeId.idListaOcOro[10])); 
    for(let i=0; i<listaDeId.idListaOcOro.length;i++){
      await setOcOro(parseInt(listaDeId.idListaOcOro[i]));
     }

     
  } catch (error) {
    console.log(error);
  }

}

/**
 * Persistir data de oc oro
 * @param {} id;
 */
const setOcOro = async(id)=>{
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbDetalleDocumento-dev";
  var respuesta={
      statusCod:true,
      statusDesc:""
    }

  let detalleOc = {
    "id" : id,
    "createdAt": "",
    "moneda":"",
    "subtotal":"",
    "total":"",
    "descuento":"",
    "organizacion":"",
    "usuario":"",
    "pais":"",
    "status":{
      "pago":"",
      "factura":"",
      "entrega":""
    }

  }
    try {
      const oc = await obtenerDetalleOc(id); 
      if(oc.statusCod){

        let params = {
          TableName:tablaDynamo,
            Item:{
              "id_documento":id,
              "oc_oro": "",
              "nv_sherpa":"SIN NV ASOCIADA",
              "nv_sofnet":"SIN NV SHERPA ASOCIADA"
            }
          };

        detalleOc.createdAt = oc.data.createdAt;
        detalleOc.moneda = oc.data.currency;
        detalleOc.subtotal = oc.data.subtotalValue;
        detalleOc.total = oc.data.totalValue;
        detalleOc.descuento = oc.data.discount;
        detalleOc.organizacion = oc.data.billingAddress.organization;
        detalleOc.usuario = `${oc.data.billingAddress.firstName} ${oc.data.billingAddress.lastName}`,
        detalleOc.pais =oc.data.billingAddress.country;
        detalleOc.status.pago = oc.data.summa_payment_status;
        detalleOc.status.factura = oc.data.summa_invoice_status;
        detalleOc.status.entrega = oc.data.summa_shipping_status;

          params.Item.oc_oro = detalleOc;
          const data= await DynamoDB.put(params).promise();
          respuesta.statusCod = true;
          respuesta.statusDesc = "Registro almacenado con exito";

      }else{
        respuesta.statusCod = false;
        respuesta.statusDesc = "No se encontraron registros con el id " + id;
      }
    }catch(e){
      console.log(e)
      respuesta.statusCod = false;
      respuesta.statusDesc = `Ha ocurrido un error ${e.message}`;
    }
    return respuesta;
}

/**
 * Asociar nv a oc
 * @param {} folio;
 * @param {} mes;
 * @param {} year;
 * @param {} id_documento;
 */
const asociarNv = async(id_documento,folio,mes,year) => {
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbDetalleDocumento-dev";

  var respuesta={
    statusCod:true,
    statusDesc:""
  }

  try {
      const detalleOcOro = await obtenerDetalleDocumento(id_documento);
     
      const detalleFacturaSoftnet = await obtenerDetalleNv(folio,mes,year);
    
      if(detalleFacturaSoftnet.statusCod) {
        let params = {
          TableName:tablaDynamo,
          Item:{
            "id_documento":id_documento,
            "oc_oro":detalleOcOro.documentos.oc_oro,
            "nv_sofnet":detalleFacturaSoftnet.data,
            "nv_sherpa":"SIN NV SHERPA ASOCIADA"
          }
        }
 
        const data= await DynamoDB.put(params).promise();
        respuesta.statusCod = true;
        respuesta.statusDesc = "Registro almacenado con exito";
      }else{
        respuesta.statusCod = false;
        respuesta.statusDesc = "Ha ocurrido un error al asociar";
      }
  }catch(e) {
    console.log(e)
    respuesta.statusCod = false;
    respuesta.statusDesc = `Ha ocurrido un error ${e.message}`;
  }
  return respuesta;
}
/**
 * Actualizar Documento
 * @param idOcOro
 * @param idNVSoftnet
 * @param idNVSherpa
 */
 const actualizarDocumento = async(idOcOro,idNVSoftnet,idNVSherpa)=>{
    
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbDocumentoOc-dev";

  var respuesta={
      statusCod:true,
      statusDesc:""
    }

  let params = {
      TableName:tablaDynamo,
      Item:{
          "id_documento":0,
          "oc_oro": idOcOro.toString(),
          "nv_sherpa":idNVSherpa.toString(),
          "nv_sofnet":idNVSoftnet.toString()
      }
    };
    
    try{     
      //Obtenemos el ultimo ID de documento
      const documento = await obtenerIdDocumento(idOcOro);
      params.Item.id_documento = parseInt(documento.idDoc);

          const data= await DynamoDB.put(params).promise();
          respuesta.statusDesc = data;
          respuesta.statusCod=true;
  
  }catch(e){/**Error*/
     console.log(e);
      respuesta.statusCod="ERR";
      respuesta.statusDesc=e.message;
    }
    return respuesta;
} 

module.exports = {
  migrateOroCommerce,
  crearDocumento,
  setOcOro,
  asociarNv,
  actualizarDocumento
}
