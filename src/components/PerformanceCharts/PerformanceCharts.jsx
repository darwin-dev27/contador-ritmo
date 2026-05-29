import React, { useState, useEffect } from 'react';
import { activityAPI } from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';
import { BarChart3, PieChart as PieIcon, LineChart as LineIcon, Activity, Sparkles } from 'lucide-react';
import styles from './PerformanceCharts.module.css';

export const PerformanceCharts = ({ globalStats }) => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyStats();
  }, []);

  const fetchMonthlyStats = async () => {
    try {
      setLoading(true);
      const data = await activityAPI.getMonthlyStats();
      
      // Formatear las fechas de los meses para que sean legibles (ej: "Mayo 2026")
      const formatted = data.map(item => {
        const date = new Date(item.month);
        const monthName = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
        
        return {
          ...item,
          name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
          // Convertir metros a kilómetros
          'Natación (km)': (item.swim_distance || 0) / 1000,
          'Ciclismo (km)': (item.bike_distance || 0) / 1000,
          'Carrera (km)': (item.run_distance || 0) / 1000,
          'Horas': (item.total_time_seconds || 0) / 3600,
          'Calorías (kcal)': item.total_calories || 0,
        };
      });

      setMonthlyData(formatted);
    } catch (err) {
      console.error("Error al obtener estadísticas mensuales para gráficos:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.chartsContainer}>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Cargando analíticas avanzadas...</p>
        </div>
      </div>
    );
  }

  // Si no hay datos mensuales suficientes
  if (monthlyData.length === 0) {
    return (
      <div className={styles.chartsContainer}>
        <div className={`glass-panel ${styles.chartCard}`}>
          <div className={styles.emptyState}>
            <Activity size={40} color="var(--primary)" />
            <h4 style={{ margin: 0, color: '#fff' }}>Analíticas Avanzadas</h4>
            <p className={styles.emptyText}>Registra tu primer entrenamiento en el diario para comenzar a visualizar tus gráficas de rendimiento y volumen.</p>
          </div>
        </div>
      </div>
    );
  }

  // Formatear datos para el gráfico de Distribución (Pie Chart)
  const runKm = parseFloat(globalStats.kmRun) || 0;
  const bikeKm = parseFloat(globalStats.kmBike) || 0;
  const swimKm = (parseFloat(globalStats.mSwim) || 0) / 1000;

  const distributionData = [
    { name: 'Carrera', value: runKm, color: 'var(--accent-run)' },
    { name: 'Ciclismo', value: bikeKm, color: 'var(--accent-bike)' },
    { name: 'Natación', value: swimKm, color: 'var(--accent-swim)' }
  ].filter(d => d.value > 0);

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          {payload.map((item, index) => (
            <p key={index} className={styles.tooltipItem} style={{ color: item.color || '#fff' }}>
              <span>{item.name}:</span>
              <strong>{Number(item.value).toFixed(1)} {item.unit || ''}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel} style={{ color: data.color }}>{data.name}</p>
          <p className={styles.tooltipItem} style={{ color: '#fff' }}>
            <span>Distancia:</span>
            <strong>{Number(data.value).toFixed(1)} km</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartsContainer}>
      <div className={styles.sectionHeader}>
        <Sparkles size={24} color="var(--primary)" />
        <h3 className={styles.sectionTitle}>Analíticas e Histórico de Rendimiento</h3>
      </div>

      <div className={styles.chartsGrid}>
        {/* 1. Evolución del Volumen Mensual (Barras Apiladas) */}
        <div className={`glass-panel ${styles.chartCard}`}>
          <div className={styles.chartHeader}>
            <h4 className={styles.chartTitle}>
              <BarChart3 size={18} color="var(--primary)" />
              Volumen Mensual por Disciplina
            </h4>
            <p className={styles.chartSubtitle}>Distancia acumulada (km) agrupada por mes en la temporada.</p>
          </div>

          <div className={styles.responsiveWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} unit="k" />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="Natación (km)" stackId="a" fill="var(--accent-swim)" radius={[0, 0, 0, 0]} unit=" km" />
                <Bar dataKey="Ciclismo (km)" stackId="a" fill="var(--accent-bike)" radius={[0, 0, 0, 0]} unit=" km" />
                <Bar dataKey="Carrera (km)" stackId="a" fill="var(--accent-run)" radius={[4, 4, 0, 0]} unit=" km" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Distribución de Distancia Acumulada (Dona/Pie) */}
        <div className={`glass-panel ${styles.chartCard}`}>
          <div className={styles.chartHeader}>
            <h4 className={styles.chartTitle}>
              <PieIcon size={18} color="var(--primary)" />
              Distribución de Kilómetros
            </h4>
            <p className={styles.chartSubtitle}>Proporción total de la distancia acumulada por deporte.</p>
          </div>

          <div className={styles.responsiveWrapper}>
            {distributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>Registra actividades para ver la distribución.</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Evolución de Intensidad: Horas y Gasto Calórico (Líneas) */}
        <div className={`glass-panel ${styles.chartCard} ${styles.fullWidthCard}`}>
          <div className={styles.chartHeader}>
            <h4 className={styles.chartTitle}>
              <LineIcon size={18} color="var(--primary)" />
              Gasto Energético y Volumen de Horas
            </h4>
            <p className={styles.chartSubtitle}>Correlación mensual entre las horas entrenadas y las calorías quemadas.</p>
          </div>

          <div className={styles.responsiveWrapper} style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="var(--accent-swim)" fontSize={11} tickLine={false} unit="h" />
                <YAxis yAxisId="right" orientation="right" stroke="var(--primary)" fontSize={11} tickLine={false} unit="cal" />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Line yAxisId="left" type="monotone" dataKey="Horas" stroke="var(--accent-swim)" strokeWidth={2.5} activeDot={{ r: 6 }} unit=" h" />
                <Line yAxisId="right" type="monotone" dataKey="Calorías (kcal)" stroke="var(--primary)" strokeWidth={2.5} activeDot={{ r: 6 }} unit=" kcal" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
