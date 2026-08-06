variable "name_prefix" {
  description = "Prefix applied to all resource names"
  type        = string
}

variable "az" {
  description = "List of availability zones for the Aurora cluster"
  type        = list(string)
}

variable "postgresql_version" {
  description = "Aurora PostgreSQL engine version"
  type        = string
}

variable "db_name" {
  description = "Initial database name"
  type        = string
}

variable "db_user" {
  description = "Master username for the Aurora cluster"
  type        = string
}

variable "kms_key_arn" {
  description = "KMS key ARN for storage and secret encryption"
  type        = string
}

variable "cluster_security_group_id" {
  description = "Security group ID to attach to the RDS cluster"
  type        = string
}

variable "proxy_security_group_id" {
  description = "Security group ID to attach to the RDS Proxy"
  type        = string
}

variable "private_db_subnet_ids" {
  description = "Private data subnet IDs for the DB subnet group"
  type        = list(string)
}

variable "iam_role_rds_proxy_id" {
  type = string
}

variable "iam_role_rds_proxy_arn" {
  type = string
}

variable "iam_role_ecs_task_id" {
  type = string
}