resource "aws_xray_sampling_rule" "exclude_health_check" {
  rule_name = "exclude-health-check"
  priority       = 1
  reservoir_size = 0
  fixed_rate     = 0
  url_path       = "/api/health"
  http_method    = "GET"
  host           = "*"
  service_name   = "*"
  service_type   = "*"
  resource_arn   = "*"
  version        = 1
}