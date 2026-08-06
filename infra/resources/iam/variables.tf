variable "name_prefix" {
  description = "Prefix applied to all IAM role and policy names"
  type        = string
}

variable "kms_key_arn" {
  description = "ARN of the KMS key the roles are allowed to decrypt with"
  type        = string
}

variable "db_user" {
  description = "Master username used to scope the rds-db:connect IAM permission"
  type = string
}

variable "s3_bucket_arn" {
  type = string
}

variable "cloudfront_arn" {
  type = string
}