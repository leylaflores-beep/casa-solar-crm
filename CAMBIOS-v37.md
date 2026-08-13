# Casa Solar CRM v37

## Importación de contactos

- Acepta archivos `.xls`, `.xlsx` y `.csv`.
- Reconoce encabezados equivalentes en español e inglés, aunque tengan tildes, espacios, guiones, mayúsculas o minúsculas.
- Normaliza los datos a los nombres internos en español del CRM.
- Incluye alias para nombre/empresa, teléfono, correo, DPI/CUI, NIT, dirección, municipio, departamento, observaciones, producto, precio, promoción, forma de pago, vendedor, estado, canal y sitio web.
- Una fila se considera válida cuando tiene nombre o empresa y al menos teléfono o correo.
- La vista previa muestra DPI y NIT antes de confirmar la importación.

## Contactos y órdenes de pedido

- Se agregó DPI/CUI al formulario de contactos y a la información guardada del cliente.
- Se agregó DPI/CUI a las órdenes de pedido y a los documentos PDF generados.
- Las órdenes con visita técnica presencial permiten seleccionar fecha y hora y confirmarlas con el botón **Programar fecha y hora**.

## Validación

- Compilación de producción verificada con `npm run build`.
