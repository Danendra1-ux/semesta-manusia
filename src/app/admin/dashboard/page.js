"use client";

import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import styles from "./page.module.css";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

// Chart data
const campData = [
  { name: "Pending", value: 45, color: "#1A1A2E" },
  { name: "Diterima", value: 30, color: "#6B7280" },
  { name: "Ditolak", value: 25, color: "#D1D5DB" },
];

const sjnData = [
  { name: "Pending", value: 38, color: "#1A1A2E" },
  { name: "Diterima", value: 42, color: "#6B7280" },
  { name: "Ditolak", value: 20, color: "#D1D5DB" },
];

// Table data
const recentRegistrations = [
  { id: 1, nama: "Andi Pratama", aktivitas: "SJN#4", tipe: "Fully Funded", status: "Ditolak" },
  { id: 2, nama: "Siti Rahma", aktivitas: "Semesta Camp #2", tipe: "-", status: "Pending" },
  { id: 3, nama: "Budi Santoso", aktivitas: "Semesta Camp #3", tipe: "-", status: "Pending" },
  { id: 4, nama: "Dewi Lestari", aktivitas: "SJN#4", tipe: "Self Funded", status: "Diterima" },
  { id: 5, nama: "Reza Firmansyah", aktivitas: "Semesta Camp #3", tipe: "-", status: "Pending" },
  { id: 6, nama: "Nadia Putri", aktivitas: "SJN#3", tipe: "Fully Funded", status: "Ditolak" },
];

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "Pending":
      return styles.badgePending;
    case "Diterima":
      return styles.badgeDiterima;
    case "Ditolak":
      return styles.badgeDitolak;
    default:
      return "";
  }
};

// Get today's date formatted
const getFormattedDate = () => {
  const options = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
  return new Date().toLocaleDateString("id-ID", options);
};

export default function DashboardPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expanded : ""}`}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h1 className={styles.pageTitle}>Dashboard</h1>
          </div>
          <div className={styles.topbarRight}>
            <span className={styles.currentDate}>{getFormattedDate()}</span>
            <button className={styles.notificationButton} aria-label="Notifikasi">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span className={styles.notificationDot} />
            </button>
            <div className={styles.adminAvatar}>AM</div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className={styles.dashboardContent}>
          {/* Stat Cards */}
          <div className={styles.statsGrid}>
            {/* Total Pendaftar */}
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statNumber}>1,284</span>
                <span className={styles.statLabel}>Total Pendaftar</span>
                <span className={styles.statGrowth}>+12 dari bulan lalu</span>
              </div>
            </div>

            {/* Total Program */}
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                </svg>
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statNumber}>12</span>
                <span className={styles.statLabel}>Total Program</span>
                <span className={styles.statGrowth}>+3 dari bulan lalu</span>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className={styles.chartsGrid}>
            {/* Semesta Camp Chart */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Semesta Camp</h3>
              <div className={styles.chartContent}>
                <div className={styles.chartWrapper}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={campData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {campData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.chartLegend}>
                  {campData.map((item, index) => (
                    <div key={index} className={styles.legendItem}>
                      <span
                        className={styles.legendDot}
                        style={{ background: item.color }}
                      />
                      <span className={styles.legendLabel}>{item.name}</span>
                      <span className={styles.legendValue}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SJN Chart */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Semesta Jelajah Nusantara</h3>
              <div className={styles.chartContent}>
                <div className={styles.chartWrapper}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={sjnData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {sjnData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.chartLegend}>
                  {sjnData.map((item, index) => (
                    <div key={index} className={styles.legendItem}>
                      <span
                        className={styles.legendDot}
                        style={{ background: item.color }}
                      />
                      <span className={styles.legendLabel}>{item.name}</span>
                      <span className={styles.legendValue}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Registration Table */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h3 className={styles.tableTitle}>Pendaftar Terbaru</h3>
              <button className={styles.viewAllButton}>
                <span>Lihat Semua</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Jenis Aktivitas</th>
                    <th>Tipe</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRegistrations.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className={styles.registrantName}>{item.nama}</span>
                      </td>
                      <td>
                        <span className={styles.activityBadge}>{item.aktivitas}</span>
                      </td>
                      <td>
                        <span className={styles.tipeText}>{item.tipe}</span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <button className={styles.viewButton}>Lihat</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}