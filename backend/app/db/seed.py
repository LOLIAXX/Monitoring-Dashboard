"""Idempotent seed for energy_app_db (app/auth DB only).

Never touches MONITORING_DATABASE_URL / Kalleh_Amol_DB.
All upsert helpers are safe to run multiple times.
"""
import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.factory import Factory, UserFactoryAccess
from app.models.permission import Permission, RolePermission
from app.models.role import Role, UserRole
from app.models.user import User

logger = logging.getLogger(__name__)

# ── Permissions ───────────────────────────────────────────────────────────────

# Original colon-style permissions — kept for backward compat with existing router deps
_LEGACY_PERMISSIONS: list[dict] = [
    {"name": "energy:read",        "description": "View energy data"},
    {"name": "energy:write",       "description": "Modify energy data"},
    {"name": "users:read",         "description": "View users"},
    {"name": "users:write",        "description": "Manage users"},
    {"name": "reports:read",       "description": "View reports"},
    {"name": "reports:write",      "description": "Create and modify reports"},
    {"name": "admin:users",        "description": "Admin-level user management"},
    {"name": "roles:read",         "description": "View roles"},
    {"name": "roles:write",        "description": "Manage roles"},
    {"name": "permissions:read",   "description": "View permissions"},
    {"name": "permissions:write",  "description": "Manage permissions"},
    {"name": "companies:read",     "description": "View companies"},
    {"name": "companies:write",    "description": "Manage companies"},
    {"name": "sites:read",         "description": "View sites"},
    {"name": "sites:write",        "description": "Manage sites"},
    {"name": "devices:read",       "description": "View devices"},
    {"name": "devices:write",      "description": "Manage devices"},
    {"name": "access:read",        "description": "View user access assignments"},
    {"name": "access:assign",      "description": "Assign user access to companies/sites/devices"},
]

# New structured dot-notation permissions
_NEW_PERMISSIONS: list[dict] = [
    {"name": "admin.access",                "description": "Access admin dashboard"},
    {"name": "users.read",                  "description": "View user list"},
    {"name": "users.create",               "description": "Create new users"},
    {"name": "users.update",               "description": "Update user details"},
    {"name": "users.delete",               "description": "Delete users"},
    {"name": "roles.read",                 "description": "View roles"},
    {"name": "roles.create",               "description": "Create roles"},
    {"name": "roles.update",               "description": "Update roles"},
    {"name": "roles.delete",               "description": "Delete roles"},
    {"name": "permissions.read",           "description": "View permissions"},
    {"name": "permissions.assign",         "description": "Assign permissions to roles"},
    {"name": "factories.read",             "description": "View assigned factories"},
    {"name": "factories.assign_users",     "description": "Assign users to factories and manage factory data"},
    {"name": "monitoring.overview.read",   "description": "View factory monitoring overview"},
    {"name": "monitoring.trends.read",     "description": "View monitoring trends"},
    {"name": "monitoring.reports.read",    "description": "View monitoring reports"},
    {"name": "monitoring.alerts.read",     "description": "View monitoring alerts"},
    {"name": "monitoring.export",          "description": "Export monitoring data"},
    {"name": "monitoring.settings.read",   "description": "View monitoring settings"},
    {"name": "monitoring.settings.update", "description": "Update monitoring settings"},
]

ALL_PERMISSIONS: list[dict] = _LEGACY_PERMISSIONS + _NEW_PERMISSIONS
_ALL_NEW_PERM_NAMES = [p["name"] for p in _NEW_PERMISSIONS]

# ── Roles ─────────────────────────────────────────────────────────────────────

_LEGACY_ROLES: list[dict] = [
    {"name": "admin",    "description": "Full system access",         "is_system": True},
    {"name": "operator", "description": "Energy monitoring operator", "is_system": True},
    {"name": "viewer",   "description": "Read-only access",           "is_system": True},
]

_NEW_ROLES: list[dict] = [
    {"name": "Super Admin",        "description": "Full system access — all permissions",             "is_system": True},
    {"name": "CEO",                "description": "Executive read access, reports, and exports",      "is_system": False},
    {"name": "Energy Manager",     "description": "Energy monitoring, reports, trends, alerts, export", "is_system": False},
    {"name": "Technical Manager",  "description": "Technical monitoring, trends, alerts, settings",  "is_system": False},
    {"name": "Technical User",     "description": "Read monitoring, trends, and alerts",             "is_system": False},
    {"name": "Automation Manager", "description": "Automation read and settings access",             "is_system": False},
    {"name": "Automation User",    "description": "Limited automation read access",                  "is_system": False},
    {"name": "Operator",           "description": "Factory overview and alerts read",                "is_system": False},
    {"name": "Demo User",          "description": "Read-only demo access",                           "is_system": False},
]

ALL_ROLES: list[dict] = _LEGACY_ROLES + _NEW_ROLES

# ── Role → Permission assignments ─────────────────────────────────────────────

ALL_ROLE_PERMISSIONS: dict[str, list[str]] = {
    "admin": [
        "energy:read", "energy:write",
        "users:read", "users:write",
        "reports:read", "reports:write",
        "admin:users",
        "roles:read", "roles:write",
        "permissions:read", "permissions:write",
        "companies:read", "companies:write",
        "sites:read", "sites:write",
        "devices:read", "devices:write",
        "access:read", "access:assign",
    ],
    "operator": [
        "energy:read", "energy:write",
        "reports:read",
        "companies:read", "sites:read", "devices:read",
    ],
    "viewer": [
        "energy:read",
        "reports:read",
        "companies:read", "sites:read", "devices:read",
    ],
    "Super Admin": _ALL_NEW_PERM_NAMES,
    "CEO": [
        "admin.access", "users.read", "roles.read",
        "factories.read",
        "monitoring.overview.read", "monitoring.trends.read",
        "monitoring.reports.read", "monitoring.alerts.read",
        "monitoring.export", "monitoring.settings.read",
    ],
    "Energy Manager": [
        "factories.read",
        "monitoring.overview.read", "monitoring.trends.read",
        "monitoring.reports.read", "monitoring.alerts.read",
        "monitoring.export", "monitoring.settings.read",
    ],
    "Technical Manager": [
        "factories.read",
        "monitoring.overview.read", "monitoring.trends.read",
        "monitoring.alerts.read",
        "monitoring.settings.read", "monitoring.settings.update",
    ],
    "Technical User": [
        "factories.read",
        "monitoring.overview.read", "monitoring.trends.read",
        "monitoring.alerts.read",
    ],
    "Automation Manager": [
        "factories.read",
        "monitoring.overview.read", "monitoring.trends.read",
        "monitoring.alerts.read",
        "monitoring.settings.read", "monitoring.settings.update",
    ],
    "Automation User": [
        "factories.read",
        "monitoring.overview.read", "monitoring.alerts.read",
    ],
    "Operator": [
        "factories.read",
        "monitoring.overview.read", "monitoring.alerts.read",
    ],
    "Demo User": [
        "factories.read",
        "monitoring.overview.read",
    ],
}

# ── Amol Dairy Kalleh Factory ─────────────────────────────────────────────────

AMOL_DAIRY_FACTORY: dict = {
    "code":                   "AMOL_DAIRY_KALLEH",
    "name":                   "Amol Dairy Kalleh Factory",
    "legal_name":             "Kalleh Amol Dairy Products Co.",
    "city":                   "Amol",
    "province":               "Mazandaran",
    "country":                "Iran",
    "address":                "Industrial Zone, Amol, Mazandaran Province, Iran",
    "latitude":               36.4691,
    "longitude":              52.3564,
    "timezone":               "Asia/Tehran",
    "industry":               "Dairy / Food Manufacturing",
    "factory_type":           "Production Plant",
    "production_lines_count": 8,
    "nominal_power_kw":       4500.0,
    "contract_demand_kw":     4000.0,
    "main_voltage_level":     "20kV",
    "is_active":              True,
    "description": (
        "Amol Dairy Kalleh is a large-scale dairy production and processing facility "
        "in the Mazandaran province of Iran. It operates 8 production lines covering "
        "pasteurized milk, UHT products, yogurt, butter, and cheese. "
        "Connected to the regional 20kV grid with a contract demand of 4 MW."
    ),
}

# ── Demo users (one per new role) ─────────────────────────────────────────────

DEMO_USERS: list[dict] = [
    {"email": "ceo@example.com",                "full_name": "Demo CEO",                "password": "Demo@2024!", "role": "CEO"},
    {"email": "energy_manager@example.com",     "full_name": "Demo Energy Manager",     "password": "Demo@2024!", "role": "Energy Manager"},
    {"email": "technical_manager@example.com",  "full_name": "Demo Technical Manager",  "password": "Demo@2024!", "role": "Technical Manager"},
    {"email": "technical_user@example.com",     "full_name": "Demo Technical User",     "password": "Demo@2024!", "role": "Technical User"},
    {"email": "automation_manager@example.com", "full_name": "Demo Automation Manager", "password": "Demo@2024!", "role": "Automation Manager"},
    {"email": "automation_user@example.com",    "full_name": "Demo Automation User",    "password": "Demo@2024!", "role": "Automation User"},
    {"email": "operator@example.com",           "full_name": "Demo Operator",           "password": "Demo@2024!", "role": "Operator"},
    {"email": "demo@example.com",               "full_name": "Demo User",               "password": "Demo@2024!", "role": "Demo User"},
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def _upsert_role(db: Session, data: dict) -> Role:
    role = db.query(Role).filter_by(name=data["name"]).first()
    if role is None:
        role = Role(**data)
        db.add(role)
        db.flush()
        logger.debug("Created role: %s", data["name"])
    return role


def _upsert_permission(db: Session, data: dict) -> Permission:
    perm = db.query(Permission).filter_by(name=data["name"]).first()
    if perm is None:
        perm = Permission(**data)
        db.add(perm)
        db.flush()
        logger.debug("Created permission: %s", data["name"])
    return perm


def _assign_role_permission(db: Session, role: Role, perm: Permission) -> None:
    exists = (
        db.query(RolePermission)
        .filter_by(role_id=role.id, permission_id=perm.id)
        .first()
    )
    if exists is None:
        db.add(RolePermission(role_id=role.id, permission_id=perm.id))
        logger.debug("Assigned %s -> %s", role.name, perm.name)


def _assign_user_role(db: Session, user: User, role: Role) -> None:
    exists = db.query(UserRole).filter_by(user_id=user.id, role_id=role.id).first()
    if exists is None:
        db.add(UserRole(user_id=user.id, role_id=role.id))
        logger.debug("Assigned role %s to %s", role.name, user.email)


def _assign_user_factory(
    db: Session,
    user: User,
    factory: Factory,
    access_level: str = "admin",
    is_default: bool = True,
) -> None:
    exists = (
        db.query(UserFactoryAccess)
        .filter_by(user_id=user.id, factory_id=factory.id)
        .first()
    )
    if exists is None:
        db.add(
            UserFactoryAccess(
                user_id=user.id,
                factory_id=factory.id,
                access_level=access_level,
                is_default=is_default,
            )
        )
        logger.debug("Assigned factory %s to %s", factory.code, user.email)


# ── Public seed functions ─────────────────────────────────────────────────────

def seed_roles(db: Session) -> dict[str, Role]:
    return {d["name"]: _upsert_role(db, d) for d in ALL_ROLES}


def seed_permissions(db: Session) -> dict[str, Permission]:
    return {d["name"]: _upsert_permission(db, d) for d in ALL_PERMISSIONS}


def seed_role_permissions(
    db: Session,
    roles: dict[str, Role],
    permissions: dict[str, Permission],
) -> None:
    for role_name, perm_names in ALL_ROLE_PERMISSIONS.items():
        role = roles.get(role_name)
        if role is None:
            continue
        for perm_name in perm_names:
            perm = permissions.get(perm_name)
            if perm is None:
                continue
            _assign_role_permission(db, role, perm)
    db.flush()


def seed_admin_user(
    db: Session,
    email: str,
    password: str,
    roles: dict[str, Role],
) -> User:
    user = db.query(User).filter_by(email=email).first()
    if user is None:
        user = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name="System Admin",
            is_active=True,
            is_superuser=True,
        )
        db.add(user)
        db.flush()
        logger.info("Created admin user: %s", email)

    # Assign both legacy and new super-admin roles
    for role_name in ("admin", "Super Admin"):
        role = roles.get(role_name)
        if role:
            _assign_user_role(db, user, role)
    db.flush()
    return user


def seed_factory(db: Session) -> Factory:
    factory = db.query(Factory).filter_by(code=AMOL_DAIRY_FACTORY["code"]).first()
    if factory is None:
        factory = Factory(**AMOL_DAIRY_FACTORY)
        db.add(factory)
        db.flush()
        logger.info("Created factory: %s", AMOL_DAIRY_FACTORY["name"])
    return factory


def seed_demo_users(
    db: Session,
    roles: dict[str, Role],
    factory: Factory,
) -> list[User]:
    created: list[User] = []
    for spec in DEMO_USERS:
        user = db.query(User).filter_by(email=spec["email"]).first()
        if user is None:
            user = User(
                email=spec["email"],
                full_name=spec["full_name"],
                hashed_password=get_password_hash(spec["password"]),
                is_active=True,
                is_superuser=False,
            )
            db.add(user)
            db.flush()
            logger.info("Created demo user: %s (%s)", spec["email"], spec["role"])

        role = roles.get(spec["role"])
        if role:
            _assign_user_role(db, user, role)

        _assign_user_factory(db, user, factory, access_level="viewer", is_default=True)
        created.append(user)
    db.flush()
    return created


def run_seed(
    db: Session,
    admin_email: Optional[str] = None,
    admin_password: Optional[str] = None,
    seed_demos: bool = True,
) -> None:
    """Master seed: idempotent. Safe to run on an already-seeded DB."""
    roles       = seed_roles(db)
    permissions = seed_permissions(db)
    seed_role_permissions(db, roles, permissions)

    admin: Optional[User] = None
    if admin_email and admin_password:
        admin = seed_admin_user(db, admin_email, admin_password, roles)

    factory = seed_factory(db)

    if admin:
        _assign_user_factory(db, admin, factory, access_level="admin", is_default=True)
        db.flush()

    if seed_demos:
        seed_demo_users(db, roles, factory)

    db.commit()
    logger.info("Seed complete")
