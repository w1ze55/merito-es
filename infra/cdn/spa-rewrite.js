// Rotas do React Router (/bombas, /abastecimentos...) não existem no S3:
// todo caminho cujo último trecho não tem extensão é servido pelo index.html.
function handler(event) {
  var request = event.request
  var ultimoTrecho = request.uri.split('/').pop()

  if (ultimoTrecho.indexOf('.') === -1) {
    request.uri = '/index.html'
  }

  return request
}
