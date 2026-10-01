package com.merito_es.merito.view;

import com.merito_es.merito.service.AbastecimentoService;
import com.merito_es.merito.service.BombaCombustivelService;
import com.merito_es.merito.service.TipoCombustivelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import javax.swing.*;
import java.awt.*;

// No servidor (perfil prod, dentro do container) só a API REST sobe.
@Slf4j
@Component
@Profile("!prod")
@RequiredArgsConstructor
public class MainFrame {

	private static final String TITULO = "Posto de Combustível - Abastecimentos";

	private final TipoCombustivelService tipoCombustivelService;
	private final BombaCombustivelService bombaCombustivelService;
	private final AbastecimentoService abastecimentoService;

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
		abas.addTab("Tipos de Combustível", new TipoCombustivelPanel(tipoCombustivelService));
		abas.addTab("Bombas", new BombaCombustivelPanel(bombaCombustivelService, tipoCombustivelService));
		abas.addTab("Abastecimentos", new AbastecimentoPanel(abastecimentoService, bombaCombustivelService));
		abas.addChangeListener(evento -> atualizarAbaSelecionada(abas));
		atualizarAbaSelecionada(abas);

		frame.add(abas);
		frame.setVisible(true);
	}

	private void atualizarAbaSelecionada(JTabbedPane abas) {
		if (abas.getSelectedComponent() instanceof PainelCadastro<?> painel) {
			painel.atualizar();
		}
	}

	private void usarVisualDoSistemaOperacional() {
		try {
			UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
		} catch (Exception e) {
			log.warn("Não foi possível aplicar o visual do sistema; usando o padrão do Swing.", e);
		}
	}
}
