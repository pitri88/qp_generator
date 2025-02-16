from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from api.models import CustomUser, Department, Course, Unit, Question

class TestViews(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create user and department for testing
        self.user = CustomUser.objects.create_user(
            username="faculty1",
            password="testpassword",
            role="faculty"
        )
        self.department = Department.objects.create(dept_name="Information Science")
        self.department.save()  # Save to ensure it has an ID

        self.course = Course.objects.create(
            course_id="IS101",
            course_name="Introduction to Programming",
            coordinating_department_id=self.department,
        )
        self.unit = Unit.objects.create(
            unit_id=1, unit_name="Basics of Python", course_id=self.course
        )

        # Login and get token
        self.client.login(username="faculty1", password="testpassword")

    def test_register_user(self):
        url = reverse("register")
        data = {
            "username": "faculty2",
            "password": "password123",
            "email": "faculty2@example.com",
            "role": "faculty",
            "faculty_details": {
                "f_id": "F001",
                "name": "John Doe",
                "department": self.department.dept_id,  # Updated key
            }
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, 201)

    def test_login(self):
        url = reverse("login")
        data = {"username": "faculty1", "password": "testpassword"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, 200)

    def test_logout(self):
        url = reverse("logout")
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)

    def test_add_department(self):
        url = reverse("add_department")
        data = {"dept_name": "Electronics"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, 201)

    def test_add_course(self):
        url = reverse("add_course")
        data = {
            "course_id": "IS102",
            "course_name": "Data Structures",
            "coordinating_department_id": self.department,
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, 201)

    def test_question_list(self):
        Question.objects.create(
            unit_id=self.unit,
            course_id=self.course,
            text="What is a stack?",
            marks=5,
        )
        url = reverse("question_list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_session_management(self):
        session = self.client.session
        session.set_expiry(2)  # 2 seconds
        session.save()

        # Wait for session expiry
        import time
        time.sleep(3)

        # Attempt to access a protected route
        url = reverse("profile")
        response = self.client.get(url)
        self.assertNotEqual(response.status_code, 200)  # Should not allow access
