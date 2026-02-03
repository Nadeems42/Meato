import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: "What areas do you deliver to?",
            answer: "We currently deliver to Buldhana and surrounding areas within a 15km radius. You can check if we deliver to your location by entering your pincode during checkout."
        },
        {
            question: "How fresh are the products?",
            answer: "All our meat and egg products are sourced fresh daily from verified local farms and suppliers. We guarantee farm-to-table freshness with strict quality checks."
        },
        {
            question: "What are your delivery timings?",
            answer: "We offer two delivery options: Express Delivery (10-15 minutes) for select zones and Standard Delivery (30-45 minutes). Orders can be placed from 7 AM to 10 PM daily."
        },
        {
            question: "Do you accept online payments?",
            answer: "Currently, we only accept Cash on Delivery (COD). Online payment options will be available soon."
        },
        {
            question: "What is your minimum order value?",
            answer: "There is no minimum order value. However, delivery fees apply based on your location and order size."
        },
        {
            question: "Can I cancel or modify my order?",
            answer: "You can cancel or modify your order within 5 minutes of placing it. Please contact our support team immediately at +91 8605082096 or through the app."
        },
        {
            question: "What if I receive a damaged or incorrect product?",
            answer: "Please inspect your order upon delivery. If you receive a damaged or incorrect product, refuse the delivery or contact us immediately. We will arrange for a replacement or refund."
        },
        {
            question: "How do I track my order?",
            answer: "You can track your order in real-time through the 'My Orders' section. You'll receive updates on your order status and delivery partner location."
        },
        {
            question: "Are your products halal certified?",
            answer: "Yes, all our meat products are halal certified and sourced from certified suppliers following proper religious practices."
        },
        {
            question: "Do you offer any discounts or loyalty programs?",
            answer: "Yes! Keep an eye on our app for seasonal offers, first-order discounts, and referral rewards. We also have special deals for bulk orders."
        },
        {
            question: "What if nobody is home for delivery?",
            answer: "Our delivery partner will call you upon arrival. If nobody is available, we'll attempt re-delivery once. Please ensure someone is available at the delivery address."
        },
        {
            question: "How is the delivery fee calculated?",
            answer: "Delivery fees are based on your location from our nearest hub. Express delivery zones have a slightly higher fee. The exact fee is displayed before you place your order."
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1 container py-8 pb-24 max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-soft p-8 md:p-12">
                    <h1 className="text-4xl font-black tracking-tight mb-4">Frequently Asked Questions</h1>
                    <p className="text-muted-foreground mb-8">Find answers to common questions about Meato</p>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border border-slate-200 rounded-2xl overflow-hidden">
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                                >
                                    <span className="font-bold text-gray-900 pr-4">{faq.question}</span>
                                    <ChevronDown
                                        className={cn(
                                            "h-5 w-5 text-primary shrink-0 transition-transform duration-200",
                                            openIndex === index && "rotate-180"
                                        )}
                                    />
                                </button>
                                <div
                                    className={cn(
                                        "overflow-hidden transition-all duration-200 ease-in-out",
                                        openIndex === index ? "max-h-96" : "max-h-0"
                                    )}
                                >
                                    <div className="p-6 pt-0 text-gray-700 leading-relaxed">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                        <h3 className="text-lg font-bold mb-2">Still have questions?</h3>
                        <p className="text-gray-700 mb-4">Feel free to reach out to our support team</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <a href="tel:+918605082096" className="font-semibold text-primary hover:underline">+91 8605082096</a>
                            <span className="hidden sm:inline text-gray-300">|</span>
                            <a href="mailto:support@meato.com" className="font-semibold text-primary hover:underline">support@meato.com</a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            <ScrollToTop />
        </div>
    );
};

export default FAQ;
