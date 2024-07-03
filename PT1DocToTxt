async function(properties, context) {
  const mammoth = require('mammoth');

  if (!properties.docUrl) {
    throw new Error('docUrl is required in properties');
  }

  let docUrl = properties.docUrl;

  // Asegurarse de que la URL tenga el esquema correcto
  if (!/^https?:\/\//i.test(docUrl)) {
    docUrl = 'https://' + docUrl;
  }

  try {
    // Importar dinámicamente 'node-fetch'
    const fetch = (await import('node-fetch')).default;

    // Asegurarse de que la URL esté correctamente formada
    let url;
    try {
      url = new URL(docUrl);
    } catch (err) {
      throw new Error('Invalid URL');
    }

    // Descargar el archivo DOC/DOCX
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const docBuffer = await response.buffer();

    // Extraer el texto del DOC/DOCX usando mammoth
    const { value } = await mammoth.extractRawText({ buffer: docBuffer });
    const text = value.trim();

    const result = {
      text: text
    };

    return { result: JSON.stringify(result) };
  } catch (err) {
    console.error('Error extracting DOC/DOCX text:', err);
    throw err;
  }
}
