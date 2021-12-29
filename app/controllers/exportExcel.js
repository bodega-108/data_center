
var XLSX = require('xlsx');

const path = require('path');


function exportExcel(data,workSheetColumnNames,filePath) {

    let fecha = new Date();
    // const filePath =path.join(__dirname,`../../outputFiles/listadeoc-${fecha.getTime()}.xlsx`);
    console.log("creando archivo")
    const workSheetData = [
        workSheetColumnNames,
        ... data
    ];
	var ws = XLSX.utils.aoa_to_sheet(workSheetData);
	var wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
    XLSX.writeFile(wb, path.resolve(filePath));
    return wb;
}



const exportUsersToExcel = (informacion,filePath) => {
   console.log(informacion[0].fulldata.productos);
    const workSheetColumnNames = [
        "id_oc",
        "fecha de creacion",
        "cliente",
        "codigo de orden",
        "moneda",
        "subtotal",
        "total",
        "sku"
    ]

   const  data = informacion.map((oc) =>{
        return [ 
            oc.id_oc,
            oc.fulldata.creada,
            oc.cliente,
            oc.fulldata.poNumber,
            oc.fulldata.moneda,
            oc.fulldata.subtotal,
            oc.fulldata.total
        ]
    });
    for(let i = 0; i < informacion.length; i++) {
         for(let x = 0; x < informacion[i].fulldata.productos.length; x++ ){
             data[i].push(informacion[i].fulldata.productos[x].attributes.productSku);
             data[i].push(informacion[i].fulldata.productos[x].attributes.productName);
             data[i].push(informacion[i].fulldata.productos[x].attributes.quantity);

         }
     }
 //console.log(data);

    exportExcel(data, workSheetColumnNames,filePath);
}
module.exports = {
    exportUsersToExcel
}
