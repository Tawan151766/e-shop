# Admin Order Manager Documentation

## ภาพรวม

AdminOrderManager เป็นหน้าจัดการคำสั่งซื้อสำหรับผู้ดูแลระบบ ที่รวมฟีเจอร์การจัดการคำสั่งซื้อ, การตรวจสอบการชำระเงิน, และการจัดการการจัดส่งไว้ในหน้าเดียว

## ตำแหน่งไฟล์

- **Component**: `src/module/admin/order/AdminOrderManager.js`
- **Page**: `src/app/admin/order/page.js`
- **URL**: `/admin/order`

## ฟีเจอร์หลัก

### 1. การจัดการคำสั่งซื้อ (Order Management)

- แสดงรายการคำสั่งซื้อทั้งหมด
- กรองตามสถานะคำสั่งซื้อ
- ดูรายละเอียดคำสั่งซื้อ
- อัปเดตสถานะคำสั่งซื้อ

### 2. การตรวจสอบการชำระเงิน (Payment Verification)

- ตรวจสอบหลักฐานการชำระเงิน
- ยืนยันหรือปฏิเสธการชำระเงิน
- ดูสลิปการโอนเงิน

### 3. การจัดการการจัดส่ง (Shipping Management)

- สร้างข้อมูลการจัดส่ง
- แก้ไขข้อมูลการจัดส่ง
- อัปเดตสถานะการจัดส่ง

## สถานะคำสั่งซื้อ

| สถานะ             | ภาษาไทย     | สี      | ขั้นตอน | คำอธิบาย                    |
| ----------------- | ----------- | ------- | ------- | --------------------------- |
| `PENDING_PAYMENT` | รอชำระเงิน  | orange  | 0       | รอลูกค้าชำระเงิน            |
| `WAITING_CONFIRM` | รอยืนยัน    | blue    | 1       | รอ admin ตรวจสอบการชำระเงิน |
| `PAID`            | ชำระแล้ว    | green   | 2       | ยืนยันการชำระเงินแล้ว       |
| `SHIPPING`        | กำลังจัดส่ง | purple  | 3       | อยู่ระหว่างจัดส่ง           |
| `COMPLETED`       | เสร็จสิ้น   | success | 4       | จัดส่งสำเร็จแล้ว            |
| `CANCELLED`       | ยกเลิก      | red     | -1      | ยกเลิกคำสั่งซื้อ            |

## สถานะการจัดส่ง

| สถานะ       | ภาษาไทย      | สี     | คำอธิบาย                      |
| ----------- | ------------ | ------ | ----------------------------- |
| `PREPARING` | เตรียมสินค้า | orange | กำลังเตรียมสินค้าสำหรับจัดส่ง |
| `SHIPPED`   | จัดส่งแล้ว   | blue   | ส่งสินค้าออกไปแล้ว            |
| `DELIVERED` | จัดส่งสำเร็จ | green  | ลูกค้าได้รับสินค้าแล้ว        |

## บริษัทขนส่งที่รองรับ

- Thailand Post
- Kerry Express
- J&T Express
- Flash Express
- Ninja Van
- DHL
- FedEx
- UPS

## การใช้งาน

### 1. ดูรายการคำสั่งซื้อ

1. เข้าหน้า `/admin/order`
2. ดูรายการคำสั่งซื้อในตาราง
3. ใช้แท็บด้านบนเพื่อกรองตามสถานะ
4. คลิก "ดูรายละเอียด" เพื่อดูข้อมูลเต็ม

### 2. ตรวจสอบการชำระเงิน

1. หาคำสั่งซื้อที่มีสถานะ "รอยืนยัน" (สีน้ำเงิน)
2. คลิกปุ่ม "ตรวจสอบ"
3. ดูหลักฐานการชำระเงินและข้อมูลการโอนเงิน
4. คลิก "ยืนยันการชำระเงิน" หรือ "ปฏิเสธการชำระเงิน"

### 3. จัดการการจัดส่ง

1. หาคำสั่งซื้อที่มีสถานะ "ชำระแล้ว" หรือ "กำลังจัดส่ง"
2. คลิกปุ่ม "จัดส่ง"
3. กรอกข้อมูล:
   - เลือกบริษัทขนส่ง
   - ใส่หมายเลขติดตาม (ถ้ามี)
   - เลือกสถานะการจัดส่ง
4. คลิก "สร้างการจัดส่ง" หรือ "อัปเดตการจัดส่ง"

### 4. อัปเดตสถานะคำสั่งซื้อ

1. คลิก "ดูรายละเอียด" ในคำสั่งซื้อที่ต้องการ
2. ในส่วน "สถานะคำสั่งซื้อ" เลือกสถานะใหม่จาก dropdown
3. ระบบจะอัปเดตสถานะอัตโนมัติ

## API ที่ใช้

### Order APIs

- `GET /api/admin/orders` - ดึงรายการคำสั่งซื้อ
- `PUT /api/admin/orders/[orderId]/status` - อัปเดตสถานะคำสั่งซื้อ
- `GET /api/admin/orders/statistics` - ดึงสถิติคำสั่งซื้อ

### Payment APIs

- `GET /api/admin/payments?orderId={orderId}` - ดึงข้อมูลการชำระเงินตาม orderId
- `POST /api/admin/payments/[paymentId]/confirm` - ยืนยัน/ปฏิเสธการชำระเงิน

### Shipping APIs

- `GET /api/admin/shipping?orderId={orderId}` - ดึงข้อมูลการจัดส่งตาม orderId
- `POST /api/admin/shipping` - สร้างข้อมูลการจัดส่ง
- `PUT /api/admin/shipping/[shippingId]` - อัปเดตข้อมูลการจัดส่ง

## State Management

### หลัก States

```javascript
const [orders, setOrders] = useState([]); // รายการคำสั่งซื้อ
const [loading, setLoading] = useState(false); // สถานะโหลด
const [modalOpen, setModalOpen] = useState(false); // Modal รายละเอียดคำสั่งซื้อ
const [selectedOrder, setSelectedOrder] = useState(null); // คำสั่งซื้อที่เลือก
const [activeTab, setActiveTab] = useState("ALL"); // แท็บที่เลือก
```

### Payment States

```javascript
const [paymentModalOpen, setPaymentModalOpen] = useState(false); // Modal ตรวจสอบการชำระเงิน
const [paymentVerifying, setPaymentVerifying] = useState(false); // สถานะการยืนยันการชำระเงิน
const [orderPayment, setOrderPayment] = useState(null); // ข้อมูลการชำระเงิน
```

### Shipping States

```javascript
const [shippingModalOpen, setShippingModalOpen] = useState(false); // Modal จัดการการจัดส่ง
const [shippingLoading, setShippingLoading] = useState(false); // สถานะโหลดการจัดส่ง
const [orderShipping, setOrderShipping] = useState(null); // ข้อมูลการจัดส่ง
const [shippingForm] = Form.useForm(); // Form การจัดส่ง
```

## ฟังก์ชันหลัก

### Order Functions

- `fetchOrders(status)` - ดึงรายการคำสั่งซื้อ
- `handleViewOrder(order)` - แสดงรายละเอียดคำสั่งซื้อ
- `handleUpdateStatus(orderId, newStatus)` - อัปเดตสถานะคำสั่งซื้อ

### Payment Functions

- `handleVerifyPayment(orderId, verified)` - ยืนยัน/ปฏิเสธการชำระเงิน
- `getPaymentStatus(order)` - ดึงสถานะการชำระเงิน
- `getPaymentMethod(payment)` - ดึงวิธีการชำระเงิน

### Shipping Functions

- `handleCreateShipping(orderId)` - เปิด Modal จัดการการจัดส่ง
- `handleSaveShipping(values)` - บันทึกข้อมูลการจัดส่ง

### Utility Functions

- `getStatusConfig(status)` - ดึงการตั้งค่าสถานะ
- `getOrderProgress(status)` - ดึงความคืบหน้าคำสั่งซื้อ
- `getNextStatusOptions(currentStatus)` - ดึงตัวเลือกสถานะถัดไป

## Components ที่ใช้

### Ant Design Components

- `Table` - ตารางแสดงรายการคำสั่งซื้อ
- `Modal` - หน้าต่างป๊อปอัพ
- `Button` - ปุ่มต่างๆ
- `Tag` - แสดงสถานะ
- `Steps` - แสดงขั้นตอนคำสั่งซื้อ
- `Form` - ฟอร์มจัดการการจัดส่ง
- `Select` - เลือกตัวเลือก
- `Input` - ช่องกรอกข้อมูล
- `Descriptions` - แสดงรายละเอียด
- `Card` - การ์ดแสดงข้อมูล
- `Alert` - ข้อความแจ้งเตือน
- `Image` - แสดงรูปภาพ

### Custom Components

- `OrderStatistics` - สถิติคำสั่งซื้อ

## การจัดการ Error

- แสดงข้อความ error ผ่าน `message.error()`
- Log error ใน console สำหรับ debugging
- Fallback UI เมื่อไม่มีข้อมูล

## การ Optimize Performance

- ใช้ `pagination` ในตาราง
- `lazy loading` สำหรับข้อมูลการชำระเงินและการจัดส่ง
- `debounce` สำหรับการค้นหา (ถ้ามี)

## ข้อกำหนดความปลอดภัย

- ตรวจสอบสิทธิ์ admin ก่อนเข้าใช้งาน (TODO)
- Validate ข้อมูลก่อนส่งไป API
- ป้องกัน XSS ด้วย Ant Design components

## การทดสอบ

- ทดสอบการแสดงรายการคำสั่งซื้อ
- ทดสอบการกรองตามสถานะ
- ทดสอบการตรวจสอบการชำระเงิน
- ทดสอบการจัดการการจัดส่ง
- ทดสอบการอัปเดตสถานะ

## การพัฒนาต่อ

- เพิ่มการค้นหาคำสั่งซื้อ
- เพิ่มการ export ข้อมูล
- เพิ่มการแจ้งเตือนแบบ real-time
- เพิ่มการจัดการ bulk actions
- เพิ่มการ audit log

## ปัญหาที่พบบ่อย

### 1. API Error 500

**สาเหตุ**: Database connection หรือ Prisma schema ไม่ตรงกัน
**แก้ไข**:

```bash
npx prisma generate
npx prisma db push
# รีสตาร์ท Next.js server
```

### 2. ข้อมูลไม่แสดง

**สาเหตุ**: ไม่มีข้อมูลในฐานข้อมูล
**แก้ไข**: ตรวจสอบข้อมูลในฐานข้อมูลหรือสร้างข้อมูลทดสอบ

### 3. Payment/Shipping Modal ไม่แสดงข้อมูล

**สาเหตุ**: API ไม่ส่งข้อมูลกลับมา
**แก้ไข**: ตรวจสอบ API response และ error handling

## การบำรุงรักษา

- อัปเดต dependencies เป็นประจำ
- ตรวจสอบ performance เป็นระยะ
- รีวิว code และ refactor เมื่อจำเป็น
- อัปเดต documentation เมื่อมีการเปลี่ยนแปลง
