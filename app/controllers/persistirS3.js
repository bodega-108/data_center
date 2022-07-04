const AWS = require("aws-sdk");
const {ultimaOc,obtenerDetalleOc,obtenerTodasLasOc,obtenerProductosOC,buildDetailOc} = require('./downloadInfo');
const { obtenerDetalleDocumento,obtenerIdDocumento,obtenerListaDocumentos, obtenerListaDocumentosSSO, obtenerDocumentosConstruidos } = require("./getInfoAws");
const {obtenerDetalleNv} = require('./infoSoftne');
const { getInfochina } = require('./getInfoChina');
const { persistenciaSistemaEta } = require("./persistirOro");
const logger = require("./logger");
const { newNVADD, newNVADDSOFTNET } = require("./utils/utils");


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
    console.log("iniciando creacion de documento");
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
      console.log(respuesta);
      return respuesta;
}

/**
 * Migrar Oro comerce to aws
 */
const migrateOroCommerce = async()=>{

  const listaDeId = await ultimaOc();
  console.log(listaDeId);
  try {
    let listadoDocumentos = await obtenerListaDocumentos(); 
    console.log(listadoDocumentos.documentos.Items[0].id_documento);
    console.log(listadoDocumentos.documentos.Items[0].oc_oro);
   //await setOcOro(parseInt(listaDeId.idListaOcOro[10])); 
       for(let i=0; i<listadoDocumentos.documentos.Items.length;i++){
         // await crearDocumento(listaDeId.idListaOcOro[i].toString(),"","");
         console.log("id documento: " + listadoDocumentos.documentos.Items[i].id_documento);
         console.log("id oc oro: " + listadoDocumentos.documentos.Items[i].oc_oro);
       const almacenado =   await setOcOro(listadoDocumentos.documentos.Items[i].id_documento,parseInt(listadoDocumentos.documentos.Items[i].oc_oro));
         console.log(almacenado);
       }

     
  } catch (error) {
    console.log(error);
  }

}

/**
 * Persistir data de oc oro
 * @param {} id;
 */
const setOcOro = async(id_documento,id)=>{
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbDetalleDocumento-dev";
  var respuesta={
      statusCod:true,
      statusDesc:""
    }

  let detalleOc = {
    "id_oc" : id,
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
    },
    "lista_de_productos":""

  }
    try {
      const oc = await obtenerDetalleOc(id); 
      if(oc.statusCod){ 

        const listaProductos = await obtenerProductosOC(id);

        if(listaProductos.statusCod){

          let params = {
            TableName:tablaDynamo,
              Item:{
                "id_documento":id_documento,
                "id_oc_oro":id,
                "oc_oro": "",
                "nv_softnet":"SIN NV ASOCIADA",
                "nv_sherpa":"SIN NV SHERPA ASOCIADA"
                
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
            detalleOc.lista_de_productos = listaProductos.lista_de_productos;

            params.Item.oc_oro = detalleOc;
            const data= await DynamoDB.put(params).promise();
            respuesta.statusCod = true;
            respuesta.statusDesc = "Registro almacenado con exito";
        
      }else{
          console.log("No se pudo obtener lista de productos");
          respuesta.statusCod = false;
          respuesta.statusDesc = "No se pudo obtener lista de productos"
        }
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
 * Persistir data de oc oro
 * @param {} id;
 */
 const insertNewOroOc = async(id_documento)=>{
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbDocumentosOSS-dev";
  var respuesta={
      statusCod:true,
      statusDesc:""
    }

    try {
          let params = {
            TableName:tablaDynamo,
              Item:{
                "id_documento":id_documento,
                "oc_oro": "",
                "nv_softnet":"SIN NV ASOCIADA",
                "nv_sherpa":"SIN NV SHERPA ASOCIADA"
                
              }
            };
            const data= await DynamoDB.put(params).promise();
            respuesta.statusCod = true;
            respuesta.statusDesc = "Registro almacenado con exito";

    }catch(e){
      console.log(e);
      logger.error("HA OCURRIDO UN ERROR AL PERSISTER LA NV ASOCIADA")
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
const asociarNv = async(id_documento,folio,mes,year,nv_sherpa) => {
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbDetalleDocumento-dev";

  var respuesta={
    statusCod:true,
    statusDesc:""
  }
  let detalleFacturaSoftnet;
  try {
      const detalleOcOro = await obtenerDetalleDocumento(id_documento);
      const newsNVSH = await newNVADD(detalleOcOro,nv_sherpa);
      const newNVSS = await newNVADDSOFTNET(detalleOcOro,folio);

      let dataNVSherpa = detalleOcOro.documentos.nv_sherpa;
      let dataNVSoftnet = detalleOcOro.documentos.nv_softnet;
     
    if(folio === 0){
      detalleFacturaSoftnet = "SIN NV ASOCIADA";
     }else{
       detalleFacturaSoftnet = await obtenerDetalleNv(folio,mes,year);
       if(newNVSS){
        if(typeof(dataNVSoftnet) === "string"){
          dataNVSoftnet = [detalleFacturaSoftnet.data]
        }else{

        } dataNVSoftnet.push(detalleFacturaSoftnet.data);
       
       }
     }
     

     if(newsNVSH || newNVSS){
      const notaVentaSherpa = await getInfochina(nv_sherpa);
      if(newsNVSH){
        if(typeof(dataNVSherpa) === 'string') {
          dataNVSherpa = [notaVentaSherpa.data[0]];
        }else{
          dataNVSherpa.push(notaVentaSherpa.data[0])
        }
       
      }
  
      
      if(detalleFacturaSoftnet.statusCod || detalleFacturaSoftnet === "SIN NV ASOCIADA") {
        let params = {
          TableName:tablaDynamo,
          Item:{
            "id_documento":id_documento,
            "oc_oro":detalleOcOro.documentos.oc_oro,
            "nv_softnet":detalleFacturaSoftnet.data ? dataNVSoftnet : "SIN NV ASOCIADA",
            "nv_sherpa":notaVentaSherpa.statusCod ? dataNVSherpa : "SIN NV SHERPA ASOCIADA",
            "id_oc_oro": detalleOcOro.documentos.oc_oro.id_oc
          }
        }
 
        const data= await DynamoDB.put(params).promise();
        respuesta.statusCod = true;
        respuesta.statusDesc = "Registro almacenado con exito";
      }else{
        respuesta.statusCod = false;
        respuesta.statusDesc = "Ha ocurrido un error al asociar";
      }
     }else{
      respuesta.statusCod = false;
      respuesta.statusDesc = "La nota de venta ya ha sido asociada"
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
 const actualizarDocumento = async(id_documento,idOcOro,idNVSoftnet,idNVSherpa)=>{
    
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbDocumentoOc-dev";

  var respuesta={
      statusCod:true,
      statusDesc:""
    }

  let params = {
      TableName:tablaDynamo,
      Item:{
          "id_documento":id_documento,
          "oc_oro": idOcOro.toString(),
          "nv_sherpa": idNVSherpa.length === 0 ? "SIN NV SHERPA ASOCIADA" : idNVSherpa.toString(),
          "nv_softnet":idNVSoftnet === 0 ? "SIN NV ASOCIADA" :idNVSoftnet.toString()
      }
    };
   
    try{     
      //Obtenemos el ultimo ID de documento
      const documento = await obtenerIdDocumento(idOcOro);
     
      // params.Item.nv_softnet = parseInt(documento.idDoc);
          const data= await DynamoDB.put(params).promise();
          respuesta.statusDesc = data;
          respuesta.statusCod=true;
  
  }catch(e){/**Error*/
     console.log(e);
      respuesta.statusCod="ERR";
      respuesta.statusDesc=`Error al intentar acutalizar documento ${e.message}`;
    }
    return respuesta;
} 

/**
 * Obtener lista de oc nuevas
 * 
 */

const nuevasOc = async()=>{
  
  let respuesta = {
    statusCod:true,
    statusDesc:""
  };

  try {
    const listaAWS = await obtenerListaDocumentos();
   
    const listaOC = await obtenerTodasLasOc();

    if(listaAWS.documentos.Count != listaOC.data.data.length ){

      let listaIdOCAWS = [];
      let nuevosRegistros = [];
      
      for(let i = 0; i < listaAWS.documentos.Items.length; i++){
        listaIdOCAWS.push(listaAWS.documentos.Items[i].oc_oro);
      }

      for(let i=0; i<listaOC.data.data.length; i++){
        
        if(listaIdOCAWS.includes(listaOC.data.data[i].id)){
          console.log("Existe el registro");
        }else{
          console.log("No Existe el registro");
          nuevosRegistros.push(listaOC.data.data[i].id);
        }
      }

      if(nuevosRegistros.length > 0){
        respuesta.statusCod =true;
        respuesta.statusDesc="Se encontraron nuevos registros";
        respuesta.nuevasOc = nuevosRegistros
      }else{
        respuesta.statusCod =false;
        respuesta.statusDesc="No see encontraron nuevos registros";
       
      }
      
    }else{
      console.log("sin registros nuevos");
      respuesta.statusCod = false;
      respuesta.statusDesc ="No hay registros nuevos";
    }

  } catch (error) {
    console.log(error);
    respuesta.statusCod = false;
    respuest.statusDesc = `Ha ocurrido un error al obtener nuevas oc`;
  }
  return respuesta;
}


/**
 * 
 * @param {*} folio 
 * @param {*} registro 
 * @returns 
 */
const guardarPago = async (folio,registro) =>{
 
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbRegistrosPagos";

  var respuesta={
      statusCod:true,
      statusDesc:""
    }

  let params = {
      TableName:tablaDynamo,
      Item:{
        "folio":folio,
        registro
      }
    };
  
    try{     
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

/**
 * 
 * @param {*} oc
 * @returns 
 */
 const guardarOcConstruida = async (oc) =>{
 
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbOcBuild-dev";

  var respuesta={
      statusCod:true,
      statusDesc:""
    }

  let params = {
      TableName:tablaDynamo,
      Item:{
        id_oc:oc.id,
        cliente:oc.cliente,
        fulldata:oc
      }
    };
  
    try{     
      const data= await DynamoDB.put(params).promise();
      respuesta.statusDesc = data;
      respuesta.statusCod=true;
      console.log("====== OC MIGRADA CON EXITO =======");
  }catch(e){/**Error*/
     console.log(e);
      respuesta.statusCod="ERR";
      respuesta.statusDesc=e.message;
    }
    return respuesta;
}

const migrarOcBuild = async ()=>{
  console.log("====== INICIANDO MIGRACION =======");
  let respuesta = {
    statusCode:true,
    statusDesc:""
  };

  try{
   const listaMigracionOc = await buildDetailOc();

    for(let i = 0; i < listaMigracionOc.listOc.length; i++){
      console.log(`====== MIGRANDO OC ${listaMigracionOc.listOc.id} =======`);
    }
  }catch(error){
    console.log(error);
  }

  console.log(respuesta);
  return respuesta;
}
const migrarNV = async()=>{
  let respuesta = {
    statusCod:true,
    statusDesc: ""
  }

  try {
    for(let i = 1; i < 98; i ++){
      const detalleFacturaSoftnet = await obtenerDetalleNv(i,"mes","year");
      
      let notadeventa = {
        folio:i,
        fecha: detalleFacturaSoftnet.data.idDoc.fechaEmis,
        cliente: detalleFacturaSoftnet.data.receptor.RznSocRecep,
        productos:detalleFacturaSoftnet.data.Detalle
      }
      console.log(notadeventa);

       await guardarNotaDeVenta(notadeventa);

    }
     
    respuesta.statusCod=true;
    respuesta.statusDesc="La data ha sido migrada en su totalidad";
  } catch (error) {
   console.log(error);
   respuesta.statusCod = false;
   respuesta.statusDesc = `Ha ocuriddo un error al obtener` 
  }

  console.log(respuesta);
  return respuesta;


}

/**
 * 
 * @param {*} notadeventa 
 * @returns 
 */
const guardarNotaDeVenta = async(notadeventa)=>{
  console.log("iniciando guardado de nota de venta");

  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  
  const tablaDynamo = "tbListaNotasVentas-dev";

  var respuesta={
      statusCod:true,
      statusDesc:""
    }

  let params = {
      TableName:tablaDynamo,
      Item:notadeventa
    };
  
    try{     
      //Obtenemos el ultimo ID de documento
      const data= await DynamoDB.put(params).promise();
      respuesta.statusDesc = `migrada nota de venta con el folio ${notadeventa.folio}`;
      respuesta.statusCod=true;

  }catch(e){/**Error*/
     console.log(e);
      respuesta.statusCod="ERR";
      respuesta.statusDesc=e.message;
    }
    console.log(respuesta);
    return respuesta;
}

const guardarMontoDeuda = async(nuevoMonto)=>{
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbPagoNv-dev";
  
  console.log(nuevoMonto);

  let respuesta = {
    statusCod : true,
    statusDesc : ""
  }
  let params = {
    TableName:tablaDynamo,
    Item:{
      "folio":nuevoMonto.folio.toString(),
      "montoPendiente":nuevoMonto.nuevoMontoPendiente
    }
  };

  try{
    
    const data= await DynamoDB.put(params).promise();
    console.log(data);
    respuesta.statusDesc = `Se ha registrado pago para la nota de venta con el folio ${nuevoMonto.folio}`;
    respuesta.statusCod=true;
  
  }catch(e){
    
    console.log(e);
    respuesta.statusCod=false;
    respuesta.statusDesc=e.message;
  
  }

  return respuesta;
}

const guardarActualizacionListaOc = async (id) =>{
 
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbActualizaciones-dev";

  var respuesta={
      statusCod:true,
      statusDesc:""
    }

    let fecha = new Date();
   
    let dia = fecha.getDate();
    let mes = fecha.getMonth().toLocaleString();
    let year = fecha.getFullYear();

    let hora = fecha.getHours();
    let minutos = fecha.getMinutes();


    let fechaActualizacion =fecha.toISOString().split('T')[0];
    let horaTotal = `${hora}:${minutos}`;
    
    
  let params = {
      TableName:tablaDynamo,
      Item:{
        id_actualizacion:id.toString(),
        fecha:fechaActualizacion,
        hora:horaTotal
      }
    };
  
    try{     
      const data= await DynamoDB.put(params).promise();
      respuesta.statusDesc = data;
      respuesta.statusCod=true;
      console.log("====== ACTUALIZADO CON EXITO =======");
  }catch(e){/**Error*/
     console.log(e);
      respuesta.statusCod="ERR";
      respuesta.statusDesc=e.message;
    }
    return respuesta;
}

const updateDataOroSherpa = async ()=>{

  const listaAWS = await obtenerListaDocumentosSSO();
  //const listaOcOro = await obtenerTodasLasOc();
  const listaOcBuild = await obtenerDocumentosConstruidos();

  if( listaOcBuild.listaOrdenes.length > listaAWS.documentos.Items.length ){
    console.log("========= HAY NUEVOS REGISTROS =========");
    
    let idOroAWS = [];
    for(let idOro of listaAWS.documentos.Items){
      idOroAWS.push(idOro.id_oro);
    }
    let idAPersistir = [];
    console.log(idOroAWS);
    for(let i = 0; i < listaOcBuild.listaOrdenes.length ; i++){

      let id_sistema_oro = listaOcBuild.listaOrdenes[i].oc_oro.id_oc;
      if(idOroAWS.includes(id_sistema_oro)){

        logger.warn(`NO PERSISTIMOS LA OC ${listaOcBuild.listaOrdenes[i].oc_oro.id_oc}`);
      }else{
      
        if(listaOcBuild.listaOrdenes[i].nv_sherpa ==="SIN NV SHERPA ASOCIADA" || listaOcBuild.listaOrdenes[i].nv_sherpa ===  'No olvide ingresar Folio de Nota de Venta Valido<br>' ||
        listaOcBuild.listaOrdenes[i].nv_sherpa === 'Nota de Venta no registrada<br>'){
            logger.info(`EL DOCUMENTO ${listaOcBuild.listaOrdenes[i].id_documento} NO TIENE NV ASOCIADA`);
        }else{
          logger.info(listaOcBuild.listaOrdenes[i])
          logger.info(`persistimos la oc ${listaOcBuild.listaOrdenes[i].oc_oro.id_oc}`);
          let id_oc = listaOcBuild.listaOrdenes[i].oc_oro.id_oc;
          let nv_sherpa_id =  listaOcBuild.listaOrdenes[i].nv_sherpa[i].detalle[0].folio;
          let nv_sofnet = listaOcBuild.listaOrdenes[i].nv_sofnet;
          let id_documento = listaOcBuild.listaOrdenes[i].id_documento.toString();

          const perEta = await persistenciaSistemaEta(nv_sherpa_id,id_documento,id_oc,0);
          if(perEta.statusCod){
            logger.info(`INFO DOCUMENTO ${listaOcBuild.listaOrdenes[i].oc_oro.id_oc} ACTUALIZADO`)
          }
        }
      }
    }

    logger.info("FIN DE LA ACTUALIZACIÓN");
    return;

  }else{
    logger.warn('NO SE ENCONTRARON NUEVOS REGISTROS');
    return;
  }

}

const deleteNVSherpa = async(id_documento, nv_sherpa)=>{

  var respuesta={
    statusCod:true,
    statusDesc:""
  }

  try {
    const getDocumente = await obtenerDetalleDocumento(id_documento);
    let listNSSh = getDocumente.documentos.nv_sherpa.length;
    
    let newListNSSH = [];
    let findDocuments= 0;
    for(let i=0; i < listNSSh; i++) {

      let nv_sherpa_aws = getDocumente.documentos.nv_sherpa[i].detalle[0].folio;
        if(nv_sherpa === nv_sherpa){
          findDocuments++
        }
      if(nv_sherpa_aws !== nv_sherpa){
         
          logger.info(`OC A ELIMINAR ${nv_sherpa_aws}`);
          newListNSSH.push(getDocumente.documentos.nv_sherpa[i]);
        }
    }

    if(findDocuments > 0){
      if(newListNSSH.length === 0){
        getDocumente.documentos.nv_sherpa = "SIN NV SHERPA ASOCIADA";
      }else{
        getDocumente.documentos.nv_sherpa = newListNSSH;
      }
  
      const update = await updateDetalleDocumento(getDocumente);
      
    }
    
    respuesta.statusCod = true;
    respuesta.statusDesc = "nv sherpa eliminada con exito";
    respuesta.document = getDocumente;
  } catch (error) {
    throw new Error("Ha ocurrido un error obteniendo el documento")
  }

  return respuesta;
}

const deleteNVSoftnet = async(id_documento, nv_softnet) => {

  var respuesta={
    statusCod:true,
    statusDesc:""
  }

  try {
    const getDocumente = await obtenerDetalleDocumento(id_documento);
    let listNSS = getDocumente.documentos.nv_softnet.length;
    
    let newListNSS = [];
    let findDocuments= 0;
    for(let i=0; i < listNSS; i++) {

      let nv_softnet_aws = getDocumente.documentos.nv_softnet[i].idDoc.folio;
        if(nv_softnet_aws === nv_softnet){
          findDocuments++
        }
      if(nv_softnet_aws !== nv_softnet){
         
          logger.info(`OC A ELIMINAR ${nv_softnet}`);
          newListNSS.push(getDocumente.documentos.nv_softnet[i]);
        }
    }

    if(findDocuments > 0){
      if(newListNSS.length === 0){
        getDocumente.documentos.nv_softnet = "SIN NV ASOCIADA";
      }else{
        getDocumente.documentos.nv_softnet = newListNSS;
      }
  
      const update = await updateDetalleDocumento(getDocumente);
      
    }
    
    respuesta.statusCod = true;
    respuesta.statusDesc = "nv softnet eliminada con exito";
    respuesta.document = getDocumente;
  } catch (error) {
    throw new Error("Ha ocurrido un error obteniendo el documento")
  }

  return respuesta;
}


const updateDetalleDocumento = async(new_document)=>{
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbDetalleDocumento-dev";

  var respuesta={
    statusCod:true,
    statusDesc:""
  }


  try{
    let params = {
      TableName:tablaDynamo,
      Item:new_document.documentos
    }

    const data= await DynamoDB.put(params).promise();
    respuesta.statusCod = true;
    respuesta.statusDesc = "Registro almacenado con exito";
    logger.info("REGISTRO ALMACENADO CON EXITO!!!");
  }catch(e){  
    console.log("Error", e)
    logger.error("HA ODUCRRIDO UN ERROR ACTUALIZANDO EL DOCUMENTO");
    respuesta.statusCod = false;
  }

  return respuesta;
}
module.exports = {
  migrateOroCommerce,
  crearDocumento,
  setOcOro,
  asociarNv,
  actualizarDocumento,
  nuevasOc,
  obtenerUltimoNumeroTabla,
  guardarPago,
  migrarNV,
  guardarMontoDeuda,
  guardarOcConstruida,
  migrarOcBuild,
  guardarActualizacionListaOc,
  updateDataOroSherpa,
  deleteNVSherpa,
  deleteNVSoftnet
  
}
