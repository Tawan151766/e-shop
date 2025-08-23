"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";

export default function CustomerProfile() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: session.user.phone || "",
        address: session.user.address || "",
      });
    }
  }, [session]);

  const showMessage = (type, content) => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: "", content: "" }), 5000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put("/api/customer/profile", profileData);

      if (response.data.success) {
        showMessage("success", "อัปเดตข้อมูลส่วนตัวสำเร็จ");
        await update({
          ...session,
          user: {
            ...session.user,
            ...profileData,
          },
        });
        setEditMode(false);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      showMessage("error", "ไม่สามารถอัปเดตข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#f4f2f0",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            maxWidth: "400px",
            width: "100%",
            margin: "0 1rem",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "bold",
                color: "#181411",
                marginBottom: "0.5rem",
              }}
            >
              กรุณาเข้าสู่ระบบ
            </h3>
            <p style={{ color: "#887563" }}>
              คุณต้องเข้าสู่ระบบเพื่อดูข้อมูลส่วนตัว
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f4f2f0" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "white",
          padding: "1rem",
          paddingBottom: "0.5rem",
          justifyContent: "space-between",
        }}
      >
        <h2
          style={{
            color: "#181411",
            fontSize: "1.125rem",
            fontWeight: "bold",
            flex: 1,
            textAlign: "center",
            paddingLeft: "3rem",
            margin: 0,
          }}
        >
          Profile
        </h2>
      </div>

      {/* Message Alert */}
      {message.content && (
        <div
          style={{
            margin: "1rem",
            padding: "1rem",
            borderRadius: "8px",
            backgroundColor: message.type === "success" ? "#f0f9ff" : "#fef2f2",
            border: `1px solid ${
              message.type === "success" ? "#bfdbfe" : "#fecaca"
            }`,
            color: message.type === "success" ? "#1e40af" : "#dc2626",
          }}
        >
          {message.content}
        </div>
      )}

      {/* Profile Avatar Section */}
      <div style={{ display: "flex", padding: "1rem" }}>
        <div
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "column",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                aspectRatio: "1",
                backgroundSize: "cover",
                borderRadius: "50%",
                minHeight: "8rem",
                width: "8rem",
                backgroundImage: session.user.image
                  ? `url("${session.user.image}")`
                  : `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBep1lKcq5n1HSpK6U2rmgnYVlJr_k2LZh5umg3BuAVV7EPIKnMmhXRNAVKY0HzI2zSvOIZ2CyPwXl7sLZ9bmNsG2XfhDEcZm_7HuanWCLc8z2R8pCxpUVfLRVtorm30f7bdJevyd93xCd71eNkwMmRijt33RlwwtzHd4WSxsqUUMqFGGbkETXs1pGKv42W_WA2PQ7uvxvlEz61tGpLXcOrrAV-AUwEAdwCRY4IlOxW116csgcFIYhsyvbtb19xc6zhP95cSelG65o")`,
              }}
            ></div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p
                style={{
                  color: "#181411",
                  fontSize: "1.375rem",
                  fontWeight: "bold",
                  textAlign: "center",
                  margin: 0,
                }}
              >
                {session.user.name || "ไม่ระบุชื่อ"}
              </p>
              <p
                style={{
                  color: "#887563",
                  fontSize: "1rem",
                  textAlign: "center",
                  margin: 0,
                }}
              >
                {session.user.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Details Header */}
      <h3
        style={{
          color: "#181411",
          fontSize: "1.125rem",
          fontWeight: "bold",
          padding: "0 1rem",
          paddingBottom: "0.5rem",
          paddingTop: "1rem",
          margin: 0,
        }}
      >
        Account Details
      </h3>

      {/* Edit Button */}
      <div style={{ padding: "0 1rem", paddingBottom: "1rem" }}>
        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            width: "100%",
            backgroundColor: "#181411",
            color: "white",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            fontWeight: "500",
            border: "none",
            cursor: "pointer",
          }}
        >
          {editMode ? "ยกเลิกการแก้ไข" : "แก้ไขข้อมูล"}
        </button>
      </div>

      {/* Profile Form */}
      {editMode ? (
        <form onSubmit={handleUpdateProfile} style={{ padding: "0 1rem" }}>
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <label
              style={{
                display: "block",
                color: "#181411",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              ชื่อ-นามสกุล
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) =>
                setProfileData({ ...profileData, name: e.target.value })
              }
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
              placeholder="กรอกชื่อ-นามสกุล"
              required
            />
          </div>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <label
              style={{
                display: "block",
                color: "#181411",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              อีเมล
            </label>
            <input
              type="email"
              value={profileData.email}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                backgroundColor: "#f9fafb",
                cursor: "not-allowed",
                fontSize: "1rem",
              }}
              disabled
            />
          </div>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <label
              style={{
                display: "block",
                color: "#181411",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) =>
                setProfileData({ ...profileData, phone: e.target.value })
              }
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
              placeholder="กรอกเบอร์โทรศัพท์"
              maxLength={10}
            />
          </div>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <label
              style={{
                display: "block",
                color: "#181411",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              ที่อยู่
            </label>
            <textarea
              value={profileData.address}
              onChange={(e) =>
                setProfileData({ ...profileData, address: e.target.value })
              }
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                resize: "vertical",
                minHeight: "100px",
                fontSize: "1rem",
              }}
              placeholder="กรอกที่อยู่"
              maxLength={500}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: "#059669",
              color: "white",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              fontWeight: "500",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              marginBottom: "1rem",
            }}
          >
            {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </form>
      ) : (
        // Display Mode
        <div style={{ padding: "0 1rem" }}>
          {/* Phone */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              backgroundColor: "white",
              padding: "1rem",
              minHeight: "4.5rem",
              borderRadius: "8px",
              marginBottom: "0.25rem",
            }}
          >
            <div
              style={{
                color: "#181411",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                backgroundColor: "#f4f2f0",
                width: "3rem",
                height: "3rem",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46ZM176,208A128.14,128.14,0,0,1,48,80,40.2,40.2,0,0,1,82.87,40a.61.61,0,0,0,0,.12l21,47L83.2,111.86a6.13,6.13,0,0,0-.57.77,16,16,0,0,0-1,15.7c9.06,18.53,27.73,37.06,46.46,46.11a16,16,0,0,0,15.75-1.14,8.44,8.44,0,0,0,.74-.56L168.89,152l47,21.05h0s.08,0,.11,0A40.21,40.21,0,0,1,176,208Z"></path>
              </svg>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <p
                style={{
                  color: "#181411",
                  fontSize: "1rem",
                  fontWeight: "500",
                  margin: 0,
                }}
              >
                Phone Number
              </p>
              <p style={{ color: "#887563", fontSize: "0.875rem", margin: 0 }}>
                {profileData.phone || "ไม่ได้ระบุ"}
              </p>
            </div>
          </div>

          {/* Address */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              backgroundColor: "white",
              padding: "1rem",
              minHeight: "4.5rem",
              borderRadius: "8px",
              marginBottom: "0.25rem",
            }}
          >
            <div
              style={{
                color: "#181411",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                backgroundColor: "#f4f2f0",
                width: "3rem",
                height: "3rem",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"></path>
              </svg>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <p
                style={{
                  color: "#181411",
                  fontSize: "1rem",
                  fontWeight: "500",
                  margin: 0,
                }}
              >
                Address
              </p>
              <p style={{ color: "#887563", fontSize: "0.875rem", margin: 0 }}>
                {profileData.address || "ไม่ได้ระบุ"}
              </p>
            </div>
          </div>

          {/* Member Since */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              backgroundColor: "white",
              padding: "1rem",
              minHeight: "4.5rem",
              borderRadius: "8px",
              marginBottom: "0.25rem",
            }}
          >
            <div
              style={{
                color: "#181411",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                backgroundColor: "#f4f2f0",
                width: "3rem",
                height: "3rem",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-96-88v64a8,8,0,0,1-16,0V132.94l-4.42,2.22a8,8,0,0,1-7.16-14.32l16-8A8,8,0,0,1,112,120Zm59.16,30.45L152,176h16a8,8,0,0,1,0,16H136a8,8,0,0,1-6.4-12.8l28.78-38.37A8,8,0,1,0,145.07,132a8,8,0,1,1-13.85-8A24,24,0,0,1,176,136A23.76,23.76,0,0,1,171.16,150.45Z"></path>
              </svg>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <p
                style={{
                  color: "#181411",
                  fontSize: "1rem",
                  fontWeight: "500",
                  margin: 0,
                }}
              >
                Member Since
              </p>
              <p style={{ color: "#887563", fontSize: "0.875rem", margin: 0 }}>
                {new Date(
                  session.user.createdAt || Date.now()
                ).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Orders Section */}
      <h3
        style={{
          color: "#181411",
          fontSize: "1.125rem",
          fontWeight: "bold",
          padding: "0 1rem",
          paddingBottom: "0.5rem",
          paddingTop: "1.5rem",
          margin: 0,
        }}
      >
        Orders
      </h3>

      <Link
        style={{ padding: "0 1rem", paddingBottom: "1.5rem" }}
        href="/order/history"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            backgroundColor: "white",
            padding: "1rem",
            minHeight: "3.5rem",
            justifyContent: "space-between",
            borderRadius: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                color: "#181411",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                backgroundColor: "#f4f2f0",
                width: "2.5rem",
                height: "2.5rem",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.34,44-29.77,16.3-80.35-44ZM128,120,47.66,76l33.9-18.56,80.34,44ZM40,90l80,43.78v85.79L40,175.82Zm176,85.78h0l-80,43.79V133.82l32-17.51V152a8,8,0,0,0,16,0V107.55L216,90v85.77Z"></path>
              </svg>
            </div>
            <p style={{ color: "#181411", fontSize: "1rem", margin: 0 }}>
              Order History
            </p>
          </div>
          <div>
            <div
              style={{
                color: "#181411",
                display: "flex",
                width: "1.75rem",
                height: "1.75rem",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
