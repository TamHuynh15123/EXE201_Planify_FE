import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Users,
  TrendingUp,
  UserPlus,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { userService, UserGrowthStats } from "../../services/userService";

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString("vi-VN");

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

type RangePreset = "7d" | "19d" | "30d" | "custom";

const PRESETS: { key: RangePreset; label: string }[] = [
  { key: "7d", label: "7 ngày" },
  { key: "19d", label: "19 ngày" },
  { key: "30d", label: "30 ngày" },
  { key: "custom", label: "Tùy chỉnh" },
];

// ── Component ─────────────────────────────────────────────────────────────────

const AdminUserGrowth: React.FC = () => {
  const [stats, setStats] = useState<UserGrowthStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [preset, setPreset] = useState<RangePreset>("19d");
  const [fromDate, setFromDate] = useState(daysAgo(18));
  const [toDate, setToDate] = useState(today());
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const applyPreset = useCallback((p: RangePreset) => {
    setPreset(p);
    if (p === "7d") { setFromDate(daysAgo(6)); setToDate(today()); }
    else if (p === "19d") { setFromDate(daysAgo(18)); setToDate(today()); }
    else if (p === "30d") { setFromDate(daysAgo(29)); setToDate(today()); }
    // custom: keep current
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userService.adminGetGrowthStats(fromDate, toDate);
      setStats(res.data ?? res as any);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Chart data ──────────────────────────────────────────────────────────
  const daily = stats?.dailyRegistrations ?? [];
  const maxCount = Math.max(...daily.map((d) => d.count), 1);

  const SVG_W = 700;
  const SVG_H = 200;
  const PAD_X = 44;
  const PAD_Y = 24;
  const chartW = SVG_W - PAD_X * 2;
  const chartH = SVG_H - PAD_Y * 2;

  const pts = daily.map((d, i) => ({
    x: daily.length <= 1 ? PAD_X + chartW / 2 : PAD_X + (i / (daily.length - 1)) * chartW,
    y: PAD_Y + chartH - (d.count / maxCount) * chartH,
    ...d,
  }));

  const linePath = pts.reduce(
    (path, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`),
    ""
  );
  const areaPath =
    pts.length > 0
      ? `${linePath} L ${pts[pts.length - 1].x} ${PAD_Y + chartH} L ${pts[0].x} ${PAD_Y + chartH} Z`
      : "";

  // Y-axis labels
  const yLabels = [0, Math.round(maxCount / 2), maxCount];

  // X-axis labels — show at most 7 evenly
  const xIdxs: number[] =
    daily.length <= 7
      ? daily.map((_, i) => i)
      : [0, ...Array.from({ length: 5 }, (_, k) => Math.round(((k + 1) * (daily.length - 1)) / 6)), daily.length - 1];

  // ── Growth badge ─────────────────────────────────────────────────────────
  const rate = stats?.growthRatePercent;
  const GrowthBadge = () => {
    if (rate === null || rate === undefined) return (
      <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#94a3b8", fontSize: 13 }}>
        <Minus size={14} /> Chưa đủ dữ liệu
      </span>
    );
    const pos = rate >= 0;
    return (
      <span style={{
        display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600,
        color: pos ? "#34d399" : "#f87171",
        background: pos ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
        borderRadius: 8, padding: "2px 10px"
      }}>
        {pos ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {pos ? "+" : ""}{rate}% so với kỳ trước
      </span>
    );
  };

  // ── Stat cards ─────────────────────────────────────────────────────────
  const cards = [
    {
      icon: <Users size={22} />,
      label: "Tổng người dùng",
      value: stats?.totalUsers ?? 0,
      color: "#818cf8",
      bg: "rgba(129,140,248,0.12)",
    },
    {
      icon: <UserPlus size={22} />,
      label: "Mới trong kỳ",
      value: stats?.newUsers ?? 0,
      color: "#34d399",
      bg: "rgba(52,211,153,0.12)",
    },
    {
      icon: <TrendingUp size={22} />,
      label: "7 ngày gần nhất",
      value: stats?.newUsersLast7Days ?? 0,
      color: "#fb923c",
      bg: "rgba(251,146,60,0.12)",
    },
    {
      icon: <Calendar size={22} />,
      label: "30 ngày gần nhất",
      value: stats?.newUsersLast30Days ?? 0,
      color: "#38bdf8",
      bg: "rgba(56,189,248,0.12)",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      padding: "32px 24px",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: "#e2e8f0",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
            <TrendingUp size={28} color="#818cf8" />
            Tăng trưởng người dùng
          </h1>
          <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 14 }}>
            Thống kê số lượng người dùng đăng ký theo thời gian
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Preset buttons */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 3, gap: 2 }}>
            {PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => applyPreset(p.key)}
                style={{
                  padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 500, transition: "all .2s",
                  background: preset === p.key ? "#818cf8" : "transparent",
                  color: preset === p.key ? "#fff" : "#94a3b8",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom date pickers */}
          {preset === "custom" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="date" value={fromDate} max={toDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={dateInputStyle}
              />
              <span style={{ color: "#64748b" }}>→</span>
              <input
                type="date" value={toDate} min={fromDate} max={today()}
                onChange={(e) => setToDate(e.target.value)}
                style={dateInputStyle}
              />
            </div>
          )}

          {/* Refresh */}
          <button
            onClick={fetchData}
            disabled={isLoading}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
              background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.3)",
              borderRadius: 10, color: "#818cf8", cursor: "pointer", fontSize: 13, fontWeight: 500,
            }}
          >
            <RefreshCw size={14} style={{ animation: isLoading ? "spin 1s linear infinite" : "none" }} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        {cards.map((c) => (
          <div key={c.label} style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{ background: c.bg, borderRadius: 12, padding: 12, flexShrink: 0, color: c.color }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>{c.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#f1f5f9", lineHeight: 1 }}>
                {isLoading ? <span style={{ opacity: 0.3 }}>—</span> : fmt(c.value)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Card */}
      <div style={{
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20, padding: "28px 28px 20px",
      }}>
        {/* Chart header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>
              Đăng ký theo ngày
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
              {fromDate} → {toDate}
            </div>
          </div>
          <GrowthBadge />
        </div>

        {isLoading ? (
          <div style={{ height: SVG_H, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", marginRight: 10 }} />
            Đang tải dữ liệu...
          </div>
        ) : daily.length === 0 ? (
          <div style={{ height: SVG_H, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
            Không có dữ liệu trong khoảng thời gian này
          </div>
        ) : (
          <div style={{ position: "relative", overflowX: "auto" }}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              width="100%"
              style={{ display: "block", minWidth: 320, maxHeight: 260 }}
              onMouseLeave={() => { setHoveredIdx(null); setTooltip(null); }}
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Y gridlines */}
              {yLabels.map((v) => {
                const cy = PAD_Y + chartH - (v / maxCount) * chartH;
                return (
                  <g key={v}>
                    <line x1={PAD_X} y1={cy} x2={SVG_W - PAD_X} y2={cy}
                      stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                    <text x={PAD_X - 6} y={cy + 4} textAnchor="end"
                      fontSize={10} fill="#475569">{v}</text>
                  </g>
                );
              })}

              {/* Area + Line */}
              {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}
              {linePath && (
                <path d={linePath} fill="none" stroke="#818cf8" strokeWidth={2.5}
                  strokeLinecap="round" strokeLinejoin="round" />
              )}

              {/* X labels */}
              {xIdxs.map((i) => {
                const p = pts[i];
                const dateStr = daily[i]?.date?.slice(5) ?? ""; // MM-DD
                return (
                  <text key={i} x={p.x} y={SVG_H - 4} textAnchor="middle"
                    fontSize={10} fill="#475569">{dateStr}</text>
                );
              })}

              {/* Hover areas */}
              {pts.map((p, i) => (
                <rect
                  key={i}
                  x={i === 0 ? PAD_X : (pts[i - 1].x + p.x) / 2}
                  y={PAD_Y}
                  width={
                    i === 0
                      ? (pts[1]?.x ?? p.x + 20) / 2 - PAD_X
                      : i === pts.length - 1
                      ? p.x - (pts[i - 1].x + p.x) / 2
                      : ((pts[i + 1].x + p.x) / 2) - ((pts[i - 1].x + p.x) / 2)
                  }
                  height={chartH}
                  fill="transparent"
                  style={{ cursor: "crosshair" }}
                  onMouseEnter={(e) => {
                    const rect = svgRef.current?.getBoundingClientRect();
                    if (rect) {
                      setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                    }
                    setHoveredIdx(i);
                  }}
                  onMouseMove={(e) => {
                    const rect = svgRef.current?.getBoundingClientRect();
                    if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                  }}
                />
              ))}

              {/* Hover dot */}
              {hoveredIdx !== null && pts[hoveredIdx] && (
                <>
                  <line
                    x1={pts[hoveredIdx].x} y1={PAD_Y}
                    x2={pts[hoveredIdx].x} y2={PAD_Y + chartH}
                    stroke="rgba(129,140,248,0.4)" strokeWidth={1} strokeDasharray="4 3"
                  />
                  <circle cx={pts[hoveredIdx].x} cy={pts[hoveredIdx].y}
                    r={5} fill="#818cf8" stroke="#1e293b" strokeWidth={2} />
                </>
              )}
            </svg>

            {/* Tooltip */}
            {hoveredIdx !== null && tooltip && daily[hoveredIdx] && (
              <div style={{
                position: "absolute",
                left: Math.min(tooltip.x + 12, (svgRef.current?.clientWidth ?? 400) - 140),
                top: Math.max(tooltip.y - 50, 0),
                background: "rgba(15,23,42,0.95)",
                border: "1px solid rgba(129,140,248,0.4)",
                borderRadius: 10, padding: "10px 14px",
                pointerEvents: "none", zIndex: 10,
                backdropFilter: "blur(8px)", minWidth: 120,
              }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                  📅 {daily[hoveredIdx].date}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#818cf8" }}>
                  {fmt(daily[hoveredIdx].count)}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>người đăng ký</div>
              </div>
            )}
          </div>
        )}

        {/* Daily breakdown table */}
        {!isLoading && daily.length > 0 && (
          <div style={{ marginTop: 28, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 12 }}>
              Chi tiết theo ngày
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {daily.map((d, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    background: hoveredIdx === i ? "rgba(129,140,248,0.2)" : d.count > 0 ? "rgba(129,140,248,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${hoveredIdx === i ? "rgba(129,140,248,0.5)" : d.count > 0 ? "rgba(129,140,248,0.2)" : "rgba(255,255,255,0.05)"}`,
                    borderRadius: 10, padding: "8px 12px", minWidth: 88, textAlign: "center",
                    cursor: "default", transition: "all .15s",
                  }}
                >
                  <div style={{ fontSize: 10, color: "#64748b" }}>{d.date.slice(5)}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: d.count > 0 ? "#818cf8" : "#475569" }}>
                    {d.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const dateInputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#e2e8f0",
  padding: "6px 10px",
  fontSize: 13,
  outline: "none",
};

export default AdminUserGrowth;
