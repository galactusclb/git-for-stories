resource "aws_lb" "this" {
  name = "${var.name_prefix}-alb"
  internal = false
  load_balancer_type = "application"
  security_groups = var.security_groups_ids
  subnets = var.public_subnets_ids
  ip_address_type = "ipv4"

  enable_deletion_protection = false
}

resource "aws_lb_listener" "this" {
  load_balancer_arn = aws_lb.this.arn
  port = 80
  protocol = "HTTP"

  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.tg-web.arn
  }
}

resource "aws_lb_listener_rule" "api-rule" {
  listener_arn = aws_lb_listener.this.id
  priority = 100

  action {
    type = "forward"
    target_group_arn = aws_lb_target_group.tg-api.arn
  }

  condition {
    path_pattern {
      values = ["/api", "/api/" ,"/api/*"]
    }
  }
}

resource "aws_lb_target_group" "tg-web" {
  name = "${var.name_prefix}-alb-tg-web"
  vpc_id = var.vpc_id
  target_type = "ip"
  protocol = "HTTP"
  port = var.web_port

  health_check {
    protocol = "HTTP"
    path = "/"
    port = var.web_port
  }
}

resource "aws_lb_target_group" "tg-api" {
  name = "${var.name_prefix}-alb-tg-api"
  vpc_id = var.vpc_id
  target_type = "ip"
  protocol = "HTTP"
  port = var.api_port

  health_check {
    protocol = "HTTP"
    path = "/api/health"
    port = var.api_port
  }
}