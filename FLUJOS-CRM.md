# Flujos operativos verificados · Casa Solar CRM

## 1. Evaluación solicitada por Ventas

- **Visita técnica presencial:** Vendedor selecciona fecha y hora y confirma **Programar fecha y hora** → Jefe técnico → Técnico asignado (el Jefe técnico también puede asignarse) → Programación.
- **Llamada o videollamada:** Vendedor → Programación.

## 2. Instalación programada

Al guardar una fecha de instalación, la misma orden queda disponible simultáneamente para:

- Programación: fecha, horario y técnico.
- Bodega: productos, fecha y estado de preparación/despacho.
- Facturación: cliente, DPI/CUI, NIT, pago, factura y número.

## Datos bilingües de clientes

- El importador acepta encabezados en español e inglés y los normaliza a los nombres internos en español.
- Reconoce, entre otros: Nombre/Name/Company, Teléfono/Phone/Mobile, Correo/Email, DPI/CUI/National ID, NIT/Tax ID, Dirección/Address, Municipio/City, Departamento/State y Observaciones/Notes/Comments.
- Cada fila válida debe incluir nombre o empresa y, además, teléfono o correo.
- DPI y NIT se conservan en Contactos y en la Orden de Pedido.
- Calendario completo: vista diaria, semanal y mensual.

Un cambio de fecha actualiza la orden compartida; no crea una copia separada.

## 3. Ejecución y cierre técnico

1. El técnico asignado abre la orden.
2. Registra quién recibió el equipo y redacta el informe.
3. Presiona **Registrar instalación realizada**.
4. El CRM registra fecha y hora; solicita al dispositivo la ubicación GPS y conserva como respaldo la dirección de instalación.
5. El técnico presiona **Guardar registro**.
6. La instalación queda marcada como completada y el informe aparece en **Informes de instalación**, con descarga PDF.

## 4. Permisos principales

- **Jefe:** acceso general a ventas y áreas operativas.
- **Jefe técnico:** ve/modifica/guarda/descarga órdenes, asigna técnicos, puede operar como técnico y consulta programación, calendario e informes.
- **Técnico:** ve sus órdenes, completa datos técnicos y genera su informe; no modifica precios ni descarga documentos comerciales.
- **Programación:** administra fechas y horarios y consulta informes.
- **Bodega:** ve todas las órdenes que tienen fecha de instalación y actualiza el despacho.
- **Facturación:** ve todas las órdenes que tienen fecha de instalación y actualiza factura y número.

## 5. Comprobaciones antes de publicar

- Compilación de producción con `npm run build`.
- Firebase Authentication obligatorio.
- Datos compartidos en Firestore.
- Sin Firebase Storage, Cloud Functions ni automatización de WhatsApp: compatible con el plan gratuito Spark dentro de sus cuotas.
