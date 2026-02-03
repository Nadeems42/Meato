export interface Variant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stockQty: number;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  price: number; // Discounted Price (Standard)
  mrp?: number; // MRP
  originalPrice?: number; // Kept for backward compatibility, mapped to MRP
  unit: string;
  image: string;
  description: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  gst_percentage?: number;
  variants?: Variant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  color: string;
}

export const categories: Category[] = [
  { id: "1", name: "Chicken", slug: "chicken", image: "/products/chicken_whole.png", productCount: 4, color: "from-orange-400 to-red-500" },
  { id: "2", name: "Mutton", slug: "mutton", image: "/products/mutton_curry.png", productCount: 4, color: "from-red-400 to-rose-600" },
  { id: "3", name: "Eggs", slug: "eggs", image: "https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=400", productCount: 4, color: "from-yellow-400 to-orange-500" },
];

export const products: Product[] = [
  // Chicken
  {
    id: "p1",
    name: "Fresh Whole Chicken",
    category: "Chicken",
    categoryId: "1",
    price: 180,
    mrp: 220,
    unit: "1 kg",
    image: "/products/chicken_whole.png",
    description: "Farm-fresh whole chicken, tender and juicy. Perfect for roasting, grilling, or curries.",
    inStock: true,
    rating: 4.8,
    reviews: 156,
  },
  {
    id: "p2",
    name: "Chicken Breast - Boneless",
    category: "Chicken",
    categoryId: "1",
    price: 240,
    mrp: 280,
    unit: "500 g",
    image: "/products/chicken_breast.png",
    description: "Lean, high-protein boneless chicken breast fillets. Ideal for salads, grilling, or stir-fries.",
    inStock: true,
    rating: 4.9,
    reviews: 210,
  },

  // Mutton
  {
    id: "p3",
    name: "Premium Mutton Curry Cut",
    category: "Mutton",
    categoryId: "2",
    price: 750,
    mrp: 850,
    unit: "1 kg",
    image: "/products/mutton_curry.png",
    description: "Premium goat meat, perfectly cut for rich and flavorful curries. Tender and succulent.",
    inStock: true,
    rating: 4.8,
    reviews: 432,
  },
  {
    id: "p4",
    name: "Mutton Keema",
    category: "Mutton",
    categoryId: "2",
    price: 380,
    mrp: 450,

    unit: "500 g",
    image: "https://images.unsplash.com/photo-1593560737060-e110c793ffcc?w=400&q=80",
    description: "Finely minced fresh mutton, ideal for keema recipes.",
    inStock: true,
    rating: 4.9,
    reviews: 112,
  },

  // Eggs
  {
    id: "p5",
    name: "Farm Fresh Brown Eggs",
    category: "Eggs",
    categoryId: "3",
    price: 90,
    mrp: 110,

    unit: "6 pcs",
    image: "https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=400&q=80",
    description: "Nutritious brown eggs sourced from local farms.",
    inStock: true,
    rating: 4.5,
    reviews: 567,
  },
  {
    id: "p6",
    name: "Organic White Eggs",
    category: "Eggs",
    categoryId: "3",
    price: 150,
    mrp: 180,

    unit: "12 pcs",
    image: "https://images.unsplash.com/photo-1587486918502-319c9e8dc921?w=400&q=80",
    description: "Standard white eggs, high in protein and fresh.",
    inStock: true,
    rating: 4.7,
    reviews: 88,
  },
];

export const featuredProducts = products.filter(p => p.originalPrice || p.rating > 4.8);

