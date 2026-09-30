package com.merito_es.merito.view;

import com.merito_es.merito.dto.AbastecimentoRequest;
import com.merito_es.merito.model.Abastecimento;
import com.merito_es.merito.model.BombaCombustivel;
import com.merito_es.merito.service.AbastecimentoService;
import com.merito_es.merito.service.BombaCombustivelService;
import com.merito_es.merito.view.ModeloTabela.Coluna;

import javax.swing.*;
import java.util.Date;
import java.util.List;

public class AbastecimentoPanel extends PainelCadastro<Abastecimento> {

	private final AbastecimentoService abastecimentoService;
	private final BombaCombustivelService bombaCombustivelService;
	private final JComboBox<BombaCombustivel> campoBomba = new JComboBox<>();
	private final JSpinner campoData = campoDataHora();
	private final JSpinner campoLitros = campoDecimal(1.0);
	private final JTextField campoValorTotal = new JTextField();

	public AbastecimentoPanel(AbastecimentoService abastecimentoService,
			BombaCombustivelService bombaCombustivelService) {
		super(List.of(
				new Coluna<>("ID", Abastecimento::getId),
				new Coluna<>("Data", abastecimento -> Formatos.dataHora(abastecimento.getDataAbastecimento())),
				new Coluna<>("Bomba", abastecimento -> abastecimento.getBomba().getNome()),
				new Coluna<>("Combustível", abastecimento -> abastecimento.getBomba().getTipoCombustivel().getNome()),
				new Coluna<>("Litros", abastecimento -> Formatos.litros(abastecimento.getLitros())),
				new Coluna<>("Valor total", abastecimento -> Formatos.moeda(abastecimento.getValorTotal()))));
		this.abastecimentoService = abastecimentoService;
		this.bombaCombustivelService = bombaCombustivelService;

		campoBomba.setRenderer(renderizador(bomba -> bomba.getNome() + " - " + bomba.getTipoCombustivel().getNome()
				+ " (" + Formatos.precoPorLitro(bomba.getTipoCombustivel().getPrecoPorLitro()) + "/L)"));
		campoBomba.addActionListener(evento -> atualizarValorTotal());
		campoLitros.addChangeListener(evento -> atualizarValorTotal());
		campoValorTotal.setEditable(false);

		montarFormulario(
				new Campo("Bomba", campoBomba),
				new Campo("Data do abastecimento", campoData),
				new Campo("Litros", campoLitros),
				new Campo("Valor total", campoValorTotal));
	}

	@Override
	protected void aoAtualizar() {
		recarregar(campoBomba, bombaCombustivelService.listar());
	}

	@Override
	protected List<Abastecimento> listar() {
		return abastecimentoService.listar();
	}

	@Override
	protected Long idDe(Abastecimento abastecimento) {
		return abastecimento.getId();
	}

	@Override
	protected void preencherFormulario(Abastecimento abastecimento) {
		selecionarPorId(campoBomba, BombaCombustivel::getId, abastecimento.getBomba().getId());
		campoData.setValue(paraDate(abastecimento.getDataAbastecimento()));
		campoLitros.setValue(abastecimento.getLitros().doubleValue());
		campoValorTotal.setText(Formatos.moeda(abastecimento.getValorTotal()));
	}

	@Override
	protected void limparFormulario() {
		campoBomba.setSelectedIndex(-1);
		campoData.setValue(new Date());
		campoLitros.setValue(0.0);
		atualizarValorTotal();
	}

	@Override
	protected void salvar(Long id) {
		BombaCombustivel bomba = itemSelecionado(campoBomba);
		AbastecimentoRequest request = new AbastecimentoRequest(
				bomba == null ? null : bomba.getId(), dataHora(campoData), decimal(campoLitros));
		if (id == null) {
			abastecimentoService.criar(request);
		} else {
			abastecimentoService.atualizar(id, request);
		}
	}

	@Override
	protected void excluir(Long id) {
		abastecimentoService.excluir(id);
	}

	private void atualizarValorTotal() {
		BombaCombustivel bomba = itemSelecionado(campoBomba);
		if (bomba == null) {
			campoValorTotal.setText("");
			return;
		}
		campoValorTotal.setText(Formatos.moeda(abastecimentoService.calcularValorTotal(
				bomba.getTipoCombustivel().getPrecoPorLitro(), paraDecimal(campoLitros.getValue()))));
	}
}
