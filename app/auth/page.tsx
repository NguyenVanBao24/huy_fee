"use client";
import React from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useRouter } from "next/navigation";
const LoginForm: React.FC = () => {
  const router = useRouter();
  const onFinish = async (values: { name: string; password: string }) => {
    try {
      const response = await fetch("https://bup-be.vercel.app/api/H/auth-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      router.push("/user");
      if (data.success) {
        localStorage.setItem("token", data.data[0][0]);
      } else {
        message.error(data.message || "Login failed!");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("An error occurred while logging in!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-96 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>
        <Form name="login" layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter your name!" }]}
          >
            <Input placeholder="Enter your name" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginForm;
