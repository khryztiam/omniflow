---
name: Change Control Manager
description: Control de cambios de software, evaluacion de versionado SemVer (MAJOR.MINOR.PATCH) a solicitud del usuario y documentacion obligatoria en CHANGELOG.md o README.md. Usar cuando el usuario pida registrar un cambio, proponer nueva version, documentar modificaciones, features, parches, refactorizaciones o actualizaciones de UI/UX.

---

# Change Control Manager (Gestor de Control de Cambios)
## Proposito
Este skill gestiona el ciclo completo de control de cambios de software: clasifica la naturaleza de la modificacion, evalua e incrementa la version bajo el esquema SemVer (MAJOR.MINOR.PATCH), solicita la confirmacion/aprobacion explicita del usuario antes de aplicar el incremento y garantiza la documentacion obligatoria en CHANGELOG.md y README.md.

## When to Use
Activar este skill cuando el usuario mencione o solicite:

- Registrar un control de cambios o solicitud de cambio (Change Request / Change Control).
- Proponer o actualizar la version de la aplicacion (X.X.X).
- Documentar nuevas funcionalidades (features), correcciones de errores (bugfixes/patches), cambios de UI/UX, actualizaciones de dependencias o refactorizaciones.
- Actualizar o redactar entradas en CHANGELOG.md y/o README.md.

## Steps & Workflow
Paso 1: Analizar y Clasificar el Cambio
Clasificar la modificacion reportada o realizada dentro de una de las siguientes categorias estandar:

- MAJOR (X.0.0): Cambios que rompen la compatibilidad hacia atras (Breaking Changes), reestructuraciones profundas de la API o arquitectura.
- MINOR (0.X.0): Nuevas funcionalidades (features), mejoras significativas de UI/UX, adiciones retrocompatibles que no rompen el sistema.
- PATCH (0.0.X): Correccion de errores (bugfixes), parches de seguridad, optimizaciones menores de codigo, refactorizaciones internas o ajustes cosméticos.

Paso 2: Proponer el Incremento de Version y Matriz de Cambio
Presentar al usuario una propuesta clara con el siguiente formato antes de aplicar cambios finales:

1. Resumen del Cambio: Descripcion breve de lo que se modifico o agregada.
2. Clasificacion de Impacto: (MAJOR / MINOR / PATCH).
3. Propuesta de Versionado:
   - Version Actual: vX.Y.Z
   - Nueva Version Propuesta: vX.Y.Z+1
4. Resumen de Archivos a Documentar: (CHANGELOG.md, README.md).

**REGLA DE APROBACION**: Solicitar siempre la aprobacion o confirmacion del usuario antes de dar por asentada la version oficial.

Paso 3: Documentacion Obligatoria (CHANGELOG.md y README.md)
Una vez confirmada la version por el usuario (o al proceder con el registro), actualizar o redactar la documentacion siguiendo estas directrices:

A. CHANGELOG.md (Basado en Keep a Changelog)
Estructurar la entrada bajo la version aprobada y la fecha actual (formato YYYY-MM-DD):

**[X.Y.Z] - YYYY-MM-DD**

### Added (Añadido)
- Nuevas funcionalidades o caracteristicas agregadas.

### Changed (Cambiado)
- Cambios en funcionalidades existentes o mejoras de UI/UX.

### Deprecated (Obsoleto)
- Caracteristicas que seran eliminadas en futuras versiones.

### Removed (Eliminado)
- Caracteristicas o codigo eliminado en esta version.

### Fixed (Corregido)
- Solucion de errores o bugs.

### Security (Seguridad)
- Parches o correcciones de vulnerabilidades.
B. README.md (Si aplica)
Actualizar el README.md únicamente si el cambio afecta:

- El numero de version mostrado en el encabezado o insignia (badge).
- Nuevos requisitos del sistema o dependencias.
- Modificaciones en los comandos de instalacion, ejecucion o configuracion de entorno (.env).
- Capturas o descripcion general de modulos principales (ej. nuevas vistas de UI).

## Gotchas & Guidelines
Documentacion obligatoria: NUNCA dar por finalizado un control de cambios sin generar o actualizar el bloque correspondiente en CHANGELOG.md.
Formato SemVer estricto: Respetar la sintaxis MAJOR.MINOR.PATCH sin agregar letras innecesarias a menos que el usuario pida explicitamente etiquetas pre-release (ej. v1.2.0-beta.1).
Claridad en el registro: Describir los cambios orientados al valor técnico u operativo, evitando descripciones vagas como "se arreglaron cosas".
Sin asumir versiones: Si no se conoce la version previa, consultar al usuario o asumir v1.0.0 como punto de partida inicial.