#!/bin/bash
set -e

if ! terraform -chdir=infra output -raw cloudfront_domain_name > /dev/null 2>&1; then
  echo "✗ Run 'make infra-apply or make infra-refresh' first"
  exit 1
fi

CLOUDFRONT_DOMAIN=$(terraform -chdir=infra output -raw cloudfront_domain_name)
S3_BUCKET_NAME=$(terraform -chdir=infra output -raw s3_bucket_name)

cat > web/.env.infra <<EOF
NEXT_PUBLIC_CLOUDFRONT_DOMAIN=$CLOUDFRONT_DOMAIN
AWS_S3_BUCKET_NAME=$S3_BUCKET_NAME
EOF

echo "✓ web/.env.infra updated ✅"