package com.merito_es.merito.view;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import javax.swing.*;
import java.awt.*;

@Slf4j
@Component
public class MainFrame {

	private static final String TITULO = "Posto de Combustível - Abastecimentos";

	@EventListener(ApplicationReadyEvent.class)
	public void iniciar() {
		if (GraphicsEnvironment.isHeadless()) {
			log.info("Ambiente sem interface gráfica: a janela Swing não será aberta.");
			return;
		}
		SwingUtilities.invokeLater(this::exibir);
	}

	private void exibir() {
		usarVisualDoSistemaOperacional();

		JFrame frame = new JFrame(TITULO);
		frame.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
		frame.setSize(1000, 650);
		frame.setLocationRelativeTo(null);

		JTabbedPane abas = new JTabbedPane();
		abas.addTab("Tipos de Combustível", emConstrucao());
		abas.addTab("Bombas", emConstrucao());
		abas.addTab("Abastecimentos", emConstrucao());

		frame.add(abas);
		frame.setVisible(true);
	}

	private JPanel emConstrucao() {
		JPanel painel = new JPanel(new BorderLayout());
		painel.add(new JLabel("Em construção", SwingConstants.CENTER), BorderLayout.CENTER);
		return painel;
	}

	private void usarVisualDoSistemaOperacional() {
		try {
			UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
		} catch (Exception e) {
			log.warn("Não foi possível aplicar o visual do sistema; usando o padrão do Swing.", e);
		}
	}
}
