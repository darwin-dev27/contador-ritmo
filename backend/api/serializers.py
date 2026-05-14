from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Activity, Lap, HeartRateZone, Gear,
    Race, TrainingPlan, ProviderConnection
)


# =============================================================================
# USER
# =============================================================================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Las contraseñas no coinciden."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


# =============================================================================
# GEAR
# =============================================================================
class GearSerializer(serializers.ModelSerializer):
    usage_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Gear
        fields = [
            'id', 'name', 'gear_type', 'brand', 'model_name',
            'distance_logged', 'max_distance', 'active',
            'purchased_at', 'notes', 'usage_percentage', 'created_at'
        ]
        read_only_fields = ['id', 'distance_logged', 'created_at']


# =============================================================================
# TRAINING PLAN
# =============================================================================
class TrainingPlanSerializer(serializers.ModelSerializer):
    activity_count = serializers.SerializerMethodField()

    class Meta:
        model = TrainingPlan
        fields = [
            'id', 'name', 'description', 'start_date', 'end_date',
            'goal', 'activity_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_activity_count(self, obj):
        return obj.activities.count()


# =============================================================================
# HEART RATE ZONE
# =============================================================================
class HeartRateZoneSerializer(serializers.ModelSerializer):
    time_in_zone_seconds = serializers.SerializerMethodField()

    class Meta:
        model = HeartRateZone
        fields = [
            'id', 'zone_number', 'zone_name', 'min_hr', 'max_hr',
            'time_in_zone', 'time_in_zone_seconds'
        ]
        read_only_fields = ['id']

    def get_time_in_zone_seconds(self, obj):
        if obj.time_in_zone:
            return int(obj.time_in_zone.total_seconds())
        return 0


# =============================================================================
# LAP
# =============================================================================
class LapSerializer(serializers.ModelSerializer):
    elapsed_time_seconds = serializers.SerializerMethodField()

    class Meta:
        model = Lap
        fields = [
            'id', 'lap_index', 'sport_type', 'start_time',
            'elapsed_time', 'elapsed_time_seconds', 'distance',
            'avg_heart_rate', 'max_heart_rate',
            'avg_speed', 'max_speed', 'avg_cadence', 'avg_power',
            'total_ascent', 'total_descent', 'calories',
            'lap_trigger', 'sport_specific_data'
        ]
        read_only_fields = ['id']

    def get_elapsed_time_seconds(self, obj):
        if obj.elapsed_time:
            return int(obj.elapsed_time.total_seconds())
        return 0


# =============================================================================
# ACTIVITY
# =============================================================================
class ActivityListSerializer(serializers.ModelSerializer):
    """Serializer ligero para listados de actividades."""
    pace_per_km = serializers.ReadOnlyField()
    gear_name = serializers.CharField(source='gear.name', read_only=True, default=None)
    elapsed_time_seconds = serializers.SerializerMethodField()
    moving_time_seconds = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            'id', 'external_id', 'source', 'sport_type', 'sub_sport',
            'name', 'start_time', 'elapsed_time', 'elapsed_time_seconds',
            'moving_time', 'moving_time_seconds', 'distance',
            'avg_heart_rate', 'max_heart_rate', 'avg_speed',
            'calories', 'feeling', 'pace_per_km', 'gear_name',
            'completed', 'created_at'
        ]

    def get_elapsed_time_seconds(self, obj):
        if obj.elapsed_time:
            return int(obj.elapsed_time.total_seconds())
        return None

    def get_moving_time_seconds(self, obj):
        if obj.moving_time:
            return int(obj.moving_time.total_seconds())
        return None


class ActivityDetailSerializer(serializers.ModelSerializer):
    """Serializer completo con laps y zonas HR anidadas."""
    laps = LapSerializer(many=True, read_only=True)
    hr_zones = HeartRateZoneSerializer(many=True, read_only=True)
    pace_per_km = serializers.ReadOnlyField()
    gear_name = serializers.CharField(source='gear.name', read_only=True, default=None)
    plan_name = serializers.CharField(source='plan.name', read_only=True, default=None)
    elapsed_time_seconds = serializers.SerializerMethodField()
    moving_time_seconds = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            'id', 'external_id', 'source', 'sport_type', 'sub_sport',
            'name', 'description', 'start_time', 'end_time',
            'elapsed_time', 'elapsed_time_seconds',
            'moving_time', 'moving_time_seconds',
            'distance', 'total_ascent', 'total_descent',
            'avg_heart_rate', 'max_heart_rate', 'min_heart_rate',
            'avg_speed', 'max_speed', 'calories',
            'feeling', 'training_effect_aerobic', 'training_effect_anaerobic',
            'sport_specific_data', 'raw_fit_file',
            'plan', 'plan_name', 'gear', 'gear_name',
            'completed', 'pace_per_km',
            'laps', 'hr_zones',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_elapsed_time_seconds(self, obj):
        if obj.elapsed_time:
            return int(obj.elapsed_time.total_seconds())
        return None

    def get_moving_time_seconds(self, obj):
        if obj.moving_time:
            return int(obj.moving_time.total_seconds())
        return None


class ActivityCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear/actualizar actividades con laps y zonas HR."""
    laps = LapSerializer(many=True, required=False)
    hr_zones = HeartRateZoneSerializer(many=True, required=False)

    class Meta:
        model = Activity
        fields = [
            'id', 'external_id', 'source', 'sport_type', 'sub_sport',
            'name', 'description', 'start_time', 'end_time',
            'elapsed_time', 'moving_time',
            'distance', 'total_ascent', 'total_descent',
            'avg_heart_rate', 'max_heart_rate', 'min_heart_rate',
            'avg_speed', 'max_speed', 'calories',
            'feeling', 'training_effect_aerobic', 'training_effect_anaerobic',
            'sport_specific_data', 'raw_fit_file',
            'plan', 'gear', 'completed',
            'laps', 'hr_zones'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        laps_data = validated_data.pop('laps', [])
        hr_zones_data = validated_data.pop('hr_zones', [])

        activity = Activity.objects.create(**validated_data)

        for lap_data in laps_data:
            Lap.objects.create(activity=activity, **lap_data)

        for zone_data in hr_zones_data:
            HeartRateZone.objects.create(activity=activity, **zone_data)

        # Actualizar distancia del gear si se proporcionó
        if activity.gear and activity.distance:
            activity.gear.distance_logged += activity.distance
            activity.gear.save()

        return activity

    def update(self, instance, validated_data):
        laps_data = validated_data.pop('laps', None)
        hr_zones_data = validated_data.pop('hr_zones', None)

        # Guardar distancia anterior para actualizar gear
        old_distance = instance.distance or 0
        old_gear = instance.gear

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if laps_data is not None:
            instance.laps.all().delete()
            for lap_data in laps_data:
                Lap.objects.create(activity=instance, **lap_data)

        if hr_zones_data is not None:
            instance.hr_zones.all().delete()
            for zone_data in hr_zones_data:
                HeartRateZone.objects.create(activity=instance, **zone_data)

        # Actualizar gear distance
        new_distance = instance.distance or 0
        if old_gear and old_gear != instance.gear:
            old_gear.distance_logged -= old_distance
            old_gear.save()
        if instance.gear:
            if old_gear == instance.gear:
                instance.gear.distance_logged += (new_distance - old_distance)
            else:
                instance.gear.distance_logged += new_distance
            instance.gear.save()

        return instance


# =============================================================================
# RACE
# =============================================================================
class RaceSerializer(serializers.ModelSerializer):
    activity_name = serializers.CharField(source='activity.name', read_only=True, default=None)

    class Meta:
        model = Race
        fields = [
            'id', 'name', 'sport_type', 'date', 'season', 'location',
            'target_time', 'target_position',
            'result_time', 'result_position', 'result_position_age_group',
            'distance', 'activity', 'activity_name',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# =============================================================================
# PROVIDER CONNECTION
# =============================================================================
class ProviderConnectionSerializer(serializers.ModelSerializer):
    is_token_expired = serializers.ReadOnlyField()

    class Meta:
        model = ProviderConnection
        fields = [
            'id', 'provider', 'is_active', 'last_sync',
            'sync_errors', 'provider_user_id', 'provider_metadata',
            'is_token_expired', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'last_sync', 'sync_errors', 'provider_user_id',
            'provider_metadata', 'created_at', 'updated_at'
        ]
        # Nunca exponer tokens en la API
        extra_kwargs = {
            'access_token': {'write_only': True},
            'refresh_token': {'write_only': True},
        }


class ProviderConnectionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderConnection
        fields = [
            'provider', 'access_token', 'refresh_token',
            'token_expires_at', 'token_scope', 'provider_user_id'
        ]
