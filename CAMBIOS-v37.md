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

## Revisión de flujos y persistencia

- Las órdenes técnicas muestran si la evaluación está pendiente o realizada, si el cliente la aprobó y si la OP final ya fue generada.
- La OP final se habilita después de registrar la evaluación técnica y la aprobación del cliente; las órdenes históricas que ya tenían instalación programada conservan compatibilidad.
- Al iniciar sesión, el CRM concilia las órdenes existentes con fecha de instalación y crea únicamente el seguimiento faltante en el historial del contacto.
- Cada fecha nueva o reprogramación de instalación agrega automáticamente un seguimiento al contacto.
- La reasignación de clientes o el cambio de nombre de un vendedor actualizan los seguimientos mediante una transacción, sin reemplazar la lista completa ni borrar registros recientes de otra sesión.
