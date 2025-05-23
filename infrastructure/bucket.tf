resource "aws_s3_bucket" "sam_bucket" {
  bucket = "${local.app_name}-sam-bucket"
}

resource "aws_s3_bucket" "messages" {
  bucket = "${local.app_name}-messages"
}
