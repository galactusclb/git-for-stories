resource "aws_ecr_repository" "launchzap-api" {
  name = "launchzap-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "launchzap-web" {
  name = "launchzap-web"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}


resource "aws_ecr_lifecycle_policy" "launchzap-api" {
  repository = aws_ecr_repository.launchzap-api.name

  policy = jsonencode({
    rules = [
        {
            rulePriority = 1
            description = "Keep last 10 images"
            selection = {
                tagStatus = "any"
                countType = "imageCountMoreThan"
                countNumber  = 10
            }
            action = {
                type = "expire"
            }
        }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "launchzap-web" {
  repository = aws_ecr_repository.launchzap-web.name

  policy = jsonencode({
    rules = [
        {
            rulePriority = 1
            description = "Keep last 10 images"
            selection = {
                tagStatus = "any"
                countType = "imageCountMoreThan"
                countNumber  = 10
            }
            action = {
                type = "expire"
            }
        }
    ]
  })
}