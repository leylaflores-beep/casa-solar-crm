# Casa Solar CRM v42

## Corrección del acceso de Samuel

- El correo `casasolar.bodega.gt@gmail.com` se reconoce como usuario especial de Samuel Lemus.
- Su perfil siempre carga las funciones de **Jefe técnico + Vendedor**.
- Se evita que un estado antiguo de suspensión cierre su sesión después de que Firebase acepta la contraseña.
- Las reglas de Firestore incluyen expresamente el correo correcto de Samuel.
- La pantalla de ingreso muestra mensajes diferenciados para correo anterior, clave no reconocida, bloqueo temporal y problemas de conexión.

## Carolina Custodio y colaboradores antiguos

- En **Equipo** puede escribirse el correo de Carolina Custodio aunque su registro anterior no tenga un usuario de Firebase vinculado.
- Al guardar el correo, el CRM crea o vincula el acceso y envía un enlace para establecer la contraseña.
- La misma función sirve para otros integrantes antiguos que solamente existían como vendedores.

## Administración de contraseñas

- Leyla conserva el control para definir y mostrar/ocultar la contraseña inicial al crear una cuenta.
- Puede enviar un restablecimiento de contraseña a cualquier correo registrado.
- No se incorpora una clave maestra ni una puerta trasera: Firebase no permite que una aplicación cliente consulte o escriba directamente la contraseña existente de otra persona.

## Instalación

- Es obligatorio publicar el archivo `firestore.rules` incluido para aplicar la corrección completa de acceso de Samuel.
- Compilación de producción verificada con Vite.
