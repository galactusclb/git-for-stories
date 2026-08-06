variable "name_prefix" {
  description = "Prefix used for the KMS alias (alias/<name_prefix>)"
  type        = string
}

variable "deletion_window_in_days" {
  description = "Days to wait before deleting the key after destruction (7–30)"
  type        = number
  default     = 7
}