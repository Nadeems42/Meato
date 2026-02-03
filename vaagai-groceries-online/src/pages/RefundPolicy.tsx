import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

const RefundPolicy = () => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1 container py-8 pb-24 max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-soft p-8 md:p-12">
                    <h1 className="text-4xl font-black tracking-tight mb-6">Refund & Cancellation Policy</h1>
                    <p className="text-sm text-muted-foreground mb-8">Last updated: January 2026</p>

                    <div className="space-y-8 text-gray-700 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">Cancellation Policy</h2>

                            <div className="space-y-4">
                                <div className="flex gap-3 items-start p-4 bg-green-50 rounded-xl border border-green-200">
                                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-green-900 mb-1">Cancellation Allowed</p>
                                        <p className="text-sm text-green-800">You can cancel your order within 5 minutes of placing it without any charges. Simply contact our support team or use the 'Cancel Order' option in your order details.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 items-start p-4 bg-red-50 rounded-xl border border-red-200">
                                    <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-red-900 mb-1">Cancellation Not Allowed</p>
                                        <p className="text-sm text-red-800">Once your order has been confirmed and our delivery partner has been assigned (usually after 5 minutes), the order cannot be cancelled as preparation has already begun.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">Refund Policy</h2>
                            <p className="mb-4">At Meato, we strive to deliver the highest quality products. However, if you're not satisfied with your order, we offer refunds under the following conditions:</p>

                            <div className="space-y-4">
                                <div className="border-l-4 border-primary pl-4">
                                    <h3 className="font-bold mb-2">1. Quality Issues</h3>
                                    <p>If the product received is not fresh, damaged, or doesn't meet our quality standards, you are eligible for a full refund. Please report the issue immediately upon delivery.</p>
                                </div>

                                <div className="border-l-4 border-primary pl-4">
                                    <h3 className="font-bold mb-2">2. Wrong Product Delivered</h3>
                                    <p>If you receive an incorrect product, we will arrange for a replacement or provide a full refund at your choice.</p>
                                </div>

                                <div className="border-l-4 border-primary pl-4">
                                    <h3 className="font-bold mb-2">3. Missing Items</h3>
                                    <p>If any items are missing from your order, please contact us within 2 hours of delivery. We will either deliver the missing items or refund the amount.</p>
                                </div>

                                <div className="border-l-4 border-primary pl-4">
                                    <h3 className="font-bold mb-2">4. Delayed Delivery</h3>
                                    <p>If there's an unusual delay (beyond 60 minutes from the estimated time) and you choose to cancel, you will not be charged.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">How to Request a Refund</h2>
                            <ol className="list-decimal list-inside space-y-3 ml-4">
                                <li><strong>Immediate Reporting:</strong> Report the issue immediately upon delivery or within 2 hours maximum.</li>
                                <li><strong>Contact Support:</strong> Call us at +91 8605082096 or reach out through the app.</li>
                                <li><strong>Provide Evidence:</strong> Share photos of the product if there's a quality issue.</li>
                                <li><strong>Verification:</strong> Our team will verify the claim (usually within 24 hours).</li>
                                <li><strong>Resolution:</strong> Once approved, refunds will be processed within 3-5 business days.</li>
                            </ol>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">Refund Method</h2>
                            <p>Since we currently accept only Cash on Delivery (COD), refunds will be processed as:</p>
                            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
                                <li>Store credit for future orders (instant)</li>
                                <li>Bank transfer (requires account details, 3-5 business days)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">Non-Refundable Scenarios</h2>
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                <div className="flex gap-3 items-start">
                                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-amber-900 mb-2">Please Note:</p>
                                        <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                                            <li>Orders cancelled after preparation has begun</li>
                                            <li>Products consumed or used before reporting issues</li>
                                            <li>Issues reported after 2 hours of delivery</li>
                                            <li>Subjective quality complaints without valid evidence</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">Contact Us</h2>
                            <p className="mb-4">For any refund or cancellation queries:</p>
                            <div className="p-6 bg-slate-50 rounded-xl">
                                <p className="font-semibold mb-2">Customer Support</p>
                                <p>Email: support@meato.com</p>
                                <p>Phone: +91 8605082096</p>
                                <p className="mt-2 text-sm text-muted-foreground">Available: 7 AM - 10 PM (All days)</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
            <ScrollToTop />
        </div>
    );
};

export default RefundPolicy;
