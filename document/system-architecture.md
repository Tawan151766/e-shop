# System Architecture Documentation

## การทำงานของ 3 โฟลเดอร์หลัก: Products API, Shop Module, และ Checkout

> เอกสารอธิบายการทำงานร่วมกันของระบบ E-commerce ตั้งแต่การแสดงสินค้า จนถึงการสั่งซื้อ

---

## 📁 1. Products API (`src/app/api/products/`)

### ไฟล์หลัก

- `route.js` - API endpoint สำหรับดึงข้อมูลสินค้า

### การทำงาน

```javascript
GET /api/products?page=1&pageSize=16&categoryId=all
```

### ใช้ Database Tables

- **`products`** - ข้อมูลสินค้าหลัก
- **`categories`** - หมวดหมู่สินค้า (ผ่าน categoryId filter)

### Features

- **Pagination** - แบ่งหน้าสินค้า (page, pageSize)
- **Category Filter** - กรองตามหมวดหมู่
- **Soft Delete** - ไม่แสดงสินค้าที่ถูกลบ (`deletedAt: null`)
- **Sorting** - เรียงตามวันที่สร้างล่าสุด

### Response Format

```json
{
  "products": [...],
  "total": 150,
  "page": 1,
  "pageSize": 16,
  "totalPages": 10
}
```

---

## 📁 2. Shop Module (`src/module/shop/`)

### ไฟล์หลัก

- `MainModule.js` - Component หลักที่ควบคุมทั้งหน้า Shop
- `ShopHeader.js` - Header พร้อม Cart และ Search
- `ProductGrid.js` - แสดงสินค้าในรูปแบบ Grid
- `CategoryFilterBar.js` - แถบกรองหมวดหมู่
- `Pagination.js` - ปุ่มเปลี่ยนหน้า
- `HeroBanner.js` - แบนเนอร์โปรโมชั่น

### การทำงาน

1. **Load ข้อมูลเริ่มต้น**

   ```javascript
   // ดึงหมวดหมู่และโปรโมชั่น
   Promise.all([
     axios.get("/api/home"), // categories
     axios.get("/api/promotions"), // promo products
   ]);
   ```

2. **Load สินค้าตาม Filter**
   ```javascript
   axios.get("/api/products", {
     params: { page, pageSize, categoryId },
   });
   ```

### State Management

- `categories` - รายการหมวดหมู่
- `products` - สินค้าในหน้าปัจจุบัน
- `promoProducts` - สินค้าโปรโมชั่น
- `selectedCategory` - หมวดหมู่ที่เลือก
- `page` - หน้าปัจจุบัน
- `loading` - สถานะการโหลด

### ใช้ Database Tables (ผ่าน API)

- **`categories`** - หมวดหมู่สินค้า
- **`products`** - รายการสินค้า
- **`promotions`** - โปรโมชั่นสินค้า

---

## 📁 3. Checkout (`src/app/checkout/`)

### ไฟล์หลัก

- `page.js` - Server Component สำหรับ Checkout
- `route.js` (API) - API endpoint สำหรับสร้าง Order

### การทำงาน

#### 3.1 Checkout Page (Server Side)

```javascript
// 1. ตรวจสอบ Authentication
const session = await getServerSession(authOptions);

// 2. ดึงข้อมูล Cart พร้อม Product details
const cart = await prisma.cart.findUnique({
  include: {
    cartItems: {
      include: {
        product: {
          include: {
            promotions: {...},
            galleries: true
          }
        }
      }
    }
  }
});

// 3. คำนวณราคารวม (รวมส่วนลด)
const cartSummary = validCartItems.reduce(...)
```

#### 3.2 Checkout API (Transaction)

```javascript
POST /api/checkout
{
  "shippingInfo": {
    "name": "John Doe",
    "phone": "0812345678",
    "address": "123 Main St"
  }
}
```

### ใช้ Database Tables

- **`carts`** - ตะกร้าสินค้า
- **`cart_items`** - รายการในตะกร้า
- **`products`** - ข้อมูลสินค้า
- **`promotions`** - ส่วนลดสินค้า
- **`orders`** - คำสั่งซื้อ
- **`order_items`** - รายการสินค้าในออเดอร์
- **`payments`** - การชำระเงิน
- **`shippings`** - การจัดส่ง
- **`stock_movements`** - การเคลื่อนไหวสต็อก
- **`customers`** - ข้อมูลลูกค้า

### Transaction Process

1. **Validate** - ตรวจสอบสต็อกและข้อมูล
2. **Calculate** - คำนวณราคารวมพร้อมส่วนลด
3. **Create Order** - สร้างคำสั่งซื้อ
4. **Create Payment** - สร้างรายการชำระเงิน
5. **Create Shipping** - สร้างรายการจัดส่ง
6. **Update Stock** - ลดสต็อกสินค้า
7. **Record Movement** - บันทึกการเคลื่อนไหวสต็อก
8. **Update Customer** - อัปเดตข้อมูลลูกค้า
9. **Clear Cart** - ล้างตะกร้าสินค้า

---

## 🔄 Flow การทำงานร่วมกัน

### 1. Customer Browse Products

```
ShopHeader → CategoryFilterBar → ProductGrid
     ↓              ↓              ↓
API: /home    API: /products   Click Product
```

### 2. Add to Cart Flow

```
ProductGrid → Add to Cart → API: /cart → Update Header Badge
```

### 3. Checkout Flow

```
Cart Page → Checkout Page → Validate Cart → Create Order
    ↓            ↓              ↓             ↓
Load Cart    Calculate     API: /checkout   Redirect to
Items        Summary       (Transaction)    Payment
```

### 4. Payment Flow

```
Payment Page → Show Bank Info → Customer Transfer → Upload Slip
     ↓              ↓               ↓                ↓
Load Order    Bank Account     Transfer Money   Validate File
Details       Information      to Bank Account  → Update DB
     ↓              ↓               ↓                ↓
Status Poll ← Admin Review ← Wait Status ← Success/Failed
```

### 5. Database Relationships

```
customers → carts → cart_items → products
    ↓                               ↓
  orders → order_items ←────────────┘
    ↓         ↓
payments   shippings
    ↓
stock_movements

Payment Status Flow:
payments.status: WAITING → CONFIRMED/REJECTED
payments.slipUrl: null → /uploads/slips/filename.jpg
```

---

## 📁 4. Payment System (`src/app/payment/`, `src/module/payment/`)

### ไฟล์หลัก

- `[paymentId]/page.js` - หน้าชำระเงิน (Server Component)
- `ClientPaymentPage.js` - Payment UI (Client Component)
- `PaymentMethods.js` - เลือกวิธีการชำระเงิน
- `BankTransferInfo.js` - ข้อมูลบัญชีธนาคาร
- `SlipUpload.js` - อัปโหลดสลิปโอนเงิน
- `OrderDetails.js` - รายละเอียดคำสั่งซื้อ

### API Endpoints


- `POST /api/payment/upload-slip` - อัปโหลดสลิปการโอนเงิน
- `GET /api/payment/[paymentId]/status` - ตรวจสอบสถานะการชำระเงิน

### การทำงาน

#### 4.1 Payment Page Flow

```javascript
// 1. Load Payment Data
const payment = await prisma.payment.findFirst({
  include: {
    order: {
      include: {
        orderItems: { include: { product: true } },
        customer: true,
      },
    },
  },
});

// 2. Check Payment Status
if (payment.status === "CONFIRMED") {
  redirect(`/order/success/${orderId}`);
}
```

#### 4.2 Slip Upload Process

```javascript
POST /api/payment/upload-slip
FormData: {
  "slip": File,
  "paymentId": "456"
}

// Process:
1. Validate file (image, <5MB)
2. Save to /public/uploads/slips/
3. Update payment.slipUrl
4. Set payment.paymentDate
```

#### 4.3 Payment Status Polling

```javascript
// Client-side polling every 30 seconds
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await fetch(`/api/payment/${paymentId}/status`);
    const data = await response.json();

    if (data.status === "CONFIRMED") {
      router.push(`/order/success/${orderId}`);
    }
  }, 30000);
}, []);
```

### ใช้ Database Tables

- **`payments`** - ข้อมูลการชำระเงิน
  - `slipUrl` - URL ของสลิปที่อัปโหลด
  - `status` - WAITING → CONFIRMED/REJECTED
  - `paymentDate` - วันที่อัปโหลดสลิป
  - `confirmedAt` - วันที่ยืนยันการชำระ
- **`orders`** - คำสั่งซื้อที่เชื่อมโยง
- **`order_items`** - รายการสินค้าในออเดอร์
- **`customers`** - ข้อมูลลูกค้า

### Payment Status Flow

```
WAITING (รอการชำระ)
    ↓ (อัปโหลดสลิป)
WAITING (รอการตรวจสอบ)
    ↓ (Admin ตรวจสอบ)
CONFIRMED ✅ หรือ REJECTED ❌
```

### Features

- **Bank Transfer Info** - แสดงข้อมูลบัญชีธนาคาร
- **Slip Upload** - อัปโหลดสลิปพร้อม validation
- **Real-time Status** - ตรวจสอบสถานะแบบ real-time
- **File Management** - จัดการไฟล์สลิปอย่างปลอดภัย
- **Error Handling** - จัดการข้อผิดพลาดครบถ้วน

---

## 📁 5. Order Management (`src/app/order/`, `src/module/order/`)

### ไฟล์หลัก

- `success/[orderId]/page.js` - หน้าสำเร็จ
- `failed/[orderId]/page.js` - หน้าไม่สำเร็จ
- `OrderSuccessPage.js` - UI หน้าสำเร็จ
- `OrderFailedPage.js` - UI หน้าไม่สำเร็จ

### การทำงาน

- **Order Success** - แสดงข้อมูลคำสั่งซื้อที่สำเร็จ
- **Order Failed** - แสดงสาเหตุและให้ลองใหม่
- **Order Tracking** - ติดตามสถานะการจัดส่ง

---

## 🎯 Key Features

### Products API

- ✅ Pagination และ Category Filter
- ✅ Soft Delete Support
- ✅ Performance Optimization

### Shop Module

- ✅ Real-time Category Filtering
- ✅ Responsive Product Grid
- ✅ Loading States
- ✅ Promotion Banner

### Checkout System

- ✅ Stock Validation
- ✅ Promotion Calculation
- ✅ Database Transaction
- ✅ Inventory Management
- ✅ Order Tracking

### Payment System

- ✅ Bank Transfer Information Display
- ✅ Slip Upload & Validation
- ✅ Real-time Status Checking
- ✅ Payment Status Management
- ✅ File Upload Security

### Order Management

- ✅ Order Success/Failed Pages
- ✅ Order Status Tracking
- ✅ Customer Notifications
- ✅ Retry Payment Flow

---

## 🔧 Technical Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **State Management**: React useState/useEffect
- **HTTP Client**: Axios

---

## 📊 Performance Considerations

1. **API Optimization**
   - Pagination ลดการโหลดข้อมูลมาก
   - Index บน categoryId และ deletedAt
2. **Frontend Optimization**
   - useCallback สำหรับ fetchProducts
   - Loading states ป้องกัน multiple requests
3. **Database Optimization**
   - Transaction สำหรับ Checkout
   - Proper foreign key relationships
   - Stock movement tracking
