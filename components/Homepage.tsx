"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Table, Card, Spin, Typography } from "antd";
import Link from "next/link";
import classNames from "classnames";

// Định nghĩa kiểu dữ liệu
interface AttendanceRow {
  key: number;
  [key: string]: string | number;
}

interface ColumnType {
  title: string;
  dataIndex: string;
  key: string;
}

const { Title } = Typography;

const AttendanceTable: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Hàm fetch dữ liệu với error handling
  const fetchAttendanceData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://bup-be.onrender.com/api/H/get-all-attendance");
      if (!response.ok) throw new Error("Failed to fetch attendance data");

      const { data }: { data: string[][] } = await response.json();

      if (!data?.length) return;

      const headers = data[0];
      // Tạo cấu hình cột
      const tableColumns = headers.map((header) => ({
        title: header,
        dataIndex: header,
        key: header,
      }));

      // Chuyển đổi dữ liệu
      const formattedData = data.slice(1).map((row, index) => {
        return headers.reduce(
          (acc, header, i) => ({
            ...acc,
            [header]: row[i] || "-",
            key: index,
          }),
          {} as AttendanceRow
        );
      });

      setColumns(tableColumns);
      setAttendanceData(formattedData);
    } catch (error) {
      console.error("❌ Error fetching attendance data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Kiểm tra authentication và fetch data
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    if (token) fetchAttendanceData();
  }, [fetchAttendanceData]);

  // Component hiển thị khi chưa đăng nhập
  const renderLoginPrompt = () => (
    <div className="flex min-h-screen items-center justify-center">
      <Link
        href="/auth"
        className="text-lg font-semibold text-blue-600 underline 
          transition-colors hover:text-blue-800"
      >
        Nhấn để đăng nhập
      </Link>
    </div>
  );

  // Component hiển thị bảng điểm danh
  const renderAttendanceTable = () => (
    <div className="p-4">
      <Card
        className="mx-auto w-full max-w-6xl overflow-hidden rounded-lg shadow-lg"
        bodyStyle={{ padding: "16px" }}
      >
        <Title level={2} className="mb-4 text-center">
          Attendance Records
        </Title>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spin size="large" />
          </div>
        ) : attendanceData.length > 0 ? (
          <Table
            dataSource={attendanceData}
            columns={columns}
            bordered
            pagination={false}
            scroll={{ x: "max-content" }}
            rowClassName={(_, index) =>
              classNames({
                "bg-gray-100": index % 2 === 0,
                "bg-white": index % 2 !== 0,
              })
            }
          />
        ) : (
          <p className="py-4 text-center text-gray-500">Không có dữ liệu chấm công nào.</p>
        )}
      </Card>
    </div>
  );

  return isAuthenticated ? renderAttendanceTable() : renderLoginPrompt();
};

export default AttendanceTable;
