variable "aws_region" {
  description = "The AWS region to deploy to"
}

variable "environment" {
  description = "The environment to deploy to"
}

locals {
  app_name = "${var.environment}-pp-place-du-village"
}
