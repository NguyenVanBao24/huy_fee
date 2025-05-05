"use client";
import React, { useEffect, useState } from "react";
import { message, Card, Spin } from "antd";
import Link from "next/link";

interface SalaryData {
  name: string;
  salary: number;
  timeBySun: number;
  timeByMoon: number;
}

const AttendanceCheckIn: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<SalaryData[]>([]);
  const [totalSalary, setTotalSalary] = useState<number>(0);

  // Lấy token từ localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token")?.trim() || null;
    setToken(storedToken);
  }, []);

  // Fetch dữ liệu lương
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);

      try {
        const response = await fetch("https://bup-be.onrender.com/api/H/get-all-salary");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);

        if (result.success && Array.isArray(result.data)) {
          // Chuyển đổi dữ liệu về dạng có type rõ ràng
          const formattedData: SalaryData[] = result.data.map((item: [string, string]) => ({
            name: item[0],
            salary: Number(item[1]) || 0,
          }));

          setData(formattedData);

          // Tính tổng lương
          const total = formattedData.reduce((sum, item) => sum + item.salary, 0);
          setTotalSalary(total);

          console.log(formattedData, "formattedDataformattedDataformattedData");

          message.success("Chấm công thành công!");
        } else {
          message.error("Chấm công thất bại, vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        message.error("Có lỗi xảy ra, vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Nếu token không phải admin => Không có quyền
  if (token !== "Nguyễn Phạm Quốc Thắng" && token !== "Nguyễn Thị Uyên") {
    return (
      <div className="text-center mt-10">
        <Link href="/" className="text-blue-500 underline">
          Bạn không có quyền, nhấp vào đây để quay về trang chính
        </Link>
      </div>
    );
  }

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-md shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">BẢNG LƯƠNG</h2>

        {loading ? (
          <div className="text-center">
            <Spin tip="Đang tải..." />
          </div>
        ) : data.length > 0 ? (
          <>
            {data.map(
              (employee, index) =>
                index < data.length - 1 && (
                  <div key={index} className="mb-4 border-b pb-2">
                    <p>
                      <strong>Tên nhân viên:</strong> {employee.name}
                    </p>
                    <p>
                      <strong>Lương:</strong> {employee.salary.toLocaleString()} VND
                    </p>
                    {/* <p>
                      <strong>Giờ làm ca sáng:</strong> {employee.salary.toLocaleString()} VND
                    </p>
                    <p>
                      <strong>Giờ làm ca tối:</strong> {employee.salary.toLocaleString()} VND
                    </p> */}
                  </div>
                )
            )}
            <div className="mt-4 text-lg font-semibold">
              Tổng chi phí lương:{" "}
              <span className="text-blue-600">{totalSalary.toLocaleString()} VND</span>
            </div>
          </>
        ) : (
          <p className="text-center">Không có dữ liệu để hiển thị.</p>
        )}
      </Card>
    </div>
  );
};

export default AttendanceCheckIn;
