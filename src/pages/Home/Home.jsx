import React from 'react';
import { Link } from 'react-router-dom';
import { Waves, Bike, Footprints, Trophy, Target, Award, Calendar, Cpu, ShieldCheck } from 'lucide-react';
import styles from './Home.module.css';

export const Home = () => {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      
      {/* 1. HERO SECTION */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Domina tu Rendimiento en <br />
            <span className={styles.heroHighlight}>Natación, Ciclismo y Carrera</span>
          </h1>
          <p className={styles.heroSubtitle}>
            La plataforma integral para triatletas. Registra tus sesiones, controla el desgaste de tu equipamiento con precisión Muchos a Muchos y planifica tus picos de forma para cruzar la meta.
          </p>
          <div className={styles.btnGroup}>
            <Link to="/register" className={`button ${styles.ctaBtn}`}>
              Comenzar ahora 🚀
            </Link>
            <Link to="/login" className={`button secondary ${styles.ctaBtn}`}>
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </header>

      {/* 2. THREE SPORT CARDS SECTION */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tres Disciplinas, Una Sola Plataforma</h2>
        <p className={styles.sectionSubtitle}>
          TriCalc Pro centraliza y analiza cada fase de tus entrenamientos con total precisión.
        </p>

        <div className={styles.sportGrid}>
          {/* Nadar */}
          <div className={`glass-panel ${styles.sportCard}`}>
            <div className={styles.sportIconWrapper}>
              <Waves size={36} color="var(--accent-swim)" />
            </div>
            <h3 className={styles.sportName}>Natación</h3>
            <p className={styles.sportDesc}>
              Registra tus entrenamientos en piscina o aguas abiertas. Controla tus brazadas, ritmos cada 100m, y analiza el rendimiento de tu neopreno y gafas.
            </p>
          </div>

          {/* Pedalear */}
          <div className={`glass-panel ${styles.sportCard}`}>
            <div className={styles.sportIconWrapper}>
              <Bike size={36} color="var(--accent-bike)" />
            </div>
            <h3 className={styles.sportName}>Ciclismo</h3>
            <p className={styles.sportDesc}>
              Analiza tu potencia (W), cadencias, desniveles acumulados y trackea el desgaste de tu bicicleta de ruta, gravel o rodillo de forma inteligente.
            </p>
          </div>

          {/* Correr */}
          <div className={`glass-panel ${styles.sportCard}`}>
            <div className={styles.sportIconWrapper}>
              <Footprints size={36} color="var(--accent-run)" />
            </div>
            <h3 className={styles.sportName}>Carrera a Pie</h3>
            <p className={styles.sportDesc}>
              Controla tus ritmos por kilómetro, cadencia de zancada y vigila la vida útil acumulada de tus zapatillas favoritas para evitar lesiones.
            </p>
          </div>
        </div>
      </section>

      {/* 3. KEY BENEFITS SECTION */}
      <section className={styles.section} style={{ background: 'rgba(255, 255, 255, 0.01)', borderRadius: '24px' }}>
        <h2 className={styles.sectionTitle}>Beneficios Principales</h2>
        <p className={styles.sectionSubtitle}>
          ¿Por qué los triatletas eligen TriCalc Pro para entrenar de forma inteligente?
        </p>

        <div className={styles.benefitsGrid}>
          <div className={styles.benefitCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Cpu size={20} color="var(--primary)" />
              <h4 className={styles.benefitTitle} style={{ margin: 0 }}>Soporte FIT Avanzado</h4>
            </div>
            <p className={styles.benefitDesc}>
              Sube de forma directa tus archivos de actividad .FIT. Importamos todos los datos (ritmos, FC, potencia y brazadas) sin configuraciones complejas.
            </p>
          </div>

          <div className={styles.benefitCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <ShieldCheck size={20} color="var(--primary)" />
              <h4 className={styles.benefitTitle} style={{ margin: 0 }}>Multiselección N:N</h4>
            </div>
            <p className={styles.benefitDesc}>
              Exclusiva relación Muchos a Muchos. Vincula múltiples equipamientos a una sola actividad (ej: bici + casco) para que acumulen kilómetros a la vez de forma real.
            </p>
          </div>

          <div className={styles.benefitCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Trophy size={20} color="var(--primary)" />
              <h4 className={styles.benefitTitle} style={{ margin: 0 }}>Calendario de Carreras</h4>
            </div>
            <p className={styles.benefitDesc}>
              Planifica tus objetivos de tiempo/posición de la temporada y asocia de forma automática las actividades de tu diario como la carrera real.
            </p>
          </div>
        </div>
      </section>

      {/* 4. DASHBOARD PREVIEW SECTION */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Dashboard Preview</h2>
        <p className={styles.sectionSubtitle}>
          Visualiza tus datos con una interfaz diseñada bajo los más exigentes estándares de usabilidad y estética oscura.
        </p>

        <div className={styles.previewWrapper}>
          <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>Estadísticas de Rendimiento (Demostración)</h4>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Métricas agregadas acumuladas de tu perfil.</p>
          </div>

          <div className={styles.mockDashboard}>
            <div className={styles.mockWidget}>
              <div className={styles.mockWidgetTitle}>Sesiones Totales</div>
              <div className={styles.mockWidgetVal}>48</div>
            </div>

            <div className={styles.mockWidget}>
              <div className={styles.mockWidgetTitle}>Horas Entrenadas</div>
              <div className={styles.mockWidgetVal} style={{ color: '#10b981' }}>65.4h</div>
            </div>

            <div className={styles.mockWidget}>
              <div className={styles.mockWidgetTitle}>Distancia Ciclismo</div>
              <div className={styles.mockWidgetVal} style={{ color: 'var(--accent-bike)' }}>842 km</div>
            </div>

            <div className={styles.mockWidget}>
              <div className={styles.mockWidgetTitle}>Meta Semanal (Objetivo)</div>
              <div className={styles.mockWidgetVal} style={{ fontSize: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>3 de 4 completados</span>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                  <div style={{ width: '75%', height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Cómo Funciona</h2>
        <p className={styles.sectionSubtitle}>
          En menos de 2 minutos estarás listo para empezar a registrar y alcanzar tus picos de forma.
        </p>

        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNum}>1</div>
            <h4 className={styles.stepTitle}>Crea tu Cuenta</h4>
            <p className={styles.stepDesc}>
              Regístrate e introduce tu perfil deportivo (nivel, modalidad favorita de triatlón y tus metas semanales de entrenamiento).
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNum}>2</div>
            <h4 className={styles.stepTitle}>Carga tus Actividades</h4>
            <p className={styles.stepDesc}>
              Registra tus entrenos de forma manual o sube tu archivo .FIT. Vincula de forma múltiple el equipamiento utilizado en esa sesión.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNum}>3</div>
            <h4 className={styles.stepTitle}>Analiza y Conquista</h4>
            <p className={styles.stepDesc}>
              Visualiza tus estadísticas de volumen por deporte y el desgaste de tus materiales. Prepárate para tus carreras agendadas y alcanza el podio.
            </p>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA SECTION */}
      <section className={styles.finalCta}>
        <h2 className={styles.finalCtaTitle}>¿Listo para llevar tu entrenamiento al siguiente nivel?</h2>
        <p className={styles.finalCtaDesc}>
          Únete a los triatletas que ya optimizan su material y planifican sus victorias. Registra tu cuenta en segundos.
        </p>
        <Link to="/register" className={`button ${styles.ctaBtn}`}>
          Registrarme Ahora 🚀
        </Link>
      </section>

    </div>
  );
};
export default Home;
