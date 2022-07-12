const { autenticarOro, obtenerDetalleOc } = require("./downloadInfo");
const { obtenerDocumentoBynvSherpa } = require("./getInfoAws");

const AWS = require("aws-sdk");
const logger = require("./logger");

const axios = require("axios").default;

const saveProductOro = async (datos) => {
  let respuesta = {
    statusCod: true,
    statusDesc: "",
  };
  const token = await autenticarOro();

  if (token.access_token) {
    //PREPARAMOS EL OBJETO

    let newProduct = {
      data: {
        type: "products",
        attributes: {
          sku: `${datos.sku}`,
          status: "disabled",
          variantFields: [],
          productType: "simple",
          featured: false,
          newArrival: false,
          availability_date: "2022-01-01",
        },
        relationships: {
          owner: {
            data: {
              type: "businessunits",
              id: "1",
            },
          },
          organization: {
            data: {
              type: "organizations",
              id: "1",
            },
          },
          names: {
            data: [
              {
                type: "localizedfallbackvalues",
                id: "names-1",
              },
              {
                type: "localizedfallbackvalues",
                id: "names-2",
              },
            ],
          },
          slugPrototypes: {
            data: [
              {
                type: "localizedfallbackvalues",
                id: "slug-id-1",
              },
            ],
          },
          taxCode: {
            data: {
              type: "producttaxcodes",
              id: "3",
            },
          },
          attributeFamily: {
            data: {
              type: "attributefamilies",
              id: "1",
            },
          },
          primaryUnitPrecision: {
            data: {
              type: "productunitprecisions",
              id: "product-unit-precision-id-3",
            },
          },
          unitPrecisions: {
            data: [
              {
                type: "productunitprecisions",
                id: "product-unit-precision-id-1",
              },
            ],
          },
          inventory_status: {
            data: {
              type: "prodinventorystatuses",
              id: "out_of_stock",
            },
          },
          pageTemplate: {
            data: {
              type: "entityfieldfallbackvalues",
              id: "1xyz",
            },
          },
          manageInventory: {
            data: {
              type: "entityfieldfallbackvalues",
              id: "1abcd",
            },
          },
          inventoryThreshold: {
            data: {
              type: "entityfieldfallbackvalues",
              id: "2abcd",
            },
          },
          highlightLowInventory: {
            data: {
              type: "entityfieldfallbackvalues",
              id: "low1abcd",
            },
          },
          lowInventoryThreshold: {
            data: {
              type: "entityfieldfallbackvalues",
              id: "low2abcd",
            },
          },
          isUpcoming: {
            data: {
              type: "entityfieldfallbackvalues",
              id: "product-is-upcoming",
            },
          },
          minimumQuantityToOrder: {
            data: {
              type: "entityfieldfallbackvalues",
              id: "3abcd",
            },
          },
          maximumQuantityToOrder: {
            data: {
              type: "entityfieldfallbackvalues",
              id: "4abcd",
            },
          },
          decrementQuantity: {
            data: {
              type: "entityfieldfallbackvalues",
              id: "5abcd",
            },
          },
          backOrder: {
            data: {
              type: "entityfieldfallbackvalues",
              id: "6abcd",
            },
          },
          category: {
            data: {
              type: "categories",
              id: `${datos.category}`,
            },
          },
        },
      },
      included: [
        {
          type: "entityfieldfallbackvalues",
          id: "1xyz",
          attributes: {
            fallback: null,
            scalarValue: "short",
            arrayValue: null,
          },
        },
        {
          type: "entityfieldfallbackvalues",
          id: "1abcd",
          attributes: {
            fallback: "systemConfig",
            scalarValue: null,
            arrayValue: null,
          },
        },
        {
          type: "entityfieldfallbackvalues",
          id: "2abcd",
          attributes: {
            fallback: null,
            scalarValue: "31",
            arrayValue: null,
          },
        },
        {
          type: "entityfieldfallbackvalues",
          id: "low1abcd",
          attributes: {
            fallback: "systemConfig",
            scalarValue: null,
            arrayValue: null,
          },
        },
        {
          type: "entityfieldfallbackvalues",
          id: "low2abcd",
          attributes: {
            fallback: null,
            scalarValue: "41",
            arrayValue: null,
          },
        },
        {
          type: "entityfieldfallbackvalues",
          id: "product-is-upcoming",
          attributes: {
            fallback: null,
            scalarValue: "1",
            arrayValue: null,
          },
        },
        {
          type: "entityfieldfallbackvalues",
          id: "3abcd",
          attributes: {
            fallback: "systemConfig",
            scalarValue: null,
            arrayValue: null,
          },
        },
        {
          type: "entityfieldfallbackvalues",
          id: "4abcd",
          attributes: {
            fallback: null,
            scalarValue: "12",
            arrayValue: null,
          },
        },
        {
          type: "entityfieldfallbackvalues",
          id: "5abcd",
          attributes: {
            fallback: null,
            scalarValue: "1",
            arrayValue: null,
          },
        },
        {
          type: "entityfieldfallbackvalues",
          id: "6abcd",
          attributes: {
            fallback: null,
            scalarValue: "0",
            arrayValue: null,
          },
        },
        {
          type: "localizedfallbackvalues",
          id: "names-1",
          attributes: {
            fallback: null,
            string: `${datos.name}`,
            text: null,
          },
          relationships: {
            localization: {
              data: null,
            },
          },
        },
        {
          type: "localizedfallbackvalues",
          id: "names-2",
          attributes: {
            fallback: null,
            string: "Product in spanish",
            text: null,
          },
          relationships: {
            localization: {
              data: {
                type: "localizations",
                id: "1",
              },
            },
          },
        },
        {
          type: "localizedfallbackvalues",
          id: "slug-id-1",
          attributes: {
            fallback: null,
            string: "test-prod-slug",
            text: null,
          },
          relationships: {
            localization: {
              data: null,
            },
          },
        },
        {
          type: "productunitprecisions",
          id: "product-unit-precision-id-1",
          attributes: {
            precision: "0",
            conversionRate: "5",
            sell: "1",
          },
          relationships: {
            unit: {
              data: {
                type: "productunits",
                id: "each",
              },
            },
          },
        },
        {
          type: "productunitprecisions",
          id: "product-unit-precision-id-3",
          attributes: {
            precision: "0",
            conversionRate: "2",
            sell: "1",
          },
          relationships: {
            unit: {
              data: {
                type: "productunits",
                id: "set",
              },
            },
          },
        },
      ],
    };
    console.log(`${process.env.ORO_SITE_PATH_ADMIN}/api/products`);
    //Guardamos
    await axios({
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/vnd.api+json",
      },
      url: `${process.env.ORO_SITE_PATH_ADMIN}/api/products`,
      data: newProduct,
    })
      .then((resp) => {
        console.log(resp.data);
        respuesta.statusCod = true;
        respuesta.message = "Producto creado con exito";
        respuesta.producto = resp.data;
      })
      .catch((err) => {
        console.log(err.response.data.errors[0].detail);
        respuesta.statusCod = false;
        respuesta.statusDesc = err.response.data.errors[0].detail;
      });
  } else {
    throw new Error("ERROR AL OBTENER EL TOKEN");
  }
  return respuesta;
};
/**
 *
 * @param {*} datos
 * @returns
 */
const reqUpdateEta = async (id_oc, nv_sherpa, datos) => {
  let respuesta = {
    statusCod: true,
    statusDesc: "",
  };

  const token = await autenticarOro();

  if (token.access_token) {
    //PREPARAMOS EL OBJETO

    let updateProduct = {
      datos,
    };
    console.log(updateProduct);
    console.log(
      `${process.env.ORO_SITE_PATH_ADMIN}/3m0nk_admin/api/orders/${id_oc}`
    );
    //Guardamos
    await axios({
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/vnd.api+json",
      },
      url: `${process.env.ORO_SITE_PATH_ADMIN}/api/orders/${id_oc}`,
      data: datos,
    })
      .then((resp) => {
        console.log(resp.data);
        respuesta.statusCod = true;
        respuesta.message = "El ETA HA SIDO ACTUALIZADO CON EXITO";
        respuesta.producto = resp.data;
      })
      .catch((err) => {
        console.log(console.log(err.toJSON()));
        respuesta.statusCod = false;
        respuesta.statusDesc = "Ha ocurrido un error";
      });
  } else {
    throw new Error("ERROR AL OBTENER EL TOKEN");
  }
  return respuesta;
};

const saveEtaHistory = async (nv_sherpa, status, fecha_eta) => {
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbHistoryETANVSH-dev";

  var respuesta = {
    statusCod: true,
    statusDesc: "",
  };

  let params = {
    TableName: tablaDynamo,
    Item: {
      nv_sherpa:nv_sherpa.toString(),
      status,
      fecha_eta,
    },
  };
  try {
    const data = await DynamoDB.put(params).promise();
    respuesta.statusDesc = data;
    respuesta.statusCod = true;
    logger.info(`LA NV SHERPA ${nv_sherpa} ENTRA EN COLA DE ESPERA.`);
  } catch (e) {
    /**Error*/
    console.log(e);
    respuesta.statusCod = "ERR";
    respuesta.statusDesc = e.message;
    logger.error(`HA OCURRIDO UN ERROR AL GUARDAR LA NV SHERPA ${nv_sherpa}`);
  }
  return respuesta;
};

const updateEta = async (nv_sherpa, fecha) => {
  let respuesta = {
    statusDesc: "",
  };
  logger.info("LLAMANDO UPDATE ETA");
  const document = await obtenerDocumentoBynvSherpa(nv_sherpa);

  if (!document.statusCod) {
    const history_eta = await saveEtaHistory(nv_sherpa, "pending", fecha);

    if (history_eta.statusCod) {
      respuesta.statusCod = true;
      respuesta.statusDesc = `La nv sherpa entro en cola`;
      respuesta.statusInfo = `La nota de venta sherpa ${nv_sherpa} no tiene una orden oro asociada`;
    }else{
      logger.error("HA OCURRIDO UN ERROR AL GUARDAR EN LA TABLA DE HISTORY-ETA");
      respuesta.statusCod = false;
      respuesta.statusDesc = "Ha ocurrido un error al guardar en la table de cola la nv";
    }
  } else {
    if (document.statusCod) {
      for (let i = 0; i < document.datos.length; i++) {
        let cuerpoUpdateEta = {
          data: {
            type: "orders",
            id: `${document.datos[i].id_oro}`,
            attributes: {
              eta_date: "",
              eta_updated: "",
            },
          },
        };

        try {
          // PROCESAR ORDEN
          //respuesta.orden = orden.data;
          cuerpoUpdateEta.data.attributes.eta_date = fecha;
          //generar fecha
          var today = new Date();
          var dd = String(today.getDate()).padStart(2, "0");
          var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
          var hora = String(today.getHours()).padStart(2, "0");
          var minutos = String(today.getMinutes()).padStart(2, "0");
          var segundos = String(today.getSeconds()).padStart(2, "0");
          var yyyy = today.getFullYear();

          cuerpoUpdateEta.data.attributes.eta_updated = `${yyyy}-${mm}-${dd}T${hora}:${minutos}:${segundos}Z`;

          const updatePersistOro = await reqUpdateEta(
            document.datos[i].id_oro,
            nv_sherpa,
            cuerpoUpdateEta
          );

          if (updatePersistOro.statusCod) {
            respuesta.statusCod = true;
            respuesta.statusDesc = `El ETA de la orden ha sido actualizado con exito`;
            respuesta.statusInfo = `Se ha actualizado ETA con la nv sherpa  ${nv_sherpa}`;
          } else {
            respuesta.statusDesc = `Ha ocurrido un error al actualizar ETA`;
          }
        } catch (error) {
          logger.error(error);
          respuesta.statusDesc = "HA OCURRIDO UN ERROR ACTUALIZANDO EL ETA";
        }
      }
    } else {
      respuesta.statusCod = false;
      respuesta.statusDesc = `No se encontraron documentos asociados a la nota de venta sherpa ${nv_sherpa}`;
    }
  }

  return respuesta;
};

const persistenciaSistemaEta = async (
  id_nv_sherpa,
  id_documento,
  id_oro,
  nv_softnet
) => {
  let DynamoDB = new AWS.DynamoDB.DocumentClient();
  const tablaDynamo = "tbDocumentosOSS-dev";
  var respuesta = {
    statusCod: true,
    statusDesc: "",
  };

  let params = {
    TableName: tablaDynamo,
    Item: {
      nv_sherpa: id_nv_sherpa,
      id_oro: id_oro,
      id_documento,
      nv_softnet,
    },
  };
  try {
    const data = await DynamoDB.put(params).promise();
    respuesta.statusDesc = data;
    respuesta.statusCod = true;
    console.log("====== OC MIGRADA CON EXITO =======");
  } catch (e) {
    /**Error*/
    console.log(e);
    respuesta.statusCod = "ERR";
    respuesta.statusDesc = e.message;
    logger.error(
      `HA OCURRIDO UN ERROR AL GUARDAR EL DOCUMENTO ${id_documento}`
    );
  }
  return respuesta;
};

module.exports = {
  saveProductOro,
  updateEta,
  persistenciaSistemaEta,
};
