const axios = require('axios').default;


/**
 * Obtener token de autenticacion
 */

const autenticacion = async()=>{

    let respuesta = {
        statusCod:"",
        statusDesc:""
    }

    //Preparando request
    const username = process.env.USERNAME_SOFTNET;
    const password = process.env.PASSWORD_SOFTNET;
    const rut = process.env.RUT_SOFTNET;
    const url = process.env.SOFTNET_PATH;

    try {   
        await axios({
            method: 'POST',
            url:`${url}/login`,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
              },
              data: {
                username,
                password,
                rut
              }
        }
        ).then(res =>{
           
            respuesta.statusCod = true;
            respuesta.statusDesc = `Token generado`,
            respuesta.data = res.data;
        }).catch(err =>{
            console.log(err);
            respuesta.statusCod = false;
            respuesta.statusDesc = `Error ` ;
        })
    } catch (error) {
        console.error(error);
        respuesta.statusCod = false;
        respuesta.statusDesc = `Error:  ${error.message}` ;
    }

    return respuesta;
}
/**
 * Obtener Lista de nv
 */
const obtenerListaNv = async(year,mes)=>{
    let respuesta = {
        statusCod:"",
        statusDesc:""
    }
    //Preparando request

    const url = process.env.SOFTNET_PATH;
    try {
        //Obtenemos Token
        let token = await autenticacion();

        if(token){
            await axios({
                method: 'POST',
                url:`${url}/libroNotaVenta`,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json;charset=UTF-8',
                    'token':token.data.token
                  },
                  data: {
                   periodo:year,
                   mes
                  }
            }
            ).then(res =>{
               
                respuesta.statusCod = true;
                respuesta.statusDesc = `Token generado`,
                respuesta.data = res.data;
            }).catch(err =>{
                console.log(err);
                respuesta.statusCod = false;
                respuesta.statusDesc = `Error ` ;
            });
        }
    } catch (error) {
        console.error(error);
        respuesta.statusCod = false;
        respuesta.statusDesc = `Error:  ${error.message}` ;
    }
 
    return respuesta;
}
/**
 * Obtener  nv
 */
 const obtenerDetalleNv = async(folio,year,mes)=>{
    let respuesta = {
        statusCod:"",
        statusDesc:""
    }
    //Preparando request

    const url = process.env.SOFTNET_PATH;
    try {
        //Obtenemos Token
        let token = await autenticacion();

        if(token){
            
          
            await axios({
                method: 'POST',
                url:`${url}/consultaDocumento`,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json;charset=UTF-8',
                    'token':token.data.token
                  },
                  data:  {
                    rut: process.env.RUT_SOFTNET,
                    tipo: 780,
                    folio
                    }
            }
            ).then(res =>{
               
                respuesta.statusCod = true;
                respuesta.statusDesc = `Detalle nv folio: ${folio}`,
                respuesta.data = res.data;
            }).catch(err =>{
                console.log(err);
                respuesta.statusCod = false;
                respuesta.statusDesc = `Error ` ;
            });
        }
    } catch (error) {
        console.error(error);
        respuesta.statusCod = false;
        respuesta.statusDesc = `Error:  ${error.message}` ;
    }
   
    return respuesta;r
}

module.exports = {
    obtenerListaNv,
    autenticacion,
    obtenerDetalleNv
}