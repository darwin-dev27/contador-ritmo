from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from django.utils import timezone
from .models import Activity

class AuthAndActivityTests(APITestCase):
    def setUp(self):
        # Configuración inicial para los tests
        self.register_url = reverse('register')
        self.login_url = reverse('token_obtain_pair')
        self.activity_list_url = reverse('activity-list')
        
        self.user_data = {
            'username': 'runner123',
            'email': 'runner@example.com',
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!',
        }

    def test_user_registration_and_login(self):
        """
        Verifica que un nuevo usuario puede registrarse y luego iniciar sesión para obtener un JWT token.
        """
        # 1. Registrar usuario
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['username'], self.user_data['username'])
        
        # 2. Iniciar sesión (obtener token JWT)
        login_data = {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_authenticated_activity_creation(self):
        """
        Verifica que un usuario autenticado puede crear y listar una actividad.
        """
        # Registrar y crear usuario
        user = User.objects.create_user(
            username=self.user_data['username'],
            email=self.user_data['email'],
            password=self.user_data['password']
        )
        
        # Iniciar sesión para obtener token
        login_data = {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }
        response = self.client.post(self.login_url, login_data, format='json')
        token = response.data['access']
        
        # Añadir cabecera de autenticación
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Crear actividad
        activity_data = {
            'sport_type': 'run',
            'sub_sport': 'road_run',
            'name': 'Mañana de Running 10K',
            'start_time': timezone.now().isoformat(),
            'distance': 10000.0,
            'feeling': 7,
            'source': 'manual'
        }
        
        response = self.client.post(self.activity_list_url, activity_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Mañana de Running 10K')
        
        # Listar actividades y verificar que existe
        response = self.client.get(self.activity_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Si hay paginación, los resultados están en response.data['results'] o directamente en response.data
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
            self.assertEqual(response.data['results'][0]['name'], 'Mañana de Running 10K')
        else:
            self.assertEqual(len(response.data), 1)
            self.assertEqual(response.data[0]['name'], 'Mañana de Running 10K')

    def test_unauthenticated_activity_creation_fails(self):
        """
        Verifica que un usuario no autenticado no puede crear una actividad.
        """
        activity_data = {
            'sport_type': 'run',
            'name': 'Entreno No Autorizado',
            'start_time': timezone.now().isoformat(),
        }
        response = self.client.post(self.activity_list_url, activity_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
