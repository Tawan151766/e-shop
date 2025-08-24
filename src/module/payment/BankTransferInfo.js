// src/module/payment/BankTransferInfo.js
"use client";
import { useState } from "react";
import { Copy, Check, CreditCard } from "lucide-react";
import { WarningFilled } from "@ant-design/icons";

export default function BankTransferInfo({ amount, orderId }) {
  const [copied, setCopied] = useState(null);

  // Bank account information (example - replace with real data)
  const bankAccounts = [
    {
      bank: "ธนาคารกสิกรไทย",
      accountNumber: "123-4-56789-0",
      accountName: "บริษัท ร้านค้าออนไลน์ จำกัด",
      color: "bg-green-600",
    },
    {
      bank: "ธนาคารไทยพาณิชย์",
      accountNumber: "987-6-54321-0",
      accountName: "บริษัท ร้านค้าออนไลน์ จำกัด",
      color: "bg-purple-600",
    },
  ];

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        ข้อมูลบัญชีธนาคาร
      </h3>

      <div className="space-y-4">
        {bankAccounts.map((account, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-4 h-4 rounded-full ${account.color}`}></div>
              <h4 className="font-semibold text-gray-900">{account.bank}</h4>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  เลขที่บัญชี
                </label>
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                  <span className="font-mono text-lg font-semibold flex-1">
                    {account.accountNumber}
                  </span>
                  <button
                    onClick={() => copyToClipboard(account.accountNumber.replace(/-/g, ''), `account-${index}`)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="คัดลอกเลขบัญชี"
                  >
                    {copied === `account-${index}` ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  ชื่อบัญชี
                </label>
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium flex-1">
                    {account.accountName}
                  </span>
                  <button
                    onClick={() => copyToClipboard(account.accountName, `name-${index}`)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="คัดลอกชื่อบัญชี"
                  >
                    {copied === `name-${index}` ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-blue-900">
              ยอดที่ต้องโอน
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">
                ฿{Number(amount).toLocaleString()}
              </span>
              <button
                onClick={() => copyToClipboard(Number(amount).toString(), 'amount')}
                className="p-1 hover:bg-blue-200 rounded transition-colors"
                title="คัดลอกยอดเงิน"
              >
                {copied === 'amount' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-blue-600" />
                )}
              </button>
            </div>
          </div>
          <p className="text-sm text-blue-800">
            กรุณาโอนเงินตามยอดที่ระบุเท่านั้น เพื่อความสะดวกในการตรวจสอบ
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">
            ขั้นตอนการโอนเงิน:
          </h4>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>เลือกบัญชีธนาคารที่สะดวกในการโอน</li>
            <li>คัดลอกเลขที่บัญชีและชื่อบัญชี</li>
            <li>โอนเงินตามยอดที่ระบุ: <strong>฿{Number(amount).toLocaleString()}</strong></li>
            <li>ถ่ายรูปสลิปการโอนเงิน</li>
            <li>อัปโหลดสลิปในช่องด้านล่าง</li>
            <li>รอการตรวจสอบจากเจ้าหน้าที่</li>
          </ol>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2">
            <WarningFilled/> ข้อควรระวัง:
          </h4>
          <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
            <li>ตรวจสอบเลขที่บัญชีให้ถูกต้องก่อนโอน</li>
            <li>โอนเงินตามยอดที่ระบุเท่านั้น</li>
            <li>เก็บสลิปการโอนเงินไว้เป็นหลักฐาน</li>
            <li>หากโอนผิดบัญชี ทางร้านไม่สามารถรับผิดชอบได้</li>
          </ul>
        </div>
      </div>
    </div>
  );
}