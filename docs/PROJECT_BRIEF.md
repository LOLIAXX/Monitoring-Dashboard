\# Energy Monitoring Web App — Project Brief



\## Goal



Build a modern full-stack web application for industrial energy monitoring, analysis, dashboards, alerts, Grafana integration, and report building.



The system should help companies monitor energy consumption, analyze trends, view dashboards, manage alerts, and generate reports.



\## Core Modules



\### 1. Authentication and Access Control

\- User login

\- JWT authentication

\- Role-based access control

\- Permission-based route protection

\- Access levels by company/site/department/device



\### 2. Dashboard

\- Executive overview

\- Energy consumption KPIs

\- Site comparison

\- Trend charts

\- Alerts summary

\- Grafana embedded panels later



\### 3. Energy Data

\- PostgreSQL data source

\- Meter/device readings

\- Consumption records

\- Aggregated daily/monthly views

\- Data quality status



\### 4. Analysis

\- Trend analysis

\- Peak usage analysis

\- Site comparison

\- Consumption anomaly detection later

\- Cost analysis later



\### 5. Alerts

\- Alert rules

\- Threshold-based alerts

\- Alert status: active, acknowledged, resolved

\- Alert history



\### 6. Reports

\- Report builder

\- KPI summaries

\- Charts and tables

\- Export to PDF/Excel later



\### 7. Grafana Integration

\- Store Grafana panel/dashboard references

\- Embed selected Grafana panels inside the app

\- Do not use Grafana as the whole frontend



\## Recommended Stack



Backend:

\- FastAPI

\- SQLAlchemy

\- PostgreSQL

\- Alembic

\- JWT auth

\- pytest



Frontend:

\- Next.js

\- TypeScript

\- Tailwind CSS

\- shadcn/ui

\- React Query

\- Axios

\- Recharts or ECharts



\## Development Rules



\- Backend foundation first.

\- Authentication and permissions before dashboards.

\- PostgreSQL integration before analytics.

\- Frontend starts only after backend auth and core routes are stable.

\- Grafana integration comes after internal dashboard structure exists.

\- Report builder comes after data and dashboard APIs are stable.

\- Every feature must be built on a feature branch.

\- Claude reviews plans and implementation.

\- Codex implements scoped tasks.

\- Human approves merges.



\## First Milestone



Create backend authentication and access-control foundation:

\- User model

\- Role model

\- Permission model

\- Database session setup

\- Password hashing

\- JWT token creation

\- Login endpoint

\- Current user endpoint

\- Protected test route

\- Tests



\## Do Not Add Yet



\- Frontend

\- Grafana

\- Report builder

\- Complex analytics

\- Email alerts

\- Production deployment

\- Complex database schema

