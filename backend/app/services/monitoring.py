from collections.abc import Iterator
from contextlib import contextmanager
from datetime import datetime, timedelta

from sqlalchemy import func, inspect, text
from sqlalchemy.orm import Session

from app.db.monitoring_database import monitoring_db_session
from app.models.company import Device, Site
from app.models.measurement import EnergyMeasurement
from app.schemas.monitoring import (
    MonitoringKpiItem,
    MonitoringLatestItem,
    MonitoringOverviewSummary,
    MonitoringReportSummary,
    MonitoringSiteRead,
    MonitoringTargetRead,
    MonitoringTrendPoint,
)


@contextmanager
def _monitoring_query_db(db: Session) -> Iterator[Session]:
    with monitoring_db_session() as monitoring_db:
        yield monitoring_db or db


def _has_real_monitoring_schema(db: Session) -> bool:
    if db is None:
        return False
    try:
        if db.bind is None or db.bind.dialect.name != "postgresql":
            return False
        table_names = set(inspect(db.bind).get_table_names(schema="public"))
        return {"sites", "circuits", "opc_tags", "readings"}.issubset(table_names)
    except Exception:
        return False


def _unit_for_tag(tag_name: str | None, data_type: str | None = None) -> str | None:
    name = (tag_name or "").lower()
    dtype = (data_type or "").lower()
    value = f"{name} {dtype}"
    if "factor" in value or value in {"cosq"}:
        return None
    if "frequency" in value:
        return "Hz"
    if "voltage" in value:
        return "V"
    if "current" in value:
        return "A"
    if "reactive" in value or "var" in value:
        return "kVAr"
    if "energy" in value or "wh" in value:
        return "kWh"
    if "power" in value or "_w" in value or "kw" in value:
        return "kW"
    return None


def _parameter_filter_clause(parameter: str | None) -> tuple[str, dict]:
    if not parameter:
        return "", {}
    aliases = {
        "power_kw": "active_power",
        "energy_kwh": "active_energy",
        "voltage_v": "voltage",
        "current_a": "current",
        "power_factor": "power_factor",
    }
    normalized = aliases.get(parameter.lower(), parameter.lower())
    return (
        "and (lower(t.tag_name) = :parameter or lower(t.data_type) = :parameter)",
        {"parameter": normalized},
    )


def _latest_real_rows(db: Session, target_id: int | None = None, max_items: int = 500) -> list:
    target_clause = "and t.circuit_id = :target_id" if target_id is not None else ""
    params = {"target_id": target_id, "limit": max_items}
    return db.execute(
        text(
            f"""
            select
                c.id as target_id,
                c.circuit_name as target_name,
                t.tag_name,
                t.data_type,
                r.value,
                r.ts,
                r.quality
            from public.opc_tags t
            join public.circuits c on c.id = t.circuit_id
            join lateral (
                select value, ts, quality
                from public.readings
                where opc_id = t.id
                order by ts desc
                limit 1
            ) r on true
            where t.is_active = true
              and t.circuit_id is not null
              {target_clause}
            order by c.circuit_name asc, t.tag_name asc
            limit :limit
            """
        ),
        params,
    ).fetchall()


def list_monitoring_sites(db: Session) -> list[Site | MonitoringSiteRead]:
    with _monitoring_query_db(db) as query_db:
        if _has_real_monitoring_schema(query_db):
            rows = query_db.execute(
                text(
                    """
                    select id, site_name, description, location
                    from public.sites
                    order by site_name asc
                    """
                )
            ).fetchall()
            return [
                MonitoringSiteRead(
                    id=row.id,
                    company_id=None,
                    name=row.site_name,
                    description=row.description,
                    location=row.location,
                    is_active=True,
                )
                for row in rows
            ]
    return db.query(Site).order_by(Site.name.asc()).all()


def list_monitoring_targets(db: Session) -> list[MonitoringTargetRead]:
    with _monitoring_query_db(db) as query_db:
        if _has_real_monitoring_schema(query_db):
            rows = query_db.execute(
                text(
                    """
                    select
                        id,
                        site_id,
                        circuit_name,
                        description,
                        circuit_type,
                        circuit_code,
                        is_active
                    from public.circuits
                    order by circuit_name asc
                    """
                )
            ).fetchall()
            return [
                MonitoringTargetRead(
                    id=row.id,
                    site_id=row.site_id,
                    name=row.circuit_name,
                    description=row.description,
                    target_type=row.circuit_type,
                    serial_number=row.circuit_code,
                    is_active=row.is_active,
                )
                for row in rows
            ]

    devices = db.query(Device).order_by(Device.name.asc()).all()
    return [
        MonitoringTargetRead(
            id=device.id,
            site_id=device.site_id,
            name=device.name,
            description=device.description,
            target_type=device.device_type,
            serial_number=device.serial_number,
            is_active=device.is_active,
        )
        for device in devices
    ]


def list_latest_measurements(
    db: Session,
    target_id: int | None = None,
) -> list[MonitoringLatestItem]:
    with _monitoring_query_db(db) as query_db:
        if _has_real_monitoring_schema(query_db):
            return [
                MonitoringLatestItem(
                    target_id=row.target_id,
                    target_name=row.target_name,
                    parameter=row.tag_name or row.data_type or "value",
                    value=row.value,
                    unit=_unit_for_tag(row.tag_name, row.data_type),
                    timestamp=row.ts,
                    quality=row.quality,
                )
                for row in _latest_real_rows(query_db, target_id=target_id)
                if row.value is not None
            ]

    devices_query = db.query(Device)
    if target_id is not None:
        devices_query = devices_query.filter(Device.id == target_id)

    items: list[MonitoringLatestItem] = []
    for device in devices_query.order_by(Device.name.asc()).all():
        measurement = (
            db.query(EnergyMeasurement)
            .filter(EnergyMeasurement.device_id == device.id)
            .order_by(EnergyMeasurement.timestamp.desc())
            .first()
        )
        if measurement is None:
            continue
        items.append(
            MonitoringLatestItem(
                target_id=device.id,
                target_name=device.name,
                parameter=measurement.measurement_type,
                value=measurement.value,
                unit=measurement.unit,
                timestamp=measurement.timestamp,
                quality=measurement.quality,
            )
        )
    return items


def list_trend_points(
    db: Session,
    target_id: int | None = None,
    parameter: str | None = None,
    from_dt: datetime | None = None,
    to_dt: datetime | None = None,
    resolution: str = "raw",
    limit: int = 500,
) -> list[MonitoringTrendPoint]:
    with _monitoring_query_db(db) as query_db:
        if _has_real_monitoring_schema(query_db):
            return _list_real_trend_points(
                query_db,
                target_id=target_id,
                parameter=parameter,
                from_dt=from_dt,
                to_dt=to_dt,
                resolution=resolution,
                limit=limit,
            )

    query = db.query(EnergyMeasurement)
    if target_id is not None:
        query = query.filter(EnergyMeasurement.device_id == target_id)
    if parameter is not None:
        query = query.filter(EnergyMeasurement.measurement_type == parameter)
    if from_dt is not None:
        query = query.filter(EnergyMeasurement.timestamp >= from_dt)
    if to_dt is not None:
        query = query.filter(EnergyMeasurement.timestamp <= to_dt)

    measurements = query.order_by(EnergyMeasurement.timestamp.asc()).limit(limit).all()
    return [
        MonitoringTrendPoint(
            timestamp=measurement.timestamp,
            value=measurement.value,
            unit=measurement.unit,
            parameter=measurement.measurement_type,
            quality=measurement.quality,
        )
        for measurement in measurements
    ]


def get_overview_summary(db: Session) -> tuple[bool, MonitoringOverviewSummary]:
    with _monitoring_query_db(db) as query_db:
        if _has_real_monitoring_schema(query_db):
            rows = _latest_real_rows(query_db, max_items=5000)
            if not rows:
                return False, MonitoringOverviewSummary(
                    total_energy_kwh=0.0,
                    peak_demand_kw=0.0,
                    power_factor=None,
                    active_alerts=0,
                )
            energy_values = [
                row.value for row in rows
                if row.value is not None and (row.tag_name or "").lower() == "active_energy"
            ]
            power_values = [
                row.value for row in rows
                if row.value is not None and (row.tag_name or "").lower() == "active_power_iii"
            ]
            power_factor_values = [
                row.value for row in rows
                if row.value is not None and (row.tag_name or "").lower() in {"power_factor_iii", "power_factor", "cosq"}
            ]
            return True, MonitoringOverviewSummary(
                total_energy_kwh=float(sum(energy_values)) if energy_values else 0.0,
                peak_demand_kw=float(max(power_values)) if power_values else 0.0,
                power_factor=(
                    float(sum(power_factor_values) / len(power_factor_values))
                    if power_factor_values else None
                ),
                active_alerts=0,
            )

    measurement_count = db.query(func.count(EnergyMeasurement.id)).scalar() or 0
    total_energy = (
        db.query(func.coalesce(func.sum(EnergyMeasurement.value), 0.0))
        .filter(EnergyMeasurement.measurement_type == "energy")
        .scalar()
        or 0.0
    )
    peak_demand = (
        db.query(func.coalesce(func.max(EnergyMeasurement.value), 0.0))
        .filter(EnergyMeasurement.measurement_type == "active_power")
        .scalar()
        or 0.0
    )
    power_factor = (
        db.query(EnergyMeasurement.value)
        .filter(EnergyMeasurement.measurement_type == "power_factor")
        .order_by(EnergyMeasurement.timestamp.desc())
        .first()
    )
    return (
        measurement_count > 0,
        MonitoringOverviewSummary(
            total_energy_kwh=float(total_energy),
            peak_demand_kw=float(peak_demand),
            power_factor=float(power_factor[0]) if power_factor else None,
            active_alerts=0,
        ),
    )


def get_report_summary(db: Session) -> tuple[bool, MonitoringReportSummary]:
    with _monitoring_query_db(db) as query_db:
        if _has_real_monitoring_schema(query_db):
            site_count = query_db.execute(text("select count(*) from public.sites")).scalar() or 0
            target_count = query_db.execute(text("select count(*) from public.circuits")).scalar() or 0
            try:
                measurement_count = query_db.execute(
                    text(
                        """
                        select coalesce(sum(sample_count), 0)::bigint
                        from public.readings_1day
                        """
                    )
                ).scalar() or 0
            except Exception:
                query_db.rollback()
                measurement_count = query_db.execute(
                    text("select count(*) from public.readings")
                ).scalar() or 0
            has_data = query_db.execute(text("select exists(select 1 from public.readings limit 1)")).scalar()
            return bool(has_data), MonitoringReportSummary(
                site_count=site_count,
                target_count=target_count,
                measurement_count=measurement_count,
                active_alerts=0,
            )

    site_count = db.query(func.count(Site.id)).scalar() or 0
    target_count = db.query(func.count(Device.id)).scalar() or 0
    measurement_count = db.query(func.count(EnergyMeasurement.id)).scalar() or 0
    return (
        measurement_count > 0,
        MonitoringReportSummary(
            site_count=site_count,
            target_count=target_count,
            measurement_count=measurement_count,
            active_alerts=0,
        ),
    )


def list_kpis(db: Session) -> tuple[bool, list[MonitoringKpiItem]]:
    data_available, summary = get_overview_summary(db)
    if not data_available:
        return False, []
    return True, [
        MonitoringKpiItem(
            key="total_energy_kwh",
            label="Total energy",
            value=summary.total_energy_kwh,
            unit="kWh",
        ),
        MonitoringKpiItem(
            key="peak_demand_kw",
            label="Peak demand",
            value=summary.peak_demand_kw,
            unit="kW",
        ),
    ]


def _list_real_trend_points(
    db: Session,
    target_id: int | None = None,
    parameter: str | None = None,
    from_dt: datetime | None = None,
    to_dt: datetime | None = None,
    resolution: str = "raw",
    limit: int = 500,
) -> list[MonitoringTrendPoint]:
    if from_dt is None or to_dt is None:
        latest_ts = db.execute(text("select max(ts) from public.readings")).scalar()
        if latest_ts is not None:
            to_dt = to_dt or latest_ts
            from_dt = from_dt or (to_dt - timedelta(hours=24))

    target_clause = "and t.circuit_id = :target_id" if target_id is not None else ""
    parameter_clause, parameter_params = _parameter_filter_clause(parameter)
    params = {
        "target_id": target_id,
        "from_dt": from_dt,
        "to_dt": to_dt,
        "limit": limit,
        **parameter_params,
    }

    normalized_resolution = resolution.lower()
    aggregate_sources = {
        "1m": "public.readings_1min_view",
        "1min": "public.readings_1min_view",
        "1h": "public.readings_1hour_view",
        "1hour": "public.readings_1hour_view",
        "1d": "public.readings_1day_view",
        "1day": "public.readings_1day_view",
    }

    if normalized_resolution in aggregate_sources:
        source = aggregate_sources[normalized_resolution]
        time_column = "bucket"
        value_column = "avg_value"
        quality_column = "r.good_sample_count::text"
    else:
        source = "public.readings"
        time_column = "ts"
        value_column = "value"
        quality_column = "r.quality"

    rows = db.execute(
        text(
            f"""
            select *
            from (
                select
                    r.{time_column} as point_ts,
                    r.{value_column} as point_value,
                    t.tag_name,
                    t.data_type,
                    {quality_column} as quality
                from {source} r
                join public.opc_tags t on t.id = r.opc_id
                where t.is_active = true
                  and t.circuit_id is not null
                  and (:from_dt is null or r.{time_column} >= :from_dt)
                  and (:to_dt is null or r.{time_column} <= :to_dt)
                  {target_clause}
                  {parameter_clause}
                order by r.{time_column} desc
                limit :limit
            ) limited_points
            order by point_ts asc
            """
        ),
        params,
    ).fetchall()
    return [
        MonitoringTrendPoint(
            timestamp=row.point_ts,
            value=row.point_value,
            unit=_unit_for_tag(row.tag_name, row.data_type),
            parameter=row.tag_name or row.data_type or "value",
            quality=str(row.quality) if row.quality is not None else None,
        )
        for row in rows
        if row.point_value is not None
    ]
