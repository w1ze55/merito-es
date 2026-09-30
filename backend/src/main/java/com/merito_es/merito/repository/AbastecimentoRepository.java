package com.merito_es.merito.repository;

import com.merito_es.merito.model.Abastecimento;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AbastecimentoRepository extends JpaRepository<Abastecimento, Long> {

	@Override
	@EntityGraph(attributePaths = {"bomba", "bomba.tipoCombustivel"})
	List<Abastecimento> findAll(Sort sort);

	boolean existsByBombaId(Long bombaId);
}
