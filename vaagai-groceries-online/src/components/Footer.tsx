import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-foreground text-card mt-16">
      {/* Main Footer */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 rounded-xl overflow-hidden shadow-md border-2 border-primary/20 bg-white p-1">
                <img src="/logo.jpg" alt="Meato Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-card">Meato</h3>
                <p className="text-xs text-muted-foreground">Fresh Meat & Eggs Delivered</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium quality chicken, mutton, and farm-fresh eggs delivered to your home in Buldhana. Freshness guaranteed.
            </p>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/mlm_market/" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-card/10 hover:bg-primary flex items-center justify-center transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-card">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">Shop All</Link>
              </li>
              <li>
                <Link to="/track-order" className="text-muted-foreground hover:text-primary transition-colors">Track Order</Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/orders" className="text-muted-foreground hover:text-primary transition-colors">My Orders</Link>
              </li>
              <li>
                <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors">My Profile</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="font-semibold text-card">Categories</h4>
            <ul className="space-y-2 text-sm">
              {[
                { name: "Chicken", id: "1" },
                { name: "Mutton", id: "2" },
                { name: "Eggs", id: "3" },
              ].map((cat) => (
                <li key={cat.id}>
                  <Link to={`/shop?category=${cat.id}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-card">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Flat no.304 swapnapurti apartment samta neagar Buldhana, old ajispur road, BULDHANA, Maharashtra - 443001</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href="tel:+918605082096" className="hover:text-primary transition-colors">+91 86050 82096</a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href="mailto:samishathifoods@gmail.com" className="hover:text-primary transition-colors">samishathifoods@gmail.com</a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span>6:00 AM - 9:00 PM (All days)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-card/10">
        <div className="container py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
          <p>© 2026 SAMISHATHI FOODS OPC PRIVATE LIMITED. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
            <Link to="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link>
            <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
