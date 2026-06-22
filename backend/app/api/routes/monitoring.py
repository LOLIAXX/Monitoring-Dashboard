from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import require_permission
from app.db.database import get_db
from app.models.user import User
from app.schemas.monitoring import (
    MonitoringKpiResponse,
    MonitoringLatestResponse,
    MonitoringOverviewResponse,
    MonitoringReportSummaryResponse,
    MonitoringSiteListResponse,
    MonitoringTargetListResponse,
    MonitoringTrendResponse,
)
from app.services.monitoring import (
    get_overview_summary,
    get_report_summary,
    list_kpis,
    list_latest_measurements,
    list_monitoring_sites,
    list_monitoring_targets,
    list_trend_points,
)

router = APIRouter(prefix="/monitoring", tags=["monitoring"])


@router.get("/sites", response_model=MonitoringSiteListResponse)
def read_monitoring_sites(
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("energy:read")),
) -> MonitoringSiteListResponse:
    return MonitoringSiteListResponse(items=list_monitoring_sites(db))


@router.get("/targets", response_model=MonitoringTargetListResponse)
def read_monitoring_targets(
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("energy:read")),
) -> MonitoringTargetListResponse:
    return MonitoringTargetListResponse(items=list_monitoring_targets(db))


@router.get("/latest", response_model=MonitoringLatestResponse)
def read_monitoring_latest(
    target_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("energy:read")),
) -> MonitoringLatestResponse:
    items = list_latest_measurements(db, target_id=target_id)
    return MonitoringLatestResponse(data_available=bool(items), items=items)


@router.get("/trends", response_model=MonitoringTrendResponse)
def read_monitoring_trends(
    target_id: int | None = Query(default=None),
    parameter: str | None = Query(default=None),
    from_dt: datetime | None = Query(default=None, alias="from"),
    to_dt: datetime | None = Query(default=None, alias="to"),
    resolution: str = Query(default="raw"),
    limit: int = Query(default=500, ge=1, le=2000),
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("energy:read")),
) -> MonitoringTrendResponse:
    points = list_trend_points(
        db,
        target_id=target_id,
        parameter=parameter,
        from_dt=from_dt,
        to_dt=to_dt,
        resolution=resolution,
        limit=limit,
    )
    return MonitoringTrendResponse(
        target_id=target_id,
        parameter=parameter,
        resolution=resolution,
        points=points,
    )


@router.get("/overview", response_model=MonitoringOverviewResponse)
def read_monitoring_overview(
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("energy:read")),
) -> MonitoringOverviewResponse:
    data_available, summary = get_overview_summary(db)
    return MonitoringOverviewResponse(data_available=data_available, summary=summary)


@router.get("/reports/summary", response_model=MonitoringReportSummaryResponse)
def read_monitoring_report_summary(
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("energy:read")),
) -> MonitoringReportSummaryResponse:
    data_available, summary = get_report_summary(db)
    return MonitoringReportSummaryResponse(data_available=data_available, summary=summary)


@router.get("/kpis", response_model=MonitoringKpiResponse)
def read_monitoring_kpis(
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("energy:read")),
) -> MonitoringKpiResponse:
    data_available, items = list_kpis(db)
    return MonitoringKpiResponse(data_available=data_available, items=items)


@router.get("/health")
def monitoring_health(
    _: User = Depends(require_permission("energy:read")),
) -> dict:
    from app.db.monitoring_database import monitoring_db_session
    from app.services.monitoring import _has_real_monitoring_schema
    connected = False
    schema_detected = False
    try:
        with monitoring_db_session() as mdb:
            if mdb is not None:
                connected = True
                schema_detected = _has_real_monitoring_schema(mdb)
    except Exception:
        connected = False
    return {
        "connected": connected,
        "schema_detected": schema_detected,
        "fallback_active": not schema_detected,
    }
