const axios = require('axios').default;

/**
 * 
 * @param {*} id_nv_sherpa 
 */
const getInfochina = async(id_nv_sherpa)=>{

    let respuesta = {
        statusCod:"",
        statusDesc:""
    }

    const url = process.env.SHERPA_PATH;

    try{
        await axios({
            method: 'GET',
            url:`${url}//test/api/sherpa_api.php?accion=nv_production&nv=${id_nv_sherpa}`,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
              }
        }
        ).then(res =>{
           
            respuesta.statusCod = true;
            respuesta.statusDesc = data=== `Nota de venta de china`,
            respuesta.data = res.data === "Nota de Venta no registrada<br>" ? "SIN NV SHERPA ASOCIADA":res.data;
        }).catch(err =>{
            console.log(err);
            respuesta.statusCod = false;
            respuesta.statusDesc = `Error ` ;
            
        });

        return respuesta;
    }catch(e){
        console.log("Ha ocurrido un error " + e.message);
    }
}

module.exports = {
    getInfochina
}