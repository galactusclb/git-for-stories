output "execution_role_arn" {
  description = "ARN of the ECS task execution role"
  value       = aws_iam_role.ecs_task_execution.arn
}

output "ecs_api_task_role_id" {
  description = "Id of the API ECS task role"
  value       = aws_iam_role.ecs_api_task.id
}

output "ecs_api_task_role_arn" {
  description = "ARN of the API ECS task role (runtime app permissions)"
  value       = aws_iam_role.ecs_api_task.arn
}

output "ecs_web_task_role_id" {
  description = "Id of the WEB ECS task role"
  value       = aws_iam_role.ecs_web_task.id
}

output "ecs_web_task_role_arn" {
  description = "ARN of the WEB ECS task role (runtime app permissions)"
  value       = aws_iam_role.ecs_web_task.arn
}

output "rds_proxy_role_id" {
  description = "Id of the ECS task role"
  value       = aws_iam_role.rds_proxy.id
}

output "rds_proxy_role_arn" {
  description = "ARN of the ECS task role (runtime app permissions)"
  value       = aws_iam_role.rds_proxy.arn
}
