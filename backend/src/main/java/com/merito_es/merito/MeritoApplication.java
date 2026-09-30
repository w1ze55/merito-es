package com.merito_es.merito;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;

@SpringBootApplication
public class MeritoApplication {

	public static void main(String[] args) {
		new SpringApplicationBuilder(MeritoApplication.class)
				.headless(false)
				.run(args);
	}

}
