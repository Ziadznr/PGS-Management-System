import React, { useEffect } from "react";
import {
  ExpensesSummary,
  SaleSummary,
  PurchaseSummary,
} from "../../APIRequest/SummaryAPIRequest";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { useSelector } from "react-redux";
import { NumericFormat as CurrencyFormat } from "react-number-format";
import store from "../../redux/store/store";
import { ShowLoader, HideLoader } from "../../redux/state-slice/settings-slice";

// ---------------- Helpers ----------------
const getLast30Days = () => {
  const dates = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]); // YYYY-MM-DD
  }
  return dates;
};

const mapToLast30Days = (data) => {
  const last30Days = getLast30Days();
  return last30Days.map((date) => {
    const found = data.find((d) => d._id === date);
    return { _id: date, TotalAmount: found ? found.TotalAmount : 0 };
  });
};

// ---------------- Modern Colors ----------------
const gradientColors = {
  expense: ["#ff7f50", "#ff4500"], // orange gradient
  sale: ["#1e90ff", "#00bfff"],    // blue gradient
  purchase: ["#32cd32", "#228b22"], // green gradient
};

const Dashboard = () => {
  useEffect(() => {
    const loadData = async () => {
      store.dispatch(ShowLoader());
      try {
        await Promise.all([
          ExpensesSummary(),
          SaleSummary(),
          PurchaseSummary(),
        ]);
      } finally {
        store.dispatch(HideLoader());
      }
    };
    loadData();
  }, []);

  // ---------------- Redux State ----------------
  const ExpenseChart = useSelector((state) => state.dashboard.ExpenseChart);
  const ExpenseTotal = useSelector((state) => state.dashboard.ExpenseTotal);

  const SaleChart = useSelector((state) => state.dashboard.SaleChart);
  const SaleTotal = useSelector((state) => state.dashboard.SaleTotal);

  const PurchaseChart = useSelector((state) => state.dashboard.PurchaseChart);
  const PurchaseTotal = useSelector((state) => state.dashboard.PurchaseTotal);

  // ---------------- Render Functions ----------------
  const renderCard = (title, total, color) => (
    <div className="col-md-4 p-2" key={title}>
      <div
        className="card shadow-sm"
        style={{ borderLeft: `5px solid ${color}`, borderRadius: "10px" }}
      >
        <div className="card-body">
          <span className="h5">
            <CurrencyFormat
              value={total}
              displayType={"text"}
              thousandSeparator={true}
              prefix={"৳ "}
            />
          </span>
          <p className="text-muted">{title}</p>
        </div>
      </div>
    </div>
  );

  const renderBarChart = (title, data, colorKey) => {
    const gradientId = `grad-${title.replace(/\s/g, "")}`;
    const gradient = gradientColors[colorKey];

    return (
      <div className="col-md-6 p-2" key={title}>
        <div className="card shadow-sm" style={{ borderRadius: "10px" }}>
          <div className="card-body">
            <span className="h6">{title}</span>
            <ResponsiveContainer className="mt-4" width="100%" height={220}>
              <BarChart
                data={mapToLast30Days(data)}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={gradient[0]} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={gradient[1]} stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="TotalAmount"
                  fill={`url(#${gradientId})`}
                  radius={[6, 6, 0, 0]}
                  animationDuration={1500}
                >
                  {mapToLast30Days(data).map((entry, index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderLineChart = (title, data, color) => (
    <div className="col-md-6 p-2" key={title + "_line"}>
      <div className="card shadow-sm" style={{ borderRadius: "10px" }}>
        <div className="card-body">
          <span className="h6">{title} Trend</span>
          <ResponsiveContainer className="mt-4" width="100%" height={220}>
            <LineChart
              data={mapToLast30Days(data)}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="TotalAmount"
                stroke={color}
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid my-4">
      <div className="row">
        {renderCard("Total Expense", ExpenseTotal, gradientColors.expense[0])}
        {renderCard("Total Sale", SaleTotal, gradientColors.sale[0])}
        {renderCard("Total Purchase", PurchaseTotal, gradientColors.purchase[0])}
      </div>

      <div className="row">
        {renderBarChart("Expense Last 30 Days", ExpenseChart, "expense")}
        {renderLineChart("Expense", ExpenseChart, gradientColors.expense[1])}

        {renderBarChart("Sales Last 30 Days", SaleChart, "sale")}
        {renderLineChart("Sales", SaleChart, gradientColors.sale[1])}

        {renderBarChart("Purchase Last 30 Days", PurchaseChart, "purchase")}
        {renderLineChart("Purchase", PurchaseChart, gradientColors.purchase[1])}
      </div>
    </div>
  );
};

export default Dashboard;
