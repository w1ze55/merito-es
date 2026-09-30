package com.merito_es.merito.repository;

import com.merito_es.merito.model.TipoCombustivel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoCombustivelRepository extends JpaRepository<TipoCombustivel, Long> {

	boolean existsByNomeIgnoreCase(String nome);

	boolean existsByNomeIgnoreCaseAndIdNot(String nome, Long id);
}
