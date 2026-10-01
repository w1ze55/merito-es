# RDS MySQL 8.4, a mesma versão do docker-compose local. O schema não é criado aqui:
# o Flyway da API roda as migrations ao subir.
# Não é Aurora porque a conta está no plano Free da AWS, que só libera Aurora PostgreSQL.

# Só letras e números: a senha vai para JDBC e para o env-file do Docker sem precisar de escape.
resource "random_password" "db" {
  length  = 32
  special = false
}

resource "aws_db_subnet_group" "main" {
  name       = local.name
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_db_instance" "main" {
  identifier     = local.name
  engine         = "mysql"
  engine_version = "8.4" # a AWS escolhe a versão menor e aplica as atualizações dela
  instance_class = var.db_instance_class

  allocated_storage = 20
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = "abastecimento"
  username = "merito"
  password = random_password.db.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false
  multi_az               = false

  backup_retention_period    = 1
  auto_minor_version_upgrade = true
  apply_immediately          = true

  # Homolog: o terraform destroy apaga o banco sem snapshot final.
  skip_final_snapshot = true
  deletion_protection = false
}

# A EC2 lê estes parâmetros no deploy e os passa ao container como DB_URL, DB_USERNAME e DB_PASSWORD.
resource "aws_ssm_parameter" "db_url" {
  name  = "${local.ssm_prefix}/db/url"
  type  = "String"
  value = "jdbc:mysql://${aws_db_instance.main.address}:${aws_db_instance.main.port}/${aws_db_instance.main.db_name}"
}

resource "aws_ssm_parameter" "db_username" {
  name  = "${local.ssm_prefix}/db/username"
  type  = "String"
  value = aws_db_instance.main.username
}

resource "aws_ssm_parameter" "db_password" {
  name  = "${local.ssm_prefix}/db/password"
  type  = "SecureString"
  value = random_password.db.result
}
