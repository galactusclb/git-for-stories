provider "aws" {
  profile = "bit"
  region  = "us-east-1"
}

module "iam" {
  source = "./iam"
}

module "ecr" {
  source = "./ecr"
}

module "s3" {
  source = "./s3"
}