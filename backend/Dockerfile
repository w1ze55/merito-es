# syntax=docker/dockerfile:1

# Build: gera o jar com o Maven Wrapper do projeto. Os testes rodam antes, no CI.
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
COPY src/ src/
# O maven-resources-plugin publica docs/openapi.yaml para o Swagger UI.
COPY docs/ docs/
RUN --mount=type=cache,target=/root/.m2 ./mvnw -B -DskipTests package

# Runtime: só a JRE e o jar, sem root e sem a janela Swing (perfil prod + headless).
FROM eclipse-temurin:25-jre
WORKDIR /app
RUN groupadd --system merito && useradd --system --gid merito merito
COPY --from=build /app/target/*.jar app.jar
USER merito
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_TOOL_OPTIONS="-Djava.awt.headless=true -XX:MaxRAMPercentage=75"
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
