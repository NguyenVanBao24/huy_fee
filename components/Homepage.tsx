"use client";
import React, { useEffect, useState } from "react";
import { Table, Card } from "antd";

const AttendanceTable: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://bup-be.vercel.app/api/H/get-all-attendance");
        const data1 = await response.json();
        const data = data1.data;
        if (data.length > 0) {
          const headers = data[0];
          setColumns(
            headers.map((header: string) => ({
              title: header,
              dataIndex: header,
              key: header,
            }))
          );

          const formattedData = data.slice(1).map((row: string[], index: number) => {
            const rowData: any = { key: index };
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

  return (
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
          />
        </div>
      </Card>
    </div>
  );
};

export default AttendanceTable;
