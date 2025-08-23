// src/module/shop/ShopFooter.js
"use client";
import { useRouter } from "next/navigation";

export default function ShopFooter() {
  const router = useRouter();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Shop</h3>
            <p className="text-gray-600 text-sm">
              ร้านค้าออนไลน์ที่มีสินค้าคุณภาพดี ราคาเป็นกันเอง พร้อมบริการที่ดีที่สุด
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">ลิงก์ด่วน</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => router.push("/")}
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  หน้าแรก
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push("/cart")}
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  ตะกร้าสินค้า
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push("/checkout")}
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  ชำระเงิน
                </button>
              </li>
            </ul>
          </div>

          {/* Order Services */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">บริการคำสั่งซื้อ</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => router.push("/order/track")}
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  ติดตามคำสั่งซื้อ
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push("/order/history")}
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  ประวัติการสั่งซื้อ
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push("/payment")}
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  อัปโหลดสลิป
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">ติดต่อเรา</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46Z"/>
                </svg>
                02-123-4567
              </li>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M224,48H32a8,8,0,0,0-8,8V192a8,8,0,0,0,8,8H224a8,8,0,0,0,8-8V56A8,8,0,0,0,224,48Zm-96,85.15L52.57,64H203.43ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05L203.43,192H52.57Zm46.74-10.85L216,74.19V181.81Z"/>
                </svg>
                info@shop.com
              </li>
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="mt-0.5">
                  <path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"/>
                </svg>
                123 ถนนสุขุมวิท กรุงเทพฯ 10110
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2024 Shop. สงวนลิขสิทธิ์.
          </p>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <button 
              onClick={() => router.push("/order/track")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              ติดตามคำสั่งซื้อ
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}