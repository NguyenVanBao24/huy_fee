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

// Định nghĩa kiểu dữ liệu cho biểu đồ giờ làm theo tháng
interface HoursByMonthChartData {
  date: string;
  dayHours: number;
  nightHours: number;
}

// Định nghĩa kiểu dữ liệu cho biểu đồ tiền lương theo tháng
interface SalaryByMonthChartData {
  date: string;
  salary: number;
}

// Định nghĩa kiểu dữ liệu cho biểu đồ tiền lương theo cá nhân
interface SalaryByPersonChartData {
  name: string;
  salary: number;
}

// Định nghĩa kiểu dữ liệu cho biểu đồ giờ làm theo cá nhân
interface HoursByPersonChartData {
  name: string;
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
        const response = await fetch("https://bup-be.onrender.com/api/H/get-all-attendance");
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
        const headers = rawData[0];
        const processedData: AttendanceRecord[] = [];

        for (let i = 1; i < rawData.length; i += 3) {
          const personInfo = rawData[i];
          const hoursInfo = rawData[i + 1] || [];
          const valuesInfo = rawData[i + 2] || [];

          if (!personInfo || personInfo.length < 2) continue;

          const record: AttendanceRecord = {
            id: personInfo[0] || "",
            Name: personInfo[1] || "Không tên",
            Phone: personInfo[2] || "",
          };

          for (let j = 3; j < headers.length; j++) {
            const date = headers[j];
            const totalHour = personInfo[j] || "";
            const typeHour = hoursInfo[j] || "";
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

  // Tính tổng giờ làm việc và tiền lương cho ca sáng (S) và ca tối (T)
  const { dayHoursTotal, nightHoursTotal, daySalaryTotal } = data.reduce(
    (
      totals: {
        dayHoursTotal: number;
        nightHoursTotal: number;
        daySalaryTotal: number;
        nightSalaryTotal: number;
      },
      record: AttendanceRecord
    ) => {
      for (const day in record) {
        if (
          day !== "id" &&
          day !== "Name" &&
          day !== "Phone" &&
          Array.isArray(record[day]) &&
          record[day][1]
        ) {
          const typeHour = record[day][1];
          const salary = record[day][2];
          if (typeHour.includes("S")) {
            const dayHours = parseFloat(typeHour.split("-")[0].replace("S", "").replace(",", "."));
            totals.dayHoursTotal += isNaN(dayHours) ? 0 : dayHours;
            totals.daySalaryTotal += salary;
          }
          if (typeHour.includes("T")) {
            const nightHours = parseFloat(
              (typeHour.includes("-") ? typeHour.split("-")[1] : typeHour)
                .replace("T", "")
                .replace(",", ".")
            );
            totals.nightHoursTotal += isNaN(nightHours) ? 0 : nightHours;
            totals.nightSalaryTotal += salary;
          }
        }
      }
      return totals;
    },
    { dayHoursTotal: 0, nightHoursTotal: 0, daySalaryTotal: 0, nightSalaryTotal: 0 }
  );

  // Biểu đồ 1: Giờ làm theo tháng (theo ngày)
  const hoursByMonthChartData: HoursByMonthChartData[] =
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

  // Biểu đồ 2: Tiền lương theo tháng (theo ngày)
  const salaryByMonthChartData: SalaryByMonthChartData[] =
    data.length > 0
      ? Object.keys(data[0])
          .filter((key) => key !== "id" && key !== "Name" && key !== "Phone")
          .map((date) => {
            const salary = data.reduce((sum: number, record: AttendanceRecord) => {
              return sum + (record[date] as [string, string, number])[2];
            }, 0);
            return { date, salary };
          })
          .filter((d) => d.salary > 0)
      : [];

  // Biểu đồ 3: Tiền lương theo cá nhân
  const salaryByPersonChartData: SalaryByPersonChartData[] = data.map((record) => {
    const salary = Object.keys(record)
      .filter((day) => day !== "id" && day !== "Name" && day !== "Phone")
      .reduce((sum, day) => sum + (record[day] as [string, string, number])[2], 0);
    return { name: record.Name, salary };
  });

  // Biểu đồ 4: Giờ làm theo cá nhân
  const hoursByPersonChartData: HoursByPersonChartData[] = data.map((record) => {
    let dayHours = 0;
    let nightHours = 0;
    for (const day in record) {
      if (
        day !== "id" &&
        day !== "Name" &&
        day !== "Phone" &&
        Array.isArray(record[day]) &&
        record[day][1]
      ) {
        const typeHour = record[day][1];
        if (typeHour.includes("S")) {
          dayHours += parseFloat(typeHour.split("-")[0].replace("S", "").replace(",", "."));
        }
        if (typeHour.includes("T")) {
          nightHours += parseFloat(
            (typeHour.includes("-") ? typeHour.split("-")[1] : typeHour)
              .replace("T", "")
              .replace(",", ".")
          );
        }
      }
    }
    return { name: record.Name, dayHours, nightHours };
  });

  // Cột cho bảng
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
        {/* Tổng số giờ ca sáng */}
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Tổng giờ ca sáng (S)"
              value={dayHoursTotal}
              precision={1}
              suffix="giờ"
              valueStyle={{ color: "#0088FE" }}
            />
          </Card>
        </Col>
        {/* Tổng số giờ ca tối */}
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Tổng giờ ca tối (T)"
              value={nightHoursTotal}
              precision={1}
              suffix="giờ"
              valueStyle={{ color: "#FF8042" }}
            />
          </Card>
        </Col>
        {/* Tổng tiền ca sáng */}
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Tổng tiền"
              value={daySalaryTotal}
              precision={0}
              suffix="VNĐ"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        {/* Tổng tiền ca tối */}
        {/* <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Tổng tiền ca tối (T)"
              value={nightSalaryTotal}
              precision={0}
              suffix="VNĐ"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col> */}
        {/* Biểu đồ 1: Giờ làm theo tháng */}
        <Col xs={24} md={12}>
          <Card title="Giờ làm theo tháng (Tháng 5/25)">
            {hoursByMonthChartData.length > 0 ? (
              <BarChart width={500} height={300} data={hoursByMonthChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="dayHours" fill="#0088FE" name="Ca sáng (S)" />
                <Bar dataKey="nightHours" fill="#FF8042" name="Ca tối (T)" />
              </BarChart>
            ) : (
              <p className="text-center">Không có dữ liệu để hiển thị</p>
            )}
          </Card>
        </Col>
        {/* Biểu đồ 2: Tiền lương theo tháng */}
        <Col xs={24} md={12}>
          <Card title="Tiền lương theo tháng (Tháng 5/25)">
            {salaryByMonthChartData.length > 0 ? (
              <BarChart width={500} height={300} data={salaryByMonthChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} VNĐ`} />
                <Legend />
                <Bar dataKey="salary" fill="#52c41a" name="Tiền lương" />
              </BarChart>
            ) : (
              <p className="text-center">Không có dữ liệu để hiển thị</p>
            )}
          </Card>
        </Col>
        {/* Biểu đồ 3: Tiền lương theo cá nhân */}
        <Col xs={24} md={12}>
          <Card title="Tiền lương theo cá nhân (Tháng 5/25)">
            {salaryByPersonChartData.length > 0 ? (
              <BarChart width={500} height={300} data={salaryByPersonChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} VNĐ`} />
                <Legend />
                <Bar dataKey="salary" fill="#52c41a" name="Tiền lương" />
              </BarChart>
            ) : (
              <p className="text-center">Không có dữ liệu để hiển thị</p>
            )}
          </Card>
        </Col>
        {/* Biểu đồ 4: Giờ làm theo cá nhân */}
        <Col xs={24} md={12}>
          <Card title="Giờ làm theo cá nhân (Tháng 5/25)">
            {hoursByPersonChartData.length > 0 ? (
              <BarChart width={500} height={300} data={hoursByPersonChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="dayHours" fill="#0088FE" name="Ca sáng (S)" />
                <Bar dataKey="nightHours" fill="#FF8042" name="Ca tối (T)" />
              </BarChart>
            ) : (
              <p className="text-center">Không có dữ liệu để hiển thị</p>
            )}
          </Card>
        </Col>
        {/* Bảng dữ liệu */}
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
