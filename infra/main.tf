provider "aws" {
  profile = "bit"
  region  = var.region

  default_tags {
    tags = var.common_tags
  }
}

module "kms" {
  source = "./resources/kms"

  name_prefix = var.name_prefix
}

module "iam" {
  source = "./resources/iam"

  kms_key_arn = module.kms.key_arn
  name_prefix = var.name_prefix
  db_user     = var.db_user
  cloudfront_arn = module.cloudfront.cloudfront_distribution_arn
  s3_bucket_arn = module.s3.s3_bucket_arn
}

module "vpc" {
  source = "./resources/vpc"

  vpc_name           = var.vpc_name
  availability_zones = var.availability_zones
  vpc_cidr           = var.vpc_cidr
  subnets            = var.subnets
}

module "security_groups" {
  source = "./resources/security-groups"

  vpc_id      = module.vpc.vpc_id
  name_prefix = var.name_prefix
  api_port    = var.api_port
  web_port    = var.web_port
  redis_port  = var.redis_port
}

module "rds" {
  source = "./resources/rds"

  name_prefix               = var.name_prefix
  az                        = var.availability_zones
  postgresql_version        = var.postgresql_version
  db_name                   = var.db_name
  db_user                   = var.db_user
  kms_key_arn               = module.kms.key_arn
  cluster_security_group_id = module.security_groups.rds_cluster_sg_id
  proxy_security_group_id   = module.security_groups.rds_proxy_sg_id
  private_db_subnet_ids     = module.vpc.private_data_subnet_ids
  iam_role_rds_proxy_id     = module.iam.rds_proxy_role_id
  iam_role_rds_proxy_arn    = module.iam.rds_proxy_role_arn
  iam_role_ecs_task_id      = module.iam.ecs_api_task_role_id
}

module "elasticache-redis" {
  source = "./resources/elasticache-redis"

  name_prefix = var.name_prefix
  redis_port = var.redis_port
  kms_key_arn = module.kms.key_arn
  private_subnet_ids = module.vpc.private_data_subnet_ids
  redis_sg_ids = [module.security_groups.elasticache_sg_id]
}

module "alb" {
  source = "./resources/alb"

  vpc_id = module.vpc.vpc_id
  name_prefix = var.name_prefix
  web_port = var.web_port
  api_port = var.api_port
  security_groups_ids = [ module.security_groups.alb_sg_id ]
  public_subnets_ids = module.vpc.public_subnet_ids
}

module "ecs" {
  source = "./resources/ecs"

  name_prefix = var.name_prefix
  ecs_subnet_ids = module.vpc.private_compute_subnet_ids
  ecs_execution_role_arn = module.iam.execution_role_arn
  ecs_api_task_role_arn = module.iam.ecs_api_task_role_arn
  ecs_web_task_role_arn = module.iam.ecs_web_task_role_arn

  ecr_web_repository_name = var.ecr_web_repository_name
  web_port = var.web_port
  target_group_web_arn = module.alb.alb_tg_web_arn
  ecs_web_sg_ids = [module.security_groups.ecs_web_sg_id]
  web_env_api_base_url = "http://${module.alb.alb_dns_name}/api"
  web_env_secret_manager_secret_name = var.secret_manager_name
  web_env_cloudfront_domain = module.cloudfront.cloudfront_domain_name
  web_env_s3_bucket_name = module.s3.s3_bucket_name

  ecr_api_repository_name = var.ecr_api_repository_name
  api_port = var.api_port
  target_group_api_arn = module.alb.alb_tg_api_arn
  ecs_api_sg_ids = [module.security_groups.ecs_api_sg_id]
  ecs_api_aws_xray_enabled = var.ecs_api_aws_xray_enabled
  ecs_api_aws_xray_service_name = var.ecs_api_aws_xray_service_name

  db_name = var.db_name
  db_port = module.rds.cluster_port
  db_user = var.db_user
  rds_proxy_endpoint = module.rds.proxy_endpoint
  redis_client_url = module.elasticache-redis.primary_endpoint_address

  web_app_url = "http://${module.alb.alb_dns_name}"
  google_redirect_uri = "http://${module.alb.alb_dns_name}/api/auth/google/callback"
  secret_manager_arn = module.secret-manager.arn
}

module "xray" {
  source = "./resources/xray"

  name_prefix = var.name_prefix
}

module "s3" {
  source = "./resources/s3"

  s3_bucket_name = var.s3_bucket_name
}

module "cloudfront" {
  source = "./resources/cloudfront"

  bucket_regional_domain_name = module.s3.s3_bucket_regional_domain_name
  bucket_id                   = module.s3.s3_bucket_id
  bucket_arn                  = module.s3.s3_bucket_arn
}

module "secret-manager" {
  source = "./resources/secret-manager"

  secret_manager_name = var.secret_manager_name
  recovery_window_in_days = var.secret_manager_recovery_window_in_days
  secrets_object = {
    S3_BUCKET_NAME = module.s3.s3_bucket_name
    ACCESS_SECRET = var.access_secret
    GOOGLE_CLIENT_ID = var.google_client_id
    GOOGLE_CLIENT_SECRET = var.google_client_secret
  }
}