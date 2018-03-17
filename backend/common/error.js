function Error(options) {
  this.detail = options.detail
  this.status = options.status
}

module.exports = Error