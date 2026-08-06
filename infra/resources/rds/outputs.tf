output "cluster_endpoint" {
  description = "Writer endpoint for the Aurora cluster"
  value       = aws_rds_cluster.aurora_rds_cluster.endpoint
}

output "cluster_reader_endpoint" {
  description = "Reader endpoint for the Aurora cluster"
  value       = aws_rds_cluster.aurora_rds_cluster.reader_endpoint
}

output "cluster_identifier" {
  value = aws_rds_cluster.aurora_rds_cluster.cluster_identifier
}

output "cluster_port" {
  value = aws_rds_cluster.aurora_rds_cluster.port
}

output "master_user_secret_arn" {
  description = "ARN of the Secrets Manager secret holding master credentials"
  value       = aws_rds_cluster.aurora_rds_cluster.master_user_secret[0].secret_arn
}

output "proxy_endpoint" {
  description = "RDS Proxy endpoint — use this in the app instead of the cluster endpoint"
  value = aws_db_proxy.this.endpoint
}