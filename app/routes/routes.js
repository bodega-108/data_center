const {getOCOro,getDetalleOCOro,getDetalleDocumento, asociarNV, obtenerListaDeDocumentos} = require('../controllers/oc');
const { Router} = require('express');
const { obtenerListaDocumentos } = require('../controllers/getInfoAws');
const router = Router();

router.get('/descargar/oro-oc/:id',getOCOro);
router.get('/detalle-oc/:id',getDetalleOCOro);
router.get('/detalle-documento/:id',getDetalleDocumento);
router.post('/asociarNv',asociarNV);
router.get('/documentos',obtenerListaDeDocumentos)

module.exports = router;