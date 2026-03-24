# Speedrun Delivery — Backend

API REST + WebSockets construida con NestJS. Puerto por defecto: `3006`.

## Endpoints principales

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/login` | — | Login, retorna JWT |
| POST | `/auth/register` | — | Registro de usuario |
| GET | `/orders` | JWT | Listar órdenes (filtradas por rol) |
| POST | `/orders` | CLIENT | Crear orden |
| PATCH | `/orders/:id/status` | COURIER/ADMIN | Actualizar estado |
| PATCH | `/orders/:id/assign` | ADMIN | Asignar courier |
| POST | `/orders/:id/evidence` | COURIER | Subir evidencia fotográfica |
| GET | `/orders/:id/evidence` | JWT | Ver evidencias de una orden |
| GET | `/users` | ADMIN | Listar usuarios |

## Variables de entorno

```env
DATABASE_URL=sqlserver://host:port;database=db;user=u;password=p;trustServerCertificate=true
JWT_SECRET=your-secret
PORT=3006
```

## Comandos

```bash
npm install
npx prisma migrate deploy
npm run start:dev       # desarrollo
npm run build && npm run start:prod  # producción
```
