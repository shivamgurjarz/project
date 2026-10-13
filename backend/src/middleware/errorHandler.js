function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'That record already exists.' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({ error: 'This action conflicts with a related record.' });
  }

  res.status(err.status || 500).json({ error: err.message || 'Something went wrong on the server.' });
}

module.exports = errorHandler;
