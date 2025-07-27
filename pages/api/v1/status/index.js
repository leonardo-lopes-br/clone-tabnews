function status(request, response) {
  response.status(200).json({chave: "Eu amo a Letícia Guida!"});
}

export default status;