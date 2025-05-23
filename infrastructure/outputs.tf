output "s3_messages_bucket_arn" {
  value       = aws_s3_bucket.messages.arn
  description = "The ARN of the S3 bucket for the messages"
}
output "s3_sam_bucket_arn" {
  value       = aws_s3_bucket.sam_bucket.arn
  description = "The ARN of the S3 bucket for SAM deployment artifacts"
}

output "lambda_role_arn" {
  value       = aws_iam_role.lambda_role.arn
  description = "The ARN of the IAM role for the Lambda function"
}
