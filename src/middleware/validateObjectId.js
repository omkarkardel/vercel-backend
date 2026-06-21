const validateObjectId = (fieldName) => (req, _res, next) => {
  const id = req.params[fieldName];
  const isValid = /^[0-9a-fA-F]{24}$/.test(id);

  if (!isValid) {
    return next(new Error(`Invalid ${fieldName} id`));
  }

  return next();
};

module.exports = validateObjectId;