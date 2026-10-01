terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Bucket, key, região e perfil vêm do backend.hcl (veja backend.hcl.example).
  backend "s3" {
    encrypt      = true
    use_lockfile = true
  }
}
