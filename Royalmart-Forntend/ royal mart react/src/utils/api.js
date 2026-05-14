import items from '../assets/data/items';
import { API_BASE, API_FIELDS } from './constants';
import { calcSalePrice } from './helpers';

const productCache = new Map();
const BAG_DELIVERY_DATE = 'Mar 15, 2026';

async function getJson(url) {
  // Small helper so all API calls share the same success/error handling.
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

function normalizeCatalogProduct(rawProduct) {
  // Wishlist and bag use this friendlier shape instead of the raw API response.
  const roundedDiscount = Math.round(rawProduct.discountPercentage);

  return {
    id: String(rawProduct.id),
    image: rawProduct.thumbnail,
    company: rawProduct.brand || rawProduct.category,
    item_name: rawProduct.title,
    original_price: rawProduct.price,
    current_price: calcSalePrice(rawProduct.price, roundedDiscount),
    discount_percentage: roundedDiscount,
    rating: rawProduct.rating,
    reviews: rawProduct.reviews ? rawProduct.reviews.length : 0,
    return_period: 14,
    delivery_date: BAG_DELIVERY_DATE
  };
}

function normalizeCheckoutProduct(rawProduct) {
  // Checkout only needs a smaller set of fields, so we shape it once here.
  return {
    id: String(rawProduct.id),
    name: rawProduct.title,
    brand: rawProduct.brand || 'Royal Mart',
    image: rawProduct.thumbnail,
    price: rawProduct.price,
    originalPrice: Math.round(rawProduct.price / (1 - rawProduct.discountPercentage / 100)),
    discount: Math.round(rawProduct.discountPercentage)
  };
}

export async function fetchProductList(page, perPage) {
  const skip = (page - 1) * perPage;
  const url = `${API_BASE}?limit=${perPage}&skip=${skip}&select=${API_FIELDS}`;
  return getJson(url);
}

export async function fetchProductsByCategory(categorySlugs) {
  const slugs = categorySlugs.split(',');
  // One nav tab can map to multiple API categories, so we fetch and merge them here.
  const requests = slugs.map((slug) =>
    getJson(`${API_BASE}/category/${slug}?select=${API_FIELDS}`)
      .then((data) => data.products || [])
  );

  const groups = await Promise.all(requests);
  return groups.flat();
}

export async function searchProducts(query, page, perPage) {
  const skip = (page - 1) * perPage;
  const url = `${API_BASE}/search?q=${encodeURIComponent(
    query
  )}&limit=${perPage}&skip=${skip}&select=${API_FIELDS}`;
  return getJson(url);
}

export async function fetchProductById(id) {
  const cacheKey = String(id);
  if (productCache.has(cacheKey)) {
    // Reusing cached products keeps repeat visits snappy and avoids extra API calls.
    return productCache.get(cacheKey);
  }

  const product = await getJson(`${API_BASE}/${id}`);
  productCache.set(cacheKey, product);
  return product;
}

export async function resolveCatalogProduct(id) {
  try {
    const product = await fetchProductById(id);
    return normalizeCatalogProduct(product);
  } catch {
    // Local fallback data keeps the UI usable even if the API does not respond.
    return items.find((item) => String(item.id) === String(id)) || null;
  }
}

export async function resolveCheckoutProduct(id) {
  try {
    const product = await fetchProductById(id);
    return normalizeCheckoutProduct(product);
  } catch {
    const local = items.find((item) => String(item.id) === String(id));

    if (!local) return null;

    return {
      id: String(local.id),
      name: local.item_name,
      brand: local.company,
      image: local.image,
      price: local.current_price,
      originalPrice: local.original_price,
      discount: local.discount_percentage
    };
  }
}
