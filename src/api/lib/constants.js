export const port = process.env.PORT || 9000

export const cors = {
  origin: process.env.CLIENT_URL,
  optionsSuccessStatus: 200,
  preflightContinue: false,
}

export const status = {
  badRequest: 400,
  internalServerError: 500,
  notFound: 404,
  ok: 200,
  unprocessable: 422,
}
