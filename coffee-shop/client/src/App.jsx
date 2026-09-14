import { useState } from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import { useAuth } from "./hooks/useAuth.js";
import { useShopState } from "./hooks/useShopState.js";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Toast from "./components/Toast.jsx";
import ChatWidget from "./components/ChatWidget.jsx";
import Login from "./views/Login.jsx";
import PublicOrderMenu from "./views/PublicOrderMenu.jsx";

import Dashboard from "./views/Dashboard.jsx";
import TableMap from "./views/TableMap.jsx";
import POSView from "./views/POSView.jsx";
import KitchenView from "./views/KitchenView.jsx";
import PaymentView from "./views/PaymentView.jsx";
import MenuManage from "./views/MenuManage.jsx";
import InventoryView from "./views/InventoryView.jsx";
import StaffView from "./views/StaffView.jsx";
import LoyaltyView from "./views/LoyaltyView.jsx";
import PromoManage from "./views/PromoManage.jsx";

// Lấy tableId từ query string (?table=...) — đây là link mà mã QR dán tại bàn trỏ tới.
// Có tableId ngay từ đầu => vào thẳng trang đặt món công khai, không cần đăng nhập.
function getTableIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("table");
}

export default function App() {
  const auth = useAuth();
  const [publicMode, setPublicMode] = useState(() => !!getTableIdFromUrl());
  const [publicTableId] = useState(() => getTableIdFromUrl());

  // ---- Chế độ công khai: khách quét QR hoặc bấm "Xem thực đơn" từ trang đăng nhập ----
  if (publicMode) {
    return (
      <PublicOrderMenu
        tableId={publicTableId}
        onBack={() => {
          setPublicMode(false);
          window.history.replaceState({}, "", window.location.pathname);
        }}
      />
    );
  }

  if (auth.loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-stone-100 text-stone-500 gap-2">
        <RefreshCw size={18} className="animate-spin" /> Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!auth.user) {
    return (
      <Login
        onLogin={auth.login}
        error={auth.error}
        onShowPublicMenu={() => setPublicMode(true)}
        onForgotVerify={auth.forgotPasswordVerify}
        onForgotReset={auth.forgotPasswordReset}
      />
    );
  }

  return (
    <AuthenticatedApp token={auth.token} user={auth.user} onLogout={auth.logout} onUnauthorized={auth.handleUnauthorized} />
  );
}

function AuthenticatedApp({ token, user, onLogout, onUnauthorized }) {
  const s = useShopState(token, user.roleKey, onUnauthorized);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (s.loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-stone-100 text-stone-500 gap-2">
        <RefreshCw size={18} className="animate-spin" /> Đang tải dữ liệu từ server...
      </div>
    );
  }

  if (s.error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-stone-100 text-stone-600 gap-3 px-6 text-center">
        <WifiOff size={28} className="text-red-500" />
        <div className="font-medium">Không kết nối được tới server backend</div>
        <div className="text-sm text-stone-500 max-w-md">
          {s.error}. Hãy chắc chắn server đang chạy (mặc định tại http://localhost:4000) rồi thử lại.
        </div>
        <button onClick={s.reload} className="mt-2 bg-amber-700 hover:bg-amber-800 text-white text-sm px-4 py-2 rounded-lg">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-stone-100 flex text-stone-800 font-sans overflow-hidden">
      <Sidebar
        role={user.roleKey}
        view={s.view}
        setView={s.setView}
        setActiveTableId={s.setActiveTableId}
        lowStockCount={s.lowStock.length}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar view={s.view} user={user} onLogout={onLogout} onOpenMobileMenu={() => setMobileNavOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {s.view === "dashboard" && (
            <Dashboard
              todayRevenue={s.todayRevenue}
              tables={s.tables}
              lowStock={s.lowStock}
              orders={s.orders}
              revenueByCategory={s.revenueByCategory}
              topSellers={s.topSellers}
              invoices={s.invoices}
            />
          )}

          {s.view === "tables" && !s.activeTableId && <TableMap tables={s.tables} onOpen={s.openTable} orders={s.orders} />}
          {s.view === "tables" && s.activeTableId && (
            <POSView
              table={s.tables.find((t) => t.id === s.activeTableId)}
              order={s.getOrderForTable(s.activeTableId)}
              menu={s.menu}
              cats={s.cats}
              onBack={() => s.setActiveTableId(null)}
              onAdd={s.addItemToOrder}
              onQty={s.changeQty}
              onSend={s.sendToKitchen}
            />
          )}

          {s.view === "kitchen" && <KitchenView orders={s.orders} tables={s.tables} menu={s.menu} onReady={s.markItemReady} />}

          {s.view === "payment" && (
            <PaymentView
              orders={s.openOrdersReady}
              tables={s.tables}
              menu={s.menu}
              customers={s.customers}
              promos={s.promos}
              onCheckout={s.checkout}
              onGetPaymentQr={s.getPaymentQr}
            />
          )}

          {s.view === "menu" && (
            <MenuManage menu={s.menu} cats={s.cats} onAdd={s.addMenuItem} onToggleStatus={s.toggleMenuStatus} onRemove={s.removeMenuItem} />
          )}

          {s.view === "promotions" && (
            <PromoManage
              promos={s.promosAll}
              onAdd={s.addPromo}
              onUpdate={s.updatePromo}
              onToggleActive={s.togglePromoActive}
              onRemove={s.removePromo}
            />
          )}

          {s.view === "inventory" && <InventoryView ingredients={s.ingredients} onNhapKho={s.nhapKho} onXuatKho={s.xuatKho} />}

          {s.view === "staff" && <StaffView staff={s.staff} onAdd={s.addStaff} onToggleActive={s.toggleStaffActive} />}

          {s.view === "loyalty" && <LoyaltyView customers={s.customers} onAdd={s.addCustomer} />}
        </main>
      </div>

      <ChatWidget menu={s.menu} lowStock={s.lowStock} todayRevenue={s.todayRevenue} topSellers={s.topSellers} />

      <Toast message={s.toast} />
    </div>
  );
}
