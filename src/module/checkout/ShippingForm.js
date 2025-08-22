// src/module/checkout/ShippingForm.js
"use client";

export default function ShippingForm({ shippingInfo, setShippingInfo, errors }) {
  const handleInputChange = (field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h2 className="text-[#181411] text-xl font-bold mb-6">ข้อมูลการจัดส่ง</h2>
      
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-[#181411] mb-2">
            ชื่อผู้รับ *
          </label>
          <input
            type="text"
            value={shippingInfo.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb9947] transition-colors ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="กรอกชื่อผู้รับ"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-[#181411] mb-2">
            เบอร์โทรศัพท์ *
          </label>
          <input
            type="tel"
            value={shippingInfo.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb9947] transition-colors ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0xx-xxx-xxxx"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-[#181411] mb-2">
            ที่อยู่จัดส่ง *
          </label>
          <textarea
            value={shippingInfo.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb9947] transition-colors resize-none ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="กรอกที่อยู่จัดส่งแบบละเอียด เช่น บ้านเลขที่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>

        {/* Delivery Options */}
        <div>
          <label className="block text-sm font-medium text-[#181411] mb-3">
            ตัวเลือกการจัดส่ง
          </label>
          <div className="space-y-3">
            <div className="flex items-center p-3 border border-[#eb9947] rounded-lg bg-orange-50">
              <input
                type="radio"
                id="standard"
                name="delivery"
                value="standard"
                defaultChecked
                className="text-[#eb9947] focus:ring-[#eb9947]"
              />
              <label htmlFor="standard" className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-[#181411]">จัดส่งมาตรฐาน</p>
                    <p className="text-sm text-[#887563]">3-5 วันทำการ</p>
                  </div>
                  <p className="font-bold text-[#181411]">50 ฿</p>
                </div>
              </label>
            </div>
            
            <div className="flex items-center p-3 border border-gray-300 rounded-lg">
              <input
                type="radio"
                id="free"
                name="delivery"
                value="free"
                disabled
                className="text-[#eb9947] focus:ring-[#eb9947]"
              />
              <label htmlFor="free" className="ml-3 flex-1 opacity-60">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-[#181411]">จัดส่งฟรี</p>
                    <p className="text-sm text-[#887563]">สำหรับคำสั่งซื้อตั้งแต่ 1,000 ฿</p>
                  </div>
                  <p className="font-bold text-green-600">ฟรี</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-[#181411] mb-2">
            หมายเหตุเพิ่มเติม (ไม่บังคับ)
          </label>
          <textarea
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb9947] transition-colors resize-none"
            placeholder="เช่น ช่วงเวลาที่สะดวกรับของ หรือคำแนะนำเพิ่มเติม"
          />
        </div>
      </div>
    </div>
  );
}