package com.merito_es.merito.view;

import com.merito_es.merito.exception.RecursoNaoEncontradoException;
import com.merito_es.merito.exception.RegraNegocioException;
import com.merito_es.merito.view.ModeloTabela.Coluna;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;

import javax.swing.*;
import javax.swing.text.DefaultFormatter;
import java.awt.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormatSymbols;
import java.text.ParseException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
public abstract class PainelCadastro<T> extends JPanel {

	protected record Campo(String rotulo, JComponent componente) {
	}

	private static final int LARGURA_CAMPO = 320;

	private final ModeloTabela<T> modelo;
	private final JTable tabela;
	private final JPanel formulario = new JPanel(new GridBagLayout());
	private final JButton botaoExcluir = new JButton("Excluir");
	private T selecionado;

	protected PainelCadastro(List<Coluna<T>> colunas) {
		super(new BorderLayout(0, 12));
		setBorder(BorderFactory.createEmptyBorder(12, 12, 12, 12));

		modelo = new ModeloTabela<>(colunas);
		tabela = new JTable(modelo);
		tabela.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
		tabela.setFillsViewportHeight(true);
		tabela.setRowHeight(24);
		tabela.getTableHeader().setReorderingAllowed(false);
		tabela.getColumnModel().getColumn(0).setMaxWidth(70);
		tabela.getSelectionModel().addListSelectionListener(evento -> {
			if (!evento.getValueIsAdjusting()) {
				aoSelecionarLinha();
			}
		});

		JButton botaoNovo = new JButton("Novo");
		JButton botaoSalvar = new JButton("Salvar");
		botaoNovo.addActionListener(evento -> novo());
		botaoSalvar.addActionListener(evento -> salvarFormulario());
		botaoExcluir.addActionListener(evento -> excluirSelecionado());
		botaoExcluir.setEnabled(false);

		JPanel botoes = new JPanel(new FlowLayout(FlowLayout.LEADING, 8, 0));
		botoes.add(botaoNovo);
		botoes.add(botaoSalvar);
		botoes.add(botaoExcluir);

		formulario.setBorder(BorderFactory.createTitledBorder("Dados"));

		JPanel topo = new JPanel(new BorderLayout(0, 8));
		topo.add(formulario, BorderLayout.CENTER);
		topo.add(botoes, BorderLayout.SOUTH);

		add(topo, BorderLayout.NORTH);
		add(new JScrollPane(tabela), BorderLayout.CENTER);
	}

	protected abstract List<T> listar();

	protected abstract Long idDe(T item);

	protected abstract void preencherFormulario(T item);

	protected abstract void limparFormulario();

	protected abstract void salvar(Long id);

	protected abstract void excluir(Long id);

	protected void aoAtualizar() {
	}

	public void atualizar() {
		executar(() -> {
			aoAtualizar();
			modelo.setLinhas(listar());
			novo();
		});
	}

	protected final void montarFormulario(Campo... campos) {
		GridBagConstraints restricoes = new GridBagConstraints();
		restricoes.insets = new Insets(4, 8, 4, 8);
		for (int linha = 0; linha < campos.length; linha++) {
			JComponent componente = campos[linha].componente();
			componente.setPreferredSize(new Dimension(LARGURA_CAMPO, componente.getPreferredSize().height));

			restricoes.gridy = linha;
			restricoes.gridx = 0;
			restricoes.weightx = 0;
			restricoes.anchor = GridBagConstraints.LINE_END;
			formulario.add(new JLabel(campos[linha].rotulo()), restricoes);

			restricoes.gridx = 1;
			restricoes.anchor = GridBagConstraints.LINE_START;
			formulario.add(componente, restricoes);

			restricoes.gridx = 2;
			restricoes.weightx = 1;
			formulario.add(Box.createHorizontalGlue(), restricoes);
		}
	}

	protected static JSpinner campoDecimal(double passo) {
		JSpinner campo = new JSpinner(new SpinnerNumberModel(0.0, 0.0, 9_999_999.999, passo));
		JSpinner.NumberEditor editor = new JSpinner.NumberEditor(campo, Formatos.PADRAO_DECIMAL);
		editor.getFormat().setDecimalFormatSymbols(DecimalFormatSymbols.getInstance(Formatos.LOCALE));
		editor.getTextField().setValue(campo.getValue());
		((DefaultFormatter) editor.getTextField().getFormatter()).setCommitsOnValidEdit(true);
		campo.setEditor(editor);
		return campo;
	}

	protected static JSpinner campoDataHora() {
		JSpinner campo = new JSpinner(new SpinnerDateModel());
		campo.setEditor(new JSpinner.DateEditor(campo, Formatos.PADRAO_DATA_HORA));
		return campo;
	}

	protected static BigDecimal decimal(JSpinner campo) {
		confirmarEdicao(campo);
		return paraDecimal(campo.getValue());
	}

	protected static BigDecimal paraDecimal(Object valor) {
		return BigDecimal.valueOf(((Number) valor).doubleValue()).setScale(3, RoundingMode.HALF_UP);
	}

	protected static LocalDateTime dataHora(JSpinner campo) {
		confirmarEdicao(campo);
		Date data = (Date) campo.getValue();
		return LocalDateTime.ofInstant(data.toInstant(), ZoneId.systemDefault()).truncatedTo(ChronoUnit.MINUTES);
	}

	protected static Date paraDate(LocalDateTime dataHora) {
		return Date.from(dataHora.atZone(ZoneId.systemDefault()).toInstant());
	}

	protected static <E> ListCellRenderer<E> renderizador(Function<E, String> texto) {
		DefaultListCellRenderer padrao = new DefaultListCellRenderer();
		return (lista, valor, indice, selecionado, foco) -> padrao.getListCellRendererComponent(
				lista, valor == null ? "" : texto.apply(valor), indice, selecionado, foco);
	}

	protected static <E> void recarregar(JComboBox<E> combo, List<E> itens) {
		combo.removeAllItems();
		itens.forEach(combo::addItem);
		combo.setSelectedIndex(-1);
	}

	protected static <E> E itemSelecionado(JComboBox<E> combo) {
		return combo.getItemAt(combo.getSelectedIndex());
	}

	protected static <E> void selecionarPorId(JComboBox<E> combo, Function<E, Long> id, Long valor) {
		for (int indice = 0; indice < combo.getItemCount(); indice++) {
			if (id.apply(combo.getItemAt(indice)).equals(valor)) {
				combo.setSelectedIndex(indice);
				return;
			}
		}
		combo.setSelectedIndex(-1);
	}

	private static void confirmarEdicao(JSpinner campo) {
		try {
			campo.commitEdit();
		} catch (ParseException e) {
			String texto = ((JSpinner.DefaultEditor) campo.getEditor()).getTextField().getText();
			throw new IllegalArgumentException("Valor inválido: " + texto);
		}
	}

	private void aoSelecionarLinha() {
		int linha = tabela.getSelectedRow();
		if (linha < 0) {
			novo();
			return;
		}
		selecionado = modelo.getLinha(tabela.convertRowIndexToModel(linha));
		preencherFormulario(selecionado);
		botaoExcluir.setEnabled(true);
	}

	private void novo() {
		tabela.clearSelection();
		selecionado = null;
		limparFormulario();
		botaoExcluir.setEnabled(false);
	}

	private void salvarFormulario() {
		executar(() -> {
			salvar(selecionado == null ? null : idDe(selecionado));
			atualizar();
		});
	}

	private void excluirSelecionado() {
		if (selecionado == null) {
			return;
		}
		int opcao = JOptionPane.showConfirmDialog(this, "Deseja excluir o registro selecionado?",
				"Confirmar exclusão", JOptionPane.YES_NO_OPTION, JOptionPane.WARNING_MESSAGE);
		if (opcao == JOptionPane.YES_OPTION) {
			executar(() -> {
				excluir(idDe(selecionado));
				atualizar();
			});
		}
	}

	private void executar(Runnable acao) {
		try {
			acao.run();
		} catch (ConstraintViolationException e) {
			mostrarErro(e.getConstraintViolations().stream()
					.map(ConstraintViolation::getMessage)
					.sorted()
					.collect(Collectors.joining("\n")));
		} catch (RegraNegocioException | RecursoNaoEncontradoException | IllegalArgumentException e) {
			mostrarErro(e.getMessage());
		} catch (RuntimeException e) {
			log.error("Erro inesperado na tela de cadastro.", e);
			mostrarErro("Ocorreu um erro inesperado: " + e.getMessage());
		}
	}

	private void mostrarErro(String mensagem) {
		JOptionPane.showMessageDialog(this, mensagem, "Atenção", JOptionPane.WARNING_MESSAGE);
	}
}
