import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";

const TermsConditions = () => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1 container py-8 pb-24 max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-soft p-8 md:p-12">
                    <h1 className="text-4xl font-black tracking-tight mb-6">Terms & Conditions</h1>
                    <p className="text-sm text-muted-foreground mb-8">Last updated: January 2026</p>

                    <div className="space-y-6 text-gray-700 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">1. Introduction</h2>
                            <p>Welcome to Meato. By accessing and using our platform, you agree to comply with and be bound by the following terms and conditions. Please read these carefully before using our services.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">2. Services</h2>
                            <p>Meato provides an online platform for ordering fresh meat, eggs, and related products. We connect customers with local suppliers to ensure quality and freshness.</p>
                            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
                                <li>Fresh meat delivery within designated areas</li>
                                <li>Express delivery options available</li>
                                <li>Quality-assured products from verified suppliers</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">3. User Responsibilities</h2>
                            <p>As a user of Meato, you agree to:</p>
                            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
                                <li>Provide accurate and complete information during registration</li>
                                <li>Maintain the confidentiality of your account credentials</li>
                                <li>Accept deliveries at the specified address and time</li>
                                <li>Make payments for orders in a timely manner</li>
                                <li>Not misuse our platform for any unlawful purposes</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">4. Orders and Payments</h2>
                            <p>All orders placed through Meato are subject to acceptance and availability. We reserve the right to refuse any order at our discretion.</p>
                            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
                                <li>Payment must be made at the time of delivery (Cash on Delivery)</li>
                                <li>Prices are inclusive of GST and applicable taxes</li>
                                <li>Delivery fees are calculated based on location and order value</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">5. Delivery</h2>
                            <p>We strive to deliver your order within the estimated time frame. However, delivery times may vary based on factors beyond our control, including weather conditions and traffic.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">6. Quality Guarantee</h2>
                            <p>We ensure that all products meet our quality standards. If you receive a product that is not fresh or does not meet your expectations, please contact us immediately.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">7. Limitation of Liability</h2>
                            <p>Meato shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or products.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">8. Changes to Terms</h2>
                            <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our website. Continued use of our services constitutes acceptance of the modified terms.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">9. Contact Us</h2>
                            <p>If you have any questions about these Terms & Conditions, please contact us at:</p>
                            <div className="mt-3 p-4 bg-slate-50 rounded-xl">
                                <p className="font-semibold">Email: support@meato.com</p>
                                <p className="font-semibold">Phone: +91 8605082096</p>
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

export default TermsConditions;
