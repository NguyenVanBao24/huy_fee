"use client";
import React, { useEffect, useState } from "react";
import { Input, Button, message, Card, Select } from "antd";
import Link from "next/link";

const AttendanceCheckIn: React.FC = () => {
  const now = new Date();
  const currentDate = now.toLocaleDateString("vi-VN");
  const currentTime = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    setName(token);
  }, []);

  const { Option } = Select;
  const [name, setName] = useState<string | null>("");
  const [loading, setLoading] = useState(false);
  const [shift, setShift] = useState("7h-15h:8S");

  const handleCheckIn = async () => {
    console.log(shift, name, currentDate, currentTime);
    const totalHour = shift.split(":")[0];
    const typeHour = shift.split(":")[1];
    setLoading(true);
    const request = { name, totalHour, typeHour };
    try {
      const response = await fetch("https://bup-be.vercel.app/api/H/post-attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      const result = await response.json();
      if (result.success) {
        message.success("Chấm công thành công!");
      } else {
        message.error("Chấm công thất bại, vui lòng thử lại.");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return name ? (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-md shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">Chấm Công</h2>
        <Input
          placeholder="Nhập tên của bạn"
          value={name ? name : ""}
          onChange={(e) => setName(e.target.value)}
          className="mb-4"
          disabled
        />
        <Input value={`${currentDate} - ${currentTime}`} className="mb-4" disabled />
        <Select className="w-full mb-4" value={shift} onChange={setShift}>
          <Option value="7h-15h:8S">7h-15h (8s)</Option>
          <Option value="15h-23h:3S-5T">15h-23h (3s/5t)</Option>
          <Option value="23h-7h:8T">23h-7h (8t)</Option>
        </Select>
        <Button type="primary" onClick={handleCheckIn} loading={loading} block>
          Chấm Công
        </Button>
      </Card>
    </div>
  ) : (
    <Link href={"/auth"}>NHẤP VÀO ĐỂ ĐI ĐĂNG NHẬP THÔI</Link>
  );
};

export default AttendanceCheckIn;
