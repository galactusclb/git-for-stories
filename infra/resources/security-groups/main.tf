# ALB
resource "aws_security_group" "alb" {
  vpc_id = var.vpc_id
  name = "${var.name_prefix}-sg-alb"
  description = "ALB: HTTP/HTTPS from internet"

  tags = {
    Name = "${var.name_prefix}-sg-alb"
  }
}

resource "aws_vpc_security_group_ingress_rule" "allow_http" {
  security_group_id = aws_security_group.alb.id

  cidr_ipv4 = "0.0.0.0/0"
  from_port = 80
  to_port = 80
  ip_protocol = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "allow_https" {
  security_group_id = aws_security_group.alb.id

  cidr_ipv4 = "0.0.0.0/0"
  from_port = 443
  to_port = 443
  ip_protocol = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ip4" {
  security_group_id = aws_security_group.alb.id

  cidr_ipv4 = "0.0.0.0/0"
  ip_protocol = -1
}


# SG for web ECS
resource "aws_security_group" "ecs_web" {
  vpc_id = var.vpc_id
  name = "${var.name_prefix}-sg-ecs-web"
  description = "ECS Web: from ALB only"

  tags = {
    Name = "${var.name_prefix}-sg-ecs-web"
  }
}

resource "aws_vpc_security_group_ingress_rule" "ecs_web_from_alb" {
  security_group_id = aws_security_group.ecs_web.id

  referenced_security_group_id = aws_security_group.alb.id
  from_port = var.web_port
  to_port = var.web_port
  ip_protocol = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "ecs_web_egress" {
  security_group_id = aws_security_group.ecs_web.id

  cidr_ipv4 = "0.0.0.0/0"
  ip_protocol = -1
}

# SG for api ECS
resource "aws_security_group" "ecs_api" {
  vpc_id = var.vpc_id
  name = "${var.name_prefix}-sg-ecs-api"
  description = "ECS API: from ALB and ECS Web"

  tags = {
    Name = "${var.name_prefix}-sg-ecs-api"
  }
}

resource "aws_vpc_security_group_ingress_rule" "ecs_api_from_alb" {
  security_group_id = aws_security_group.ecs_api.id
  
  referenced_security_group_id = aws_security_group.alb.id
  from_port = var.api_port
  to_port = var.api_port
  ip_protocol = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "ecs_api_from_ecs_web" {
  security_group_id = aws_security_group.ecs_api.id
  
  referenced_security_group_id = aws_security_group.ecs_web.id
  from_port = var.api_port
  to_port = var.api_port
  ip_protocol = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "ecs_api_egress" {
  security_group_id = aws_security_group.ecs_api.id

  cidr_ipv4 = "0.0.0.0/0"
  ip_protocol = -1
}

# RDS Proxy — ECS API only
resource "aws_security_group" "rds_proxy" {
  vpc_id = var.vpc_id
  name        = "${var.name_prefix}-sg-rds-proxy"
  description = "RDS Proxy: from ECS API only"

  tags = {
    Name = "${var.name_prefix}-sg-rds-proxy"
  }
}

resource "aws_vpc_security_group_ingress_rule" "rds_proxy_from_ecs_api" {
  security_group_id = aws_security_group.rds_proxy.id

  referenced_security_group_id = aws_security_group.ecs_api.id
  from_port = 5432
  to_port = 5432
  ip_protocol = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "rds_proxy_egress" {
  security_group_id = aws_security_group.rds_proxy.id

  cidr_ipv4 = "0.0.0.0/0"
  ip_protocol = -1
}

# Aurora — RDS Proxy only
resource "aws_security_group" "rds_cluster" {
  vpc_id      = var.vpc_id
  name        = "${var.name_prefix}-sg-aurora"
  description = "RDS Cluster: from RDS Proxy only"
  tags = { Name = "${var.name_prefix}-sg-aurora" }
}

resource "aws_vpc_security_group_ingress_rule" "aurora_from_proxy" {
  security_group_id            = aws_security_group.rds_cluster.id
  
  referenced_security_group_id = aws_security_group.rds_proxy.id
  from_port = 5432
  to_port = 5432
  ip_protocol = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "aurora_egress" {
  security_group_id = aws_security_group.rds_cluster.id

  cidr_ipv4 = "0.0.0.0/0"
  ip_protocol = -1
}

# ElastiCache — ECS API only
resource "aws_security_group" "elasticache" {
  vpc_id      = var.vpc_id
  name        = "${var.name_prefix}-sg-elasticache"
  description = "ElastiCache: from ECS API only"
  tags = { Name = "${var.name_prefix}-sg-elasticache" }
}

resource "aws_vpc_security_group_ingress_rule" "elasticache_from_api" {
  security_group_id            = aws_security_group.elasticache.id

  referenced_security_group_id = aws_security_group.ecs_api.id
  from_port = var.redis_port
  to_port = var.redis_port
  ip_protocol = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "elasticache_egress" {
  security_group_id = aws_security_group.elasticache.id

  cidr_ipv4 = "0.0.0.0/0"
  ip_protocol = -1
}