const { z } = require('zod');

const orderSchema = z.object({
    body: z.object({
        delivery_address: z.object({
            name: z.string().min(1, 'Name is required'),
            phone: z.string().min(10, 'Phone must be at least 10 digits'),
            address_line: z.string().min(1, 'Address is required'),
            city: z.string().min(1, 'City is required'),
            pincode: z.string().min(6, 'Pincode must be at least 6 digits')
        }),
        items: z.array(z.object({
            product_id: z.number().int().positive(),
            quantity: z.number().int().positive()
        })).optional() // Optional for logged in users (uses cart), required for guest (handled in controller)
    })
});

const adminOrderUpdateSchema = z.object({
    body: z.object({
        status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
        payment_status: z.enum(['pending', 'paid', 'failed']).optional()
    })
});

module.exports = {
    orderSchema,
    adminOrderUpdateSchema
};
