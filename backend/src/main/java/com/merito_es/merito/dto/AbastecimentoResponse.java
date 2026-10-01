package com.merito_es.merito.dto;

import com.merito_es.merito.model.Abastecimento;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AbastecimentoResponse(
		Long id,
		BombaCombustivelResponse bomba,
		LocalDateTime dataAbastecimento,
		BigDecimal litros,
		BigDecimal valorTotal) {

	public static AbastecimentoResponse de(Abastecimento abastecimento) {
		return new AbastecimentoResponse(
				abastecimento.getId(),
				BombaCombustivelResponse.de(abastecimento.getBomba()),
				abastecimento.getDataAbastecimento(),
				abastecimento.getLitros(),
				abastecimento.getValorTotal());
	}
}
