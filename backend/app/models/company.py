from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Company(Base, TimestampMixin):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    sites: Mapped[list["Site"]] = relationship("Site", back_populates="company", cascade="all, delete-orphan")
    user_company_accesses: Mapped[list["UserCompanyAccess"]] = relationship(  # noqa: F821
        "UserCompanyAccess", back_populates="company", cascade="all, delete-orphan"
    )


class Site(Base, TimestampMixin):
    __tablename__ = "sites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    company_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    company: Mapped[Company] = relationship("Company", back_populates="sites")
    devices: Mapped[list["Device"]] = relationship("Device", back_populates="site", cascade="all, delete-orphan")
    user_site_accesses: Mapped[list["UserSiteAccess"]] = relationship(  # noqa: F821
        "UserSiteAccess", back_populates="site", cascade="all, delete-orphan"
    )


class Device(Base, TimestampMixin):
    __tablename__ = "devices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    site_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    device_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    serial_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    site: Mapped[Site] = relationship("Site", back_populates="devices")
    user_device_accesses: Mapped[list["UserDeviceAccess"]] = relationship(  # noqa: F821
        "UserDeviceAccess", back_populates="device", cascade="all, delete-orphan"
    )
    measurements: Mapped[list["EnergyMeasurement"]] = relationship(  # noqa: F821
        "EnergyMeasurement", back_populates="device", cascade="all, delete-orphan"
    )
