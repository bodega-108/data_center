const axios = require('axios').default;


/**
 * Funcion para generarToken de oro
 * 
 */
const autenticarOro = async()=>{
 
    let resultado;
    //Rescatamos variables
    const client_id = process.env.CLIENT_ID_ORO;
    const client_secret = process.env.CLIENTE_SECRET_ORO;
        await axios({
            method: 'POST',
            url:`${process.env.ORO_SITE_PATH}/oauth2-token`,
            headers: {'Content-Type': 'application/json'},
            data:{
                client_id,
                client_secret,
                grant_type:'password',
                username:'admin',
                password:process.env.PASSWORD,
            }
        }).then(res =>{
            
            resultado = res.data;

        }).catch((err) =>{
            console.log(err);
        });
        return resultado;
}

/**
 * Llar lista de OC por cliente
 * @param {*} id; 
 */
const obtenerOCListaCliente= async (id) =>{


    let respuesta = {   
        statusCod: true,
        statusDesc: "" 
    }
    try {
        //Obtenemos Token
       let token = await autenticarOro();
       if(token){
           await axios.get(
               `${process.env.ORO_SITE_PATH}/3m0nk_admin/api/orders?fields[customer]=${id}`,
               {headers: { 'Authorization': `Bearer ${token.access_token}` }}
           ).then(res =>{
               respuesta.statusCod = true;
               respuesta.statusDesc = `Lista de OC para el cliente ${id}`,
               respuesta.data = res.data
           }).catch(err =>{
               console.log(err);
               respuesta.statusCod = false;
               respuesta.statusDesc = `Error al obtener lista de oc para el cliente con el id ${id}` ;
           })
       }else{
        respuesta.statusCod = false;
        respuesta.statusDesc = "Error al obtener el token";
       }

    } catch (error) {
        log.error(error);
        console.log(error);
        respuesta.statusCod = false;
        respuesta.statusDesc = "Error al obtener ejecutar metodo " + error;
    }

    return respuesta;
}

/**
 * Obtener data de oc por id
 * @param {number} id_oc;
 */
const obtenerDetalleOc = async(id_oc) => {

    let respuesta = {   
        statusCod: true,
        statusDesc: "" 
    }
    try {
        //Obtenemos Token
       let token = await autenticarOro();
       if(token){
           await axios.get(
               `${process.env.ORO_SITE_PATH}/3m0nk_admin/api/orders/${id_oc}`,
               {headers: { 'Authorization': `Bearer ${token.access_token}` }}
           ).then(res =>{
               respuesta.statusCod = true;
               respuesta.statusDesc = `Detalle de OC con el id ${id_oc}`,
               respuesta.data = res.data
           }).catch(err =>{
               console.log(err);
               respuesta.statusCod = false;
               respuesta.statusDesc = `Error al obtener oc para el cliente con el id ${id_oc}` ;
           })
       }else{
        respuesta.statusCod = false;
        respuesta.statusDesc = "Error al obtener el token";
       }

    } catch (error) {
        log.error(error);
        console.log(error);
        respuesta.statusCod = false;
        respuesta.statusDesc = "Error al obtener ejecutar metodo " + error;
    }

    return respuesta;
}

/**
 * Obtener todas las oc
 * 
 */
 const obtenerTodasLasOc = async() => {

    let respuesta = {   
        statusCod: true,
        statusDesc: "" 
    }
    try {
        //Obtenemos Token
       let token = await autenticarOro();
       if(token){
           await axios.get(
               `${process.env.ORO_SITE_PATH}/3m0nk_admin/api/orders?fields[customers]=1&page[number]=1&page[size]=500&sort=id`,
               {headers: { 
                   'Authorization': `Bearer ${token.access_token}`,
                    'Content-Type': 'application/vnd.api+json'
                 }
                }
           ).then(res =>{
               respuesta.statusCod = true;
               respuesta.statusDesc = `Lista de OC`,
               respuesta.data = res.data
           }).catch(err =>{
               console.log(err);
               respuesta.statusCod = false;
               respuesta.statusDesc = `Error al obtener oc para el cliente con el id ${id_oc}` ;
           })
       }else{
        respuesta.statusCod = false;
        respuesta.statusDesc = "Error al obtener el token";
       }

    } catch (error) {
        log.error(error);
        console.log(error);
        respuesta.statusCod = false;
        respuesta.statusDesc = "Error al obtener ejecutar metodo " + error;
    }
    //console.log(respuesta);
    //  console.log(respuesta.data.data.length);
    return respuesta;
}
/**
 * Obtener todas las oc
 * 
 */
 const obtenerDatosClientOc = async(id_oc) => {

    let respuesta = {   
        statusCod: true,
        statusDesc: "" 
    }
    try {
        //Obtenemos Token
       let token = await autenticarOro();
       if(token){
           await axios.get(
               `${process.env.ORO_SITE_PATH}/3m0nk_admin/api/orders/${id_oc}/customer`,
               {headers: { 
                   'Authorization': `Bearer ${token.access_token}`,
                    'Content-Type': 'application/vnd.api+json'
                 }
                }
           ).then(res =>{
               respuesta.statusCod = true;
               respuesta.statusDesc = `Datos del cliente de OC`,
               respuesta.data = res.data
           }).catch(err =>{
               console.log(err);
               respuesta.statusCod = false;
               respuesta.statusDesc = `Error al obtener los datos del cliente en la oc ${id_oc}` ;
           })
       }else{
        respuesta.statusCod = false;
        respuesta.statusDesc = "Error al obtener el token";
       }

    } catch (error) {
        log.error(error);
        console.log(error);
        respuesta.statusCod = false;
        respuesta.statusDesc = "Error al obtener ejecutar metodo " + error;
    }
    //console.log(respuesta);
    //  console.log(respuesta.data.data.length);
    return respuesta;
}
/**
 * Obtener nuevo registro oc desde oro
 */
const ultimaOc = async()=>{

    let respuesta = {   
        statusCod: true,
        statusDesc: "" ,
        idListaOcOro:[]
    }
    let listaIdOc = [];
    //Obtenemos el total de ocs
    try {
        let listaOc = await obtenerTodasLasOc();
        if(listaOc.statusCod){
            let cantidadDeRegistros = listaOc.data.data.length;
            for(let i=0; i< cantidadDeRegistros; i++){   
                listaIdOc.push(listaOc.data.data[i].id);
            }
            respuesta.statusCod = true;
            respuesta.statusDesc = "Lista de id oc oro";
            respuesta.idListaOcOro = listaIdOc;
        }else{
            respuesta.statusCod = false;
            respuesta.statusDesc = "Error al obtener Lista de Oc";
        }
    } catch (error) {       
        console.log(error);
        respuesta.statusCod = false;
        respuesta.statusDesc = "Error al obtener ejecutar metodo " + error;
    }
    // console.log(respuesta);
    return respuesta;
}

/**
 * Obtener Nuevos registros por dia
 */
const nuevosRegistrosDiarios= async()=>{
    let respuesta = {   
        statusCod: true,
        statusDesc: "" 
    }
    try {
        //Obtenemos Token
       let token = await autenticarOro();
       console.log(token);
       let fecha = new Date().toISOString().split("T");
       console.log(fecha);
       let dia = (parseInt(fecha[0].split("-")[2])-1).toString();
    
    
       let fechaFinal = fecha[0].split('-');
       fechaFinal[2]=dia;
      
       
       if(token){
           await axios.get(
               `${process.env.ORO_SITE_PATH}/3m0nk_admin/api/orders?filter[createdAt][gte]=${fechaFinal.toString().replace(/,/g, '-')}T01:00:58.204Z&page[number]=1&page[size]=50&sort=id`,
               {headers: { 
                   'Authorization': `Bearer ${token.access_token}`,
                    'Content-Type': 'application/vnd.api+json'
                 }
                }
           ).then(res =>{
               respuesta.statusCod = true;
               respuesta.statusDesc = `Lista de OC`,
               respuesta.data = res.data.data
           }).catch(err =>{
               console.log(err);
               respuesta.statusCod = false;
               respuesta.statusDesc = `Error al obtener lista` ;
           })
       }else{
        respuesta.statusCod = false;
        respuesta.statusDesc = "Error al obtener el token";
       }

    } catch (error) {
  
        console.log(error);
        respuesta.statusCod = false;
        respuesta.statusDesc = "Error al obtener ejecutar metodo " + error;
    }
   
    return respuesta;
}
/**
 * Obtener productos solicitados
 * @param {} id_oc
 */
const obtenerProductosOC = async (id_oc) =>{
    
    let respuesta = {   
        statusCod: true,
        statusDesc: "" 
    }

    try{
        let token = await autenticarOro();
        if(token){
            await axios.get(
                `${process.env.ORO_SITE_PATH}/3m0nk_admin/api/orders/${id_oc}/lineItems?page[number]=1&page[size]=10&sort=id`,
                {headers: { 
                    'Authorization': `Bearer ${token.access_token}`,
                     'Content-Type': 'application/vnd.api+json'
                  }
                 }
            ).then(res =>{
                respuesta.statusCod = true;
                respuesta.statusDesc = `Lista de OC`,
                respuesta.lista_de_productos = res.data.data
            }).catch(err =>{
                console.log(err);
                respuesta.statusCod = false;
                respuesta.statusDesc = `Error al obtener lista` ;
            })
        }else{
            console.log("TOKEN INVALIDO");
            respuesta.statusCod = false;
            respuesta.statusDesc = "Token invalido";
        }
    }catch(e){
        console.log("ERROR: ",e);
        respuesta.statusCod = false;
        respuesta.statusDesc = "Error al obtener ejecutar metodo " + error;
    }
    //console.log(respuesta)
    return respuesta;
}

const buildDetailOc = async ()=>{

    let respuesta = {
        statusCod: true,
        statusDesc: "",
        listOc:[]
    };

    try {

        console.log("====== CONSTRUYENDO LISTA DE OC =======");
        // Obtener lista de oc
        const listaOc = await obtenerTodasLasOc();
        
        if(listaOc.statusCod){
            for(let i = 0; i < listaOc.data.data.length; i++){

                let ocApp = {
                    id:listaOc.data.data[i].id,
                }
               
                const datosCliente = await obtenerDatosClientOc(listaOc.data.data[i].id);
                //asignamos nombre de clientr
               if(datosCliente.statusCod){
                //console.log(datosCliente.data.data.attributes.name);
                ocApp.cliente = datosCliente.data.data.attributes.name;
               }
               const productosInOc = await obtenerProductosOC(listaOc.data.data[i].id);
               if(productosInOc.statusCod){
                   ocApp.productos = productosInOc.lista_de_productos;
               }
               
               ocApp.poNumber = listaOc.data.data[i].attributes.poNumber;
               ocApp.moneda = listaOc.data.data[i].attributes.currency;
               ocApp.subtotal = listaOc.data.data[i].attributes.subtotalValue;
               ocApp.total = listaOc.data.data[i].attributes.totalValue;
               ocApp.creada = listaOc.data.data[i].attributes.createdAt;
               console.log(`====== OC ${listaOc.data.data[i].id} CONSTRUIDA =======`);
               
    
               respuesta.listOc.push(ocApp);
              
            }
        }   
    } catch (error) {
        console.log(error);
    }
    console.log("====== LISTA CONSTRUIDA =======");
    
    return respuesta;
}

/**
 *  Obtener todos los productos
 */
const obtenerTodosLosProductos = async(id)=>{
    
    let respuesta = {   
        statusCod: true,
        statusDesc: "" 
    }

    try{
        let token = await autenticarOro();
        if(token){
            await axios.get(
                `${process.env.ORO_SITE_PATH}/3m0nk_admin/api/products/${id}`,
                {headers: { 
                    'Authorization': `Bearer ${token.access_token}`,
                     'Content-Type': 'application/vnd.api+json'
                  }
                 }
            ).then(res =>{
                respuesta.statusCod = true;
                respuesta.statusDesc = `Producto`,
                respuesta.lista_de_productos = res.data;
            }).catch(err =>{
                console.log(err);
                respuesta.statusCod = false;
                respuesta.statusDesc = `Error al obtener el producto` ;
            })
        }else{
            console.log("TOKEN INVALIDO");
            respuesta.statusCod = false;
            respuesta.statusDesc = "Token invalido";
        }
    }catch(e){
        console.log("ERROR: ",e);
        respuesta.statusCod = false;
        respuesta.statusDesc = "Error al obtener ejecutar metodo " + error;
    }
    //console.log(respuesta)
    return respuesta; 
}


module.exports = {
    autenticarOro,
    obtenerOCListaCliente,
    obtenerDetalleOc,
    obtenerTodasLasOc,
    ultimaOc,
    nuevosRegistrosDiarios,
    obtenerProductosOC,
    buildDetailOc,
    obtenerTodosLosProductos
}


