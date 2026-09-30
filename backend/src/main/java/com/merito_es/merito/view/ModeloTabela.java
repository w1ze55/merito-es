package com.merito_es.merito.view;

import javax.swing.table.AbstractTableModel;
import java.util.List;
import java.util.function.Function;

public class ModeloTabela<T> extends AbstractTableModel {

	public record Coluna<T>(String titulo, Function<T, Object> valor) {
	}

	private final List<Coluna<T>> colunas;
	private List<T> linhas = List.of();

	public ModeloTabela(List<Coluna<T>> colunas) {
		this.colunas = List.copyOf(colunas);
	}

	public void setLinhas(List<T> linhas) {
		this.linhas = List.copyOf(linhas);
		fireTableDataChanged();
	}

	public T getLinha(int indice) {
		return linhas.get(indice);
	}

	@Override
	public int getRowCount() {
		return linhas.size();
	}

	@Override
	public int getColumnCount() {
		return colunas.size();
	}

	@Override
	public String getColumnName(int coluna) {
		return colunas.get(coluna).titulo();
	}

	@Override
	public Object getValueAt(int linha, int coluna) {
		return colunas.get(coluna).valor().apply(linhas.get(linha));
	}
}
