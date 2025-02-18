"use client";
import React, { useState } from "react";
import { Input, Button, message, Card, Select } from "antd";

const AttendanceCheckIn: React.FC = () => {
  const now = new Date();
  const currentDate = now.toLocaleDateString("vi-VN");
  const currentTime = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const { Option } = Select;
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [shift, setShift] = useState("7h-15h:8S");

  const handleCheckIn = async () => {
    console.log(shift, name, currentDate, currentTime);
    if (!name.trim()) {
      message.warning("Vui lòng nhập tên trước khi chấm công.");
      return;
    }
    setLoading(true);
    const request = { name, totalHour: "7-11", typeHour: "8T" };
    try {
      const response = await fetch("https://bup-be.vercel.app/api/H/ncheck-i", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      const result = await response.json();
      console.log(result, "result");
      if (result.success) {
        message.success("Chấm công thành công!");
        setName("");
      } else {
        message.error("Chấm công thất bại, vui lòng thử lại.");
      }
    } catch (error) {
      message.error("Lỗi kết nối, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-md shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">Chấm Công</h2>
        <Input
          placeholder="Nhập tên của bạn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4"
        />
        <Input value={`${currentDate} - ${currentTime}`} className="mb-4" disabled />
        <Select className="w-full mb-4" value={shift} onChange={setShift}>
          <Option value="7h-15h:8S">7h-15h (8s)</Option>
          <Option value="15h-23h:3S/5T">15h-23h (3s/5t)</Option>
          <Option value="23h-7h:8T">23h-7h (8t)</Option>
        </Select>
        <Button type="primary" onClick={handleCheckIn} loading={loading} block>
          Chấm Công
        </Button>
      </Card>
    </div>
  );
};

export default AttendanceCheckIn;
