package com.merito_es.merito.controller;

import com.merito_es.merito.dto.BombaCombustivelRequest;
import com.merito_es.merito.dto.BombaCombustivelResponse;
import com.merito_es.merito.service.BombaCombustivelService;
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
@RequestMapping("/api/bombas")
@RequiredArgsConstructor
public class BombaCombustivelController {

	private final BombaCombustivelService bombaCombustivelService;

	@GetMapping
	public List<BombaCombustivelResponse> listar() {
		return bombaCombustivelService.listar().stream().map(BombaCombustivelResponse::de).toList();
	}

	@GetMapping("/{id}")
	public BombaCombustivelResponse buscar(@PathVariable Long id) {
		return BombaCombustivelResponse.de(bombaCombustivelService.buscar(id));
	}

	@PostMapping
	public ResponseEntity<BombaCombustivelResponse> criar(@RequestBody BombaCombustivelRequest request) {
		BombaCombustivelResponse response = BombaCombustivelResponse.de(bombaCombustivelService.criar(request));
		URI location = ServletUriComponentsBuilder.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(response.id())
				.toUri();
		return ResponseEntity.created(location).body(response);
	}

	@PutMapping("/{id}")
	public BombaCombustivelResponse atualizar(@PathVariable Long id, @RequestBody BombaCombustivelRequest request) {
		return BombaCombustivelResponse.de(bombaCombustivelService.atualizar(id, request));
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void excluir(@PathVariable Long id) {
		bombaCombustivelService.excluir(id);
	}
}
