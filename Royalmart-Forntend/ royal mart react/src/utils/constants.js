export const API_BASE = 'https://dummyjson.com/products';
export const PER_PAGE = 20;
export const CURRENCY = '$';
export const API_FIELDS =
  'id,title,price,discountPercentage,rating,brand,category,thumbnail,reviews';

export const CATEGORY_LABELS = {
  'mens-shirts,mens-shoes,mens-watches': 'Men',
  'womens-bags,womens-dresses,womens-jewellery,womens-shoes,womens-watches,tops': 'Women',
  kids: 'Kids',
  'home-decoration,kitchen-accessories,furniture': 'Home & Living',
  'beauty,skin-care,fragrances': 'Beauty',
  'smartphones,laptops,tablets,mobile-accessories': 'Studio'
};

export const CATEGORY_LINKS = [
  {
    label: 'Men',
    category: 'mens-shirts,mens-shoes,mens-watches'
  },
  {
    label: 'Women',
    category: 'womens-bags,womens-dresses,womens-jewellery,womens-shoes,womens-watches,tops'
  },
  {
    label: 'Kids',
    category: 'kids'
  },
  {
    label: 'Home & Living',
    category: 'home-decoration,kitchen-accessories,furniture'
  },
  {
    label: 'Beauty',
    category: 'beauty,skin-care,fragrances'
  },
  {
    label: 'Studio',
    category: 'smartphones,laptops,tablets,mobile-accessories',
    badge: 'New'
  }
];

// Keeping routes in one place makes navigation easier to follow.
export const ROUTES = {
  home: '/',
  legacyHome: '/index.html',
  wishlist: '/pages/wishlist.html',
  bag: '/pages/bag.html',
  checkout: '/pages/checkout.html',
  login: '/pages/login.html',
  forgotPassword: '/pages/forgot-password.html',
  profile: '/pages/profile.html',
  orderSuccess: '/pages/order-success.html'
};

export const CHECKOUT_CONVENIENCE_FEE = 99;

export const PAYMENT_METHOD_LABELS = {
  cod: 'Cash on Delivery',
  card: 'Credit / Debit Card',
  upi: 'UPI / Net Banking'
};

export const PAYMENT_OPTIONS = [
  {
    id: 'opt-cod',
    value: 'cod',
    icon: 'local_shipping',
    name: 'Cash on Delivery',
    desc: 'Pay when your order arrives'
  },
  {
    id: 'opt-card',
    value: 'card',
    icon: 'credit_card',
    name: 'Credit / Debit Card',
    desc: 'Visa, Mastercard, Amex'
  },
  {
    id: 'opt-upi',
    value: 'upi',
    icon: 'account_balance',
    name: 'UPI / Net Banking',
    desc: 'GPay, PhonePe, Paytm'
  }
];
