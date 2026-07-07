export const validateRequired = (data, fields) => {
  const missing = fields.filter(f => !data[f])
  return missing.length > 0 ? { error: `Missing required fields: ${missing.join(', ')}` } : null
}

export const handleError = (error) => {
  console.error(error)
  return { error: error.message || 'Internal server error' }
}

export const parseNumber = (value, defaultValue = null) => {
  if (value === null || value === undefined || value === '') return defaultValue
  const parsed = Number(value)
  return isNaN(parsed) ? defaultValue : parsed
}