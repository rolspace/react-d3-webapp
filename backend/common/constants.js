module.exports = {
  cors: {
    origin: process.env.CLIENT_URL,
    optionsSuccessStatus: 200,
    preflightContinue: false
  },
  http: {
    badRequest: 400,
    internalError: 500,
    notFound: 404,
    ok: 200,
    unprocessable: 422
  }
}