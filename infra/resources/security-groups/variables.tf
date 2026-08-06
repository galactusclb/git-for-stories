variable "vpc_id" {
  description = "ID of the VPC in which all security groups will be created"
  type        = string
}

variable "name_prefix" {
  description = "Prefix applied to all security group names (e.g. launchwap-dev)"
  type        = string
}

variable "api_port" {
  description = "Port the API ECS service listens on"
  type        = number
}

variable "web_port" {
  description = "Port the web ECS service listens on"
  type        = number
}

variable "redis_port" {
  type    = number
}