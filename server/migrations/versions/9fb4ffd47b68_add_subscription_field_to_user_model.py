"""Add subscription field to User model

Revision ID: 9fb4ffd47b68
Revises: 99f2f6606b4f
Create Date: 2024-10-12 19:23:52.352508

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9fb4ffd47b68'
down_revision = '99f2f6606b4f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('has_subscription', sa.Boolean(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('has_subscription')

    # ### end Alembic commands ###