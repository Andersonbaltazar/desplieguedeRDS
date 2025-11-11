# Contribuir al Proyecto

Este es un proyecto académico para AWS Academy. 

## Cómo configurar el ambiente local

1. Clona el repositorio.
2. Copia `.env.example` a `.env` y configura tus variables:
   ```bash
   cp .env.example .env
   ```
3. Instala dependencias:
   ```bash
   npm install
   ```
4. Crea la tabla en tu BD local o RDS:
   ```bash
   mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> < migrations/create_contacts.sql
   ```
5. Arranca la app:
   ```bash
   npm start
   ```

## Notas de Desarrollo

- Las credenciales AWS no deben guardarse en el repositorio (usa `.env` local).
- Siempre usa `.env.example` como referencia.

