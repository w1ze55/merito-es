package com.merito_es.merito.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BombaCombustivelRequest(
		@NotBlank(message = "Informe o nome da bomba.")
		@Size(max = 100, message = "O nome da bomba deve ter no máximo 100 caracteres.")
		String nome,

		@NotNull(message = "Informe o tipo de combustível da bomba.")
		Long tipoCombustivelId) {
}
