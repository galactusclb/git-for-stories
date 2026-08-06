variable "name_prefix" {
  type = string
}

variable "security_groups_ids" {
  type = list(string)
}

variable "public_subnets_ids" {
  type = list(string)
}

variable "vpc_id" {
  type = string
}

variable "web_port" {
  type = number
}

variable "api_port" {
  type = number
}