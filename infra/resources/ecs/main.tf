data "aws_region" "current" { }

data "aws_ecr_image" "web" {
  repository_name = var.ecr_web_repository_name
  most_recent = true
}

data "aws_ecr_image" "api" {
  repository_name = var.ecr_api_repository_name
  most_recent = true
}

resource "aws_ecs_cluster" "ecs-cluster" {
  name = "${var.name_prefix}-ecs-cluster"
}

resource "aws_ecs_task_definition" "web" {
  family = "web-service"

  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu = 1024
  memory = 2048

  execution_role_arn = var.ecs_execution_role_arn
  task_role_arn = var.ecs_web_task_role_arn

  container_definitions = jsonencode([
    {
      name = "web-container"
      image = data.aws_ecr_image.web.image_uri
      cpu = 10
      memory = 512
      portMappings = [
          {  containerPort = var.web_port, hostPort = var.web_port }
      ]
      environment = [
          {  name = "API_BASE_URL",   value = var.web_env_api_base_url },
          {  name = "AWS_REGION",   value = data.aws_region.current.region },
          {  name = "AWS_SECRET_MANAGER_SECRET_NAME",  value = var.web_env_secret_manager_secret_name },
          {  name = "AWS_S3_BUCKET_NAME",  value = var.web_env_s3_bucket_name },
          {  name = "AWS_CLOUDFRONT_DOMAIN",  value = var.web_env_cloudfront_domain },
      ]
      essential = true
      logConfiguration = {
          logDriver =  "awslogs",
          options =  {
              "awslogs-group" =  "/ecs/web",
              "awslogs-region" =  data.aws_region.current.region,
              "awslogs-stream-prefix" =  "web"
          }
      }
    },
    {
      name = "xray-daemon"
      image = "amazon/aws-xray-daemon"
      portMappings = [
        {
          containerPort = 2000
          protocol = "udp"
        }
      ]
      essential = false
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/xray/web"
          "awslogs-region"        = data.aws_region.current.region
          "awslogs-stream-prefix" = "xray"
        }
      }
    }
  ])

  runtime_platform {
    cpu_architecture        = "X86_64"
    operating_system_family = "LINUX"
  }

  depends_on = [ aws_cloudwatch_log_group.web ]
}

resource "aws_ecs_service" "web" {
  name = "${var.name_prefix}-ecs-web-service"

  cluster = aws_ecs_cluster.ecs-cluster.id
  task_definition = aws_ecs_task_definition.web.id

  desired_count = var.ecs_web_desired_count
  
  launch_type = "FARGATE"
  scheduling_strategy = "REPLICA"

  lifecycle {
    ignore_changes = [ task_definition ]
  }

  network_configuration {
    assign_public_ip = false
    subnets = var.ecs_subnet_ids
    security_groups = var.ecs_web_sg_ids
  }

  load_balancer {
    target_group_arn = var.target_group_web_arn
    container_name = "web-container"
    container_port = var.web_port
  }
}


#API
resource "aws_ecs_task_definition" "api" {
  family = "api-service"

  requires_compatibilities = ["FARGATE"]
  network_mode = "awsvpc"
  cpu = 1024
  memory = 2048

  task_role_arn = var.ecs_api_task_role_arn
  execution_role_arn = var.ecs_execution_role_arn

  container_definitions = jsonencode([
    {
      name = "api-container"
      image = data.aws_ecr_image.api.image_uri
      cpu = 10
      memory = 512

      portMappings = [
          {
              containerPort = var.api_port
              hostPort = var.api_port
          }
      ]

      environment = [
          { name = "NODE_ENV",             value = "production" },
          { name = "RDS_PROXY_ENDPOINT",   value = var.rds_proxy_endpoint },
          { name = "REDIS_CLIENT_URL",     value = var.redis_client_url },
          { name = "DB_USER",              value = var.db_user },
          { name = "DB_NAME",              value = var.db_name },
          { name = "DB_PORT",              value = tostring(var.db_port) },
          { name = "GOOGLE_REDIRECT_URI",  value = var.google_redirect_uri },
          { name = "WEB_APP_URL",          value = var.web_app_url },
          { name = "AWS_DEFAULT_REGION",   value = data.aws_region.current.region },
          { name = "AWS_XRAY_ENABLED",   value = tostring(var.ecs_api_aws_xray_enabled) },
          { name = "AWS_XRAY_SERVICE_NAME",   value = var.ecs_api_aws_xray_service_name },
      ]

      secrets = [
          { name = "ACCESS_SECRET",         valueFrom = "${var.secret_manager_arn}:ACCESS_SECRET::" },
          { name = "GOOGLE_CLIENT_ID",      valueFrom = "${var.secret_manager_arn}:GOOGLE_CLIENT_ID::" },
          { name = "GOOGLE_CLIENT_SECRET",  valueFrom = "${var.secret_manager_arn}:GOOGLE_CLIENT_SECRET::" },
      ]

      essential = true
      logConfiguration = {
          logDriver =  "awslogs",
          options =  {
              "awslogs-group" =  "/ecs/api",
              "awslogs-region" =  data.aws_region.current.region,
              "awslogs-stream-prefix" =  "api"
          }
      }
    },
    {
      name = "xray-daemon"
      image = "amazon/aws-xray-daemon"
      portMappings = [
        {
          containerPort = 2000
          protocol = "udp"
        }
      ]
      essential = false
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/xray/api"
          "awslogs-region"        = data.aws_region.current.region
          "awslogs-stream-prefix" = "xray"
        }
      }
    }
  ])

  runtime_platform {
    cpu_architecture        = "X86_64"
    operating_system_family = "LINUX"
  }

  depends_on = [ 
    aws_cloudwatch_log_group.api,
    aws_cloudwatch_log_group.xray-api
  ]
}

resource "aws_ecs_service" "api" {
  name = "${var.name_prefix}-ecs-api-service"

  cluster = aws_ecs_cluster.ecs-cluster.id
  task_definition = aws_ecs_task_definition.api.id

  enable_execute_command = true

  desired_count = var.ecs_api_desired_count

  launch_type = "FARGATE"
  scheduling_strategy = "REPLICA"

  lifecycle {
    ignore_changes = [ task_definition ]
  }

  network_configuration {
    assign_public_ip = false
    subnets = var.ecs_subnet_ids
    security_groups = var.ecs_api_sg_ids
  }

  load_balancer {
    target_group_arn = var.target_group_api_arn
    container_name = "api-container"
    container_port =  var.api_port
  }
}

resource "aws_cloudwatch_log_group" "web" {
  name = "/ecs/web"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "api" {
  name = "/ecs/api"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "xray-web" {
  name = "/ecs/xray/web"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "xray-api" {
  name = "/ecs/xray/api"
  retention_in_days = 7
}