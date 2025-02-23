"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Table, Card, Spin } from "antd";
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

const AttendanceTable: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch dữ liệu
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("https://bup-be.vercel.app/api/H/get-all-attendance");
      const data1 = await response.json();
      const data: string[][] = data1.data;

      if (data.length > 0) {
        const headers = data[0];

        // Tạo cột bảng
        setColumns(
          headers.map((header: string) => ({
            title: header,
            dataIndex: header,
            key: header,
          }))
        );

        // Định dạng dữ liệu bảng
        const formattedData: AttendanceRow[] = data.slice(1).map((row: string[], index: number) => {
          const rowData: AttendanceRow = { key: index };
          headers.forEach((header: string, i: number) => {
            rowData[header] = row[i] || "-";
          });
          return rowData;
        });

        setAttendanceData(formattedData);
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setName(localStorage.getItem("token"));
    fetchData();
  }, [fetchData]);

  if (!name) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Link
          href="/auth"
          className="text-lg font-semibold text-blue-600 underline hover:text-blue-800 transition"
        >
          NHẤP VÀO ĐỂ ĐI ĐĂNG NHẬP THÔI
        </Link>
      </div>
    );
  }

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-6xl shadow-lg rounded-lg overflow-hidden">
        <h2 className="text-2xl font-semibold text-center mb-4">Attendance Records</h2>

        {loading ? (
          <div className="flex justify-center py-6">
            <Spin size="large" />
          </div>
        ) : attendanceData.length > 0 ? (
          <div className="overflow-x-auto">
            <Table
              dataSource={attendanceData}
              columns={columns}
              bordered
              pagination={false}
              scroll={{ x: "max-content" }}
              rowClassName={(record, index) =>
                classNames({ "bg-gray-100": index % 2 === 0, "bg-white": index % 2 !== 0 })
              }
            />
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">Không có dữ liệu chấm công nào.</p>
        )}
      </Card>
    </div>
  );
};

export default AttendanceTable;
