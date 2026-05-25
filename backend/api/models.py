from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


# =============================================================================
# GEAR — Equipamiento deportivo
# =============================================================================
class Gear(models.Model):
    GEAR_TYPE_CHOICES = [
        ('shoes', 'Zapatillas'),
        ('bike', 'Bicicleta'),
        ('wetsuit', 'Neopreno'),
        ('goggles', 'Gafas de natación'),
        ('helmet', 'Casco'),
        ('other', 'Otro'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gear')
    name = models.CharField(max_length=200)
    gear_type = models.CharField(max_length=20, choices=GEAR_TYPE_CHOICES)
    brand = models.CharField(max_length=100, blank=True)
    model_name = models.CharField(max_length=100, blank=True)
    distance_logged = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        help_text="Distancia acumulada en metros"
    )
    max_distance = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Vida útil estimada en metros"
    )
    active = models.BooleanField(default=True)
    purchased_at = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-active', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_gear_type_display()})"

    @property
    def usage_percentage(self):
        if self.max_distance and self.max_distance > 0:
            return round(float(self.distance_logged) / float(self.max_distance) * 100, 1)
        return None


# =============================================================================
# TRAINING PLAN — Planes de entrenamiento
# =============================================================================
class TrainingPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='plans')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    goal = models.CharField(max_length=200, blank=True, help_text="Ej: Ironman Barcelona 2026")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.name} ({self.user.username})"


# =============================================================================
# ACTIVITY — Modelo principal de actividades (reemplaza Workout)
# =============================================================================
class Activity(models.Model):
    SPORT_CHOICES = [
        ('swim', 'Natación'),
        ('bike', 'Ciclismo'),
        ('run', 'Carrera'),
        ('transition', 'Transición'),
        ('multisport', 'Multideporte'),
        ('strength', 'Fuerza'),
        ('other', 'Otro'),
    ]

    SUB_SPORT_CHOICES = [
        # Swim
        ('pool', 'Piscina'),
        ('open_water', 'Aguas abiertas'),
        # Bike
        ('road', 'Carretera'),
        ('mtb', 'Mountain Bike'),
        ('gravel', 'Gravel'),
        ('indoor_bike', 'Rodillo / Indoor'),
        # Run
        ('road_run', 'Carrera en carretera'),
        ('trail', 'Trail'),
        ('track', 'Pista'),
        ('treadmill', 'Cinta de correr'),
        # Other
        ('triathlon', 'Triatlón'),
        ('duathlon', 'Duatlón'),
        ('other', 'Otro'),
    ]

    SOURCE_CHOICES = [
        ('manual', 'Manual'),
        ('suunto', 'Suunto'),
        ('garmin', 'Garmin'),
        ('fit_import', 'Importación FIT'),
    ]

    # --- Identificación ---
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    external_id = models.CharField(
        max_length=255, blank=True, null=True, unique=True,
        help_text="ID externo de Suunto/Garmin para evitar duplicados"
    )
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='manual')

    # --- Clasificación ---
    sport_type = models.CharField(max_length=20, choices=SPORT_CHOICES)
    sub_sport = models.CharField(max_length=20, choices=SUB_SPORT_CHOICES, blank=True)
    name = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)

    # --- Tiempo ---
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    elapsed_time = models.DurationField(
        null=True, blank=True,
        help_text="Tiempo total incluyendo pausas"
    )
    moving_time = models.DurationField(
        null=True, blank=True,
        help_text="Tiempo solo en movimiento"
    )

    # --- Distancia y altitud ---
    distance = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Distancia en metros"
    )
    total_ascent = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True,
        help_text="Desnivel positivo en metros"
    )
    total_descent = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True,
        help_text="Desnivel negativo en metros"
    )

    # --- Frecuencia cardíaca ---
    avg_heart_rate = models.IntegerField(null=True, blank=True, help_text="FC media (bpm)")
    max_heart_rate = models.IntegerField(null=True, blank=True, help_text="FC máxima (bpm)")
    min_heart_rate = models.IntegerField(null=True, blank=True, help_text="FC mínima (bpm)")

    # --- Velocidad ---
    avg_speed = models.DecimalField(
        max_digits=8, decimal_places=4, null=True, blank=True,
        help_text="Velocidad media en m/s"
    )
    max_speed = models.DecimalField(
        max_digits=8, decimal_places=4, null=True, blank=True,
        help_text="Velocidad máxima en m/s"
    )

    # --- Energía ---
    calories = models.IntegerField(null=True, blank=True)

    # --- Percepción subjetiva ---
    feeling = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="RPE subjetivo de 1 a 10"
    )

    # --- Training Effect (Suunto/Garmin) ---
    training_effect_aerobic = models.DecimalField(
        max_digits=3, decimal_places=1, null=True, blank=True,
        help_text="Training Effect aeróbico (0.0 - 5.0)"
    )
    training_effect_anaerobic = models.DecimalField(
        max_digits=3, decimal_places=1, null=True, blank=True,
        help_text="Training Effect anaeróbico (0.0 - 5.0)"
    )

    # --- Datos específicos por deporte (JSONField extensible) ---
    sport_specific_data = models.JSONField(
        default=dict, blank=True,
        help_text="Datos específicos: swim(strokes, swolf), bike(power, NP), run(cadence, GCT)"
    )

    # --- Archivo FIT original ---
    raw_fit_file = models.FileField(
        upload_to='fit_files/%Y/%m/', null=True, blank=True,
        help_text="Archivo FIT original importado"
    )

    # --- Relaciones ---
    plan = models.ForeignKey(
        TrainingPlan, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='activities'
    )
    gear = models.ManyToManyField(
        Gear, blank=True, related_name='activities'
    )

    # --- Metadatos ---
    completed = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_time']
        verbose_name_plural = 'activities'
        indexes = [
            models.Index(fields=['user', 'sport_type']),
            models.Index(fields=['user', 'start_time']),
            models.Index(fields=['external_id']),
            models.Index(fields=['source']),
        ]

    def __str__(self):
        name = self.name or self.get_sport_type_display()
        return f"{name} — {self.start_time.strftime('%Y-%m-%d')}"

    @property
    def pace_per_km(self):
        """Calcula ritmo en min/km para run y swim pace/100m."""
        if not self.distance or not self.moving_time or self.distance == 0:
            return None
        seconds = self.moving_time.total_seconds()
        if self.sport_type == 'swim':
            pace_seconds = seconds / (float(self.distance) / 100)
        else:
            pace_seconds = seconds / (float(self.distance) / 1000)
        mins = int(pace_seconds // 60)
        secs = int(pace_seconds % 60)
        return f"{mins:02d}:{secs:02d}"


# =============================================================================
# LAP — Vueltas / Intervalos
# =============================================================================
class Lap(models.Model):
    LAP_TRIGGER_CHOICES = [
        ('manual', 'Manual'),
        ('distance', 'Distancia'),
        ('time', 'Tiempo'),
        ('position_start', 'Posición inicio'),
        ('session_end', 'Fin de sesión'),
        ('auto', 'Automático'),
    ]

    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='laps')
    lap_index = models.IntegerField(help_text="Orden de la vuelta (empieza en 0)")
    sport_type = models.CharField(
        max_length=20, choices=Activity.SPORT_CHOICES, blank=True,
        help_text="Deporte de esta vuelta (importante en multisport)"
    )

    # --- Tiempo ---
    start_time = models.DateTimeField(null=True, blank=True)
    elapsed_time = models.DurationField(null=True, blank=True)

    # --- Distancia ---
    distance = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Distancia en metros"
    )

    # --- Métricas ---
    avg_heart_rate = models.IntegerField(null=True, blank=True)
    max_heart_rate = models.IntegerField(null=True, blank=True)
    avg_speed = models.DecimalField(max_digits=8, decimal_places=4, null=True, blank=True)
    max_speed = models.DecimalField(max_digits=8, decimal_places=4, null=True, blank=True)
    avg_cadence = models.IntegerField(null=True, blank=True)
    avg_power = models.IntegerField(null=True, blank=True)
    total_ascent = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    total_descent = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    calories = models.IntegerField(null=True, blank=True)
    lap_trigger = models.CharField(max_length=20, choices=LAP_TRIGGER_CHOICES, blank=True)

    # --- Datos específicos del lap ---
    sport_specific_data = models.JSONField(
        default=dict, blank=True,
        help_text="Datos específicos del lap: swim(stroke_count, swolf), bike(NP), etc."
    )

    class Meta:
        ordering = ['activity', 'lap_index']
        unique_together = ['activity', 'lap_index']

    def __str__(self):
        return f"Lap {self.lap_index} — {self.activity}"


# =============================================================================
# HEART RATE ZONE — Zonas de frecuencia cardíaca por actividad
# =============================================================================
class HeartRateZone(models.Model):
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='hr_zones')
    zone_number = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(6)],
        help_text="Número de zona (1-5 o 1-6)"
    )
    zone_name = models.CharField(max_length=50, blank=True, help_text="Ej: Z1 Recovery, Z2 Endurance")
    min_hr = models.IntegerField(help_text="FC mínima de la zona (bpm)")
    max_hr = models.IntegerField(help_text="FC máxima de la zona (bpm)")
    time_in_zone = models.DurationField(help_text="Tiempo en esta zona")

    class Meta:
        ordering = ['activity', 'zone_number']
        unique_together = ['activity', 'zone_number']

    def __str__(self):
        return f"Z{self.zone_number} ({self.min_hr}-{self.max_hr} bpm) — {self.activity}"


# =============================================================================
# RACE — Competiciones (ampliado)
# =============================================================================
class Race(models.Model):
    RACE_SPORT_CHOICES = [
        ('swim', 'Natación'),
        ('bike', 'Ciclismo'),
        ('run', 'Carrera'),
        ('triathlon_sprint', 'Triatlón Sprint'),
        ('triathlon_olympic', 'Triatlón Olímpico'),
        ('triathlon_half', 'Medio Ironman (70.3)'),
        ('triathlon_full', 'Ironman'),
        ('duathlon', 'Duatlón'),
        ('other', 'Otro'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='races')
    name = models.CharField(max_length=200)
    sport_type = models.CharField(max_length=20, choices=RACE_SPORT_CHOICES, default='triathlon_olympic')
    date = models.DateField()
    season = models.IntegerField()
    location = models.CharField(max_length=200, blank=True)

    # --- Objetivos ---
    target_time = models.DurationField(null=True, blank=True)
    target_position = models.IntegerField(null=True, blank=True)

    # --- Resultados ---
    result_time = models.DurationField(null=True, blank=True)
    result_position = models.IntegerField(null=True, blank=True)
    result_position_age_group = models.IntegerField(null=True, blank=True)

    # --- Distancia ---
    distance = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Distancia total en metros"
    )

    # --- Vinculación con actividad real ---
    activity = models.OneToOneField(
        Activity, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='race'
    )

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.name} — {self.season}"


# =============================================================================
# PROVIDER CONNECTION — Conexiones OAuth con Suunto / Garmin
# =============================================================================
class ProviderConnection(models.Model):
    PROVIDER_CHOICES = [
        ('suunto', 'Suunto'),
        ('garmin', 'Garmin'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='provider_connections')
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)

    # --- OAuth tokens ---
    access_token = models.TextField(help_text="Token de acceso OAuth (encriptar en producción)")
    refresh_token = models.TextField(blank=True, help_text="Refresh token OAuth")
    token_expires_at = models.DateTimeField(null=True, blank=True)
    token_scope = models.CharField(max_length=500, blank=True)

    # --- Estado ---
    is_active = models.BooleanField(default=True)
    last_sync = models.DateTimeField(null=True, blank=True)
    sync_errors = models.IntegerField(default=0, help_text="Contador de errores consecutivos de sync")

    # --- Metadatos del proveedor ---
    provider_user_id = models.CharField(
        max_length=255, blank=True,
        help_text="ID del usuario en el proveedor (Suunto/Garmin)"
    )
    provider_metadata = models.JSONField(
        default=dict, blank=True,
        help_text="Datos adicionales del proveedor (nombre, email, etc.)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'provider']
        ordering = ['provider']

    def __str__(self):
        status = "✓" if self.is_active else "✗"
        return f"{status} {self.get_provider_display()} — {self.user.username}"

    @property
    def is_token_expired(self):
        if not self.token_expires_at:
            return True
        from django.utils import timezone
        return timezone.now() >= self.token_expires_at
