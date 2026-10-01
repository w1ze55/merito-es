variable "account_id" {
  description = "Conta AWS onde a infra pode ser criada"
  type        = string
}

variable "aws_profile" {
  description = "Perfil do AWS CLI exclusivo do merito-es"
  type        = string
  default     = "merito"
}

variable "region" {
  description = "Região AWS"
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Nome do projeto, usado como prefixo dos recursos"
  type        = string
  default     = "merito-es"
}

variable "environment" {
  description = "Ambiente"
  type        = string
  default     = "homolog"
}

variable "vpc_cidr" {
  description = "Faixa de IPs da VPC"
  type        = string
  default     = "10.20.0.0/16"
}

variable "instance_type" {
  description = "Tipo da EC2 que roda a API (x86_64, mesma arquitetura da imagem gerada no GitHub Actions)"
  type        = string
  default     = "t3.small"
}

variable "db_instance_class" {
  description = "Classe da instância do RDS MySQL"
  type        = string
  default     = "db.t4g.micro"
}

locals {
  name       = "${var.project}-${var.environment}"
  ssm_prefix = "/${var.project}/${var.environment}"
}
