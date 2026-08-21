# Cambios v65 - Calculadora de rutas

- Se corrigió la geocodificación que podía seleccionar negocios, terminales o calles con el nombre del municipio en otra ubicación.
- El sistema localiza primero el municipio correcto y después limita la búsqueda de la dirección a esa zona.
- Si el municipio coincide con el nombre de un departamento, corrige automáticamente una selección contradictoria. Ejemplo: municipio Chimaltenango con departamento Guatemala se calcula como Chimaltenango, Chimaltenango.
- Si una dirección específica no puede confirmarse, calcula hasta el centro del municipio correcto en vez de usar una coincidencia lejana incorrecta.
- El resultado informa cuando corrigió el departamento o utilizó el centro municipal.
- Se mantiene la tarifa de Q7.50 por kilómetro, con ida y regreso ya incluidos y sin duplicar la distancia.
- Se preservan todos los módulos y correcciones acumulativas de la versión v64.

## Verificación

- Compilación de producción completada correctamente.
- No se modificaron las reglas de Firebase ni las colecciones de contactos, cotizaciones, campañas o seguimientos.
