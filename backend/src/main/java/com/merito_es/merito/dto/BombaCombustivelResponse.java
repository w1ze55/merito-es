package com.merito_es.merito.dto;

import com.merito_es.merito.model.BombaCombustivel;

public record BombaCombustivelResponse(Long id, String nome, TipoCombustivelResponse tipoCombustivel) {

	public static BombaCombustivelResponse de(BombaCombustivel bomba) {
		return new BombaCombustivelResponse(
				bomba.getId(),
				bomba.getNome(),
				TipoCombustivelResponse.de(bomba.getTipoCombustivel()));
	}
}
