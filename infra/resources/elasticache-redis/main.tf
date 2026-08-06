resource "aws_elasticache_replication_group" "this" {
  replication_group_id = "${var.name_prefix}-redis-replication-grp"
  description = "Redis replication group"
  engine = "redis"
  engine_version = "7.1"
  node_type = "cache.t4g.micro"
  port = var.redis_port
  parameter_group_name = "default.redis7"
  num_cache_clusters = 1
  automatic_failover_enabled = false

  subnet_group_name = aws_elasticache_subnet_group.this.name
  security_group_ids = var.redis_sg_ids
  at_rest_encryption_enabled = true
  kms_key_id = var.kms_key_arn
  transit_encryption_enabled = true
}

resource "aws_elasticache_subnet_group" "this" {
  name = "${var.name_prefix}-redis-subnet-grp"
  subnet_ids = var.private_subnet_ids
}