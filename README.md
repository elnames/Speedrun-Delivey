<p align="center">
  <img src="assets/speed run circular.png" width="200" alt="Speedrun Delivery Logo">
</p>

# Speedrun Delivery

Plataforma de logística de última milla con tracking en tiempo real, gestión de órdenes y roles diferenciados para clientes, couriers y administradores.

**[speedrun.nmsdev.tech](https://speedrun.nmsdev.tech)**

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite, Tailwind CSS, Framer Motion |
| Backend | NestJS, Passport JWT, TypeScript |
| Base de datos | SQL Server, Prisma ORM |
| Tiempo real | Socket.io |
| Infraestructura | Docker, PM2, Nginx Proxy Manager |

---

## Funcionalidades

- Autenticación JWT con roles `CLIENT` / `COURIER` / `ADMIN`
- Gestión de órdenes — creación, asignación y seguimiento de estados
- Upload de evidencias fotográficas por orden
- Dashboards diferenciados por rol
- SpeedrunTimer — contador de tiempo en vivo por entrega
- Panel de administración — gestión de órdenes, couriers y clientes
- Landing page con animaciones (BentoGrid, ProcessTimeline, RouteVisualizer, Testimonials)

---

## Estructura

```
sd/
├── sd-backend/    # NestJS API (puerto 3006)
├── sd-frontend/   # React + Vite (puerto 3005)
└── README.md
```

---

## Desarrollo local

### Backend
```bash
cd sd-backend
cp .env.example .env
npm install
npx prisma migrate deploy
npm run start:dev
```

### Frontend
```bash
cd sd-frontend
npm install
npm run dev
```

---

## Deploy con Docker

```bash
docker compose up -d --build
```

Variables requeridas en `sd-backend/.env`:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión SQL Server |
| `JWT_SECRET` | Secreto JWT |
| `PORT` | Puerto del servidor (default: 3006) |

---

## Bootstrap admin (producción)

```bash
docker exec -it speedrun_backend node create-admin.js
```
