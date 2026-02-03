const { z } = require('zod');

const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        password_confirmation: z.string().optional(),
        phone: z.string().optional(),
        source: z.string().min(1, 'Source is required'),
        referral_code: z.string().optional(),
        registration_amount: z.number().nonnegative().optional(),
        registration_type: z.enum(['free', 'paid']).optional()
    })
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address').optional(),
        phone: z.string().min(10, 'Phone must be at least 10 digits').optional(),
        password: z.string().min(1, 'Password is required')
    }).refine(data => data.email || data.phone, {
        message: "Either email or phone is required",
        path: ["email"]
    })
});

module.exports = {
    registerSchema,
    loginSchema
};
