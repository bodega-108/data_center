

const newNVADD = async(documento, nv_sherpa)=>{
    
    let nvSherpaAWS = true;
    if( documento.documentos.nv_sherpa !== "SIN NV SHERPA ASOCIADA"){
        if(documento.documentos.nv_sherpa !== '' || documento.documentos.nv_sherpa.length !== 0 ){
        
            for( let i = 0; i < documento.documentos.nv_sherpa.length; i++ ){
                let nvSherpaFromSoftnet = documento.documentos.nv_sherpa[i].detalle[0].folio;
                if(nvSherpaFromSoftnet === nv_sherpa){
                  nvSherpaAWS= false;
                }
            }
    
        }
    }

    return nvSherpaAWS;
}
const newNVADDSOFTNET = async(documento, nv_softnet)=>{
    let nvSoftnetAWS = true;
    if( documento.documentos.nv_softnet !== "SIN NV ASOCIADA"){
        if(documento.documentos.nv_softnet !== '' || documento.documentos.nv_softnet.length !== 0 ){

            for(let i=0; i < documento.documentos.nv_softnet.length; i++){
                let nvSotnetFromAWS = documento.documentos.nv_softnet[i].idDoc.folio;
              if(nvSotnetFromAWS === nv_softnet){
                nvSoftnetAWS = false;
              }
                
            }
        }
    }

    return nvSoftnetAWS;
}

module.exports = {
    newNVADD,
    newNVADDSOFTNET
}