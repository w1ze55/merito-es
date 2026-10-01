package com.merito_es.merito.controller;

import com.merito_es.merito.exception.RecursoNaoEncontradoException;
import com.merito_es.merito.exception.RegraNegocioException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(RecursoNaoEncontradoException.class)
	public ProblemDetail recursoNaoEncontrado(RecursoNaoEncontradoException e) {
		return problema(HttpStatus.NOT_FOUND, "Recurso não encontrado", e.getMessage());
	}

	@ExceptionHandler(RegraNegocioException.class)
	public ProblemDetail regraNegocio(RegraNegocioException e) {
		return problema(HttpStatus.CONFLICT, "Operação não permitida", e.getMessage());
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ProblemDetail dadosInvalidos(ConstraintViolationException e) {
		ProblemDetail problema = problema(HttpStatus.BAD_REQUEST, "Dados inválidos", "Verifique os campos informados.");
		problema.setProperty("erros", e.getConstraintViolations().stream()
				.map(ConstraintViolation::getMessage)
				.sorted()
				.toList());
		return problema;
	}

	private ProblemDetail problema(HttpStatus status, String titulo, String detalhe) {
		ProblemDetail problema = ProblemDetail.forStatusAndDetail(status, detalhe);
		problema.setTitle(titulo);
		return problema;
	}
}
