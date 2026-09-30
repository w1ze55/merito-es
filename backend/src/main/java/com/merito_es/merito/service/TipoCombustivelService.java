package com.merito_es.merito.service;

import com.merito_es.merito.dto.TipoCombustivelRequest;
import com.merito_es.merito.exception.RecursoNaoEncontradoException;
import com.merito_es.merito.exception.RegraNegocioException;
import com.merito_es.merito.model.TipoCombustivel;
import com.merito_es.merito.repository.BombaCombustivelRepository;
import com.merito_es.merito.repository.TipoCombustivelRepository;
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
public class TipoCombustivelService {

	private final TipoCombustivelRepository tipoCombustivelRepository;
	private final BombaCombustivelRepository bombaCombustivelRepository;

	@Transactional(readOnly = true)
	public List<TipoCombustivel> listar() {
		return tipoCombustivelRepository.findAll(Sort.by("nome"));
	}

	@Transactional(readOnly = true)
	public TipoCombustivel buscar(Long id) {
		return tipoCombustivelRepository.findById(id)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Tipo de combustível " + id + " não encontrado."));
	}

	@Transactional
	public TipoCombustivel criar(@Valid TipoCombustivelRequest request) {
		String nome = request.nome().strip();
		if (tipoCombustivelRepository.existsByNomeIgnoreCase(nome)) {
			throw nomeDuplicado(nome);
		}
		TipoCombustivel tipoCombustivel = new TipoCombustivel();
		preencher(tipoCombustivel, nome, request);
		return tipoCombustivelRepository.save(tipoCombustivel);
	}

	@Transactional
	public TipoCombustivel atualizar(Long id, @Valid TipoCombustivelRequest request) {
		TipoCombustivel tipoCombustivel = buscar(id);
		String nome = request.nome().strip();
		if (tipoCombustivelRepository.existsByNomeIgnoreCaseAndIdNot(nome, id)) {
			throw nomeDuplicado(nome);
		}
		preencher(tipoCombustivel, nome, request);
		return tipoCombustivelRepository.save(tipoCombustivel);
	}

	@Transactional
	public void excluir(Long id) {
		TipoCombustivel tipoCombustivel = buscar(id);
		if (bombaCombustivelRepository.existsByTipoCombustivelId(id)) {
			throw new RegraNegocioException("Não é possível excluir o combustível " + tipoCombustivel.getNome()
					+ " porque existem bombas vinculadas a ele.");
		}
		tipoCombustivelRepository.delete(tipoCombustivel);
	}

	private void preencher(TipoCombustivel tipoCombustivel, String nome, TipoCombustivelRequest request) {
		tipoCombustivel.setNome(nome);
		tipoCombustivel.setPrecoPorLitro(request.precoPorLitro());
	}

	private RegraNegocioException nomeDuplicado(String nome) {
		return new RegraNegocioException("Já existe um tipo de combustível com o nome " + nome + ".");
	}
}
