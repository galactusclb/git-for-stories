#RDS Cluster
resource "aws_rds_cluster" "aurora_rds_cluster" {
    cluster_identifier = "${var.name_prefix}-aurora-rds-cluster"
    availability_zones = var.az
    engine = "aurora-postgresql"
    engine_mode = "provisioned"
    engine_version = var.postgresql_version
    database_name = var.db_name
    master_user_secret_kms_key_id = var.kms_key_arn
    manage_master_user_password = true
    master_username = var.db_user
    kms_key_id = var.kms_key_arn
    storage_encrypted = true

    db_subnet_group_name = aws_db_subnet_group.rds_subnet_grp.name
    vpc_security_group_ids = [ var.cluster_security_group_id ]
    backup_retention_period = 1
    skip_final_snapshot = true
    deletion_protection = false
    apply_immediately = true

    serverlessv2_scaling_configuration {
      min_capacity = 0.0
      max_capacity = 3.0
      seconds_until_auto_pause = 3600
    }

}

resource "aws_rds_cluster_instance" "this" {
  cluster_identifier = aws_rds_cluster.aurora_rds_cluster.id
  instance_class = "db.serverless"
  engine = aws_rds_cluster.aurora_rds_cluster.engine
  engine_version = aws_rds_cluster.aurora_rds_cluster.engine_version
  publicly_accessible = false
  monitoring_interval = 0
  performance_insights_enabled = true
}

resource "aws_db_subnet_group" "rds_subnet_grp" {
  name = "${var.name_prefix}-rds-subnet-group"
  subnet_ids = var.private_db_subnet_ids
}


#RDS Proxy
resource "aws_iam_role_policy" "rds_proxy" {
  role = var.iam_role_rds_proxy_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"]
        Resource = aws_rds_cluster.aurora_rds_cluster.master_user_secret[0].secret_arn
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = var.kms_key_arn
      },
    ]
  })
}

resource "aws_db_proxy" "this" {
  name = "${var.name_prefix}-rds-proxy"
  engine_family = "POSTGRESQL"
  role_arn = var.iam_role_rds_proxy_arn
  vpc_security_group_ids = [ var.proxy_security_group_id ]
  vpc_subnet_ids = var.private_db_subnet_ids
  idle_client_timeout = 1800
  require_tls = true

  auth {
    auth_scheme = "SECRETS"
    iam_auth    = "REQUIRED"
    secret_arn = aws_rds_cluster.aurora_rds_cluster.master_user_secret[0].secret_arn
  }
}

resource "aws_db_proxy_default_target_group" "this" {
  db_proxy_name = aws_db_proxy.this.name

  connection_pool_config {
    max_connections_percent = 100
    max_idle_connections_percent = 50
    connection_borrow_timeout = 120
  }

  lifecycle {
    replace_triggered_by = [ aws_db_proxy.this.id ]
  }
}

resource "aws_db_proxy_target" "this" {
  db_cluster_identifier = aws_rds_cluster.aurora_rds_cluster.id
  db_proxy_name = aws_db_proxy.this.name
  target_group_name = aws_db_proxy_default_target_group.this.name

  lifecycle {
    replace_triggered_by = [ aws_db_proxy.this.id ]
  }
}