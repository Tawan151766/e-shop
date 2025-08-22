1. 💳 Checkout Process (ขั้นตอนสั่งซื้อ)
เหตุผล: คุณมี Order, OrderItem, Payment, Shipping models ครบแล้ว

หน้า Checkout form (ที่อยู่จัดส่ง, เบอร์โทร)
สรุปคำสั่งซื้อ
สร้าง Order จาก Cart items

2. 💰 Payment System (ระบบชำระเงิน)
ใช้ Payment model ที่มีอยู่:

อัปโหลดสลิปโอนเงิน (slipUrl)
เปลี่ยนสถานะ Payment (WAITING → CONFIRMED)
PromptPay QR Code generation

3. 📦 Order Management (จัดการคำสั่งซื้อ)
ใช้ Order + OrderStatus enum:

Order tracking สำหรับลูกค้า
Order status updates
Order history

4. 🚚 Shipping System (ระบบจัดส่ง)
ใช้ Shipping model + ShippingStatus:

ระบบติดตาม tracking number
อัปเดตสถานะการจัดส่ง