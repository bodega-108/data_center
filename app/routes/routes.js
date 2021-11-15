const {getOCOro,getDetalleOCOro,getDetalleDocumento, asociarNV, obtenerListaDeDocumentos} = require('../controllers/oc');
const { Router} = require('express');
const { obtenerListaDocumentos } = require('../controllers/getInfoAws');
const {registrarPagoRest,obtenerHistorialPagos,listaNv} = require('../pagos/controllers/restPagos');
const router = Router();

//Modulo de data-center
router.get('/descargar/oro-oc/:id',getOCOro);
router.get('/detalle-oc/:id',getDetalleOCOro);
router.get('/detalle-documento/:id',getDetalleDocumento);
router.post('/asociarNv',asociarNV);
router.get('/documentos',obtenerListaDeDocumentos)


//Modulo de pagos

router.post('/registrar-pago',registrarPagoRest);
router.get('/historial-pagos/:folio',obtenerHistorialPagos);
router.get('/lista-nv',listaNv);
module.exports = router;