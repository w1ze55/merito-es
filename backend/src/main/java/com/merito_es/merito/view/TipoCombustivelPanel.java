package com.merito_es.merito.view;

import com.merito_es.merito.dto.TipoCombustivelRequest;
import com.merito_es.merito.model.TipoCombustivel;
import com.merito_es.merito.service.TipoCombustivelService;
import com.merito_es.merito.view.ModeloTabela.Coluna;

import javax.swing.*;
import java.util.List;

public class TipoCombustivelPanel extends PainelCadastro<TipoCombustivel> {

	private final TipoCombustivelService tipoCombustivelService;
	private final JTextField campoNome = new JTextField();
	private final JSpinner campoPreco = campoDecimal(0.01);

	public TipoCombustivelPanel(TipoCombustivelService tipoCombustivelService) {
		super(List.of(
				new Coluna<>("ID", TipoCombustivel::getId),
				new Coluna<>("Nome", TipoCombustivel::getNome),
				new Coluna<>("Preço por litro", tipo -> Formatos.precoPorLitro(tipo.getPrecoPorLitro()))));
		this.tipoCombustivelService = tipoCombustivelService;
		montarFormulario(
				new Campo("Nome", campoNome),
				new Campo("Preço por litro (R$)", campoPreco));
	}

	@Override
	protected List<TipoCombustivel> listar() {
		return tipoCombustivelService.listar();
	}

	@Override
	protected Long idDe(TipoCombustivel tipoCombustivel) {
		return tipoCombustivel.getId();
	}

	@Override
	protected void preencherFormulario(TipoCombustivel tipoCombustivel) {
		campoNome.setText(tipoCombustivel.getNome());
		campoPreco.setValue(tipoCombustivel.getPrecoPorLitro().doubleValue());
	}

	@Override
	protected void limparFormulario() {
		campoNome.setText("");
		campoPreco.setValue(0.0);
	}

	@Override
	protected void salvar(Long id) {
		TipoCombustivelRequest request = new TipoCombustivelRequest(campoNome.getText(), decimal(campoPreco));
		if (id == null) {
			tipoCombustivelService.criar(request);
		} else {
			tipoCombustivelService.atualizar(id, request);
		}
	}

	@Override
	protected void excluir(Long id) {
		tipoCombustivelService.excluir(id);
	}
}
