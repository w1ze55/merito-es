package com.merito_es.merito.view;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public final class Formatos {

	public static final Locale LOCALE = Locale.of("pt", "BR");
	public static final String PADRAO_DATA_HORA = "dd/MM/yyyy HH:mm";
	public static final String PADRAO_DECIMAL = "#,##0.000";

	private static final DateTimeFormatter DATA_HORA = DateTimeFormatter.ofPattern(PADRAO_DATA_HORA);

	private Formatos() {
	}

	public static String moeda(BigDecimal valor) {
		return moeda(valor, 2);
	}

	public static String precoPorLitro(BigDecimal valor) {
		return moeda(valor, 3);
	}

	public static String litros(BigDecimal valor) {
		return new DecimalFormat(PADRAO_DECIMAL, DecimalFormatSymbols.getInstance(LOCALE)).format(valor) + " L";
	}

	public static String dataHora(LocalDateTime dataHora) {
		return DATA_HORA.format(dataHora);
	}

	private static String moeda(BigDecimal valor, int casasDecimais) {
		NumberFormat formato = NumberFormat.getCurrencyInstance(LOCALE);
		formato.setMinimumFractionDigits(casasDecimais);
		formato.setMaximumFractionDigits(casasDecimais);
		return formato.format(valor);
	}
}
