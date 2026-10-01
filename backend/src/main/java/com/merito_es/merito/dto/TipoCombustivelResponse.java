package com.merito_es.merito.dto;

import com.merito_es.merito.model.TipoCombustivel;

import java.math.BigDecimal;

public record TipoCombustivelResponse(Long id, String nome, BigDecimal precoPorLitro) {

	public static TipoCombustivelResponse de(TipoCombustivel tipoCombustivel) {
		return new TipoCombustivelResponse(
				tipoCombustivel.getId(),
				tipoCombustivel.getNome(),
				tipoCombustivel.getPrecoPorLitro());
	}
}
