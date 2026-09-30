package com.merito_es.merito.service;

import com.merito_es.merito.dto.AbastecimentoRequest;
import com.merito_es.merito.exception.RecursoNaoEncontradoException;
import com.merito_es.merito.model.Abastecimento;
import com.merito_es.merito.model.BombaCombustivel;
import com.merito_es.merito.repository.AbastecimentoRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@Validated
@RequiredArgsConstructor
public class AbastecimentoService {

	private final AbastecimentoRepository abastecimentoRepository;
	private final BombaCombustivelService bombaCombustivelService;

	@Transactional(readOnly = true)
	public List<Abastecimento> listar() {
		return abastecimentoRepository.findAll(Sort.by(Sort.Direction.DESC, "dataAbastecimento", "id"));
	}

	@Transactional(readOnly = true)
	public Abastecimento buscar(Long id) {
		return abastecimentoRepository.findById(id)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Abastecimento " + id + " não encontrado."));
	}

	@Transactional
	public Abastecimento criar(@Valid AbastecimentoRequest request) {
		Abastecimento abastecimento = new Abastecimento();
		preencher(abastecimento, request);
		return abastecimentoRepository.save(abastecimento);
	}

	@Transactional
	public Abastecimento atualizar(Long id, @Valid AbastecimentoRequest request) {
		Abastecimento abastecimento = buscar(id);
		preencher(abastecimento, request);
		return abastecimentoRepository.save(abastecimento);
	}

	@Transactional
	public void excluir(Long id) {
		abastecimentoRepository.delete(buscar(id));
	}

	public BigDecimal calcularValorTotal(BigDecimal precoPorLitro, BigDecimal litros) {
		return precoPorLitro.multiply(litros).setScale(2, RoundingMode.HALF_UP);
	}

	private void preencher(Abastecimento abastecimento, AbastecimentoRequest request) {
		BombaCombustivel bomba = bombaCombustivelService.buscar(request.bombaId());
		abastecimento.setBomba(bomba);
		abastecimento.setDataAbastecimento(request.dataAbastecimento());
		abastecimento.setLitros(request.litros());
		abastecimento.setValorTotal(calcularValorTotal(bomba.getTipoCombustivel().getPrecoPorLitro(), request.litros()));
	}
}
