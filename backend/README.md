# Energy Monitoring API Backend

## Overview

This is the backend API for the Energy Monitoring Web App.

Current features:
- FastAPI application
- Health check endpoint
- Pytest setup

## Create virtual environment

From `real-project/backend`:

```powershell
python -m venv .venv
```

## Activate virtual environment

```powershell
.\.venv\Scripts\activate
```

## Install requirements

```powershell
python -m pip install -r requirements.txt --disable-pip-version-check --timeout 200 --retries 5
```

## Run tests

```powershell
python -m pytest
```

## Run development server

```powershell
python -m uvicorn app.main:app --reload
```

## Health endpoint

```text
GET /health
```

Expected response:

```json
{"status":"ok"}
```