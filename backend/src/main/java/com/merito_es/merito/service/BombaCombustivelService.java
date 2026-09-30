package com.merito_es.merito.service;

import com.merito_es.merito.dto.BombaCombustivelRequest;
import com.merito_es.merito.exception.RecursoNaoEncontradoException;
import com.merito_es.merito.exception.RegraNegocioException;
import com.merito_es.merito.model.BombaCombustivel;
import com.merito_es.merito.repository.AbastecimentoRepository;
import com.merito_es.merito.repository.BombaCombustivelRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Service
@Validated
@RequiredArgsConstructor
public class BombaCombustivelService {

	private final BombaCombustivelRepository bombaCombustivelRepository;
	private final AbastecimentoRepository abastecimentoRepository;
	private final TipoCombustivelService tipoCombustivelService;

	@Transactional(readOnly = true)
	public List<BombaCombustivel> listar() {
		return bombaCombustivelRepository.findAll(Sort.by("nome"));
	}

	@Transactional(readOnly = true)
	public BombaCombustivel buscar(Long id) {
		return bombaCombustivelRepository.findById(id)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Bomba " + id + " não encontrada."));
	}

	@Transactional
	public BombaCombustivel criar(@Valid BombaCombustivelRequest request) {
		String nome = request.nome().strip();
		if (bombaCombustivelRepository.existsByNomeIgnoreCase(nome)) {
			throw nomeDuplicado(nome);
		}
		BombaCombustivel bomba = new BombaCombustivel();
		preencher(bomba, nome, request);
		return bombaCombustivelRepository.save(bomba);
	}

	@Transactional
	public BombaCombustivel atualizar(Long id, @Valid BombaCombustivelRequest request) {
		BombaCombustivel bomba = buscar(id);
		String nome = request.nome().strip();
		if (bombaCombustivelRepository.existsByNomeIgnoreCaseAndIdNot(nome, id)) {
			throw nomeDuplicado(nome);
		}
		preencher(bomba, nome, request);
		return bombaCombustivelRepository.save(bomba);
	}

	@Transactional
	public void excluir(Long id) {
		BombaCombustivel bomba = buscar(id);
		if (abastecimentoRepository.existsByBombaId(id)) {
			throw new RegraNegocioException("Não é possível excluir a bomba " + bomba.getNome()
					+ " porque existem abastecimentos registrados nela.");
		}
		bombaCombustivelRepository.delete(bomba);
	}

	private void preencher(BombaCombustivel bomba, String nome, BombaCombustivelRequest request) {
		bomba.setNome(nome);
		bomba.setTipoCombustivel(tipoCombustivelService.buscar(request.tipoCombustivelId()));
	}

	private RegraNegocioException nomeDuplicado(String nome) {
		return new RegraNegocioException("Já existe uma bomba com o nome " + nome + ".");
	}
}
