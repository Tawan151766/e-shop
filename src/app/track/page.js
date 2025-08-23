import ShippingTracker from "@/module/customer/shipping/ShippingTracker";

export const metadata = {
  title: "ติดตามพัสดุ - ระบบจัดการร้านค้า",
  description: "ติดตามสถานะการจัดส่งพัสดุของคุณ",
};

export default function TrackPage() {
  return <ShippingTracker />;
}