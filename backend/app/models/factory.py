from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base, TimestampMixin


class Factory(Base, TimestampMixin):
    """Business-level factory entity in the app/auth DB.

    Distinct from monitoring DB "sites" — represents a legal/operational
    factory that users are granted access to view in the monitoring portal.
    """

    __tablename__ = "factories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    legal_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # Optional link to companies table — nullable so factories can exist independently
    company_id: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Location
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    province: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    timezone: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Classification
    industry: Mapped[str | None] = mapped_column(String(100), nullable=True)
    factory_type: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Operational specs
    production_lines_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    nominal_power_kw: Mapped[float | None] = mapped_column(Float, nullable=True)
    contract_demand_kw: Mapped[float | None] = mapped_column(Float, nullable=True)
    main_voltage_level: Mapped[str | None] = mapped_column(String(20), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    user_factory_accesses: Mapped[list["UserFactoryAccess"]] = relationship(
        "UserFactoryAccess",
        back_populates="factory",
        cascade="all, delete-orphan",
    )


class UserFactoryAccess(Base):
    """Associates a user with a factory, with an access level and default flag."""

    __tablename__ = "user_factory_access"
    __table_args__ = (UniqueConstraint("user_id", "factory_id"),)

    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    factory_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("factories.id", ondelete="CASCADE"), primary_key=True
    )
    access_level: Mapped[str] = mapped_column(String(50), nullable=False, default="viewer")
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    factory: Mapped[Factory] = relationship(
        "Factory", back_populates="user_factory_accesses"
    )
