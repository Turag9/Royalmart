import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const StoreContext = createContext(null);

const STORAGE_KEYS = {
  cart: 'cart',
  wishlist: 'wishlist',
  user: 'user',
  users: 'users',
  orders: 'orders',
  lastOrder: 'lastOrder'
};

function readFromStorage(key, fallbackValue) {
  try {
    // If storage is empty or unreadable, we fall back so the app can still boot normally.
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

  if (matchIndex !== -1) {
    nextList.splice(matchIndex, 1);
  }

  return nextList;
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => readFromStorage(STORAGE_KEYS.cart, []));
  const [wishlist, setWishlist] = useState(() => readFromStorage(STORAGE_KEYS.wishlist, []));
  const [user, setUser] = useState(() => readFromStorage(STORAGE_KEYS.user, null));
  const [users, setUsers] = useState(() => readFromStorage(STORAGE_KEYS.users, []));
  const [orders, setOrders] = useState(() => readFromStorage(STORAGE_KEYS.orders, []));
  const [lastOrder, setLastOrder] = useState(() => readFromStorage(STORAGE_KEYS.lastOrder, null));
  const [toast, setToast] = useState(null);

  // These slices are always stored as JSON, so a simple sync effect keeps
  // localStorage and React state in step.
  useEffect(() => writeToStorage(STORAGE_KEYS.cart, cart), [cart]);
  useEffect(() => writeToStorage(STORAGE_KEYS.wishlist, wishlist), [wishlist]);
  useEffect(() => writeToStorage(STORAGE_KEYS.users, users), [users]);
  useEffect(() => writeToStorage(STORAGE_KEYS.orders, orders), [orders]);

  useEffect(() => {
    if (user) {
      writeToStorage(STORAGE_KEYS.user, user);
    } else {
      // Removing the key entirely makes the "logged out" state very clear.
      localStorage.removeItem(STORAGE_KEYS.user);
    }
  }, [user]);

  useEffect(() => {
    if (lastOrder) {
      writeToStorage(STORAGE_KEYS.lastOrder, lastOrder);
    } else {
      localStorage.removeItem(STORAGE_KEYS.lastOrder);
    }
  }, [lastOrder]);

  useEffect(() => {
    if (!toast) return undefined;

    // Toasts are short-lived messages, so we auto-hide them after a moment.
    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  const value = useMemo(
    () => ({
      // Expose both the raw state and the actions pages/components need.
      cart,
      wishlist,
      user,
      users,
      orders,
      lastOrder,
      toast,
      setToast,
      addToCart(id) {
        setCart((current) => [...current, String(id)]);
      },
      removeFromCart(id) {
        setCart((current) => removeOneMatchingId(current, id));
      },
      clearCart() {
        setCart([]);
      },
      toggleWishlist(id) {
        const strId = String(id);
        setWishlist((current) =>
          current.includes(strId)
            ? current.filter((itemId) => itemId !== strId)
            : [...current, strId]
        );
      },
      removeFromWishlist(id) {
        const strId = String(id);
        setWishlist((current) => current.filter((itemId) => itemId !== strId));
      },
      moveWishlistItemToCart(id) {
        const strId = String(id);
        // If it is already in the bag, we keep things simple and do nothing.
        setCart((current) => (current.includes(strId) ? current : [...current, strId]));
      },
      async login(email, password) {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email: email.trim().toLowerCase(), password })
          });

          const json = await res.json();

          if (!res.ok) {
            return { ok: false, error: json.message || 'Invalid email or password.' };
          }

          const loggedInUser = {
            id: json.data.id,
            name: json.data.displayName || json.data.name || json.data.firstName,
            email: json.data.email,
            joinedAt: json.data.createdAt
          };

          setUser(loggedInUser);

          // Fetch user's orders from backend
          try {
            const ordersRes = await fetch(`${API_BASE}/orders/my-orders`, { credentials: 'include' });
            if (ordersRes.ok) {
              const ordersJson = await ordersRes.json();
              const userOrders = (ordersJson.data || []).map((o) => ({
                id: o.orderNumber,
                date: o.createdAt,
                status: o.status,
                items: o.notes ? o.notes.split(', ').map((name) => ({ name, price: 0 })) : [],
                total: Number(o.totalAmount),
                paymentMethod: o.paymentMethod,
                fromBackend: true
              }));
              if (userOrders.length) setOrders(userOrders);
            }
          } catch {}

          return { ok: true };
        } catch {
          return { ok: false, error: 'Network error. Please try again.' };
        }
      },
      async signup(name, email, password) {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const nameParts = name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || undefined;

        try {
          const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ firstName, lastName, email: email.trim().toLowerCase(), password })
          });

          const json = await res.json();

          if (!res.ok) {
            return { ok: false, error: json.message || 'Registration failed' };
          }

          const newUser = {
            id: json.data.id,
            name: json.data.displayName || json.data.name || name.trim(),
            email: json.data.email,
            joinedAt: json.data.createdAt || new Date().toISOString()
          };

          setUsers((current) => [...current, newUser]);
          setUser(newUser);
          return { ok: true };
        } catch {
          return { ok: false, error: 'Network error. Please try again.' };
        }
      },
      logout() {
        setUser(null);
        setOrders([]);
        setLastOrder(null);
        setCart([]);
        setWishlist([]);
      },
      async placeOrder(order) {
        // Save locally for immediate UI feedback
        setOrders((current) => [order, ...current]);
        setLastOrder(order);
        setCart([]);

        // Send to backend
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        try {
          let userId = order.userId;

          // If user id is missing (old session), fetch profile to get it
          if (!userId) {
            const profileRes = await fetch(`${API_BASE}/auth/profile`, { credentials: 'include' });
            if (profileRes.ok) {
              const profileJson = await profileRes.json();
              userId = profileJson.data?.id;
              if (userId) setUser((prev) => ({ ...prev, id: userId }));
            }
          }

          if (!userId && !user?.email) return;

          const res = await fetch(`${API_BASE}/orders/customer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              userId,
              email: user?.email,
              totalAmount: order.total,
              paymentMethod: order.paymentMethodCode,
              shippingAddress: { address: 'Customer Address', city: 'N/A' },
              itemsSummary: order.items.map((i) => i.name).join(', ')
            })
          });

          if (res.ok) {
            const json = await res.json();
            const backendOrder = {
              id: json.data.orderNumber,
              date: json.data.createdAt,
              status: json.data.status,
              items: order.items,
              total: Number(json.data.totalAmount),
              paymentMethod: json.data.paymentMethod,
              fromBackend: true
            };
            // Replace local temp order with backend order
            setOrders((current) =>
              current.map((o) => (o.id === order.id ? backendOrder : o))
            );
          }
        } catch {
          // Order is still saved locally even if backend call fails
        }
      },
      async cancelOrder(orderId) {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        // Update locally immediately
        setOrders((current) =>
          current.filter((order) => order.id !== orderId)
        );
        setToast('Order cancelled successfully');
        // Also cancel on backend
        try {
          await fetch(`${API_BASE}/orders/cancel/${encodeURIComponent(orderId)}`, {
            method: 'PATCH',
            credentials: 'include'
          });
        } catch {}
      },
      async removeOrder(orderId) {
        setOrders((current) => current.filter((order) => order.id !== orderId));
        setToast('Order removed from history');
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        try {
          await fetch(`${API_BASE}/orders/remove/${encodeURIComponent(orderId)}`, {
            method: 'DELETE',
            credentials: 'include'
          });
        } catch {}
      },
      async refreshOrders() {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        try {
          const res = await fetch(`${API_BASE}/orders/my-orders`, { credentials: 'include' });
          if (res.ok) {
            const json = await res.json();
            const backendOrders = (json.data || []).map((o) => ({
              id: o.orderNumber,
              date: o.createdAt,
              status: o.status,
              items: o.notes ? o.notes.split(', ').map((name) => ({ name, price: 0 })) : [],
              total: Number(o.totalAmount),
              paymentMethod: o.paymentMethod,
              fromBackend: true
            }));
            if (backendOrders.length) setOrders(backendOrders);
          }
        } catch {}
      }
    }),
    [cart, wishlist, user, users, orders, lastOrder, toast]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error('useStore must be used inside StoreProvider');
  }

  return context;
}
