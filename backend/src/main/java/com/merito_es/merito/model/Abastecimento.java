package com.merito_es.merito.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "abastecimento")
public class Abastecimento {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "bomba_id", nullable = false)
	private BombaCombustivel bomba;

	@Column(name = "data_abastecimento", nullable = false)
	private LocalDateTime dataAbastecimento;

	@Column(nullable = false, precision = 10, scale = 3)
	private BigDecimal litros;

	@Column(name = "valor_total", nullable = false, precision = 12, scale = 2)
	private BigDecimal valorTotal;
}
