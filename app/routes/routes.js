const {getOCOro,getDetalleOCOro,
    getDetalleDocumento, 
    asociarNV, obtenerListaDeDocumentos,
    exportExcelOrdenes,
    downloadExcel,
    listadoOcOro,
    fechaActualizacionMigracionOc,
    getInfoChinaResponse
} = require('../controllers/oc');
const { Router} = require('express');
const { obtenerListaDocumentos } = require('../controllers/getInfoAws');
const { migracionManual } = require('../controllers/oc');
const {registrarPagoRest,obtenerHistorialPagos,listaNv,eliminarRegistroPago} = require('../pagos/controllers/restPagos');
const router = Router();

//Modulo de data-center
/**
 * @swagger
 * components:
 *  schemas:
 *      fulldata:
 *          type: object
 *          properties:
 *              cliente:
 *                  type: string
 *                  description: nombre del cliente
 *              total:
 *                  type: string
 *                  description: monto total a pagar
 *              subtotal:
 *                  type: string
 *                  description: monto a pagar sin iva
 *              moneda:
 *                  type: string
 *                  description: representa el tipo de divisa con el que se pagara
 *              id:
 *                  type: string
 *                  description: representa el id de la orden en oro
 *              productos:
 *                  type: array
 *                  description: representa lista de productos comprados
 *              poNumber:
 *                  type: string
 *                  description: representa un identificador para el cliente
 *              creada:
 *                  type: string
 *                  description: representa la fecha de creacion del documento
 *      Orden:
 *          type: object
 *          properties: 
 *              fulldata:
 *                  type: object
 *                  $ref: '#/components/schemas/fulldata'
 *                  description: indica si la operacion es exitosa o no con un true o false
 *              id_oc:
 *                  type: string
 *                  description: id de orden
 *              cliente:
 *                  type: string
 *                  description: nombre del cliente
 *      listaOC:
 *          type: object
 *          properties: 
 *              statusCod:
 *                  type: boolean
 *                  description: indica si la operacion es exitosa o no con un true o false
 *              statusDesc:
 *                  type: string
 *                  description: descripciión del de lo retornado por el metodo
 *              data:
 *                  type: array
 *                  description: Lista de ordenes de oro
 *      listaOrdenesOro:
 *          type: object
 *          properties:
 *              ok:
 *                  type: boolean
 *                  description: indica si la operacion es exitosa o no con un true o false
 *              listaDeOrdenes:
 *                  type: array
 *                  items: 
 *                      $ref: '#/components/schemas/Orden'
 *                  description: lista de ordenes
 */

/**
 * @swagger
 * /api/descargar/oro-oc/{id}:
 *  get:
 *      summary: retorna la lista de ordenes de oro por id de cliente
 *      tags: [Lista de Oc por cliente]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *                type: string
 *            required: true
 *            description: lista de ordenes
 *      responses:
 *          200:
 *              description: detalle de la orden de oro
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/listaOC'
 */
router.get('/descargar/oro-oc/:id',getOCOro);
router.get('/detalle-oc/:id',getDetalleOCOro);
router.get('/detalle-documento/:id',getDetalleDocumento);
router.post('/asociarNv',asociarNV);
router.get('/documentos',obtenerListaDeDocumentos);
/**
 * @swagger
 * /api/lista-oc-oro:
 *  get:
 *      summary: retorna la lista de ordenes en la plataforma
 *      tags: [Lista de ordenes en la plataforma]
 *      responses:
 *          200:
 *              description: detalle de la orden de oro
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/listaOrdenesOro'
 */
router.get('/lista-oc-oro',listadoOcOro);

//Modulo de pagos

router.post('/registrar-pago',registrarPagoRest);
router.get('/historial-pagos/:folio',obtenerHistorialPagos);
router.get('/lista-nv',listaNv);
router.post('/eliminar-pago',eliminarRegistroPago);
router.get('/exportar-excel-ordenes',exportExcelOrdenes);
router.get('/download-excel/:nombre',downloadExcel);
router.get('/fecha-ac-oc',fechaActualizacionMigracionOc);
router.post('/asociar-nv-china',getInfoChinaResponse);
router.get('/migrar',migracionManual);

module.exports = router;