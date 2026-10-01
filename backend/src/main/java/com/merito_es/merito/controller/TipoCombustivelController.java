package com.merito_es.merito.controller;

import com.merito_es.merito.dto.TipoCombustivelRequest;
import com.merito_es.merito.dto.TipoCombustivelResponse;
import com.merito_es.merito.service.TipoCombustivelService;
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
@RequestMapping("/api/tipos-combustivel")
@RequiredArgsConstructor
public class TipoCombustivelController {

	private final TipoCombustivelService tipoCombustivelService;

	@GetMapping
	public List<TipoCombustivelResponse> listar() {
		return tipoCombustivelService.listar().stream().map(TipoCombustivelResponse::de).toList();
	}

	@GetMapping("/{id}")
	public TipoCombustivelResponse buscar(@PathVariable Long id) {
		return TipoCombustivelResponse.de(tipoCombustivelService.buscar(id));
	}

	@PostMapping
	public ResponseEntity<TipoCombustivelResponse> criar(@RequestBody TipoCombustivelRequest request) {
		TipoCombustivelResponse response = TipoCombustivelResponse.de(tipoCombustivelService.criar(request));
		URI location = ServletUriComponentsBuilder.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(response.id())
				.toUri();
		return ResponseEntity.created(location).body(response);
	}

	@PutMapping("/{id}")
	public TipoCombustivelResponse atualizar(@PathVariable Long id, @RequestBody TipoCombustivelRequest request) {
		return TipoCombustivelResponse.de(tipoCombustivelService.atualizar(id, request));
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void excluir(@PathVariable Long id) {
		tipoCombustivelService.excluir(id);
	}
}
