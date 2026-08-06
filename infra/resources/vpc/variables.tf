variable "vpc_name" {
  type = string
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC"
}

variable "subnets" {
  type        = map(list(string))
  description = "Map of subnet tiers to lists of CIDR blocks"
}

variable "availability_zones" {
  type        = list(string)
  description = "List of availability zones to deploy subnets into"
}