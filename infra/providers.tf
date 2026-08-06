terraform {
  required_version = ">= 1.14.3"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket = "launchzap-tfstate"
    key = "prod/terraform.tfstate"
    region = "us-east-1"
    encrypt = true
    use_lockfile  = true
  }
}