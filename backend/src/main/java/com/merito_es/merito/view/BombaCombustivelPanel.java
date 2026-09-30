package com.merito_es.merito.view;

import com.merito_es.merito.dto.BombaCombustivelRequest;
import com.merito_es.merito.model.BombaCombustivel;
import com.merito_es.merito.model.TipoCombustivel;
import com.merito_es.merito.service.BombaCombustivelService;
import com.merito_es.merito.service.TipoCombustivelService;
import com.merito_es.merito.view.ModeloTabela.Coluna;

import javax.swing.*;
import java.util.List;

public class BombaCombustivelPanel extends PainelCadastro<BombaCombustivel> {

	private final BombaCombustivelService bombaCombustivelService;
	private final TipoCombustivelService tipoCombustivelService;
	private final JTextField campoNome = new JTextField();
	private final JComboBox<TipoCombustivel> campoTipoCombustivel = new JComboBox<>();

	public BombaCombustivelPanel(BombaCombustivelService bombaCombustivelService,
			TipoCombustivelService tipoCombustivelService) {
		super(List.of(
				new Coluna<>("ID", BombaCombustivel::getId),
				new Coluna<>("Nome", BombaCombustivel::getNome),
				new Coluna<>("Combustível", bomba -> bomba.getTipoCombustivel().getNome()),
				new Coluna<>("Preço por litro", bomba -> Formatos.precoPorLitro(bomba.getTipoCombustivel().getPrecoPorLitro()))));
		this.bombaCombustivelService = bombaCombustivelService;
		this.tipoCombustivelService = tipoCombustivelService;
		campoTipoCombustivel.setRenderer(renderizador(tipo ->
				tipo.getNome() + " - " + Formatos.precoPorLitro(tipo.getPrecoPorLitro())));
		montarFormulario(
				new Campo("Nome", campoNome),
				new Campo("Combustível", campoTipoCombustivel));
	}

	@Override
	protected void aoAtualizar() {
		recarregar(campoTipoCombustivel, tipoCombustivelService.listar());
	}

	@Override
	protected List<BombaCombustivel> listar() {
		return bombaCombustivelService.listar();
	}

	@Override
	protected Long idDe(BombaCombustivel bomba) {
		return bomba.getId();
	}

	@Override
	protected void preencherFormulario(BombaCombustivel bomba) {
		campoNome.setText(bomba.getNome());
		selecionarPorId(campoTipoCombustivel, TipoCombustivel::getId, bomba.getTipoCombustivel().getId());
	}

	@Override
	protected void limparFormulario() {
		campoNome.setText("");
		campoTipoCombustivel.setSelectedIndex(-1);
	}

	@Override
	protected void salvar(Long id) {
		TipoCombustivel tipoCombustivel = itemSelecionado(campoTipoCombustivel);
		BombaCombustivelRequest request = new BombaCombustivelRequest(
				campoNome.getText(), tipoCombustivel == null ? null : tipoCombustivel.getId());
		if (id == null) {
			bombaCombustivelService.criar(request);
		} else {
			bombaCombustivelService.atualizar(id, request);
		}
	}

	@Override
	protected void excluir(Long id) {
		bombaCombustivelService.excluir(id);
	}
}
