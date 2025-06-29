"""Add is_verified column

Revision ID: 4516228e59f4
Revises: 9fccdd55db50
Create Date: 2025-06-18 20:15:47.845193

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4516228e59f4'
down_revision = '9fccdd55db50'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('hustles', schema=None) as batch_op:
        batch_op.add_column(sa.Column('updated_at', sa.DateTime(), nullable=True))

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_verified', sa.Boolean(), nullable=True))
        batch_op.add_column(sa.Column('verification_token', sa.String(length=100), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('verification_token')
        batch_op.drop_column('is_verified')

    with op.batch_alter_table('hustles', schema=None) as batch_op:
        batch_op.drop_column('updated_at')

    # ### end Alembic commands ###
