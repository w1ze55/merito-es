output "site_url" {
  description = "Endereço do frontend e da API"
  value       = "https://${aws_cloudfront_distribution.main.domain_name}"
}

output "ec2_instance_id" {
  description = "EC2 da API (acesso por aws ssm start-session)"
  value       = aws_instance.api.id
}

output "github_deploy_user" {
  description = "Usuário IAM cujas chaves vão para o GitHub Secrets"
  value       = aws_iam_user.github_deploy.name
}

output "github_variables" {
  description = "Variáveis do repositório usadas pelo .github/workflows/homolog.yml"
  value = {
    AWS_REGION                 = var.region
    ECR_REPOSITORY             = aws_ecr_repository.api.name
    EC2_INSTANCE_ID            = aws_instance.api.id
    S3_BUCKET                  = aws_s3_bucket.frontend.bucket
    CLOUDFRONT_DISTRIBUTION_ID = aws_cloudfront_distribution.main.id
  }
}
