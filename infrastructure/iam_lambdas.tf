resource "aws_iam_role" "lambda_role" {
  name = "${local.app_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_s3_policy" {
  name        = "lambda-s3-policy"
  description = "Policy for Lambda to access S3 buckets messages"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "s3:ListBucket",
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
        ],
        Effect = "Allow",
        Resource = [
          "${aws_s3_bucket.messages.arn}",
          "${aws_s3_bucket.messages.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_basic_execution_policy" {
  name        = "lambda-basic-execution-policy"
  description = "Basic execution policy for Lambda functions, including CloudWatch Logs access"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action : [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Effect : "Allow",
        Resource : "arn:aws:logs:*:*:*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_s3_policy_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_s3_policy.arn
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution_policy_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_basic_execution_policy.arn
}
