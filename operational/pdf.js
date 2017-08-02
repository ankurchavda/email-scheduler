// in some service 
var PdfTable = require('voilab-pdf-table'),
PdfDocument = require('pdfkit');

module.exports = {
    create: function (header, body) {
        // create a PDF from PDFKit, and a table from PDFTable 
        console.log(header);
        console.log("\n");
        console.log(body);
        var pdf = new PdfDocument({
            autoFirstPage: false
        }),
        table = new PdfTable(pdf, {
            bottomMargin: 30
        });

        table
            // add some plugins (here, a 'fit-to-width' for a column) 
            .addPlugin(new (require('voilab-pdf-table/plugins/fitcolumn'))({
                column: 'Campaign'
            }))
            // set defaults to your columns 
            .setColumnsDefaults({
                headerBorder: 'B',
                align: 'left'
            })
            // add table columns 
            .addColumns(header)
            // add events (here, we draw headers on each new page) 
            .onPageAdded(function (tb) {
                tb.addHeader();
            });

        // if no page already exists in your PDF, do not forget to add one 
        pdf.addPage();

        // draw content, by passing data to the addBody method 
        table.addBody(body);

        return pdf;
    }
};