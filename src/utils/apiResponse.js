module.exports = (payload = {}, message = "Success") => ({
  success: true,
  message,
  ...payload
});