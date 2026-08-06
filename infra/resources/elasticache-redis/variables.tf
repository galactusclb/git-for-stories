variable "name_prefix" {
  type = string
}

variable "redis_port" {
  type    = number
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "redis_sg_ids" {
  type = list(string)
}

variable "kms_key_arn" {
  type = string
}
