const { z } = require('zod');

const productSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Product name required'),
        description: z.string().optional(),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format').or(z.number()),
        stock: z.string().regex(/^\d+$/, 'Stock must be a number').or(z.number()).optional(), // Can be string if from form-data
        category_id: z.string().regex(/^\d+$/, 'Category ID must be a number').or(z.number()),
        variants: z.string().optional().or(z.array(z.any()))
    })
});

module.exports = {
    productSchema
};
