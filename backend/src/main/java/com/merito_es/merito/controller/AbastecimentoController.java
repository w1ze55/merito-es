package com.merito_es.merito.controller;

import com.merito_es.merito.dto.AbastecimentoRequest;
import com.merito_es.merito.dto.AbastecimentoResponse;
import com.merito_es.merito.service.AbastecimentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/abastecimentos")
@RequiredArgsConstructor
public class AbastecimentoController {

	private final AbastecimentoService abastecimentoService;

	@GetMapping
	public List<AbastecimentoResponse> listar() {
		return abastecimentoService.listar().stream().map(AbastecimentoResponse::de).toList();
	}

	@GetMapping("/{id}")
	public AbastecimentoResponse buscar(@PathVariable Long id) {
		return AbastecimentoResponse.de(abastecimentoService.buscar(id));
	}

	@PostMapping
	public ResponseEntity<AbastecimentoResponse> criar(@RequestBody AbastecimentoRequest request) {
		AbastecimentoResponse response = AbastecimentoResponse.de(abastecimentoService.criar(request));
		URI location = ServletUriComponentsBuilder.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(response.id())
				.toUri();
		return ResponseEntity.created(location).body(response);
	}

	@PutMapping("/{id}")
	public AbastecimentoResponse atualizar(@PathVariable Long id, @RequestBody AbastecimentoRequest request) {
		return AbastecimentoResponse.de(abastecimentoService.atualizar(id, request));
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void excluir(@PathVariable Long id) {
		abastecimentoService.excluir(id);
	}
}
