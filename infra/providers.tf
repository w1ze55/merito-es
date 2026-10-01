# O perfil é fixo para o Terraform nunca usar as credenciais padrão do AWS CLI,
# e allowed_account_ids barra o apply se o perfil apontar para outra conta.
provider "aws" {
  region              = var.region
  profile             = var.aws_profile
  allowed_account_ids = [var.account_id]

  default_tags {
    tags = {
      Project     = var.project
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
