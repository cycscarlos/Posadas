# Herramientas de Desarrollo y Pruebas

Este directorio contiene scripts, herramientas y utilidades diseñadas para ayudar en el desarrollo, pruebas y mantenimiento del sistema de reservas Posadas.

## Estructura

```
tools/
├── tests/         # Scripts de prueba
├── db/            # Utilidades para la base de datos
└── utils/         # Utilidades generales
```

## Herramientas de Prueba (`/tests`)

- **test-automatizacion.js**: Script básico para probar el middleware de automatización de estados de reservas.
- **test-automatizacion-mejorado.js**: Versión mejorada del script que simula fechas y prueba diversos escenarios de cambio de estado.

Ejecutar con:

```bash
node tools/tests/test-automatizacion-mejorado.js
```

## Herramientas de Base de Datos (`/db`)

- **optimizar-bd.sql**: Script SQL para optimizar la base de datos mediante la creación de índices y otras mejoras de rendimiento.

Ejecutar con:

```bash
mysql -u usuario -p posada_db < tools/db/optimizar-bd.sql
```

## Utilidades Generales (`/utils`)

- **checkDependencias.js**: Herramienta para verificar y actualizar las dependencias del proyecto.

Ejecutar con:

```bash
node tools/utils/checkDependencias.js
```

## Notas Importantes

1. Estos scripts son herramientas de desarrollo y no deben ejecutarse en un entorno de producción sin precaución.
2. Algunos scripts, como el de optimización de base de datos, pueden requerir privilegios de administrador.
3. Siempre haga una copia de seguridad antes de ejecutar herramientas que modifiquen la base de datos.
