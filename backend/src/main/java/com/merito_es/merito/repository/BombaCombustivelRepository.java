package com.merito_es.merito.repository;

import com.merito_es.merito.model.BombaCombustivel;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BombaCombustivelRepository extends JpaRepository<BombaCombustivel, Long> {

	@Override
	@EntityGraph(attributePaths = "tipoCombustivel")
	List<BombaCombustivel> findAll(Sort sort);

	boolean existsByNomeIgnoreCase(String nome);

	boolean existsByNomeIgnoreCaseAndIdNot(String nome, Long id);

	boolean existsByTipoCombustivelId(Long tipoCombustivelId);
}
