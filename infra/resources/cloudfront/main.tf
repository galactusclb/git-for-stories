data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

resource "aws_cloudfront_origin_access_control" "s3_oac" {
  name = "s3-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior = "always"
  signing_protocol = "sigv4"
}

resource "aws_cloudfront_distribution" "this" {
  enabled = true

  origin {
    domain_name = var.bucket_regional_domain_name
    origin_id = "s3-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.s3_oac.id
  }

  default_cache_behavior {
    target_origin_id = "s3-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    cache_policy_id = data.aws_cloudfront_cache_policy.caching_optimized.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.broswer_cache_headers.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
 
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

resource "aws_cloudfront_response_headers_policy" "broswer_cache_headers" {
  name = "browser-cache-policy"

  custom_headers_config {
    items {
      header = "Cache-Control"
      value = "public, max-age=31536000, immutable"
      override = false
    }
  }
}

resource "aws_s3_bucket_policy" "cloudfront_aoc" {
  bucket = var.bucket_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
        Effect = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action = "s3:GetObject"
        Resource = "${var.bucket_arn}/*"
        Condition = {
            StringEquals = {
                "AWS:SourceArn" = aws_cloudfront_distribution.this.arn
            }
        }
    }]
  })
}