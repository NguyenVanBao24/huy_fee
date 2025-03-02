"use client";
import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Table, message } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

// Định nghĩa kiểu dữ liệu từ API
interface ApiResponse {
  success: boolean;
  message: string;
  data: string[][];
}

// Định nghĩa kiểu dữ liệu sau khi xử lý
interface AttendanceRecord {
  id: string;
  Name: string;
  Phone: string;
  [key: string]: [string, string, number] | string;
}

// Định nghĩa kiểu dữ liệu cho biểu đồ
interface ChartData {
  date: string;
  dayHours: number;
  nightHours: number;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://bup-be.vercel.app/api/H/get-all-attendance");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result: ApiResponse = await response.json();
        console.log("Dữ liệu thô từ API:", result);

        if (!result.success || !result.data || result.data.length === 0) {
          message.error("Không có dữ liệu từ API!");
          setLoading(false);
          return;
        }

        const rawData = result.data;
        const headers = rawData[0]; // Tiêu đề cột
        const processedData: AttendanceRecord[] = [];

        for (let i = 1; i < rawData.length; i += 3) {
          const personInfo = rawData[i]; // Dòng chứa id, Name, Phone
          const hoursInfo = rawData[i + 1] || []; // Dòng chứa totalHour, typeHour
          const valuesInfo = rawData[i + 2] || []; // Dòng chứa giá trị số

          if (!personInfo || personInfo.length < 2) continue;

          const record: AttendanceRecord = {
            id: personInfo[0] || "",
            Name: personInfo[1] || "Không tên",
            Phone: personInfo[2] || "",
          };

          // Gán dữ liệu cho từng ngày
          for (let j = 3; j < headers.length; j++) {
            const date = headers[j];
            const totalHour = personInfo[j] || ""; // totalHour từ dòng personInfo
            const typeHour = hoursInfo[j] || ""; // typeHour từ dòng hoursInfo
            const value = parseFloat(valuesInfo[j] || "0") || 0;

            record[date] = [totalHour, typeHour, value];
          }
          processedData.push(record);
        }

        console.log("Dữ liệu đã xử lý:", processedData);
        setData(processedData);

        if (processedData.length === 0) {
          message.warning("Dữ liệu sau xử lý rỗng!");
        } else {
          message.success(`Đã tải ${processedData.length} bản ghi!`);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        message.error("Không thể tải dữ liệu từ API!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    console.log("State data hiện tại:", data);
  }, [data]);

  // Tính tổng giờ làm việc
  const totalHours = data.reduce((sum: number, record: AttendanceRecord) => {
    let personHours = 0;
    for (const day in record) {
      // Thay let thành const
      if (
        day !== "id" &&
        day !== "Name" &&
        day !== "Phone" &&
        Array.isArray(record[day]) &&
        record[day][1]
      ) {
        const hours = record[day][1].split("-").reduce((acc: number, h: string) => {
          const num = parseFloat(h.replace(/[ST]/g, "").replace(",", "."));
          return acc + (isNaN(num) ? 0 : num);
        }, 0);
        personHours += hours;
      }
    }
    return sum + personHours;
  }, 0);

  // Dữ liệu cho biểu đồ Bar (dùng headers từ API thay vì cố định 31 ngày)
  const chartData: ChartData[] =
    data.length > 0
      ? Object.keys(data[0])
          .filter((key) => key !== "id" && key !== "Name" && key !== "Phone")
          .map((date) => {
            const dayHours = data.reduce((sum: number, record: AttendanceRecord) => {
              const typeHour = (record[date] as [string, string, number])[1];
              if (typeHour && typeHour.includes("S")) {
                return sum + parseFloat(typeHour.split("-")[0].replace("S", "").replace(",", "."));
              }
              return sum;
            }, 0);
            const nightHours = data.reduce((sum: number, record: AttendanceRecord) => {
              const typeHour = (record[date] as [string, string, number])[1];
              if (typeHour && typeHour.includes("T")) {
                return (
                  sum +
                  parseFloat(
                    (typeHour.includes("-") ? typeHour.split("-")[1] : typeHour)
                      .replace("T", "")
                      .replace(",", ".")
                  )
                );
              }
              return sum;
            }, 0);
            return { date, dayHours, nightHours };
          })
          .filter((d) => d.dayHours > 0 || d.nightHours > 0)
      : [];

  console.log("Dữ liệu biểu đồ:", chartData);

  // Cột cho bảng (dùng headers từ API)
  const columns =
    data.length > 0
      ? [
          { title: "ID", dataIndex: "id", key: "id" },
          { title: "Tên", dataIndex: "Name", key: "Name" },
          { title: "SĐT", dataIndex: "Phone", key: "Phone" },
          ...Object.keys(data[0])
            .filter((key) => key !== "id" && key !== "Name" && key !== "Phone")
            .map((date) => ({
              title: date,
              dataIndex: date,
              key: date,
              render: (value: [string, string, number]) => (
                <div>
                  <div>{value[0]}</div>
                  <div>{value[1]}</div>
                  <div>{value[2]}</div>
                </div>
              ),
            })),
        ]
      : [];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard Chấm Công</h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Tổng số giờ làm việc"
              value={totalHours}
              precision={1}
              suffix="giờ"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card title="Giờ làm việc theo ngày">
            {chartData.length > 0 ? (
              <BarChart width={600} height={300} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="dayHours" fill="#0088FE" name="Ca ngày (S)" />
                <Bar dataKey="nightHours" fill="#FF8042" name="Ca đêm (T)" />
              </BarChart>
            ) : (
              <p className="text-center">Không có dữ liệu để hiển thị biểu đồ</p>
            )}
          </Card>
        </Col>

        <Col xs={24}>
          <Card title="Danh sách chấm công">
            <Table
              columns={columns}
              dataSource={data}
              rowKey="id"
              loading={loading}
              scroll={{ x: 2000 }}
              locale={{ emptyText: "Không có dữ liệu chấm công" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
