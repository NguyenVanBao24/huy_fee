"use client";
import React, { useEffect, useState } from "react";
import { Input, Button, message, Card } from "antd";
import Link from "next/link";

const AttendanceCheckIn: React.FC = () => {
  const now = new Date();
  const currentDate = now.toLocaleDateString("vi-VN");
  const currentTime = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const [name, setName] = useState<string | null>("");
  const [loading, setLoading] = useState(false);
  const [startHour, setStartHour] = useState("07");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("15");
  const [endMinute, setEndMinute] = useState("00");
  const [shiftResult, setShiftResult] = useState("8S");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setName(token);
    calculateShift();
  }, [startHour, startMinute, endHour, endMinute]);

  const calculateShift = () => {
    const start = parseInt(startHour) + parseInt(startMinute) / 60;
    let end = parseInt(endHour) + parseInt(endMinute) / 60;

    if (end < start) end += 24;

    const totalHours = end - start;

    let dayHours = 0;
    let nightHours = 0;

    if (start >= 6 && start < 22) {
      const dayEnd = Math.min(end, 22);
      dayHours = dayEnd - start;
      if (end > 22) {
        nightHours = end - 22;
      }
    } else {
      const nightEnd = Math.min(end, 6 + 24);
      nightHours = nightEnd - start;
      if (end > 6 + 24) {
        dayHours = end - (6 + 24);
      }
    }

    let result = "";
    if (dayHours > 0 && nightHours > 0) {
      result = `${dayHours.toFixed(1).replace(".", ",")}S-${nightHours
        .toFixed(1)
        .replace(".", ",")}T`;
    } else if (dayHours > 0) {
      // Nếu số giờ là số nguyên (kết thúc bằng ,0) thì bỏ phần thập phân
      const dayHoursStr = dayHours.toFixed(1).replace(".", ",");
      result = dayHoursStr.endsWith(",0") ? `${Math.floor(dayHours)}S` : `${dayHoursStr}S`;
    } else {
      const nightHoursStr = nightHours.toFixed(1).replace(".", ",");
      result = nightHoursStr.endsWith(",0") ? `${Math.floor(nightHours)}T` : `${nightHoursStr}T`;
    }

    setShiftResult(result);
  };

  const handleCheckIn = async () => {
    const startTime = `${startHour}${parseInt(startHour) < 12 ? "AM" : "PM"}`;
    const endTime = `${endHour}${parseInt(endHour) < 12 ? "AM" : "PM"}`;
    const totalHour = `${startTime}-${endTime}`;
    const typeHour = shiftResult;

    setLoading(true);
    const request = { name, totalHour, typeHour };

    console.log("Request gửi đi:", request);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <Card
        className="w-full max-w-md shadow-xl rounded-xl p-6 bg-white"
        style={{ border: "none" }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Chấm Công</h2>
          <p className="text-sm text-gray-500 mt-1">
            Vui lòng kiểm tra thông tin trước khi chấm công
          </p>
        </div>

        <div className="space-y-5">
          <Input
            placeholder="Nhập tên của bạn"
            value={name ? name : ""}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border-gray-300"
            prefix={<span className="text-gray-400">👤</span>}
            disabled
          />

          <Input
            value={`${currentDate} - ${currentTime}`}
            className="rounded-lg border-gray-300"
            prefix={<span className="text-gray-400">⏰</span>}
            disabled
          />

          <div className="flex gap-2">
            <Input
              placeholder="Giờ bắt đầu"
              value={startHour}
              onChange={(e) => setStartHour(e.target.value.padStart(2, "0"))}
              maxLength={2}
              className="rounded-lg w-20"
              type="number"
              min="0"
              max="23"
            />
            <Input
              placeholder="Phút bắt đầu"
              value={startMinute}
              onChange={(e) => setStartMinute(e.target.value.padStart(2, "0"))}
              maxLength={2}
              className="rounded-lg w-20"
              type="number"
              min="0"
              max="59"
            />
            <Input
              placeholder="Giờ kết thúc"
              value={endHour}
              onChange={(e) => setEndHour(e.target.value.padStart(2, "0"))}
              maxLength={2}
              className="rounded-lg w-20"
              type="number"
              min="0"
              max="23"
            />
            <Input
              placeholder="Phút kết thúc"
              value={endMinute}
              onChange={(e) => setEndMinute(e.target.value.padStart(2, "0"))}
              maxLength={2}
              className="rounded-lg w-20"
              type="number"
              min="0"
              max="59"
            />
          </div>

          <Input
            value={`Ca: ${shiftResult}`}
            className="rounded-lg border-gray-300"
            prefix={<span className="text-gray-400">🕒</span>}
            disabled
          />

          <Button
            type="primary"
            onClick={handleCheckIn}
            loading={loading}
            block
            size="large"
            className="bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300"
          >
            {loading ? "Đang xử lý..." : "Chấm Công"}
          </Button>
        </div>
      </Card>
    </div>
  ) : (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Link
        href={"/auth"}
        className="text-blue-600 hover:text-blue-800 font-medium text-lg transition-colors duration-200"
      >
        NHẤP VÀO ĐỂ ĐI ĐĂNG NHẬP THÔI
      </Link>
    </div>
  );
};

export default AttendanceCheckIn;
