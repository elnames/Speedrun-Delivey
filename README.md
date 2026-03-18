# 🌑 Speedrun Delivery: Sober Obsidian

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat-square&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Speedrun Delivery** es una plataforma de logística de alto rendimiento diseñada bajo la estética **Sober Obsidian**. Un sistema sin fricciones, sin retrasos y enfocado en la excelencia operativa.

---

## ✨ Características Principales

- **Interfaz Sober Obsidian**: Fondo negro puro (`#050505`) con tipografía de alto contraste y efectos de "Glassmorphism" premium.
- **Sincronización en Tiempo Real**: Seguimiento de pedidos en vivo mediante WebSockets (Socket.io).
- **Flujo de Negociación Avanzado**: Sistema de invitaciones directas con soporte para contra-ofertas.
- **Evidencia Digital**: Sistema de carga de fotos (Base64) para comprobantes de entrega instantáneos.
- **Arquitectura Escalable**: Estructura de monorepositorio con backend en NestJS y frontend en React/Vite.

---

## 🏗️ Arquitectura del Sistema

```mermaid
graph TD
    A[Cliente / App] -->|React/Vite| B[Frontend HUB]
    B -->|REST/WS| C[NestJS Logic Core]
    C -->|Prisma ORM| D[(Base de Datos MSSQL)]
    C -->|Socket.io| B
```

---

## 📂 Estructura del Proyecto

```bash
├── sd-backend/       # Servidor NestJS (Lógica de Negocio, Socket.io, JWT)
├── sd-frontend/      # Dashboard React (Tailwind, Framer Motion)
└── README.md         # Documentación Principal
```

---

## 🛠️ Configuración Rápida

### 1. Requisitos Previos
- Node.js v18+
- Una instancia de base de datos SQL Server (MSSQL)

### 2. Configuración del Backend
```bash
cd sd-backend
npm install
cp .env.example .env
# Configura tu DATABASE_URL en .env
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### 3. Configuración del Frontend
```bash
cd sd-frontend
npm install
cp .env.example .env
# Configura tu VITE_API_URL en .env
npm run dev
```


---

## 🌑 Lineamientos Estéticos

Este proyecto utiliza el sistema de diseño **Sober Obsidian**:
- **Fondo**: `#050505` (Obsidian Black)
- **Acentos**: Blanco puro y escala de grises premium.
- **Efectos**: Sombras suaves, bordes sutiles y animaciones fluidas con Framer Motion.

---

## 📝 Licencia

Distribuido bajo la Licencia MIT. Consulta `LICENSE` para más información.

<p align="center">
  Logística Evolucionada. Solo Excelencia.
</p>
