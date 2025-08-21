"use client";
import { useState } from "react";
import { Form, Input, Button, Typography, Alert, Card, message } from "antd";
import { UserOutlined, LockOutlined, LoadingOutlined } from "@ant-design/icons";
import axios from "axios";

export default function AdminLoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/admin/login", values);
      if (res.data && res.data.sessionId) {
        localStorage.setItem("adminSessionId", res.data.sessionId);
        message.success("Login success!");
        window.location.href = "/admin/dashboard";
      } else {
        setError("Login failed: Invalid response");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Login failed: Internal server error"
      );
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f2f5",
      }}
    >
      <Card style={{ width: 350 }}>
        <Typography.Title
          level={2}
          style={{ textAlign: "center", marginBottom: 24 }}
        >
          Admin Login
        </Typography.Title>
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Form
          name="admin_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              icon={loading ? <LoadingOutlined /> : null}
              loading={loading}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
