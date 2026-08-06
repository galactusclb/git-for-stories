resource "aws_secretsmanager_secret" "this" {
  name = var.secret_manager_name
  description = ""
  recovery_window_in_days = var.recovery_window_in_days
}

resource "aws_secretsmanager_secret_version" "this" {
  secret_id = aws_secretsmanager_secret.this.id

  secret_string = jsonencode(var.secrets_object)
}