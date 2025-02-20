"use client";
import React, { useEffect, useState } from "react";
import { Table, Card } from "antd";
import Link from "next/link";

// Định nghĩa kiểu dữ liệu cho một hàng trong bảng
interface AttendanceRow {
  key: number;
  [key: string]: string | number; // Cho phép các cột có kiểu string hoặc number
}

// Định nghĩa kiểu dữ liệu cho cột
interface ColumnType {
  title: string;
  dataIndex: string;
  key: string;
}

const AttendanceTable: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setName(token);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://bup-be.vercel.app/api/H/get-all-attendance");
        const data1 = await response.json();
        const data: string[][] = data1.data;

        if (data.length > 0) {
          const headers = data[0];

          // Cập nhật cột với kiểu dữ liệu rõ ràng
          setColumns(
            headers.map((header: string) => ({
              title: header,
              dataIndex: header,
              key: header,
            }))
          );

          // Định dạng dữ liệu bảng
          const formattedData: AttendanceRow[] = data
            .slice(1)
            .map((row: string[], index: number) => {
              const rowData: AttendanceRow = { key: index };
              headers.forEach((header: string, i: number) => {
                rowData[header] = row[i] || "-";
              });
              return rowData;
            });

          setAttendanceData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return name ? (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-6xl shadow-lg rounded-lg overflow-hidden">
        <h2 className="text-2xl font-semibold text-center mb-4">Attendance Records</h2>
        <div className="overflow-x-auto">
          <Table
            dataSource={attendanceData}
            columns={columns}
            bordered
            pagination={false}
            scroll={{ x: "max-content" }}
            rowClassName={(record, index) =>
              !record || index % 2 === 0 ? "bg-gray-100" : "bg-white"
            }
          />
        </div>
      </Card>
    </div>
  ) : (
    <Link href={"/auth"}>NHẤP VÀO ĐỂ ĐI ĐĂNG NHẬP THÔI</Link>
  );
};

export default AttendanceTable;
