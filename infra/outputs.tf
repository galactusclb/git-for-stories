# VPC
output "vpc_id" {
  value = module.vpc.vpc_id
}

output "vpc_cidr" {
  value = module.vpc.vpc_cidr
}

output "public_subnet_ids" {
  description = "IDs of public subnets (ALB)"
  value       = module.vpc.public_subnet_ids
}

output "private_compute_subnet_ids" {
  description = "IDs of private-compute subnets (ECS)"
  value       = module.vpc.private_compute_subnet_ids
}

output "private_data_subnet_ids" {
  description = "IDs of private-data subnets (Aurora, RDS Proxy, ElastiCache)"
  value       = module.vpc.private_data_subnet_ids
}

# IAM
output "ecs_execution_role_arn" {
  description = "ARN of the ECS task execution role"
  value       = module.iam.execution_role_arn
}

# KMS
output "kms_key_arn" {
  value = module.kms.key_arn
}

output "kms_key_id" {
  value = module.kms.key_id
}


# RDS
output "rds_cluster_endpoint" {
  description = "Writer endpoint for the Aurora cluster"
  value       = module.rds.cluster_endpoint
}

output "rds_cluster_reader_endpoint" {
  description = "Reader endpoint for the Aurora cluster"
  value       = module.rds.cluster_reader_endpoint
}

output "rds_cluster_port" {
  value = module.rds.cluster_port
}

output "rds_master_user_secret_arn" {
  description = "ARN of the Secrets Manager secret holding master credentials"
  value       = module.rds.master_user_secret_arn
}


# Elastic Cache Redis
output "elasticache_primary_endpoint_address" {
  description = "Primary node endpoint for read/write"
  value       = module.elasticache-redis.primary_endpoint_address
}

output "elasticache_reader_endpoint_address" {
  description = "Reader endpoint for load-balanced reads"
  value       = module.elasticache-redis.reader_endpoint_address
}

output "alb_dns_name" {
  value = module.alb.alb_dns_name
}

# S3
output "cloudfront_domain_name" {
  value = module.cloudfront.cloudfront_domain_name
}

output "s3_bucket_name" {
  value = module.s3.s3_bucket_name
}