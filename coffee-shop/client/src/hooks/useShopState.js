import { useState, useEffect, useCallback } from "react";
import { NAV } from "../data/constants.js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const EMPTY_STATE = {
  categories: [], menu: [], ingredients: [], tables: [], staff: [], customers: [], promos: [], promosAll: [],
  orders: [], invoices: [], dashboard: { todayRevenue: 0, revenueByCategory: [], topSellers: [], lowStock: [] },
};

// Hook trung tâm: gọi API backend thật, có gửi kèm token đăng nhập (JWT) trong
// header Authorization ở MỌI request. Sau mỗi thao tác thay đổi dữ liệu, hook
// gọi lại GET /api/state để đồng bộ toàn bộ giao diện với CSDL.
export function useShopState(token, roleKey, onUnauthorized) {
  const firstView = NAV.find((n) => n.roles.includes(roleKey))?.key || "dashboard";
  const [view, setView] = useState(firstView);
  const [activeTableId, setActiveTableId] = useState(null);
  const [toast, setToast] = useState(null);
  const [data, setData] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  async function api(path, opts = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...opts,
    });
    if (res.status === 401) {
      onUnauthorized?.();
      throw new Error("Phiên đăng nhập đã hết hạn");
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Có lỗi xảy ra, vui lòng thử lại");
    return body;
  }

  const refresh = useCallback(async () => {
    try {
      const json = await api("/api/state");
      setData(json);
      setError(null);
    } catch (e) {
      setError(e.message || "Không kết nối được tới server");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function openTable(table) {
    try {
      await api(`/api/tables/${table.id}/open`, { method: "POST" });
      await refresh();
      setActiveTableId(table.id);
    } catch (e) {
      showToast(e.message);
    }
  }

  function getOrderForTable(tableId) {
    return data.orders.find((o) => o.tableId === tableId && o.status === "open");
  }

  async function addItemToOrder(orderId, menuId) {
    try {
      await api(`/api/orders/${orderId}/items`, { method: "POST", body: JSON.stringify({ menuId }) });
      await refresh();
    } catch (e) {
      showToast(e.message);
    }
  }

  async function changeQty(orderId, itemId, delta) {
    try {
      await api(`/api/orders/${orderId}/items/${itemId}`, { method: "PATCH", body: JSON.stringify({ delta }) });
      await refresh();
    } catch (e) {
      showToast(e.message);
    }
  }

  async function sendToKitchen(orderId) {
    try {
      await api(`/api/orders/${orderId}/send-kitchen`, { method: "POST" });
      await refresh();
      showToast("Đã gửi order xuống khu pha chế");
    } catch (e) {
      showToast(e.message);
    }
  }

  async function markItemReady(orderId, itemId) {
    try {
      const result = await api(`/api/orders/${orderId}/items/${itemId}/ready`, { method: "POST" });
      await refresh();
      showToast(
        result.insufficient
          ? "Đã hoàn thành — cảnh báo: nguyên liệu không đủ, đã trừ kho về 0"
          : "Món đã sẵn sàng phục vụ, đã trừ kho nguyên liệu"
      );
    } catch (e) {
      showToast(e.message);
    }
  }

  async function getPaymentQr(orderId, promoId) {
    try {
      const qs = promoId && promoId !== "p0" ? `?promoId=${encodeURIComponent(promoId)}` : "";
      return await api(`/api/orders/${orderId}/payment-qr${qs}`);
    } catch (e) {
      showToast(e.message);
      return null;
    }
  }

  async function checkout(orderId, { promoId, customerPhone, method }) {
    try {
      const result = await api(`/api/orders/${orderId}/checkout`, {
        method: "POST",
        body: JSON.stringify({ promoId, customerPhone, method }),
      });
      await refresh();
      showToast(result.pointsEarned ? `Thanh toán thành công — Khách nhận +${result.pointsEarned} điểm` : "Thanh toán thành công");
      setActiveTableId(null);
    } catch (e) {
      showToast(e.message);
    }
  }

  async function addMenuItem({ name, price, catId, description }) {
    try {
      await api(`/api/menu`, { method: "POST", body: JSON.stringify({ name, price, catId, description }) });
      await refresh();
    } catch (e) {
      showToast(e.message);
    }
  }
  async function toggleMenuStatus(id) {
    try {
      await api(`/api/menu/${id}/toggle`, { method: "PATCH" });
      await refresh();
    } catch (e) {
      showToast(e.message);
    }
  }
  async function removeMenuItem(id) {
    try {
      await api(`/api/menu/${id}`, { method: "DELETE" });
      await refresh();
    } catch (e) {
      showToast(e.message);
    }
  }

  async function nhapKho(id, qty) {
    try {
      await api(`/api/ingredients/${id}/nhap-kho`, { method: "POST", body: JSON.stringify({ qty }) });
      await refresh();
    } catch (e) {
      showToast(e.message);
    }
  }
  async function xuatKho(id, qty) {
    try {
      await api(`/api/ingredients/${id}/xuat-kho`, { method: "POST", body: JSON.stringify({ qty }) });
      await refresh();
    } catch (e) {
      showToast(e.message);
    }
  }

  async function addStaff({ name, role: roleName, phone }) {
    try {
      const result = await api(`/api/staff`, { method: "POST", body: JSON.stringify({ name, role: roleName, phone }) });
      await refresh();
      showToast(`Đã tạo tài khoản — đăng nhập: ${result.username} / mật khẩu mặc định: ${result.defaultPassword}`);
    } catch (e) {
      showToast(e.message);
    }
  }
  async function toggleStaffActive(id) {
    try {
      await api(`/api/staff/${id}/toggle`, { method: "PATCH" });
      await refresh();
    } catch (e) {
      showToast(e.message);
    }
  }

  async function addCustomer({ name, phone }) {
    try {
      await api(`/api/customers`, { method: "POST", body: JSON.stringify({ name, phone }) });
      await refresh();
    } catch (e) {
      showToast(e.message);
    }
  }

  // ===== Khuyến mãi (Admin/Quản lý thêm - sửa - xoá; Thu ngân chỉ xem & áp dụng) =====
  async function addPromo({ name, percent, min }) {
    try {
      await api(`/api/promos`, { method: "POST", body: JSON.stringify({ name, percent, min }) });
      await refresh();
      showToast("Đã thêm khuyến mãi mới");
    } catch (e) {
      showToast(e.message);
    }
  }
  async function updatePromo(id, { name, percent, min }) {
    try {
      await api(`/api/promos/${id}`, { method: "PATCH", body: JSON.stringify({ name, percent, min }) });
      await refresh();
      showToast("Đã cập nhật khuyến mãi");
    } catch (e) {
      showToast(e.message);
    }
  }
  async function togglePromoActive(id) {
    try {
      await api(`/api/promos/${id}/toggle`, { method: "PATCH" });
      await refresh();
    } catch (e) {
      showToast(e.message);
    }
  }
  async function removePromo(id) {
    try {
      await api(`/api/promos/${id}`, { method: "DELETE" });
      await refresh();
      showToast("Đã xoá khuyến mãi");
    } catch (e) {
      showToast(e.message);
    }
  }

  const openOrdersReady = data.orders.filter((o) => o.status === "open" && o.items.length > 0);

  return {
    loading, error, reload: refresh,
    view, setView, activeTableId, setActiveTableId, toast,
    menu: data.menu, ingredients: data.ingredients, tables: data.tables, staff: data.staff,
    customers: data.customers, promos: data.promos, promosAll: data.promosAll, cats: data.categories,
    orders: data.orders, invoices: data.invoices,
    lowStock: data.dashboard.lowStock, openOrdersReady,
    todayRevenue: data.dashboard.todayRevenue,
    revenueByCategory: data.dashboard.revenueByCategory,
    topSellers: data.dashboard.topSellers,
    openTable, getOrderForTable, addItemToOrder, changeQty, sendToKitchen, markItemReady, checkout,
    addMenuItem, toggleMenuStatus, removeMenuItem, nhapKho, xuatKho, addStaff, toggleStaffActive, addCustomer,
    addPromo, updatePromo, togglePromoActive, removePromo,
    getPaymentQr,
  };
}
