const AWS = require("aws-sdk");
const { Console } = require("winston/lib/winston/transports");
const { exportUsersToExcel } = require("./exportExcel");
const logger = require("./logger");

/**
 * Obtener Detalle de documento
 * @param {} id
 */
const obtenerDetalleDocumento = async (id) => {
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbDetalleDocumento-dev";

  var respuesta = {
    statusCod: true,
    statusDesc: "",
  };
  let params = {
    TableName: tablaDynamo,
    Key: {
      id_documento: parseInt(id),
    },
  };

  try {
    const data = await DynamoDB.get(params).promise();

    //Extraemos ultimo id
    if (data) {
      respuesta.statusCod = true;
      respuesta.statusDesc = "";
      respuesta.documentos = data.Item;
    } else {
      respuesta.statusCod = false;
      respuesta.statusDesc = `No se encontraron registros para el documento número ${id}`;
    }
  } catch (e) {
    /**Error*/

    respuesta.statusCod = "ERR";
    respuesta.statusDesc = e.message;
  }

  return respuesta;
};
/**
 * Obtener id Documento
 * @param {} oc_oro
 */
const obtenerIdDocumento = async (oc_oro) => {
  console.log("El id a buscar es :" + oc_oro);
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbDocumentoOc-dev";

  var respuesta = {
    statusCod: true,
    statusDesc: "",
  };

  let params = {
    TableName: tablaDynamo,
  };

  try {
    const data = await DynamoDB.scan(params).promise();
    console.log(data);
    if (data) {
      const idDocumento = data.Items.filter(
        (iddc) => iddc.oc_oro === oc_oro.toString()
      );

      respuesta.statusCod = true;
      respuesta.statusDesc = "";
      respuesta.idDoc = idDocumento[0].oc_oro;
    } else {
      respuesta.statusCod = false;
      respuesta.statusDesc = `No se encontraron registros para el documento número ${oc_oro}`;
    }
  } catch (e) {
    /**Error*/

    respuesta.statusCod = "ERR";
    respuesta.statusDesc = `Error al intentar obtener documento ${e.message}`;
  }
  console.log(respuesta);
  return respuesta;
};

const obtenerListaDocumentos = async () => {
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbDocumentoOc-dev";

  var respuesta = {
    statusCod: true,
    statusDesc: "",
  };

  let params = {
    TableName: tablaDynamo,
  };

  try {
    const data = await DynamoDB.scan(params).promise();

    if (data) {
      respuesta.statusCod = true;
      respuesta.statusDesc = "";
      respuesta.documentos = data;
    } else {
      respuesta.statusCod = false;
      respuesta.statusDesc = `No se encontraron registros`;
    }
  } catch (e) {
    /**Error*/

    respuesta.statusCod = "ERR";
    respuesta.statusDesc = e.message;
  }

  return respuesta;
};

const obtenerListaDocumentosSSO = async () => {
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbDocumentosOSS-dev";

  var respuesta = {
    statusCod: true,
    statusDesc: "",
  };

  let params = {
    TableName: tablaDynamo,
  };

  try {
    const data = await DynamoDB.scan(params).promise();

    if (data) {
      respuesta.statusCod = true;
      respuesta.statusDesc = "";
      respuesta.documentos = data;
    } else {
      respuesta.statusCod = false;
      respuesta.statusDesc = `No se encontraron registros`;
    }
  } catch (e) {
    /**Error*/

    respuesta.statusCod = "ERR";
    respuesta.statusDesc = e.message;
  }

  return respuesta;
};
/**
 *
 * @param {*} folio
 * @returns
 */
const obtenetRegistroPago = async (folio) => {
  let respuesta = {
    statusCod: true,
    statusDesc: "",
  };

  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbRegistrosPagos";

  let params = {
    TableName: tablaDynamo,
    Key: {
      folio: folio,
    },
  };

  try {
    const data = await DynamoDB.get(params).promise();
    let lengthOfObject = Object.keys(data).length;
    if (lengthOfObject == 0) {
      respuesta.statusCod = false;
      respuesta.statusDesc = `no hay registros de pagos para nv ${folio}`;
    } else {
      respuesta.statusCod = true;
      respuesta.statusDesc = `registro de pagos para nv ${folio}`;
      respuesta.registro = data.Item.registro;
    }
  } catch (error) {
    console.log(error);
    respuesta.statusCod = false;
    respuesta.statusDesc = `Ha ocurrido un error al obtener la nota de venta ${folio}`;
  }
  // console.log(respuesta);
  return respuesta;
};

const obtenerListaNotaVentas = async () => {
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbListaNotasVentas-dev";

  let respuesta = {
    statusCod: true,
    statusDesc: "",
  };
  let params = {
    TableName: tablaDynamo,
  };
  try {
    const data = await DynamoDB.scan(params).promise();
    let lengthOfObject = Object.keys(data).length;

    if (lengthOfObject > 0) {
      respuesta.statusCod = true;
      (respuesta.statusDesc = "Lista de nota de ventas"),
        (respuesta.nota_de_ventas = data.Items);
    } else {
      respuesta.statusCod = false;
      respuesta.statusDesc = "No se encontraron registros";
    }
  } catch (error) {
    console.error(error);
    respuesta.statusCod = "ERR";
    respuesta.statusDesc = e.message;
  }
  return respuesta;
};

const obtenerMontoPendiente = async (folio) => {
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbPagoNv-dev";

  let respuesta = {
    statusCod: true,
    statusDesc: "",
  };

  let params = {
    TableName: tablaDynamo,
    Key: {
      folio: folio.toString(),
    },
  };

  try {
    const data = await DynamoDB.get(params).promise();
    console.log(data);
    let lengthOfObject = Object.keys(data).length;
    console.log(lengthOfObject);

    if (lengthOfObject == 0) {
      respuesta.statusCod = false;
      respuesta.statusDesc = `No se encontro un registro con el folio ${folio}`;
    } else {
      respuesta.statusCod = true;
      respuesta.statusDesc = `Registro encontrado`;
      respuesta.montoDeuda = data.Item;
    }
  } catch (error) {
    console.log(error);
    respuesta.statusCod = false;
    respuesta.statusDesc = "Ha ocurrido un error al obtener el pago";
  }

  return respuesta;
};

/**
 * Obtener id Documento
 */
const obtenerTodasLasOcBuilding = async () => {
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  //    const tablaDynamo = `tbOcBuild-${process.env.ENVIRONMENT}`;
  //    console.log(process.env.ENVIRONMENT);
  const tablaDynamo = "tbOcBuild-prod";
  var respuesta = {
    statusCod: true,
    statusDesc: "",
  };

  let params = {
    TableName: tablaDynamo,
  };

  try {
    const data = await DynamoDB.scan(params).promise();
    console.log(data);
    respuesta.listaOrdenes = data.Items;
  } catch (e) {
    /**Error*/

    respuesta.statusCod = "ERR";
    respuesta.statusDesc = `Error al intentar obtener documento ${e.message}`;
  }

  return respuesta;
};

/**
 * Obtener id Documento
 */
const obtenerTodasLasOcBuildingCliente = async (cliente) => {
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  //    const tablaDynamo = `tbOcBuild-${process.env.ENVIRONMENT}`;
  //    console.log(process.env.ENVIRONMENT);
  const tablaDynamo = "tbOcBuild-dev";
  var respuesta = {
    statusCod: true,
    statusDesc: "",
  };

  let params = {
    TableName: tablaDynamo,
    Key: {
      id_oc: "137",
    },
  };

  console.log(params);

  try {
    const data = await DynamoDB.get(params).promise();
    console.log(data);
    respuesta.listaOrdenes = data.Items;
  } catch (e) {
    /**Error*/
    console.log(e);
    respuesta.statusCod = "ERR";
    respuesta.statusDesc = `Error al intentar obtener documento ${e.message}`;
  }

  //console.log(respuesta);
  return respuesta;
};

const generarExcel = async (filePath) => {
  let respuesta = {
    statusCod: true,
    statusDesc: "",
  };

  try {
    const listaOC = await obtenerTodasLasOcBuilding();
    //console.log(listaOC);
    if (listaOC.statusCod) {
      exportUsersToExcel(listaOC.listaOrdenes, filePath);
    }
  } catch (error) {
    console.log(error);
  }

  return respuesta;
};

/**
 * Obtener id Documento
 */
const obtenerFechaActualizacion = async () => {
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbActualizaciones-dev";
  var respuesta = {
    statusCod: true,
    statusDesc: "",
  };

  let params = {
    TableName: tablaDynamo,
    Key: {
      id_actualizacion: "1",
    },
  };

  try {
    const data = await DynamoDB.get(params).promise();
    respuesta.fecha = data.Item;
  } catch (e) {
    /**Error*/
    console.log(e);
    respuesta.statusCod = "ERR";
    respuesta.statusDesc = `Error al intentar obtener documento ${e.message}`;
  }

  //console.log(respuesta);
  return respuesta;
};

/**
 *
 * @param {*} folio
 * @returns
 */
const obtenerDocumentoBynvSherpa = async (nv_sherpa) => {
  let respuesta = {
    statusCod: true,
    statusDesc: "",
  };

  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbDocumentosOSS-dev";

  let params = {
    TableName: tablaDynamo,
    KeyConditionExpression: "nv_sherpa = :nvs",
    ExpressionAttributeValues: {
      ":nvs": nv_sherpa.toString(),
    },
  };

  try {
    const data = await DynamoDB.query(params).promise();
    console.log(data);
    if (data.Items.length !== 0) {
      respuesta.statusCod = true;
      respuesta.statusDesc = `Resultados para la nota de venta ${nv_sherpa}`;
      respuesta.datos = data.Items;
    } else {
      respuesta.statusCod = false;
      respuesta.statusDesc = `La nota de venta sherpa ${nv_sherpa} no posee documentos asociados`;
    }
  } catch (error) {
    console.log(error);
    respuesta.statusCod = false;
    respuesta.statusDesc = `Ha ocurrido un error al obtener la nota de venta ${nv_sherpa}`;
  }
  // console.log(respuesta);
  return respuesta;
};

const obtenerDocumentosConstruidos = async () => {
  let respuesta = {
    statusCod: true,
    statusDesc: "",
  };

  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbDetalleDocumento-dev";

  let params = {
    TableName: tablaDynamo,
  };

  try {
    const data = await DynamoDB.scan(params).promise();
    // console.log(data)
    respuesta.listaOrdenes = data.Items;
  } catch (e) {
    /**Error*/

    respuesta.statusCod = "ERR";
    respuesta.statusDesc = `Error al intentar obtener documento ${e.message}`;
  }

  return respuesta;
};

const getETAInHistory = async (id_nv_sherpa) => {
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbHistoryETANVSH-dev";

  let respuesta = {
    statusCod: false,
    statusDesc: "",
  };

  let params = {
    TableName: tablaDynamo,
    Key: {
      nv_sherpa: id_nv_sherpa,
    },
  };

  try {
    const data = await DynamoDB.get(params).promise();

    if (data.Item !== undefined) {
      respuesta.statusCod = true;
      respuesta.statusDesc = "Se obtuvo un registro";
      respuesta.nv = data.Item;
    } else {
      respuesta.statusCod = false;
      respuesta.statusDesc = "No se encontraron registros";
    }
  } catch (error) {
    logger.info(
      `HA OCURRIDO UN ERROR OBTIENENDO EL HISTORIAL ETA PARA LA NV SHERPA`
    );
    respuesta.statusCod = false;
    respuesta.statusDesc = "Ha ocurrido un error al obtener registro";
  }

  return respuesta;
};

const deleteETAInHistory = async(id_nv_sherpa)=>{
    let DynamoDB = new AWS.DynamoDB.DocumentClient();
    const tablaDynamo = "tbHistoryETANVSH-dev";
  
    let respuesta = {
      statusCod: false,
      statusDesc: "",
    };
  
    let params = {
      TableName: tablaDynamo,
      Key: {
        nv_sherpa: id_nv_sherpa,
      },
    };
  
    try {
      const data = await DynamoDB.delete(params).promise();
        respuesta.statusCod = true;
        respuesta.statusDesc = "registro eliminado con exito"
    } catch (error) {
      logger.info(
        `HA OCURRIDO UN ERROR ELIMINANDO LA NOTA DE VENTA SHEPRA DEL HISTORY`
      );
      respuesta.statusCod = false;
      respuesta.statusDesc = "Ha ocurrido un error eliminando la nota de venta sherpa";
    }
  
    return respuesta;
}
module.exports = {
  obtenerDetalleDocumento,
  obtenerIdDocumento,
  obtenerListaDocumentos,
  obtenetRegistroPago,
  obtenerListaNotaVentas,
  obtenerMontoPendiente,
  obtenerTodasLasOcBuilding,
  generarExcel,
  obtenerTodasLasOcBuildingCliente,
  obtenerFechaActualizacion,
  obtenerDocumentoBynvSherpa,
  obtenerListaDocumentosSSO,
  obtenerDocumentosConstruidos,
  getETAInHistory,
  deleteETAInHistory
};
