variable "name_prefix" {
  type = string
}

variable "ecs_api_task_role_arn" {
  type = string
}

variable "ecs_web_task_role_arn" {
  type = string
}

variable "ecs_execution_role_arn" {
  type = string
}

variable "ecr_web_repository_name" {
  type = string
}

variable "ecr_api_repository_name" {
  type = string
}

variable "web_port" {
  type    = number
}

variable "api_port" {
  type    = number
}

variable "db_port" {
  type    = number
  default = 5432
}

variable "ecs_web_desired_count" {
  type    = number
  default = 1
}

variable "ecs_api_desired_count" {
  type    = number
  default = 1
}

variable "ecs_subnet_ids" {
  type = list(string)
}

variable "ecs_web_sg_ids" {
  type = list(string)
}

variable "ecs_api_sg_ids" {
  type = list(string)
}

variable "target_group_web_arn" {
  type = string
}

variable "target_group_api_arn" {
  type = string
}

variable "rds_proxy_endpoint" {
  type = string
}

variable "redis_client_url" {
  type = string
}

variable "db_user" {
  type = string
}

variable "db_name" {
  type = string
}

variable "google_redirect_uri" {
  type = string
}

variable "web_app_url" {
  type = string
}

variable "secret_manager_arn" {
  type = string
}

variable "ecs_api_aws_xray_enabled" {
  type = bool
}

variable "ecs_api_aws_xray_service_name" {
  type = string
}

variable "web_env_api_base_url" {
  type = string
}

variable "web_env_secret_manager_secret_name" {
  type = string
}

variable "web_env_cloudfront_domain" {
  type = string
}

variable "web_env_s3_bucket_name" {
  type = string
}