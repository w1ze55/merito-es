package com.merito_es.merito.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record TipoCombustivelRequest(
		@NotBlank(message = "Informe o nome do combustível.")
		@Size(max = 100, message = "O nome do combustível deve ter no máximo 100 caracteres.")
		String nome,

		@NotNull(message = "Informe o preço por litro.")
		@Positive(message = "O preço por litro deve ser maior que zero.")
		@Digits(integer = 7, fraction = 3, message = "O preço por litro deve ter até 7 dígitos inteiros e 3 casas decimais.")
		BigDecimal precoPorLitro) {
}
