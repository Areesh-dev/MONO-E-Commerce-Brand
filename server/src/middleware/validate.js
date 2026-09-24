
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const issues = result.error.issues.slice(0, 5).map((i) => ({
        field: i.path?.join('.') || null,
        message: i.message,
      }));
      return res.status(400).json({
        error: 'INVALID_INPUT',
        field: issues[0]?.field ?? null,
        message: issues[0]?.message || 'Invalid input',
        issues,
      });
    }

    req.valid = { ...(req.valid || {}), [source]: result.data };

    try {
      req[source] = result.data;
    } catch {
    }

    return next();
  };
}