function AppError(options) {
  this.message = options.message
  this.status = options.status
}

module.exports = AppError