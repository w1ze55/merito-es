package com.merito_es.merito.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AbastecimentoRequest(
		@NotNull(message = "Informe a bomba do abastecimento.")
		Long bombaId,

		@NotNull(message = "Informe a data do abastecimento.")
		@PastOrPresent(message = "A data do abastecimento não pode estar no futuro.")
		LocalDateTime dataAbastecimento,

		@NotNull(message = "Informe a quantidade de litros.")
		@Positive(message = "A quantidade de litros deve ser maior que zero.")
		@Digits(integer = 7, fraction = 3, message = "A quantidade de litros deve ter até 7 dígitos inteiros e 3 casas decimais.")
		BigDecimal litros) {
}
