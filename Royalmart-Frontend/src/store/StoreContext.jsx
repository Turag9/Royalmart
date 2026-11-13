import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { httpClient, onUnauthorized, getApiError } from '../utils/httpClient';

const StoreContext = createContext(null);

const STORAGE_KEYS = {
  user: 'user',
  users: 'users',
  orders: 'orders',
  lastOrder: 'lastOrder',
  // Guest-only fallbacks. Logged-in cart/wishlist live in the backend so we no
  // longer persist them to localStorage by user identity.
  guestCart: 'guestCart',
  guestWishlist: 'guestWishlist'
};

function readFromStorage(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function writeToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function removeOneMatchingId(list, targetId) {
  // The bag can hold duplicate items, so we only remove one matching entry at a time.
  const nextList = [...list];
  const matchIndex = nextList.findIndex((itemId) => String(itemId) === String(targetId));
  if (matchIndex !== -1) nextList.splice(matchIndex, 1);
  return nextList;
}

// Expand a list of cart rows ({ productId, quantity }) into the duplicated-id
// representation that the rest of the UI (BagPage, CheckoutPage, Header count)
// is built around. Two units of a product become two array entries.
function expandCartRows(rows) {
  const expanded = [];
  for (const row of rows || []) {
    const qty = Math.max(1, Number(row.quantity) || 1);
    for (let i = 0; i < qty; i += 1) expanded.push(String(row.productId));
  }
  return expanded;
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => readFromStorage(STORAGE_KEYS.guestCart, []));
  const [wishlist, setWishlist] = useState(() => readFromStorage(STORAGE_KEYS.guestWishlist, []));
  const [user, setUser] = useState(() => readFromStorage(STORAGE_KEYS.user, null));
  const [users, setUsers] = useState(() => readFromStorage(STORAGE_KEYS.users, []));
  const [orders, setOrders] = useState(() => readFromStorage(STORAGE_KEYS.orders, []));
  const [lastOrder, setLastOrder] = useState(() => readFromStorage(STORAGE_KEYS.lastOrder, null));
  const [toast, setToast] = useState(null);

  // Refs let action callbacks read the latest state without rebinding their
  // identity on every render. Combined with useCallback this keeps the
  // context value stable across cart/wishlist mutations.
  const userRef = useRef(user);
  const cartRef = useRef(cart);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { cartRef.current = cart; }, [cart]);

  useEffect(() => writeToStorage(STORAGE_KEYS.users, users), [users]);
  useEffect(() => writeToStorage(STORAGE_KEYS.orders, orders), [orders]);

  // Only persist cart/wishlist to localStorage when there is no logged-in
  // user — guest state survives reloads but never leaks across user accounts.
  useEffect(() => {
    if (user) return;
    writeToStorage(STORAGE_KEYS.guestCart, cart);
  }, [cart, user]);
  useEffect(() => {
    if (user) return;
    writeToStorage(STORAGE_KEYS.guestWishlist, wishlist);
  }, [wishlist, user]);

  useEffect(() => {
    if (user) writeToStorage(STORAGE_KEYS.user, user);
    else localStorage.removeItem(STORAGE_KEYS.user);
  }, [user]);

  useEffect(() => {
    if (lastOrder) writeToStorage(STORAGE_KEYS.lastOrder, lastOrder);
    else localStorage.removeItem(STORAGE_KEYS.lastOrder);
  }, [lastOrder]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  // ── 401 handler ─────────────────────────────────────────────────────────
  // When the cookie expires, kick the user back to a fresh logged-out state
  // so the UI doesn't keep trying calls that won't succeed.
  useEffect(() => {
    return onUnauthorized(() => {
      setUser(null);
      setOrders([]);
      setLastOrder(null);
      setCart([]);
      setWishlist([]);
      setToast('Session expired, please log in again');
    });
  }, []);

  // ── Hydrate cart + wishlist from server on login / page refresh ─────────
  useEffect(() => {
    if (!user?.id) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const [cartRes, wishlistRes] = await Promise.all([
          httpClient.get('/cart'),
          httpClient.get('/wishlist')
        ]);
        if (!cancelled) {
          setCart(expandCartRows(cartRes.data?.data));
          setWishlist((wishlistRes.data?.data || []).map((row) => String(row.productId)));
        }
      } catch {
        // 401 handler above takes care of expired sessions.
      }
    })();

    return () => { cancelled = true; };
  }, [user?.id]);

  // ── Server-sync helpers (no-op when not logged in) ─────────────────────
  const apiAddToCart = useCallback(async (productId) => {
    if (!userRef.current) return;
    try {
      await httpClient.post('/cart', { productId: String(productId), quantity: 1 });
    } catch { /* swallow — UI already updated optimistically */ }
  }, []);

  const apiRemoveFromCart = useCallback(async (productId) => {
    if (!userRef.current) return;
    try {
      await httpClient.delete(`/cart/${encodeURIComponent(String(productId))}`);
    } catch {}
  }, []);

  const apiClearCartItem = useCallback(async (productId) => {
    if (!userRef.current) return;
    try {
      await httpClient.delete(`/cart/${encodeURIComponent(String(productId))}?clear=true`);
    } catch {}
  }, []);

  const apiAddToWishlist = useCallback(async (productId) => {
    if (!userRef.current) return;
    try {
      await httpClient.post('/wishlist', { productId: String(productId) });
    } catch {}
  }, []);

  const apiRemoveFromWishlist = useCallback(async (productId) => {
    if (!userRef.current) return;
    try {
      await httpClient.delete(`/wishlist/${encodeURIComponent(String(productId))}`);
    } catch {}
  }, []);

  // ── User-facing actions, all stable across renders ─────────────────────
  const addToCart = useCallback((id) => {
    const strId = String(id);
    setCart((current) => [...current, strId]);
    apiAddToCart(strId);
  }, [apiAddToCart]);

  const removeFromCart = useCallback((id) => {
    const strId = String(id);
    setCart((current) => removeOneMatchingId(current, strId));
    apiRemoveFromCart(strId);
  }, [apiRemoveFromCart]);

  const clearCart = useCallback(() => {
    if (userRef.current) {
      const distinct = Array.from(new Set(cartRef.current.map(String)));
      for (const id of distinct) apiClearCartItem(id);
    }
    setCart([]);
  }, [apiClearCartItem]);

  const toggleWishlist = useCallback((id) => {
    const strId = String(id);
    setWishlist((current) => {
      if (current.includes(strId)) {
        apiRemoveFromWishlist(strId);
        return current.filter((itemId) => itemId !== strId);
      }
      apiAddToWishlist(strId);
      return [...current, strId];
    });
  }, [apiAddToWishlist, apiRemoveFromWishlist]);

  const removeFromWishlist = useCallback((id) => {
    const strId = String(id);
    setWishlist((current) => current.filter((itemId) => itemId !== strId));
    apiRemoveFromWishlist(strId);
  }, [apiRemoveFromWishlist]);

  const moveWishlistItemToCart = useCallback((id) => {
    const strId = String(id);
    setCart((current) => {
      if (current.includes(strId)) return current;
      apiAddToCart(strId);
      return [...current, strId];
    });
  }, [apiAddToCart]);

  const login = useCallback(async (email, password) => {
    try {
      const res = await httpClient.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password
      });
      const data = res.data?.data || {};
      const loggedInUser = {
        id: data.id,
        name: data.displayName || data.name || data.firstName,
        email: data.email,
        joinedAt: data.createdAt
      };
      // Reset before setting user so a stale render doesn't show another
      // account's items even briefly. The hydrate effect on user.id will
      // then populate them from the backend.
      setCart([]);
      setWishlist([]);
      setUser(loggedInUser);

      try {
        const ordersRes = await httpClient.get('/orders/my-orders');
        const userOrders = (ordersRes.data?.data || []).map((o) => ({
          id: o.orderNumber,
          date: o.createdAt,
          status: o.status,
          items: Array.isArray(o.itemsSnapshot) && o.itemsSnapshot.length
            ? o.itemsSnapshot.map((it) => ({ name: it.name || '', price: Number(it.price) || 0, quantity: it.quantity || 1 }))
            : (o.notes ? o.notes.split(', ').map((name) => ({ name, price: 0 })) : []),
          total: Number(o.totalAmount),
          paymentMethod: o.paymentMethod,
          fromBackend: true
        }));
        if (userOrders.length) setOrders(userOrders);
      } catch {}

      return { ok: true };
    } catch (err) {
      return { ok: false, error: getApiError(err, 'Invalid email or password.') };
    }
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || undefined;
    try {
      const res = await httpClient.post('/auth/register', {
        firstName, lastName, email: email.trim().toLowerCase(), password
      });
      const data = res.data?.data || {};
      const newUser = {
        id: data.id,
        name: data.displayName || data.name || name.trim(),
        email: data.email,
        joinedAt: data.createdAt || new Date().toISOString()
      };
      setCart([]);
      setWishlist([]);
      setUsers((current) => [...current, newUser]);
      setUser(newUser);
      return { ok: true };
    } catch (err) {
      const fallback = err?.response?.data?.errors?.[0]?.message || 'Registration failed';
      return { ok: false, error: getApiError(err, fallback) };
    }
  }, []);

  const logout = useCallback(async () => {
    try { await httpClient.post('/auth/logout'); } catch {}
    setUser(null);
    setOrders([]);
    setLastOrder(null);
    setCart([]);
    setWishlist([]);
    localStorage.removeItem(STORAGE_KEYS.guestCart);
    localStorage.removeItem(STORAGE_KEYS.guestWishlist);
  }, []);

  /**
   * placeOrder — sends the current cart to the backend with full item
   * details (productId, quantity, price, name). The server recomputes the
   * total and rejects mismatches so a tampered client cannot place a 1-taka
   * order.
   */
  const placeOrder = useCallback(async (order) => {
    setOrders((current) => [order, ...current]);
    setLastOrder(order);

    if (userRef.current) {
      const distinct = Array.from(new Set(cartRef.current.map(String)));
      for (const id of distinct) apiClearCartItem(id);
    }
    setCart([]);

    try {
      const items = (order.items || []).map((it, idx) => ({
        productId: String(it.productId ?? it.id ?? idx),
        quantity: Number(it.quantity || 1),
        price: Number(it.price || 0),
        name: it.name || '',
        image: it.image || ''
      }));

      const res = await httpClient.post('/orders/customer', {
        items,
        totalAmount: Number(order.total),
        paymentMethod: order.paymentMethodCode || 'COD',
        shippingAddress: order.shippingAddress || { address: 'Customer Address', city: 'N/A' }
      });

      const backendOrder = {
        id: res.data.data.orderNumber,
        date: res.data.data.createdAt,
        status: res.data.data.status,
        items: order.items,
        total: Number(res.data.data.totalAmount),
        paymentMethod: res.data.data.paymentMethod,
        fromBackend: true
      };
      setOrders((current) => current.map((o) => (o.id === order.id ? backendOrder : o)));
    } catch (err) {
      // Roll back the optimistic order so the UI doesn't show a fake one.
      setOrders((current) => current.filter((o) => o.id !== order.id));
      setLastOrder(null);
      setToast(getApiError(err, 'Could not place order'));
    }
  }, [apiClearCartItem]);

  const cancelOrder = useCallback(async (orderId) => {
    setOrders((current) => current.filter((o) => o.id !== orderId));
    setToast('Order cancelled successfully');
    try { await httpClient.patch(`/orders/cancel/${encodeURIComponent(orderId)}`); } catch {}
  }, []);

  const removeOrder = useCallback(async (orderId) => {
    setOrders((current) => current.filter((o) => o.id !== orderId));
    setToast('Order removed from history');
    try { await httpClient.delete(`/orders/remove/${encodeURIComponent(orderId)}`); } catch {}
  }, []);

  const refreshOrders = useCallback(async () => {
    try {
      const res = await httpClient.get('/orders/my-orders');
      const backendOrders = (res.data?.data || []).map((o) => ({
        id: o.orderNumber,
        date: o.createdAt,
        status: o.status,
        items: Array.isArray(o.itemsSnapshot) && o.itemsSnapshot.length
          ? o.itemsSnapshot.map((it) => ({ name: it.name || '', price: Number(it.price) || 0, quantity: it.quantity || 1 }))
          : (o.notes ? o.notes.split(', ').map((name) => ({ name, price: 0 })) : []),
        total: Number(o.totalAmount),
        paymentMethod: o.paymentMethod,
        fromBackend: true
      }));
      if (backendOrders.length) setOrders(backendOrders);
    } catch {}
  }, []);

  // Memoise the context value. State slices are dependencies so consumers
  // see the latest values; action callbacks already have stable identities.
  const value = useMemo(
    () => ({
      cart, wishlist, user, users, orders, lastOrder, toast,
      setToast,
      addToCart, removeFromCart, clearCart,
      toggleWishlist, removeFromWishlist, moveWishlistItemToCart,
      login, signup, logout,
      placeOrder, cancelOrder, removeOrder, refreshOrders
    }),
    [
      cart, wishlist, user, users, orders, lastOrder, toast,
      addToCart, removeFromCart, clearCart,
      toggleWishlist, removeFromWishlist, moveWishlistItemToCart,
      login, signup, logout,
      placeOrder, cancelOrder, removeOrder, refreshOrders
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}
