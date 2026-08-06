output "alb_sg_id" {
  description = "Security group ID of the Application Load Balancer"
  value       = aws_security_group.alb.id
}

output "ecs_web_sg_id" {
  description = "Security group ID of the web ECS service (Next.js)"
  value       = aws_security_group.ecs_web.id
}

output "ecs_api_sg_id" {
  description = "Security group ID of the API ECS service (Express)"
  value       = aws_security_group.ecs_api.id
}

output "rds_proxy_sg_id" {
  description = "Security group ID of the RDS Proxy"
  value       = aws_security_group.rds_proxy.id
}

output "rds_cluster_sg_id" {
  description = "Security group ID of the RDS cluster cluster"
  value       = aws_security_group.rds_cluster.id
}

output "elasticache_sg_id" {
  description = "Security group ID of the ElastiCache cluster"
  value       = aws_security_group.elasticache.id
}
