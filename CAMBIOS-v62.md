# Casa Solar CRM v62

## Calculadora de rutas corregida

- Corrige la confusión entre Santa Cruz del Quiché y Santa Cruz, Ixcán.
- Usa una coordenada fija para la Bodega Central de Plaza Pericentro, evitando que el geocodificador cambie el punto de salida.
- Conserva el cobro de una sola distancia porque la tarifa de Q7.50 por kilómetro ya incluye ida y regreso.
- Permite ingresar opcionalmente la distancia confirmada en Google Maps; esa distancia sustituye la automática para el cobro y para la cotización.
- Agrega un enlace para abrir y comprobar la ruta en Google Maps.
- Guarda en la cotización tanto la distancia automática como la distancia verificada.

## Ejemplo validado

- Plaza Pericentro → Santa Cruz del Quiché: aproximadamente 63 km con el proveedor automático.
- Si Google Maps indica 66.1 km, el cobro es: `66.1 × Q7.50 = Q495.75`.

## Instalación

Dentro de `src` en GitHub, reemplazar `CasaSolarCRM.jsx`, `Campaigns.jsx` y `firebase.js`. Esperar las marcas verdes en Actions y actualizar el CRM con `Ctrl + F5`.
