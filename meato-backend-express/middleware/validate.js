const { z } = require('zod');

/**
 * Validation Middleware using Zod
 * @param {z.ZodSchema} schema 
 */
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        });
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Zod Validation Error:', JSON.stringify(error, null, 2));
            const issues = error.errors || error.issues || [];
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details: issues.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        next(error);
    }
};

module.exports = validate;
