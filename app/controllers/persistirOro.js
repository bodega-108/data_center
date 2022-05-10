const { autenticarOro, obtenerDetalleOc } = require('./downloadInfo');

const axios = require('axios').default;

const saveProductOro = async(datos)=>{
    
    let respuesta = {   
        statusCod: true,
        statusDesc: "" 
    }
    const token = await autenticarOro();

    if(token.access_token){
        //PREPARAMOS EL OBJETO
        
        let newProduct = {
            "data": {
              "type": "products",
              "attributes": {
                "sku": `${datos.sku}`,
                "status": "disabled",
                "variantFields": [],
                "productType": "simple",
                "featured": false,
                "newArrival": false,
                "availability_date": "2022-01-01"
              },
              "relationships": {
                "owner": {
                  "data": {
                    "type": "businessunits",
                    "id": "1"
                  }
                },
                "organization": {
                  "data": {
                    "type": "organizations",
                    "id": "1"
                  }
                },
                "names": {
                  "data": [
                    {
                      "type": "localizedfallbackvalues",
                      "id": "names-1"
                    },
                    {
                      "type": "localizedfallbackvalues",
                      "id": "names-2"
                    }
                  ]
                },
                "slugPrototypes": {
                  "data": [
                    {
                      "type": "localizedfallbackvalues",
                      "id": "slug-id-1"
                    }
                  ]
                },
                "taxCode": {
                  "data": {
                    "type": "producttaxcodes",
                    "id": "3"
                  }
                },
                "attributeFamily": {
                  "data": {
                    "type": "attributefamilies",
                    "id": "1"
                  }
                },
                "primaryUnitPrecision": {
                  "data": {
                    "type": "productunitprecisions",
                    "id": "product-unit-precision-id-3"
                  }
                },
                "unitPrecisions": {
                  "data": [
                    {
                      "type": "productunitprecisions",
                      "id": "product-unit-precision-id-1"
                    }
                  ]
                },
                "inventory_status": {
                  "data": {
                    "type": "prodinventorystatuses",
                    "id": "out_of_stock"
                  }
                },
                "pageTemplate": {
                  "data": {
                    "type": "entityfieldfallbackvalues",
                    "id": "1xyz"
                  }
                },
                "manageInventory": {
                  "data": {
                    "type": "entityfieldfallbackvalues",
                    "id": "1abcd"
                  }
                },
                "inventoryThreshold": {
                  "data": {
                    "type": "entityfieldfallbackvalues",
                    "id": "2abcd"
                  }
                },
                "highlightLowInventory": {
                  "data": {
                    "type": "entityfieldfallbackvalues",
                    "id": "low1abcd"
                  }
                },
                "lowInventoryThreshold": {
                  "data": {
                    "type": "entityfieldfallbackvalues",
                    "id": "low2abcd"
                  }
                },
                "isUpcoming": {
                  "data": {
                    "type": "entityfieldfallbackvalues",
                    "id": "product-is-upcoming"
                  }
                },
                "minimumQuantityToOrder": {
                  "data": {
                    "type": "entityfieldfallbackvalues",
                    "id": "3abcd"
                  }
                },
                "maximumQuantityToOrder": {
                  "data": {
                    "type": "entityfieldfallbackvalues",
                    "id": "4abcd"
                  }
                },
                "decrementQuantity": {
                  "data": {
                    "type": "entityfieldfallbackvalues",
                    "id": "5abcd"
                  }
                },
                "backOrder": {
                  "data": {
                    "type": "entityfieldfallbackvalues",
                    "id": "6abcd"
                  }
                },
                "category": {
                  "data": {
                    "type": "categories",
                    "id": `${datos.category}`
                  }
                }
              }
            },
            "included": [
              {
                "type": "entityfieldfallbackvalues",
                "id": "1xyz",
                "attributes": {
                  "fallback": null,
                  "scalarValue": "short",
                  "arrayValue": null
                }
              },
              {
                "type": "entityfieldfallbackvalues",
                "id": "1abcd",
                "attributes": {
                  "fallback": "systemConfig",
                  "scalarValue": null,
                  "arrayValue": null
                }
              },
              {
                "type": "entityfieldfallbackvalues",
                "id": "2abcd",
                "attributes": {
                  "fallback": null,
                  "scalarValue": "31",
                  "arrayValue": null
                }
              },
              {
                "type": "entityfieldfallbackvalues",
                "id": "low1abcd",
                "attributes": {
                  "fallback": "systemConfig",
                  "scalarValue": null,
                  "arrayValue": null
                }
              },
              {
                "type": "entityfieldfallbackvalues",
                "id": "low2abcd",
                "attributes": {
                  "fallback": null,
                  "scalarValue": "41",
                  "arrayValue": null
                }
              },
              {
                "type": "entityfieldfallbackvalues",
                "id": "product-is-upcoming",
                "attributes": {
                  "fallback": null,
                  "scalarValue": "1",
                  "arrayValue": null
                }
              },
              {
                "type": "entityfieldfallbackvalues",
                "id": "3abcd",
                "attributes": {
                  "fallback": "systemConfig",
                  "scalarValue": null,
                  "arrayValue": null
                }
              },
              {
                "type": "entityfieldfallbackvalues",
                "id": "4abcd",
                "attributes": {
                  "fallback": null,
                  "scalarValue": "12",
                  "arrayValue": null
                }
              },
              {
                "type": "entityfieldfallbackvalues",
                "id": "5abcd",
                "attributes": {
                  "fallback": null,
                  "scalarValue": "1",
                  "arrayValue": null
                }
              },
              {
                "type": "entityfieldfallbackvalues",
                "id": "6abcd",
                "attributes": {
                  "fallback": null,
                  "scalarValue": "0",
                  "arrayValue": null
                }
              },
              {
                "type": "localizedfallbackvalues",
                "id": "names-1",
                "attributes": {
                  "fallback": null,
                  "string": `${datos.name}`,
                  "text": null
                },
                "relationships": {
                  "localization": {
                    "data": null
                  }
                }
              },
              {
                "type": "localizedfallbackvalues",
                "id": "names-2",
                "attributes": {
                  "fallback": null,
                  "string": "Product in spanish",
                  "text": null
                },
                "relationships": {
                  "localization": {
                    "data": {
                      "type": "localizations",
                      "id": "1"
                    }
                  }
                }
              },
              {
                "type": "localizedfallbackvalues",
                "id": "slug-id-1",
                "attributes": {
                  "fallback": null,
                  "string": "test-prod-slug",
                  "text": null
                },
                "relationships": {
                  "localization": {
                    "data": null
                  }
                }
              },
              {
                "type": "productunitprecisions",
                "id": "product-unit-precision-id-1",
                "attributes": {
                  "precision": "0",
                  "conversionRate": "5",
                  "sell": "1"
                },
                "relationships": {
                  "unit": {
                    "data": {
                      "type": "productunits",
                      "id": "each"
                    }
                  }
                }
              },
              {
                "type": "productunitprecisions",
                "id": "product-unit-precision-id-3",
                "attributes": {
                  "precision": "0",
                  "conversionRate": "2",
                  "sell": "1"
                },
                "relationships": {
                  "unit": {
                    "data": {
                      "type": "productunits",
                      "id": "set"
                    }
                  }
                }
              }
            ]
          }
          console.log( `${process.env.ORO_SITE_PATH_ADMIN}/api/products`)
            //Guardamos
          await axios({
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/vnd.api+json'},
              url:`${process.env.ORO_SITE_PATH_ADMIN}/api/products`,
              data:newProduct
          }).then(resp =>{
              console.log(resp.data);
              respuesta.statusCod = true;
              respuesta.message = "Producto creado con exito";
              respuesta.producto = resp.data;
          }).catch(err => {
              console.log(err);
              respuesta.statusCod =false;
              respuesta.statusDesc = "Ha ocurrido un error";
              
            });

    }else{
        throw new Error('ERROR AL OBTENER EL TOKEN');
    }
    return respuesta;
}
/**
 * 
 * @param {*} datos 
 * @returns 
 */
const reqUpdateEta = async(id_oc,datos)=>{
    
  let respuesta = {   
      statusCod: true,
      statusDesc: "" 
  }
  const token = await autenticarOro();

  if(token.access_token){
      //PREPARAMOS EL OBJETO
      
      let updateProduct = {
        datos
      };
      console.log(updateProduct);
        console.log( `${process.env.ORO_SITE_PATH_ADMIN}/3m0nk_admin/api/orders/${id_oc}`)
          //Guardamos
        await axios({
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token.access_token}`,
          'Content-Type': 'application/vnd.api+json'},
            url: `${process.env.ORO_SITE_PATH_ADMIN}/3m0nk_admin/api/orders/${id_oc}`,
            data: datos 
        }).then(resp =>{
            console.log(resp.data);
            respuesta.statusCod = true;
            respuesta.message = "Producto creado con exito";
            respuesta.producto = resp.data;
        }).catch(err => {
            console.log(err);
            respuesta.statusCod =false;
            respuesta.statusDesc = "Ha ocurrido un error";
            
          });

  }else{
      throw new Error('ERROR AL OBTENER EL TOKEN');
  }
  return respuesta;
}
const updateEta = async(id_oc,fecha)=>{
  let respuesta = {   
    statusCod: true,
    statusDesc: "" 
}
  console.log("LLAMANDO UPDATE ETA");

  let cuerpoUpdateEta = {
    "data": {
      "type": "orders",
      "id": `${id_oc}`,
      "attributes": {
        "eta_date": "",
        "eta_updated": ""
      }
  
    }
  }

  try {
    
    // PROCESAR ORDEN
    //respuesta.orden = orden.data;
    cuerpoUpdateEta.data.attributes.eta_date = fecha;
    //generar fecha
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var hora = String(today.getHours()).padStart(2, '0');
    var minutos = String(today.getMinutes()).padStart(2, '0');
    var segundos = String(today.getSeconds()).padStart(2, '0');
    var yyyy = today.getFullYear();

    cuerpoUpdateEta.data.attributes.eta_updated = `${yyyy}-${mm}-${dd}T${hora}:${minutos}:${segundos}Z`;
   
    
    const updatePersistOro = await reqUpdateEta(id_oc,cuerpoUpdateEta);

    if(updatePersistOro.statusCod) {
      respuesta.statusCod = true;
      respuesta.statusDesc = `El ETA de la orden ${id_oc} ha sido actualizado con exito`;
    }else{
      respuesta.statusCod = false;
      respuesta.statusDesc = `Ha ocurrido un error al actualizar ETA`;
    }
  } catch (error) {
    console.error(error);
    respuesta.statusCod = false;
    respuesta.statusDesc = "HA OCURRIDO UN ERROR ACTUALIZANDO EL ETA"
  }
  return respuesta;
}

module.exports = {
    saveProductOro,
    updateEta
    
}