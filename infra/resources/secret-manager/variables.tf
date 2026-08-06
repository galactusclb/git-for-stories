variable "secret_manager_name" {
  description = "Name of the Secrets Manager secret"
  type        = string
}

variable "secrets_object" {
  description = "Key-value pairs to store as the secret string"
  type        = map(string)
}

variable "recovery_window_in_days" {
  type = number
}