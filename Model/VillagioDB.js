// villagioDB.js
// Schemas: User, Vendor, Category, Product, Order, Review, Cart

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/* ===============================
   USER / CUSTOMER SCHEMA
   =============================== */
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },

    role: {
        type: String,
        enum: ["customer", "vendor", "admin"],
        default: "customer"
    },

    isActive: { type: Boolean, default: true },

    // For deliveries
    location: {
        county: { type: String },
        area: { type: String },
        estate: { type: String }
    },

    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 }
}, { timestamps: true });

/* ===============================
   VENDOR SCHEMA
   =============================== */
const vendorSchema = new Schema({
    name: { type: String, required: true },

    // e.g. Vegetables, Fruits, Organic, Farm Direct
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },

    status: { 
        type: String, 
        enum: ["active", "inactive"],
        default: "active"
    },

    location: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },

    totalRevenue: { type: Number, default: 0 },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }]
}, { timestamps: true });

/* ===============================
   CATEGORY SCHEMA
   (Vegetables, Fruits, Dairy, Herbal, Organic, Farm Direct)
   =============================== */
const categorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    image: String
}, { timestamps: true });


/* ===============================
   PRODUCT SCHEMA
   =============================== */
const productSchema = new Schema({
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },

    price: { type: Number, required: true },

    status: {
        type: String,
        enum: ["instock", "lowstock", "outofstock"],
        default: "instock"
    },

    image: String,
}, { timestamps: true });


/* ===============================
   ORDER SCHEMA
   =============================== */
const orderSchema = new Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },

    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],

    amount: { type: Number, required: true },

    status: {
        type: String,
        enum: ["pending", "processing", "intransit", "delivered", "cancelled"],
        default: "pending"
    },

    dateTime: { type: Date, default: Date.now }
}, { timestamps: true });


/* ===============================
   REVIEW SCHEMA 
   =============================== */
const reviewSchema = new Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },

    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String
}, { timestamps: true });


/* ===============================
   CART SCHEMA
   =============================== */
const cartSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true }
    }]
}, { timestamps: true });


/* ===============================
   MODEL EXPORTS
   =============================== */
const User = mongoose.model("User", userSchema);
const Vendor = mongoose.model("Vendor", vendorSchema);
const Category = mongoose.model("Category", categorySchema);
const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);
const Review = mongoose.model("Review", reviewSchema);
const Cart = mongoose.model("Cart", cartSchema);

module.exports = {
    User,
    Vendor,
    Category,
    Product,
    Order,
    Review,
    Cart
};
