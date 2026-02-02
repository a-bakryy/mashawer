export enum Role {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  COURIER = 'COURIER',
}

export enum MerchantType {
  RESTAURANT = 'RESTAURANT',
  GROCERY = 'GROCERY',
}

export enum OrderStatus {
  NEW = 'NEW',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  PICKED_UP = 'PICKED_UP',
  ON_THE_WAY = 'ON_THE_WAY',
  NEARBY = 'NEARBY',
  ARRIVED = 'ARRIVED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  COD = 'COD',
  INSTAPAY = 'INSTAPAY',
  VODAFONE_CASH = 'VODAFONE_CASH',
}

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: Role;
  phone?: string;
  alternatePhone?: string; 
  isActive: boolean;
  rating?: number; 
  lat?: number;
  lng?: number;
  favorites?: string[];
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  area?: string;
  lat: number;
  lng: number;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  priceEGP: number;
  image: string;
  category: string;
  inStock: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Merchant {
  id: string;
  name: string;
  nameAr: string;
  type: MerchantType;
  categoryText?: string; // Custom category name
  image: string;
  rating: number;
  minOrderEGP: number;
  lat: number;
  lng: number;
  addressText: string;
  isOpen: boolean; // Manual override
  openingTime?: string; // "09:00"
  closingTime?: string; // "23:00"
  products: Product[];
  reviews: Review[];
  // Pricing overrides
  baseDeliveryFee?: number;
  pricePerKm?: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  qty: number;
  unitPriceEGP: number;
  merchantId: string;
  merchantName: string;
  customDetails?: string;
}

export interface ChatMessage {
  senderId: string;
  senderName: string;
  role: Role;
  text: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: number; // For human readable ID starting at 101
  userId: string;
  merchantId?: string; // Primary merchant or deprecated
  merchantIds?: string[]; // For multi-vendor orders
  merchantName?: string; // Display name
  status: OrderStatus;
  items: CartItem[];
  subtotalEGP: number;
  deliveryFeeEGP: number;
  distanceKm?: number; 
  totalEGP: number;
  deliveryAddress: Address;
  alternatePhone?: string; 
  courierId?: string;
  createdAt: string;
  type: 'MERCHANT' | 'CUSTOM';
  customDetails?: string; 
  courierLocation?: Coordinates;
  estimatedArrival?: string;
  statusHistory?: { status: string; timestamp: string; note?: string }[];
  discountEGP?: number;
  promoCode?: string;
  isReviewed?: boolean;
  courierRating?: number;
  merchantRating?: number;
  reviewComment?: string;
  paymentMethod: PaymentMethod;
  paymentProofImage?: string;
  chat?: ChatMessage[];
  cancellationReason?: string;
}

export interface Promotion {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderEGP?: number;
  maxDiscountEGP?: number;
  expiryDate?: string;
  isActive: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'ORDER' | 'SYSTEM' | 'PROMO';
}

export interface DeliveryZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusKm: number;
  fixedPrice: number;
}

export interface GlobalSettings {
  defaultBaseFee: number;
  defaultPricePerKm: number;
  extraMerchantFee: number;
  vodafone: string;
  instapay: string;
  vodafoneIcon?: string;
  instapayIcon?: string;
  deliveryZones: DeliveryZone[];
}

export const CAIRO_CENTER = { lat: 30.0444, lng: 31.2357 };