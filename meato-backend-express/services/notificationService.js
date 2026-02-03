const axios = require('axios');

// Placeholder for WhatsApp API integration (e.g. Twilio, Meta WhatsApp API)
// For now, it logs to console and constructs a professional message.
class NotificationService {
    constructor() {
        this.companyName = "MLM";
        this.gstin = "33AUAPP5073GIZR";
        this.email = "contact@mlm-groceries.com";
        this.phone = "+91 98765 43210";
        this.address = "123, Fresh Street, Green Valley, Chennai, Tamil Nadu - 600001";
        this.logoUrl = "http://localhost:8080/logo.png";
        this.adminLoginLink = "http://localhost:8080/admin-login";
        this.deliveryLoginLink = "http://localhost:8080/delivery-login";
    }

    async sendWhatsAppMessage(to, message) {
        console.log(`[WhatsApp Notification] To: ${to}\nMessage: ${message}\n---`);
        // Real implementation would look like:
        // await axios.post('https://api.whatsapp.com/v1/messages', { to, body: message }, { headers: { Authorization: `Bearer ${process.env.WA_TOKEN}` } });
    }

    async sendEmailNotification(to, subject, text) {
        console.log(`[Email Notification] To: ${to}\nSubject: ${subject}\nText: ${text}\n---`);
        // Real implementation with Nodemailer or SendGrid:
        // await transporter.sendMail({ from: this.email, to, subject, text });
    }

    async sendOrderConfirmation(order, user) {
        const itemsList = order.items.map(item => `- ${item.product ? item.product.name : 'Product'} x ${item.quantity}: ₹${item.price}`).join('\n');

        const message = `
*Order Confirmed - ${this.companyName}* 🛍️

Hi ${user.name}, thank you for your order!

*Invoice Details:*
Order ID: #${order.id}
Date: ${new Date(order.createdAt).toLocaleDateString()}
GSTIN: ${this.gstin}

*Items:*
${itemsList}

*Summary:*
Subtotal: ₹${order.total}
Delivery Fee: ₹${order.delivery_fee || 0}
Handling Charge: ₹${order.handling_fee || 0}
GST Amount: ₹${order.gst_amount || 0}
Total Payable: ₹${(parseFloat(order.total) + parseFloat(order.gst_amount || 0) + parseFloat(order.delivery_fee || 0) + parseFloat(order.handling_fee || 0)).toFixed(2)}

*Delivery Details:*
Address: ${order.delivery_address}

*Contact Us:*
Email: ${this.email}
Phone: ${this.phone}
Address: ${this.address}

Thank you for shopping with us!
        `;

        await this.sendWhatsAppMessage(user.phone || this.phone, message);
        await this.sendEmailNotification(user.email, `Order Confirmation #${order.id}`, message);
    }

    async sendAdminNotification(order) {
        const message = `
*New Order Received!* 🚀

Order ID: #${order.id}
Amount: ₹${order.total}
Customer ID: ${order.user_id}

Login to manage orders:
${this.adminLoginLink}
        `;
        // Send to super admin phone
        await this.sendWhatsAppMessage(this.phone, message);
        await this.sendEmailNotification(this.email, `New Order #${order.id}`, message);
    }

    async sendDeliveryAssignmentNotification(order, deliveryPerson) {
        const message = `
*New Delivery Assigned!* 🚚

Order ID: #${order.id}
Address: ${order.delivery_address}

Please login to view details and update status:
${this.deliveryLoginLink}
        `;
        await this.sendWhatsAppMessage(deliveryPerson.phone || this.phone, message);
        await this.sendEmailNotification(deliveryPerson.email, `New Delivery Assignment #${order.id}`, message);
    }
}

module.exports = new NotificationService();
