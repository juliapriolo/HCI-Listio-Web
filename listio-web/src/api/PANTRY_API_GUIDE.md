# API de Despensa - Guía de Habilitación

## Estado Actual
La integración de la API para la despensa está **completamente implementada pero comentada** hasta que el backend esté habilitado.

## Archivos Modificados

### 1. `/src/api/pantry.js` (ACTUALIZADO)
- Endpoints completos para múltiples despensas por usuario
- Métodos para gestión de despensas e items
- Funcionalidades de compartir despensas
- Manejo de parámetros de consulta y paginación

### 2. `/src/stores/pantry.js` (ACTUALIZADO)
- Soporte para múltiples despensas
- Gestión de despensa actual seleccionada
- Nuevos getters para filtrado por categoría y estado
- Estado de carga y manejo de errores
- Métodos remotos comentados con fallback local
- Métodos de sincronización

### 3. `/src/pages/despensa.vue` (ACTUALIZADO)
- Selector de despensas
- Interfaz para crear nuevas despensas
- Funcionalidad de compartir despensas
- Interfaz mejorada con indicadores de carga
- Botón de sincronización manual
- Manejo de errores con alertas
- Fallback automático a localStorage si la API falla

## Cómo Habilitar la API

### Paso 1: Configurar Variable de Entorno
Crear archivo `.env.development` en la raíz del proyecto:
```bash
VITE_API_BASE_URL=http://localhost:8080
```

### Paso 2: Descomentar Métodos en el Store
En `/src/stores/pantry.js`, descomentar las líneas marcadas con `TODO: Uncomment when API is enabled`:

```javascript
// Cambiar esto:
// const response = await pantryApi.getAllPantries(params)

// Por esto:
const response = await pantryApi.getAllPantries(params)
```

### Paso 3: Verificar Endpoints del Backend
Asegurarse de que el backend tenga estos endpoints disponibles:

#### Gestión de Despensas
- `GET /api/pantries` - Listar todas las despensas del usuario
- `POST /api/pantries` - Crear una nueva despensa
- `GET /api/pantries/{id}` - Obtener items de una despensa específica
- `PUT /api/pantries/{id}` - Actualizar información de una despensa
- `DELETE /api/pantries/{id}` - Eliminar una despensa

#### Compartir Despensas
- `POST /api/pantries/{id}/share` - Compartir despensa con otro usuario por email
- `GET /api/pantries/{id}/share` - Obtener usuarios con acceso a la despensa
- `DELETE /api/pantries/{id}/share/{user_id}` - Revocar acceso de un usuario

#### Gestión de Items
- `POST /api/pantries/{id}/items` - Agregar item a una despensa
- `GET /api/pantries/{id}/items` - Obtener items de una despensa (paginado)
- `PUT /api/pantries/{id}/items/{item_id}` - Actualizar item específico
- `DELETE /api/pantries/{id}/items/{item_id}` - Eliminar item específico

## Funcionalidades Implementadas

### ✅ Gestión de Múltiples Despensas
- Crear nuevas despensas
- Seleccionar despensa actual
- Cambiar entre despensas
- Eliminar despensas

### ✅ CRUD de Items por Despensa
- Agregar items a despensa específica
- Actualizar items existentes
- Eliminar items
- Filtrar items por categoría y estado

### ✅ Compartir Despensas
- Compartir despensa por email
- Ver usuarios con acceso
- Revocar acceso de usuarios

### ✅ Funcionalidades Avanzadas
- Sincronización manual
- Manejo de errores robusto
- Fallback automático a localStorage
- Indicadores de carga

### ✅ Interfaz Mejorada
- Selector de despensas
- Diálogos para crear/compartir despensas
- Indicadores de carga
- Alertas de error
- Botón de sincronización
- Timestamp de última sincronización

## Estructura de Datos

### Despensa (Pantry)
```javascript
{
  id: number,
  name: string,
  description: string,
  createdAt: string,
  updatedAt: string
}
```

### Item de Despensa
```javascript
{
  id: number,
  name: string,
  category: string,
  quantity: number,
  unit: string,
  expiryDate: string,
  status: 'available' | 'low' | 'expired',
  image: string
}
```

## Fallback Automático
El sistema está diseñado para funcionar sin la API:
- Si la API no está disponible, usa localStorage
- Si la API falla, automáticamente usa métodos locales
- Los datos se mantienen sincronizados localmente
- Soporte para múltiples despensas en modo local

## Testing
Para probar la integración:
1. Habilitar la API siguiendo los pasos anteriores
2. Verificar que los endpoints respondan correctamente
3. Probar todas las operaciones CRUD para despensas e items
4. Probar funcionalidad de compartir despensas
5. Verificar el manejo de errores

## Notas Técnicas
- Todos los métodos remotos tienen manejo de errores
- Los datos se sincronizan automáticamente con localStorage
- La interfaz muestra el estado de carga y errores
- Compatible con el sistema de autenticación existente
- Soporte para paginación en endpoints de items
- Gestión de estado reactiva para múltiples despensas