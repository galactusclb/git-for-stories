output "vpc_id" {
  value = aws_vpc.this.id
}

output "vpc_cidr" {
  value = aws_vpc.this.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of public subnets (ALB)"
  value = [for k, v in aws_subnet.this : v.id if startswith(k, "public")]
}

output "private_compute_subnet_ids" {
  description = "IDs of private-compute subnets (ECS web + api)"
  value       = [for k, v in aws_subnet.this : v.id if startswith(k, "private-compute")]
}

output "private_data_subnet_ids" {
  description = "IDs of private-data subnets (Aurora, RDS Proxy, ElastiCache)"
  value       = [for k, v in aws_subnet.this : v.id if startswith(k, "private-data")]
}