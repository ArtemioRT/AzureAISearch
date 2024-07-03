
async function(properties, context) {
  const options = {};
  const PDFExtract = require('pdf.js-extract').PDFExtract;
  const pdfExtract = new PDFExtract();

  if (!properties.pdfUrl) {
    throw new Error('pdfUrl is required in properties');
  }

  let pdfUrl = properties.pdfUrl;

  // Asegurarse de que la URL tenga el esquema correcto
  if (!/^https?:\/\//i.test(pdfUrl)) {
    pdfUrl = 'https://' + pdfUrl;
  }

  try {
    // Importar dinámicamente 'node-fetch'
    const fetch = (await import('node-fetch')).default;

    // Asegurarse de que la URL esté correctamente formada
    let url;
    try {
      url = new URL(pdfUrl);
    } catch (err) {
      throw new Error('Invalid URL');
    }

    // Descargar el archivo PDF
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const pdfBuffer = await response.buffer();

    // Extraer el texto del PDF
    const data = await pdfExtract.extractBuffer(pdfBuffer, options);
    const text = data.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n');

    const result = {
      text: text,
      pageCount: data.pages.length
    };

    return { result: JSON.stringify(result) };
  } catch (err) {
    console.error('Error extracting PDF text:', err);
    throw err;
  }
}
