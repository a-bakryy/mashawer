import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  MapPin, ShoppingBag, Truck, User as UserIcon, 
  LogOut, Search, Star, ArrowRight, ArrowLeft,
  Store, Edit, Trash, Plus, Minus, Lock, Unlock,
  Briefcase, Eye, EyeOff, Bell, X, CheckCircle,
  Home, Clock, Utensils, Carrot, Croissant, 
  Calendar, Tag, XCircle, AlertTriangle, Phone,
  Menu as MenuIcon, ChevronRight, MessageSquare,
  FileText, DollarSign, Navigation, Activity,
  Map as MapIcon, Heart, RotateCcw, Mail, Package,
  Image as ImageIcon, Loader, ChevronDown, Upload, Settings, Smartphone,
  Users, BarChart3, TrendingUp, Shield, LayoutDashboard, List, Power, CreditCard,
  CheckSquare, Filter, Share, MapPinned, Globe, Download, PlusCircle, Send, Check,
  Zap, HelpCircle, Wallet, Languages, FileQuestion, History, MoreVertical, ChevronLeft
} from 'lucide-react';
import { 
  Role, OrderStatus, MerchantType, PaymentMethod,
  User, Order, Merchant, Product, CartItem, Promotion, AppNotification, Address, GlobalSettings, DeliveryZone, ChatMessage 
} from './types';

// --- INITIAL DATA ---

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'أحمد محمد', email: 'client@town.eg', username: 'client', password: '123', role: Role.CUSTOMER, isActive: true, phone: '01012345678' },
  { id: 'u2', name: 'المدير العام', email: 'admin@town.eg', username: 'admin', password: '123', role: Role.ADMIN, isActive: true },
  { id: 'u3', name: 'كابتن محمود', email: 'courier@town.eg', username: 'courier', password: '123', role: Role.COURIER, isActive: true, phone: '01234567890', rating: 4.9 },
];

const INITIAL_MERCHANTS: Merchant[] = [
  {
    id: 'm1',
    name: 'Buffalo Burger',
    nameAr: 'بافلو برجر',
    type: MerchantType.RESTAURANT,
    categoryText: 'برجر • وجبات سريعة',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
    rating: 4.8,
    minOrderEGP: 50,
    lat: 30.0444,
    lng: 31.2357,
    addressText: 'وسط البلد، القاهرة',
    isOpen: true,
    products: [
      { id: 'p1', name: 'Old School', nameAr: 'اولد سكول', description: 'برجر مشوي على اللهب مع جبنة شيدر', priceEGP: 120, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200', category: 'Burgers', inStock: true },
      { id: 'p2', name: 'Animal Style', nameAr: 'انيمال ستايل', description: 'برجر مع صوص خاص وبصل مكرمل', priceEGP: 140, image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=200', category: 'Burgers', inStock: true },
    ],
    reviews: []
  },
  {
    id: 'm2',
    name: 'Seoudi Market',
    nameAr: 'سعودي ماركت',
    type: MerchantType.GROCERY,
    categoryText: 'سوبر ماركت • منتجات غذائية',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    rating: 4.9,
    minOrderEGP: 100,
    lat: 30.0500,
    lng: 31.2400,
    addressText: 'الزمالك، القاهرة',
    isOpen: true,
    products: [
      { id: 'p3', name: 'Milk 1L', nameAr: 'لبن 1 لتر', description: 'لبن كامل الدسم معقم', priceEGP: 45, image: 'https://images.unsplash.com/photo-1550583724-1255818c053b?w=200', category: 'Dairy', inStock: true },
    ],
    reviews: []
  }
];

const INITIAL_ORDERS: Order[] = [];

// --- STYLES & ANIMATIONS ---
const GlobalStyles = () => (
  <style>{`
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    @keyframes bounce-sm { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    .animate-scale-up { animation: scaleUp 0.3s ease-out; }
    .animate-bounce-sm { animation: bounce-sm 2s infinite ease-in-out; }
    
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    
    .nav-cart-btn {
      background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
      box-shadow: 0 8px 20px rgba(234, 88, 12, 0.3);
    }
    input, textarea {
      font-family: 'Cairo', sans-serif;
    }
  `}</style>
);

// --- UTILS ---
function calculateDeliveryFee(distanceKm: number, merchant: Merchant | undefined, settings: GlobalSettings) {
  if (merchant?.baseDeliveryFee !== undefined && merchant?.pricePerKm !== undefined) {
      return Math.ceil(merchant.baseDeliveryFee + (distanceKm * merchant.pricePerKm));
  }
  return Math.ceil((settings.defaultBaseFee || 15) + (distanceKm * (settings.defaultPricePerKm || 5)));
}

const STATUS_AR: Record<string, string> = {
  [OrderStatus.NEW]: 'جديد',
  [OrderStatus.CONFIRMED]: 'مقبول',
  [OrderStatus.PREPARING]: 'تجهيز',
  [OrderStatus.PICKED_UP]: 'استلام',
  [OrderStatus.ON_THE_WAY]: 'في الطريق',
  [OrderStatus.DELIVERED]: 'تم التوصيل',
  [OrderStatus.CANCELLED]: 'ملغي',
  [OrderStatus.NEARBY]: 'قريب جداً',
  [OrderStatus.ARRIVED]: 'وصل'
};

const playNotifSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  audio.play().catch(e => console.log('Audio play blocked:', e));
};

// --- SHARED UI COMPONENTS ---

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }: any) => {
  const base = "font-bold transition-all active:scale-95 flex items-center justify-center gap-2 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes: any = { sm: "px-3 py-1.5 text-xs", md: "px-5 py-3 text-sm", lg: "px-6 py-4 text-base" };
  const variants: any = {
    primary: "bg-orange-600 text-white shadow-lg shadow-orange-500/30 hover:-translate-y-0.5",
    secondary: "bg-white text-gray-900 border border-gray-100 hover:bg-gray-50 shadow-sm",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };
  return <button type="button" className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

const Card = ({ children, className = '', noPadding = false, ...props }: any) => (
  <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm ${noPadding ? '' : 'p-5'} ${className}`} {...props}>{children}</div>
);

const Badge = ({ children, color = 'gray' }: any) => {
  const colors: any = { 
    gray: 'bg-gray-100 text-gray-600', 
    green: 'bg-emerald-100 text-emerald-700', 
    blue: 'bg-blue-100 text-blue-700', 
    orange: 'bg-orange-100 text-orange-700', 
    red: 'bg-red-100 text-red-700',
  };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${colors[color]}`}>{children}</span>;
}

const NavButton = ({ active, onClick, icon: Icon, label, special = false, badge = 0 }: any) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all relative ${
      special 
        ? 'nav-cart-btn -mt-6 h-16 w-16 justify-center text-white scale-110' 
        : active ? 'text-orange-600 bg-orange-50' : 'text-gray-400'
    }`}
  >
    <Icon className={`${special ? 'w-7 h-7' : 'w-5 h-5'} ${special ? 'animate-bounce-sm' : ''}`} />
    {!special && <span className="text-[10px] font-black">{label}</span>}
    {badge > 0 && !special && (
      <span className="absolute top-1 right-2 bg-red-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full border border-white">
        {badge}
      </span>
    )}
    {special && badge > 0 && (
      <span className="absolute top-1 right-1 bg-white text-orange-600 text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black border-2 border-orange-600">
        {badge}
      </span>
    )}
  </button>
);

// --- MODALS ---

const CustomOrderModal = ({ onClose, onSubmit }: any) => {
    const [stores, setStores] = useState([{ id: Date.now(), storeName: '', address: '', items: [''] }]);

    const addStore = () => {
        setStores([...stores, { id: Date.now(), storeName: '', address: '', items: [''] }]);
    };

    const addItem = (storeId: number) => {
        setStores(stores.map(s => s.id === storeId ? { ...s, items: [...s.items, ''] } : s));
    };

    const updateStoreField = (id: number, field: string, value: string) => {
        setStores(stores.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const updateItemValue = (storeId: number, itemIndex: number, value: string) => {
        setStores(stores.map(s => s.id === storeId ? {
            ...s,
            items: s.items.map((it, idx) => idx === itemIndex ? value : it)
        } : s));
    };

    const isValid = stores.every(s => s.storeName.trim() && s.address.trim() && s.items.some(it => it.trim()));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
            <Card className="w-full max-w-sm p-6 animate-scale-up my-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-xl">أطلب أي حاجه من أي مكان</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
                </div>
                
                <div className="space-y-8 max-h-[60vh] overflow-y-auto scrollbar-hide px-1">
                    {stores.map((store, sIdx) => (
                        <div key={store.id} className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 relative">
                            {stores.length > 1 && (
                                <button onClick={() => setStores(stores.filter(s => s.id !== store.id))} className="absolute -top-2 -left-2 bg-red-100 text-red-600 p-1.5 rounded-full shadow-sm"><Trash className="w-3.5 h-3.5"/></button>
                            )}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase">اسم المحل / المكان ({sIdx + 1})</label>
                                <input className="w-full bg-white p-3 rounded-xl border outline-none focus:border-orange-500" placeholder="مثال: صيدلية مصر، كشك..." value={store.storeName} onChange={e => updateStoreField(store.id, 'storeName', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase">عنوان المحل بالتفصيل</label>
                                <input className="w-full bg-white p-3 rounded-xl border outline-none focus:border-orange-500" placeholder="الشارع، المنطقة..." value={store.address} onChange={e => updateStoreField(store.id, 'address', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase">قائمة المشتريات</label>
                                {store.items.map((item, iIdx) => (
                                    <div key={iIdx} className="flex gap-2">
                                        <input className="flex-1 bg-white p-3 rounded-xl border outline-none focus:border-orange-500 text-sm" placeholder={`منتج رقم ${iIdx + 1}...`} value={item} onChange={e => updateItemValue(store.id, iIdx, e.target.value)} />
                                        {store.items.length > 1 && (
                                            <button onClick={() => updateStoreField(store.id, 'items', store.items.filter((_, idx) => idx !== iIdx) as any)} className="p-2 text-gray-400 hover:text-red-500"><Minus className="w-4 h-4"/></button>
                                        )}
                                    </div>
                                ))}
                                <button onClick={() => addItem(store.id)} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"><Plus className="w-3 h-3"/> إضافة منتج آخر للمحل</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 space-y-3">
                    <button onClick={addStore} className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"><PlusCircle className="w-4 h-4"/> إضافة محل آخر للطلب</button>
                    <Button onClick={() => onSubmit(stores)} disabled={!isValid} className="w-full py-4 text-base">تأكيد وإضافة للسلة</Button>
                </div>
            </Card>
        </div>
    );
};

// --- DASHBOARDS ---

const AdminDashboard = ({ users, merchants, orders, setOrders, onLogout }: any) => {
    const [activeTab, setActiveTab] = useState('STATS');
    const [priceInput, setPriceInput] = useState<{ [orderId: string]: { [itemId: string]: string } }>({});

    const handlePriceChange = (orderId: string, itemId: string, value: string) => {
        setPriceInput(prev => ({
            ...prev,
            [orderId]: { ...prev[orderId], [itemId]: value }
        }));
    };

    const savePrices = (order: Order) => {
        const updatedItems = order.items.map(item => ({
            ...item,
            unitPriceEGP: parseFloat(priceInput[order.id]?.[item.productId] || item.unitPriceEGP.toString()) || 0
        }));
        const subtotal = updatedItems.reduce((s, i) => s + i.unitPriceEGP * i.qty, 0);
        setOrders(orders.map((o: Order) => o.id === order.id ? { ...o, items: updatedItems, subtotalEGP: subtotal, totalEGP: subtotal + o.deliveryFeeEGP } : o));
        alert('تم تحديث الأسعار بنجاح');
    };

    const stats = useMemo(() => ({
        sales: orders.reduce((s: number, o: Order) => s + (o.status === OrderStatus.DELIVERED ? o.totalEGP : 0), 0),
        count: orders.length,
        users: users.length,
        merchants: merchants.length
    }), [orders, users, merchants]);

    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">
            <aside className="w-64 bg-white border-l border-gray-100 p-6 flex flex-col">
                <div className="flex items-center gap-3 text-orange-600 mb-10">
                    <LayoutDashboard className="w-8 h-8" />
                    <span className="font-black text-xl">لوحة الإدارة</span>
                </div>
                <nav className="flex-1 space-y-2">
                    {[
                        { id: 'STATS', icon: BarChart3, label: 'الإحصائيات' },
                        { id: 'ORDERS', icon: List, label: 'كل الطلبات' },
                        { id: 'MERCHANTS', icon: Store, label: 'المتاجر' },
                        { id: 'USERS', icon: Users, label: 'المستخدمين' },
                    ].map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === item.id ? 'bg-orange-50 text-orange-600' : 'text-gray-400 hover:bg-gray-50'}`}>
                            <item.icon className="w-5 h-5" /> {item.label}
                        </button>
                    ))}
                </nav>
                <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-bold border border-red-50 mt-auto"><LogOut className="w-5 h-5" /> خروج</button>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                {activeTab === 'STATS' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-4 gap-6">
                            <Card className="border-none shadow-orange-500/5 bg-orange-50/30">
                                <p className="text-[10px] font-black text-orange-600 uppercase mb-2">إجمالي المبيعات</p>
                                <p className="text-3xl font-black text-gray-900">{stats.sales} ج.م</p>
                            </Card>
                            <Card className="border-none shadow-blue-500/5 bg-blue-50/30">
                                <p className="text-[10px] font-black text-blue-600 uppercase mb-2">الطلبات</p>
                                <p className="text-3xl font-black text-gray-900">{stats.count}</p>
                            </Card>
                            <Card className="border-none shadow-emerald-500/5 bg-emerald-50/30">
                                <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">المستخدمين</p>
                                <p className="text-3xl font-black text-gray-900">{stats.users}</p>
                            </Card>
                            <Card className="border-none shadow-purple-500/5 bg-purple-50/30">
                                <p className="text-[10px] font-black text-purple-600 uppercase mb-2">المتاجر</p>
                                <p className="text-3xl font-black text-gray-900">{stats.merchants}</p>
                            </Card>
                        </div>
                    </div>
                )}
                {activeTab === 'ORDERS' && (
                    <div className="space-y-4 animate-fade-in">
                        <h2 className="text-2xl font-black mb-6">إدارة الطلبات</h2>
                        {orders.map((o: Order) => (
                            <Card key={o.id} className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-black">#{o.orderNumber}</div>
                                        <div>
                                            <p className="font-black text-gray-900">{o.merchantName}</p>
                                            <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString('ar-EG')}</p>
                                        </div>
                                    </div>
                                    <Badge color={o.status === OrderStatus.DELIVERED ? 'green' : 'blue'}>{STATUS_AR[o.status]}</Badge>
                                </div>
                                {o.type === 'CUSTOM' && (
                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
                                        <p className="text-xs font-black text-gray-400 uppercase">تسعير طلب خاص (إلزامي)</p>
                                        {o.items.map(item => (
                                            <div key={item.productId} className="flex items-center justify-between gap-4">
                                                <div className="flex-1 text-sm font-bold text-gray-600">{item.productName}</div>
                                                <input 
                                                    className="w-24 bg-white p-2 border rounded-lg text-sm text-center font-black outline-none focus:border-orange-500" 
                                                    placeholder="السعر" 
                                                    value={priceInput[o.id]?.[item.productId] ?? item.unitPriceEGP}
                                                    onChange={e => handlePriceChange(o.id, item.productId, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" onClick={() => savePrices(o)} className="text-xs px-4">حفظ الأسعار وتحديث الإجمالي</Button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

const CourierDashboard = ({ user, orders, setOrders, onLogout }: any) => {
    const [activeTab, setActiveTab] = useState('AVAILABLE');
    const [priceInput, setPriceInput] = useState<{ [orderId: string]: { [itemId: string]: string } }>({});

    const handlePriceChange = (orderId: string, itemId: string, value: string) => {
        setPriceInput(prev => ({
            ...prev,
            [orderId]: { ...prev[orderId], [itemId]: value }
        }));
    };

    const available = orders.filter((o: Order) => o.status === OrderStatus.NEW && !o.courierId);
    const myOrders = orders.filter((o: Order) => o.courierId === user.id && o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED);

    const updateStatus = (orderId: string, newStatus: OrderStatus) => {
        setOrders(orders.map((o: any) => o.id === orderId ? { 
            ...o, 
            status: newStatus,
            statusHistory: [...(o.statusHistory || []), { status: newStatus, timestamp: new Date().toISOString(), note: `تحديث حالة بواسطة الكابتن: ${STATUS_AR[newStatus]}` }]
        } : o));
    };

    const savePrices = (order: Order) => {
        const updatedItems = order.items.map(item => ({
            ...item,
            unitPriceEGP: parseFloat(priceInput[order.id]?.[item.productId] || item.unitPriceEGP.toString()) || 0
        }));
        const subtotal = updatedItems.reduce((s, i) => s + i.unitPriceEGP * i.qty, 0);
        setOrders(orders.map((o: Order) => o.id === order.id ? { ...o, items: updatedItems, subtotalEGP: subtotal, totalEGP: subtotal + o.deliveryFeeEGP } : o));
    };

    const acceptOrder = (orderId: string) => {
        setOrders(orders.map((o: any) => o.id === orderId ? { ...o, courierId: user.id, status: OrderStatus.CONFIRMED } : o));
        setActiveTab('MY_ORDERS');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 p-4 max-w-md mx-auto" dir="rtl">
            <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30"><Truck /></div>
                    <div>
                        <h1 className="text-xl font-black">لوحة الكابتن</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{user.name}</p>
                    </div>
                </div>
                <button onClick={onLogout} className="p-3 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"><LogOut className="w-5 h-5"/></button>
            </header>

            <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <button onClick={() => setActiveTab('AVAILABLE')} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'AVAILABLE' ? 'bg-orange-50 text-orange-600' : 'text-gray-400'}`}>الطلبات المتاحة ({available.length})</button>
                <button onClick={() => setActiveTab('MY_ORDERS')} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'MY_ORDERS' ? 'bg-orange-50 text-orange-600' : 'text-gray-400'}`}>طلباتي النشطة ({myOrders.length})</button>
            </div>

            <div className="space-y-4 animate-fade-in">
                {(activeTab === 'AVAILABLE' ? available : myOrders).map((o: Order) => (
                    <Card key={o.id} className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-black text-lg">طلب #{o.orderNumber}</h3>
                                <p className="text-xs text-gray-400 font-bold">{o.merchantName}</p>
                            </div>
                            <Badge color="orange">{STATUS_AR[o.status]}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <MapPin className="w-4 h-4 text-orange-500" /> {o.deliveryAddress.street}
                        </div>

                        {activeTab === 'MY_ORDERS' && o.type === 'CUSTOM' && (
                            <div className="p-4 bg-orange-50 rounded-2xl space-y-3 border border-orange-100">
                                <p className="text-[10px] font-black text-orange-600 uppercase">تحديد سعر المنتجات (إلزامي للطلبات الخاصة)</p>
                                {o.items.map(item => (
                                    <div key={item.productId} className="flex items-center justify-between gap-4">
                                        <div className="flex-1 text-sm font-bold text-gray-700">{item.productName}</div>
                                        <input 
                                            className="w-20 bg-white p-2 border rounded-lg text-sm text-center font-black outline-none focus:border-orange-500" 
                                            placeholder="0" 
                                            value={priceInput[o.id]?.[item.productId] ?? item.unitPriceEGP}
                                            onChange={e => handlePriceChange(o.id, item.productId, e.target.value)}
                                        />
                                    </div>
                                ))}
                                <Button size="sm" onClick={() => savePrices(o)} className="w-full text-xs">حفظ الأسعار</Button>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                            <span className="font-black text-xl text-emerald-600">{o.totalEGP} ج.م</span>
                            {activeTab === 'AVAILABLE' ? (
                                <Button onClick={() => acceptOrder(o.id)}>قبول وتوصيل</Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => {
                                        const steps = [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.PICKED_UP, OrderStatus.ON_THE_WAY, OrderStatus.NEARBY, OrderStatus.DELIVERED];
                                        const curIdx = steps.indexOf(o.status);
                                        if (curIdx < steps.length - 1) updateStatus(o.id, steps[curIdx + 1]);
                                    }}>تحديث الحالة</Button>
                                    <button className="p-2 bg-gray-50 rounded-xl text-gray-400"><MessageSquare className="w-4 h-4"/></button>
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
                {(activeTab === 'AVAILABLE' ? available : myOrders).length === 0 && <div className="text-center py-20 text-gray-300 font-bold">لا توجد طلبات هنا</div>}
            </div>
        </div>
    );
};

const CustomerDashboard = ({ user, merchants, orders, setOrders, settings, onLogout, notifications, setNotifications, onSendMessage }: any) => {
    const [activeTab, setActiveTab] = useState('HOME');
    const [viewMerchant, setViewMerchant] = useState<Merchant | null>(null);
    const [cart, setCart] = useState<{ items: CartItem[] }>({ items: [] });
    const [modal, setModal] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [cancelReason, setCancelReason] = useState('');

    const filtered = merchants.filter((m: Merchant) => m.nameAr.includes(search) || m.name.toLowerCase().includes(search.toLowerCase()));
    const uniqueMerchantCount = useMemo(() => new Set(cart.items.filter(i => i.merchantId !== 'custom').map(i => i.merchantId)).size, [cart.items]);
    const multiVendorExtraFee = useMemo(() => uniqueMerchantCount > 1 ? (uniqueMerchantCount - 1) * settings.extraMerchantFee : 0, [uniqueMerchantCount, settings.extraMerchantFee]);

    const handlePlaceOrder = () => {
        if(cart.items.length === 0) return;
        const subtotal = cart.items.reduce((s, i) => s + i.unitPriceEGP * i.qty, 0);
        const merchant = merchants.find((m:any)=>m.id===cart.items[0].merchantId);
        const fee = calculateDeliveryFee(3.5, merchant, settings) + multiVendorExtraFee;
        
        const newOrder: Order = {
            id: `o${Date.now()}`,
            orderNumber: 100 + orders.length + 1,
            userId: user.id,
            status: OrderStatus.NEW,
            items: [...cart.items],
            subtotalEGP: subtotal,
            deliveryFeeEGP: fee,
            totalEGP: subtotal + fee,
            deliveryAddress: { id: 'a1', label: 'المنزل', street: 'وسط البلد، القاهرة', lat: 30.0444, lng: 31.2357 },
            createdAt: new Date().toISOString(),
            type: cart.items.some(i => i.merchantId === 'custom') ? 'CUSTOM' : 'MERCHANT',
            paymentMethod: PaymentMethod.COD,
            merchantName: cart.items.length > 1 ? `متعدد (${uniqueMerchantCount} متاجر)` : (cart.items[0].merchantName),
            statusHistory: [{ status: 'NEW', timestamp: new Date().toISOString(), note: 'تم استلام طلبك وجاري البحث عن كابتن' }]
        };
        setOrders([newOrder, ...orders]);
        setCart({ items: [] });
        setModal(null);
        setActiveTab('ORDERS');
        
        playNotifSound();
        setNotifications([{ id: `n${Date.now()}`, userId: user.id, message: `تم تأكيد طلبك #${newOrder.orderNumber}! السعر هايوصلك في دقايق.`, timestamp: new Date().toISOString(), isRead: false, type: 'ORDER' }, ...notifications]);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-28 max-w-md mx-auto relative animate-fade-in" dir="rtl">
            {/* Header */}
            <header className="p-6 bg-white sticky top-0 z-10 border-b border-gray-50 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-500/20">T</div>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 leading-none">Town Delivery</h1>
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">توصيل لكل احتياجاتك</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setModal({ type: 'NOTIFICATIONS' })} className="p-2 bg-gray-50 rounded-xl relative hover:bg-orange-50 transition-colors">
                        <Bell className="w-5 h-5 text-gray-400" />
                        {notifications.some((n:any)=>!n.isRead) && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-orange-600 rounded-full border-2 border-white"></span>}
                    </button>
                </div>
            </header>

            {/* Content Tabs */}
            {activeTab === 'HOME' && !viewMerchant && (
                <div className="p-4 space-y-6">
                    <div className="relative">
                        <Search className="absolute right-4 top-4 text-gray-400 w-5 h-5" />
                        <input className="w-full bg-white py-4 px-12 rounded-2xl shadow-sm border border-gray-100 outline-none text-sm focus:border-orange-500" placeholder="ابحث عن مطعم، سوبر ماركت..." value={search} onChange={e=>setSearch(e.target.value)} />
                    </div>

                    <div onClick={() => setModal({ type: 'CUSTOM_ORDER' })} className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-[2.5rem] text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group cursor-pointer active:scale-95 transition-transform">
                        <Zap className="absolute -bottom-4 -left-4 w-24 h-24 text-white/10 rotate-12 group-hover:rotate-0 transition-transform" />
                        <div className="relative z-10">
                            <Badge color="orange">السعر هايوصلك في دقايق</Badge>
                            <h3 className="font-black text-xl mt-2">أطلب أي حاجه من أي مكان</h3>
                            <p className="text-indigo-100 text-[10px] mt-1 opacity-80">صيدلية، كشك، محل خردوات.. اكتب بيانات المحل وهنجيبهولك</p>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold">بدء الطلب الخاص <ChevronLeft className="w-4 h-4" /></div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-lg">المتاجر والأسواق</h3>
                            <button className="text-[10px] font-black text-orange-600 uppercase">رؤية الكل</button>
                        </div>
                        {filtered.map((m: Merchant) => (
                            <div key={m.id} onClick={() => setViewMerchant(m)} className="bg-white p-3 rounded-[2rem] shadow-sm border border-gray-100 flex gap-4 active:scale-95 transition-transform cursor-pointer hover:border-orange-200">
                                <img src={m.image} className="w-20 h-20 rounded-2xl object-cover bg-gray-50" />
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-black text-gray-900 truncate">{m.nameAr}</h4>
                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg text-yellow-700 text-[10px] font-bold"><Star className="w-3 h-3 fill-yellow-500" /> {m.rating}</div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">{m.categoryText}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600"><Truck className="w-3 h-3" /> {m.baseDeliveryFee || settings.defaultBaseFee} ج.م</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'HOME' && viewMerchant && (
                <div className="p-4 animate-fade-in">
                    <button onClick={() => setViewMerchant(null)} className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-6"><ArrowRight className="w-4 h-4" /> العودة للقائمة</button>
                    <div className="relative h-48 rounded-[2.5rem] overflow-hidden shadow-lg mb-6">
                        <img src={viewMerchant.image} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                        <div className="absolute bottom-6 right-6 text-white">
                            <h2 className="text-2xl font-black">{viewMerchant.nameAr}</h2>
                            <p className="text-sm opacity-90">{viewMerchant.categoryText}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-black text-lg">المنتجات</h3>
                        {viewMerchant.products.map(p => (
                            <div key={p.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex gap-4 items-center">
                                <img src={p.image} className="w-16 h-16 rounded-2xl object-cover" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate">{p.nameAr}</h4>
                                    <p className="text-[10px] text-gray-400 line-clamp-1">{p.description}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="font-black text-orange-600">{p.priceEGP} ج.م</span>
                                        <button onClick={() => setCart({ items: [...cart.items, { productId: p.id, productName: p.nameAr, qty: 1, unitPriceEGP: p.priceEGP, merchantId: viewMerchant.id, merchantName: viewMerchant.nameAr }] })} className="w-8 h-8 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 transition-colors"><Plus className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'ORDERS' && (
                <div className="p-4 space-y-4 animate-fade-in">
                    <h3 className="font-black text-xl mb-4">طلباتي النشطة</h3>
                    {orders.filter((o:any)=>o.userId === user.id).map((o: Order) => (
                        <Card key={o.id} className="active:scale-95 transition-transform" onClick={() => setModal({ type: 'TRACKING', data: o })}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="min-w-0">
                                    <p className="font-black text-gray-900 truncate">{o.merchantName}</p>
                                    <p className="text-[10px] text-gray-400">#{o.orderNumber} • {new Date(o.createdAt).toLocaleDateString('ar-EG')}</p>
                                </div>
                                <Badge color={o.status === 'DELIVERED' ? 'green' : (o.status === 'CANCELLED' ? 'red' : 'blue')}>{STATUS_AR[o.status]}</Badge>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                <span className="font-black text-orange-600">{o.totalEGP} ج.م</span>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">تتبع <ChevronLeft className="w-3 h-3"/></div>
                            </div>
                        </Card>
                    ))}
                    {orders.filter((o:any)=>o.userId === user.id).length === 0 && <div className="text-center py-20 text-gray-300 font-bold">لا توجد طلبات سابقة</div>}
                </div>
            )}

            {activeTab === 'PROFILE' && (
                <div className="p-6 space-y-8 animate-fade-in">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-orange-100 rounded-[2rem] flex items-center justify-center text-orange-600 font-black text-3xl shadow-lg shadow-orange-500/10">{user.name.charAt(0)}</div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">{user.name}</h2>
                            <p className="text-sm text-gray-400 font-bold">{user.phone || '010XXXXXXXX'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="text-center bg-gray-50 border-none">
                            <div className="w-10 h-10 bg-white rounded-xl mx-auto flex items-center justify-center mb-2 shadow-sm text-blue-500"><ShoppingBag className="w-5 h-5"/></div>
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">الطلبات</p>
                            <p className="text-xl font-black">{orders.filter((o:any)=>o.userId === user.id).length}</p>
                        </Card>
                        <Card className="text-center bg-emerald-500 text-white border-none shadow-lg shadow-emerald-500/20">
                            <div className="w-10 h-10 bg-white/20 rounded-xl mx-auto flex items-center justify-center mb-2 text-white"><Wallet className="w-5 h-5"/></div>
                            <p className="text-[10px] font-black text-emerald-100 uppercase mb-1">الرصيد</p>
                            <p className="text-xl font-black">0.00 ج.م</p>
                        </Card>
                    </div>
                    <div className="space-y-3">
                        <button onClick={() => setModal({ type: 'ADDRESSES' })} className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 font-bold hover:bg-orange-50 transition-colors group">
                            <div className="flex items-center gap-4"><div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white"><MapPin className="w-5 h-5 text-gray-400"/></div> عناويني المحفوظة</div>
                            <ChevronLeft className="w-4 h-4 text-gray-300" />
                        </button>
                        <button onClick={() => setModal({ type: 'SETTINGS' })} className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 font-bold hover:bg-orange-50 transition-colors group">
                            <div className="flex items-center gap-4"><div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white"><Settings className="w-5 h-5 text-gray-400"/></div> إعدادات الحساب</div>
                            <ChevronLeft className="w-4 h-4 text-gray-300" />
                        </button>
                        <button onClick={onLogout} className="w-full flex items-center justify-between p-5 bg-red-50 rounded-2xl text-red-600 font-bold mt-4 hover:bg-red-100 transition-colors">
                            <div className="flex items-center gap-4"><LogOut className="w-5 h-5"/> تسجيل خروج</div>
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Nav */}
            <nav className="fixed bottom-6 left-6 right-6 bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-2 shadow-2xl border border-gray-100 flex justify-between items-center z-40">
                <NavButton active={activeTab === 'HOME'} onClick={() => {setActiveTab('HOME'); setModal(null); setViewMerchant(null);}} icon={Home} label="الرئيسية" />
                <NavButton active={activeTab === 'ORDERS'} onClick={() => {setActiveTab('ORDERS'); setModal(null);}} icon={List} label="طلباتي" />
                <NavButton active={modal?.type === 'CART'} onClick={() => setModal({ type: 'CART' })} icon={ShoppingBag} label="السلة" special badge={cart.items.length} />
                <NavButton active={modal?.type === 'NOTIFICATIONS'} onClick={() => setModal({ type: 'NOTIFICATIONS' })} icon={Bell} label="تنبيهات" badge={notifications.filter((n:any)=>!n.isRead).length} />
                <NavButton active={activeTab === 'PROFILE'} onClick={() => {setActiveTab('PROFILE'); setModal(null);}} icon={UserIcon} label="حسابي" />
            </nav>

            {/* Modals Container */}
            {modal?.type === 'CART' && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <Card className="w-full max-w-md p-6 animate-slide-up rounded-t-[3rem] max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-xl">سلة المشتريات</h3>
                            <button onClick={() => setModal(null)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="space-y-4 mb-6">
                            {cart.items.map((i:any,idx:number) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-black text-sm text-gray-900 truncate">{i.productName}</p>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase">{i.merchantName}</p>
                                        {i.customDetails && <p className="text-[9px] text-orange-600 font-bold mt-1 line-clamp-2 leading-relaxed whitespace-pre-wrap">{i.customDetails}</p>}
                                    </div>
                                    <div className="flex items-center gap-3 ml-4">
                                        <span className="font-black text-sm whitespace-nowrap">{i.unitPriceEGP * i.qty} ج.م</span>
                                        <button onClick={() => setCart({items: cart.items.filter((_,index)=>index!==idx)})} className="p-2 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"><Trash className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            ))}
                            {cart.items.length === 0 && <div className="text-center py-10 text-gray-400 font-bold">السلة فارغة</div>}
                        </div>
                        {cart.items.length > 0 && (
                            <div className="space-y-4 border-t border-gray-100 pt-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-gray-500 font-bold"><span>قيمة المنتجات</span><span>{cart.items.reduce((s,i)=>s+i.qty*i.unitPriceEGP,0)} ج.م</span></div>
                                    <div className="flex justify-between text-xs text-gray-500 font-bold"><span>رسوم التوصيل</span><span>{settings.defaultBaseFee} ج.م</span></div>
                                </div>
                                <div className="flex justify-between items-center font-black pt-2 text-xl"><span>الإجمالي</span><span className="text-orange-600">{cart.items.reduce((s,i)=>s+i.qty*i.unitPriceEGP,0) + settings.defaultBaseFee} ج.م</span></div>
                                <Button onClick={handlePlaceOrder} className="w-full py-5 text-lg shadow-xl shadow-orange-500/20">تأكيد الطلب</Button>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {modal?.type === 'CUSTOM_ORDER' && (
                <CustomOrderModal onClose={() => setModal(null)} onSubmit={(stores: any[]) => {
                    const newItems = stores.map((s, idx) => ({
                        productId: `custom-${Date.now()}-${idx}`,
                        productName: `طلب خاص من ${s.storeName}`,
                        qty: 1,
                        unitPriceEGP: 0,
                        merchantId: 'custom',
                        merchantName: s.storeName,
                        customDetails: `الموقع: ${s.address}\nالمنتجات:\n${s.items.filter((it: string) => it.trim()).join('\n')}`
                    }));
                    setCart({ items: [...cart.items, ...newItems] });
                    setModal(null);
                    setActiveTab('HOME');
                }} />
            )}

            {modal?.type === 'ADDRESSES' && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
                    <Card className="w-full max-w-sm p-6 text-center">
                        <MapPin className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                        <h3 className="font-black text-xl mb-4">عناويني المحفوظة</h3>
                        <div className="bg-gray-50 p-4 rounded-xl text-right mb-4">
                            <p className="font-black text-sm">المنزل</p>
                            <p className="text-xs text-gray-400">وسط البلد، القاهرة</p>
                        </div>
                        <Button onClick={() => setModal(null)} className="w-full">إغلاق</Button>
                    </Card>
                </div>
            )}

            {modal?.type === 'SETTINGS' && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
                    <Card className="w-full max-w-sm p-6">
                        <h3 className="font-black text-xl mb-6 text-center">إعدادات الحساب</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 border-b">
                                <span className="font-bold text-sm">الإشعارات الصوتية</span>
                                <button className="w-10 h-6 bg-orange-600 rounded-full flex items-center justify-end px-1"><div className="w-4 h-4 bg-white rounded-full"/></button>
                            </div>
                            <div className="flex justify-between items-center p-3 border-b">
                                <span className="font-bold text-sm">اللغة</span>
                                <span className="text-xs text-gray-400">العربية</span>
                            </div>
                        </div>
                        <Button onClick={() => setModal(null)} className="w-full mt-6">حفظ</Button>
                    </Card>
                </div>
            )}

            {modal?.type === 'NOTIFICATIONS' && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <Card className="w-full max-w-md p-6 animate-slide-up rounded-t-[3rem] h-[70vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-xl">التنبيهات</h3>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
                            {notifications.map((n:any) => (
                                <div key={n.id} onClick={() => setNotifications(notifications.map((x:any)=>x.id===n.id?{...x, isRead: true}:x))} className={`p-4 rounded-2xl border transition-colors ${n.isRead ? 'bg-white border-gray-50' : 'bg-orange-50 border-orange-100 shadow-sm'}`}>
                                    <div className="flex gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.type==='ORDER'?'bg-blue-100 text-blue-600':'bg-orange-100 text-orange-600'}`}>
                                            {n.type === 'ORDER' ? <Package className="w-5 h-5"/> : <Bell className="w-5 h-5"/>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-900">{n.message}</p>
                                            <p className="text-[9px] text-gray-400 mt-1 font-black uppercase">{new Date(n.timestamp).toLocaleString('ar-EG')}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {modal?.type === 'TRACKING' && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <Card className="w-full max-w-md p-6 animate-slide-up rounded-t-[3rem] max-h-[85vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-xl">تتبع طلب #{modal.data.orderNumber}</h3>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-orange-50 p-5 rounded-[2rem] border border-orange-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-sm"><Package /></div>
                                <div><p className="font-black text-sm text-orange-900">{STATUS_AR[modal.data.status]}</p><p className="text-[10px] text-orange-700 font-bold">من {modal.data.merchantName}</p></div>
                            </div>
                            <div className="space-y-4 border-r-2 border-dashed border-gray-100 pr-6 mr-3">
                                {modal.data.statusHistory?.map((h:any, i:number) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -right-[31px] top-1 w-3 h-3 rounded-full bg-orange-600 border-2 border-white"></div>
                                        <p className="font-bold text-xs">{STATUS_AR[h.status]}</p>
                                        <p className="text-[10px] text-gray-400">{h.note}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

// --- AUTH SCREEN ---

const LoginScreen = ({ onLogin }: any) => {
    const [form, setForm] = useState({ email: 'client@town.eg', password: '123' });
    
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const found = INITIAL_USERS.find(u => u.email === form.email && u.password === form.password);
        if (found) onLogin(found);
        else alert('البيانات غير صحيحة');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6" dir="rtl">
            <Card className="w-full max-w-md p-10 rounded-[3rem] shadow-2xl text-center border-none">
                <div className="w-20 h-20 bg-orange-600 rounded-[2.2rem] mx-auto flex items-center justify-center text-white mb-6 shadow-xl shadow-orange-500/30">
                    <Store className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black mb-2 text-gray-900">Town Delivery</h1>
                <p className="text-gray-400 font-bold mb-10 text-sm">التوصيل الأسرع في مصر 🇪🇬</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full bg-gray-50 p-5 rounded-2xl border border-gray-100 outline-none focus:border-orange-500 transition-colors text-right" placeholder="البريد الإلكتروني" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
                    <input className="w-full bg-gray-50 p-5 rounded-2xl border border-gray-100 outline-none focus:border-orange-500 transition-colors text-right" type="password" placeholder="كلمة المرور" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
                    <Button type="submit" className="w-full py-5 text-lg mt-4">تسجيل الدخول</Button>
                </form>
                <div className="mt-10 pt-8 border-t border-gray-50 grid grid-cols-3 gap-2">
                    {['admin', 'courier', 'client'].map(r => (
                        <button key={r} onClick={() => {
                            const u = INITIAL_USERS.find(x => x.username === r);
                            if(u) onLogin(u);
                        }} className="px-2 py-3 bg-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors">{r}</button>
                    ))}
                </div>
            </Card>
        </div>
    );
};

// --- APP ROOT ---

const App = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>(() => {
        const saved = localStorage.getItem('town_orders');
        return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    });
    const [notifications, setNotifications] = useState<AppNotification[]>(() => {
        const saved = localStorage.getItem('town_notifs');
        return saved ? JSON.parse(saved) : [];
    });
    const [settings, setSettings] = useState<GlobalSettings>(() => {
        const saved = localStorage.getItem('town_settings');
        return saved ? JSON.parse(saved) : { 
            defaultBaseFee: 15, 
            defaultPricePerKm: 5, 
            extraMerchantFee: 10, 
            vodafone: '01000000000', 
            instapay: 'town@eg', 
            deliveryZones: [] 
        };
    });

    useEffect(() => {
        localStorage.setItem('town_orders', JSON.stringify(orders));
    }, [orders]);

    useEffect(() => {
        localStorage.setItem('town_notifs', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        localStorage.setItem('town_settings', JSON.stringify(settings));
    }, [settings]);

    const handleSendMessage = (orderId: string, text: string) => {
        setOrders(orders.map(o => o.id === orderId ? { 
            ...o, 
            chat: [...(o.chat || []), { senderId: currentUser?.id!, senderName: currentUser?.name!, role: currentUser?.role!, text, timestamp: new Date().toISOString() }] 
        } : o));
    };

    if (!currentUser) return <LoginScreen onLogin={setCurrentUser} />;

    return (
        <>
            <GlobalStyles />
            {currentUser.role === Role.ADMIN && (
                <AdminDashboard 
                    users={INITIAL_USERS} 
                    merchants={INITIAL_MERCHANTS} 
                    orders={orders} setOrders={setOrders} 
                    settings={settings} setSettings={setSettings} 
                    onLogout={() => setCurrentUser(null)} 
                />
            )}
            {currentUser.role === Role.CUSTOMER && (
                <CustomerDashboard 
                    user={currentUser} 
                    merchants={INITIAL_MERCHANTS} 
                    orders={orders} setOrders={setOrders} 
                    settings={settings} 
                    onLogout={() => setCurrentUser(null)} 
                    onSendMessage={handleSendMessage} 
                    notifications={notifications} setNotifications={setNotifications} 
                />
            )}
            {currentUser.role === Role.COURIER && (
                <CourierDashboard 
                    user={currentUser} 
                    orders={orders} setOrders={setOrders} 
                    onLogout={() => setCurrentUser(null)} 
                />
            )}
        </>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
