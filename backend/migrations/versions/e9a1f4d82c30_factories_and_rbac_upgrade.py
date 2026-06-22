"""factories and rbac upgrade

Adds:
  - factories table (business-level factory entities in app/auth DB)
  - user_factory_access table (user <-> factory many-to-many with access_level)

Does NOT touch monitoring DB (Kalleh_Amol_DB / MONITORING_DATABASE_URL).
Does NOT drop or modify any existing table.

Revision ID: e9a1f4d82c30
Revises:     63606a552a48
Create Date: 2026-06-15
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "e9a1f4d82c30"
down_revision = "63606a552a48"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # -- factories -------------------------------------------------------------
    op.create_table(
        "factories",
        sa.Column("id",                     sa.Integer(),     nullable=False),
        sa.Column("code",                   sa.String(50),    nullable=False),
        sa.Column("name",                   sa.String(255),   nullable=False),
        sa.Column("legal_name",             sa.String(255),   nullable=True),
        sa.Column("company_id",             sa.Integer(),     nullable=True),
        # Location
        sa.Column("city",                   sa.String(100),   nullable=True),
        sa.Column("province",               sa.String(100),   nullable=True),
        sa.Column("country",                sa.String(100),   nullable=True),
        sa.Column("address",                sa.String(500),   nullable=True),
        sa.Column("latitude",               sa.Float(),       nullable=True),
        sa.Column("longitude",              sa.Float(),       nullable=True),
        sa.Column("timezone",               sa.String(50),    nullable=True),
        # Classification
        sa.Column("industry",               sa.String(100),   nullable=True),
        sa.Column("factory_type",           sa.String(100),   nullable=True),
        # Operational specs
        sa.Column("production_lines_count", sa.Integer(),     nullable=True),
        sa.Column("nominal_power_kw",       sa.Float(),       nullable=True),
        sa.Column("contract_demand_kw",     sa.Float(),       nullable=True),
        sa.Column("main_voltage_level",     sa.String(20),    nullable=True),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.Column("description", sa.Text(), nullable=True),
        # Timestamps
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_factories_id",   "factories", ["id"],   unique=False)
    op.create_index("ix_factories_code", "factories", ["code"], unique=True)
    op.create_index("ix_factories_name", "factories", ["name"], unique=False)

    # -- user_factory_access ---------------------------------------------------
    op.create_table(
        "user_factory_access",
        sa.Column("user_id",    sa.Integer(),  nullable=False),
        sa.Column("factory_id", sa.Integer(),  nullable=False),
        sa.Column(
            "access_level",
            sa.String(50),
            nullable=False,
            server_default=sa.text("'viewer'"),
        ),
        sa.Column(
            "is_default",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"],    ["users.id"],     ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["factory_id"], ["factories.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", "factory_id"),
        sa.UniqueConstraint("user_id", "factory_id", name="uq_user_factory"),
    )


def downgrade() -> None:
    op.drop_table("user_factory_access")
    op.drop_index("ix_factories_name", table_name="factories")
    op.drop_index("ix_factories_code", table_name="factories")
    op.drop_index("ix_factories_id",   table_name="factories")
    op.drop_table("factories")
