"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Edit3,
  Eye,
  Filter,
  RefreshCw,
} from "lucide-react";

const SHIPPING_STATUS = {
  PREPARING: {
    label: "เตรียมสินค้า",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  SHIPPED: {
    label: "จัดส่งแล้ว",
    color: "bg-blue-100 text-blue-800",
    icon: Truck,
  },
  DELIVERED: {
    label: "จัดส่งสำเร็จ",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
};

const COURIERS = [
  "Thailand Post",
  "Kerry Express",
  "J&T Express",
  "Flash Express",
  "Ninja Van",
  "DHL",
  "FedEx",
  "UPS",
];

export default function AdminShippingManager() {
  const [shippings, setShippings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [paidOrders, setPaidOrders] = useState([]);

  useEffect(() => {
    fetchShippings();
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    if (showCreateModal) {
      fetchPaidOrders();
    }
  }, [showCreateModal]);

  const fetchShippings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: "20",
        status: statusFilter,
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/shipping?${params}`);
      const data = await response.json();

      if (response.ok) {
        setShippings(data.shippings);
        setTotalPages(data.totalPages);
        setError("");
      } else {
        setError(data.error || "Failed to fetch shipping records");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaidOrders = async () => {
    try {
      const response = await fetch(
        "/api/admin/orders?status=PAID&pageSize=100"
      );
      const data = await response.json();

      if (response.ok) {
        // Filter orders that don't have shipping records yet
        const ordersWithoutShipping = data.orders.filter(
          (order) => !order.shippings || order.shippings.length === 0
        );
        setPaidOrders(ordersWithoutShipping);
      }
    } catch (err) {
      console.error("Failed to fetch paid orders:", err);
    }
  };

  const handleCreateShipping = async (formData) => {
    try {
      const response = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        fetchShippings();
      } else {
        setError(data.error || "Failed to create shipping record");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Create error:", err);
    }
  };

  const handleUpdateShipping = async (shippingId, formData) => {
    try {
      const response = await fetch(`/api/admin/shipping/${shippingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setShowEditModal(false);
        setSelectedShipping(null);
        fetchShippings();
      } else {
        setError(data.error || "Failed to update shipping record");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Update error:", err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-8 h-8 text-blue-600" />
            จัดการการจัดส่ง
          </h1>
          <p className="text-gray-600 mt-1">
            ติดตามและจัดการสถานะการจัดส่งสินค้า
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          สร้างการจัดส่ง
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="ค้นหาด้วยหมายเลขติดตาม, บริษัทขนส่ง, หรือชื่อลูกค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">สถานะทั้งหมด</option>
              <option value="PREPARING">เตรียมสินค้า</option>
              <option value="SHIPPED">จัดส่งแล้ว</option>
              <option value="DELIVERED">จัดส่งสำเร็จ</option>
            </select>
            <button
              onClick={fetchShippings}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              รีเฟรช
            </button>
          </div>
        </div>
      </div>

      {/* Shipping List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  คำสั่งซื้อ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ลูกค้า
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  บริษัทขนส่ง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  หมายเลขติดตาม
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่สร้าง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shippings.map((shipping) => {
                const statusInfo = SHIPPING_STATUS[shipping.status];
                const StatusIcon = statusInfo.icon;

                return (
                  <tr key={shipping.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{shipping.order.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        ฿{Number(shipping.order.totalAmount).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {shipping.order.customer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {shipping.order.customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shipping.courier || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {shipping.trackingNumber ? (
                        <div className="text-sm font-mono text-blue-600">
                          {shipping.trackingNumber}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(shipping.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedShipping(shipping);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Edit3 className="w-4 h-4" />
                          แก้ไข
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {shippings.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">ไม่พบข้อมูลการจัดส่ง</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ก่อนหน้า
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              หน้า {currentPage} จาก {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}

      {/* Create Shipping Modal */}
      {showCreateModal && (
        <CreateShippingModal
          paidOrders={paidOrders}
          couriers={COURIERS}
          onSubmit={handleCreateShipping}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Shipping Modal */}
      {showEditModal && selectedShipping && (
        <EditShippingModal
          shipping={selectedShipping}
          couriers={COURIERS}
          onSubmit={(formData) =>
            handleUpdateShipping(selectedShipping.id, formData)
          }
          onClose={() => {
            setShowEditModal(false);
            setSelectedShipping(null);
          }}
        />
      )}
    </div>
  );
}

// Create Shipping Modal Component
function CreateShippingModal({ paidOrders, couriers, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    orderId: "",
    courier: "",
    trackingNumber: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.orderId) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">สร้างการจัดส่งใหม่</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              คำสั่งซื้อ *
            </label>
            <select
              value={formData.orderId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, orderId: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">เลือกคำสั่งซื้อ</option>
              {paidOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  #{order.id} - {order.customer.name} (฿
                  {Number(order.totalAmount).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              บริษัทขนส่ง
            </label>
            <select
              value={formData.courier}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, courier: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">เลือกบริษัทขนส่ง</option>
              {couriers.map((courier) => (
                <option key={courier} value={courier}>
                  {courier}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              หมายเลขติดตาม
            </label>
            <input
              type="text"
              value={formData.trackingNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  trackingNumber: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ใส่หมายเลขติดตาม"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              สร้าง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Shipping Modal Component
function EditShippingModal({ shipping, couriers, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    courier: shipping.courier || "",
    trackingNumber: shipping.trackingNumber || "",
    status: shipping.status,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">แก้ไขการจัดส่ง</h2>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            คำสั่งซื้อ: #{shipping.order.id}
          </p>
          <p className="text-sm text-gray-600">
            ลูกค้า: {shipping.order.customer.name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              บริษัทขนส่ง
            </label>
            <select
              value={formData.courier}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, courier: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">เลือกบริษัทขนส่ง</option>
              {couriers.map((courier) => (
                <option key={courier} value={courier}>
                  {courier}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              หมายเลขติดตาม
            </label>
            <input
              type="text"
              value={formData.trackingNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  trackingNumber: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ใส่หมายเลขติดตาม"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              สถานะ
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PREPARING">เตรียมสินค้า</option>
              <option value="SHIPPED">จัดส่งแล้ว</option>
              <option value="DELIVERED">จัดส่งสำเร็จ</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
