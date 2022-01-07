const {getOCOro,getDetalleOCOro,
    getDetalleDocumento, 
    asociarNV, obtenerListaDeDocumentos,
    exportExcelOrdenes,
    downloadExcel,
    listadoOcOro,
    fechaActualizacionMigracionOc
} = require('../controllers/oc');
const { Router} = require('express');
const { obtenerListaDocumentos } = require('../controllers/getInfoAws');
const {registrarPagoRest,obtenerHistorialPagos,listaNv,eliminarRegistroPago} = require('../pagos/controllers/restPagos');
const router = Router();

//Modulo de data-center
router.get('/descargar/oro-oc/:id',getOCOro);
router.get('/detalle-oc/:id',getDetalleOCOro);
router.get('/detalle-documento/:id',getDetalleDocumento);
router.post('/asociarNv',asociarNV);
router.get('/documentos',obtenerListaDeDocumentos)
router.get('/lista-oc-oro',listadoOcOro);

//Modulo de pagos

router.post('/registrar-pago',registrarPagoRest);
router.get('/historial-pagos/:folio',obtenerHistorialPagos);
router.get('/lista-nv',listaNv);
router.post('/eliminar-pago',eliminarRegistroPago);
router.get('/exportar-excel-ordenes',exportExcelOrdenes);
router.get('/download-excel/:nombre',downloadExcel);
router.get('/fecha-ac-oc',fechaActualizacionMigracionOc);
module.exports = router;