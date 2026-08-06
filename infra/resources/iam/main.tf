data "aws_region" "current" { }
data "aws_caller_identity" "current" { }

# Task Execution Role - used by ECS agent to start the container
resource "aws_iam_role" "ecs_task_execution" {
  name = "${var.name_prefix}-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
        Effect = "Allow"
        Action = "sts:AssumeRole"
        Principal = {
            Service = "ecs-tasks.amazonaws.com"
        }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_managed" {
  role = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_task_execution_secrets" {
  name = "${var.name_prefix}-ecs-execution-secrets"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
        {
            Effect = "Allow"
            Action = ["secretsmanager:GetSecretValue"]
            Resource = "*"
        },
        {
          Effect = "Allow"
          Action = ["kms:Decrypt"]
          Resource = var.kms_key_arn
        }
    ]
  })
}


#Task Role - used by the running application
resource "aws_iam_role" "ecs_api_task" {
  name = "${var.name_prefix}-ecs-api-task-role"
  description = "Used by the running API application"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = "sts:AssumeRole"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "ecs_api_task" {
  name = "${var.name_prefix}-ecs-api-task-policy"
  role = aws_iam_role.ecs_api_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt", 
          "kms:GenerateDataKey"
        ]
        Resource = var.kms_key_arn
      },
      {
        Effect = "Allow"
        Action = [ "rds-db:connect" ]
        Resource = "arn:aws:rds-db:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:dbuser:*/${var.db_user}"
      },
      {
        Effect = "Allow"
        Action = [
          "ssmmessages:CreateControlChannel",
          "ssmmessages:CreateDataChannel",
          "ssmmessages:OpenControlChannel",
          "ssmmessages:OpenDataChannel"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_api_xray" {
  role = aws_iam_role.ecs_api_task.name
  policy_arn = "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"
}

# Task running role for web ecs
resource "aws_iam_role" "ecs_web_task" {
  name = "${var.name_prefix}-ecs-web-task-role"
  description = "Used by the running WEB application"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "sts:AssumeRole"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "ecs_web_task" {
  name = "${var.name_prefix}-ecs-web-task-policy"
  role = aws_iam_role.ecs_web_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = ["${var.s3_bucket_arn}/*"]
      },
      {
        Effect = "Allow"
        Action = ["cloudfront:CreateInvalidation"]
        Resource = [var.cloudfront_arn]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_web_xray" {
  role = aws_iam_role.ecs_web_task.name
  policy_arn = "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"
}

# RDS Proxy
# Extract role policies to the rds/main.tf to avoid the circualr dependancy with rds/main.tf
resource "aws_iam_role" "rds_proxy" {
  name = "${var.name_prefix}-rds-proxy-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "sts:AssumeRole"
        Principal = {
          Service = "rds.amazonaws.com"
        }
      }
    ]
  })
}