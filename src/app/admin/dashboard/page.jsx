"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSidebar } from "../components/SidebarContext";
import AdminSidebar from "../components/AdminSidebar";
import styles from "./page.module.css";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

// Chart data (initial empty state — replaced by fetched data)
const emptyChartData = [
  { name: "Menunggu", value: 0, color: "#00bfff" },
  { name: "Diterima", value: 0, color: "#10b981" },
  { name: "Ditolak", value: 0, color: "#ef4444" },
];

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "Menunggu":
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
  const { isCollapsed, toggle: onToggleSidebar } = useSidebar();
  const [stats, setStats] = useState({
    total_registrants: 0,
    total_programs: 0,
    camp_data: emptyChartData,
    sjn_data: emptyChartData,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const [showChoiceModal, setShowChoiceModal] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          setStats({
            total_registrants: data.total_registrants ?? 0,
            total_programs: data.total_programs ?? 0,
            camp_data: data.camp_data ?? emptyChartData,
            sjn_data: data.sjn_data ?? emptyChartData,
          });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    const fetchRegistrations = async () => {
      try {
        const res = await fetch("/api/dashboard/recent-registrations?limit=6");
        if (res.ok) {
          const data = await res.json();
          setRegistrations(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch recent registrations:", err);
      } finally {
        setRegistrationsLoading(false);
      }
    };

    fetchStats();
    fetchRegistrations();
  }, []);

  const formatNumber = (n) => (n ?? 0).toLocaleString("id-ID");

  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggle={onToggleSidebar}
      />

      {/* Main Content */}
      <main className={`${styles.mainContent} ${isCollapsed ? styles.expanded : ""}`}>
        {/* Content Header */}
        <div className={styles.contentHeader}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>Beranda</h1>
            <p className={styles.pageSubtitle}>
              Ringkasan statistik dan pendaftar terbaru
            </p>
          </div>
          <div className={styles.topbarRight}>
            <span className={styles.currentDate}>{getFormattedDate()}</span>
          </div>
        </div>

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
                <span className={styles.statNumber}>
                  {statsLoading ? "..." : formatNumber(stats.total_registrants)}
                </span>
                <span className={styles.statLabel}>Total Pendaftar</span>
                <span className={styles.statGrowth}>Semesta Camp & SJN</span>
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
                <span className={styles.statNumber}>
                  {statsLoading ? "..." : formatNumber(stats.total_programs)}
                </span>
                <span className={styles.statLabel}>Total Program</span>
                <span className={styles.statGrowth}>Semesta Camp & SJN</span>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className={styles.chartsGrid}>
            {/* Semesta Camp Chart */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <span className={styles.chartIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 21l9-15 9 15" />
                    <path d="M9 21V11h6v10" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </span>
                <h3 className={styles.chartTitle}>Semesta Camp</h3>
              </div>
              <div className={styles.chartContent}>
                <div className={styles.chartWrapper}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={stats.camp_data}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {stats.camp_data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 10,
                          border: "1px solid rgba(0, 191, 255, 0.2)",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                          fontSize: "0.8125rem",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className={styles.chartCenter}>
                    <div className={styles.chartCenterTotal}>
                      {stats.camp_data.reduce((sum, item) => sum + (item.value || 0), 0)}
                    </div>
                    <div className={styles.chartCenterLabel}>Total</div>
                  </div>
                </div>
                <div className={styles.chartLegend}>
                  {stats.camp_data.map((item, index) => (
                    <div key={index} className={styles.legendItem}>
                      <span
                        className={styles.legendDot}
                        style={{ background: item.color }}
                      />
                      <span className={styles.legendText}>
                        <span className={styles.legendLabel}>{item.name}</span>
                        <span className={styles.legendValue}>{item.value}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SJN Chart */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <span className={styles.chartIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  </svg>
                </span>
                <h3 className={styles.chartTitle}>Semesta Jelajah Nusantara</h3>
              </div>
              <div className={styles.chartContent}>
                <div className={styles.chartWrapper}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={stats.sjn_data}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {stats.sjn_data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 10,
                          border: "1px solid rgba(0, 191, 255, 0.2)",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                          fontSize: "0.8125rem",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className={styles.chartCenter}>
                    <div className={styles.chartCenterTotal}>
                      {stats.sjn_data.reduce((sum, item) => sum + (item.value || 0), 0)}
                    </div>
                    <div className={styles.chartCenterLabel}>Total</div>
                  </div>
                </div>
                <div className={styles.chartLegend}>
                  {stats.sjn_data.map((item, index) => (
                    <div key={index} className={styles.legendItem}>
                      <span
                        className={styles.legendDot}
                        style={{ background: item.color }}
                      />
                      <span className={styles.legendText}>
                        <span className={styles.legendLabel}>{item.name}</span>
                        <span className={styles.legendValue}>{item.value}</span>
                      </span>
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
              <button className={styles.viewAllButton} onClick={() => setShowChoiceModal(true)}>
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
                    <th>Judul Program</th>
                    <th>Tipe</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {registrationsLoading && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "#9ca3af", padding: "1.5rem" }}>
                        Memuat pendaftar...
                      </td>
                    </tr>
                  )}
                  {!registrationsLoading && registrations.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "#9ca3af", padding: "1.5rem" }}>
                        Belum ada pendaftar.
                      </td>
                    </tr>
                  )}
                  {!registrationsLoading && registrations.length > 0 && registrations.map((item) => (
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
                          {item.status === "Pending" ? "Menunggu" : item.status}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/admin/${item.category === 'SJN' ? 'sjn' : 'semesta-camp'}/${item.program_id}/pendaftar/${item.id}`}
                          className={styles.viewButton}
                        >
                          Lihat
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Choice Modal: pilih halaman program */}
      {showChoiceModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowChoiceModal(false)}>
          <div
            className={styles.modalDialog}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lihat-semua-modal-title"
          >
            <h3 id="lihat-semua-modal-title" className={styles.modalTitle}>
              Lihat Daftar Program
            </h3>
            <p className={styles.modalDescription}>
              Pilih program yang ingin Anda lihat daftar pendaftarnya.
            </p>

            <div className={styles.modalChoices}>
              <Link
                href="/admin/semesta-camp"
                className={styles.modalChoiceBtn}
                onClick={() => setShowChoiceModal(false)}
              >
                <span className={`${styles.modalChoiceIcon} ${styles.camp}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 21l9-15 9 15" />
                    <path d="M9 21V11h6v10" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </span>
                Semesta Camp
              </Link>
              <Link
                href="/admin/sjn"
                className={styles.modalChoiceBtn}
                onClick={() => setShowChoiceModal(false)}
              >
                <span className={`${styles.modalChoiceIcon} ${styles.sjn}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  </svg>
                </span>
                Semesta Jelajah Nusantara
              </Link>
            </div>

            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={() => setShowChoiceModal(false)}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}