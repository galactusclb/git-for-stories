#!/bin/sh
set -e

# Generate RDS IAM auth token when running on AWS (RDS_PROXY_ENDPOINT set)
if [ -n "$RDS_PROXY_ENDPOINT" ]; then
    echo "Generating RDS IAM auth token..."
    TOKEN=$(node -e "
        const { RDSSigner } = require('@aws-sdk/rds-signer');
        const signer = new RDSSigner({
            region: process.env.AWS_REGION,
            hostname: process.env.RDS_PROXY_ENDPOINT,
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USER,
        });
        signer.getAuthToken().then(t => process.stdout.write(t));
    ")
    export DATABASE_URL="postgresql://${DB_USER}:${TOKEN}@${RDS_PROXY_ENDPOINT}:${DB_PORT:-5432}/${DB_NAME}?sslmode=require"
fi

echo "Running Prisma migrations..."
npx prisma migrate deploy

exec "$@"
