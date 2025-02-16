import pytest
from rest_framework.serializers import ValidationError
from django.test import TestCase
from django.contrib.auth import get_user_model
from api.models import Department, Course, Unit, Question, QuestionMedia, Faculty
from api.serializers import (
    UserSerializer, 
    DepartmentSerializer, 
    CourseSerializer, 
    UnitSerializer, 
    QuestionSerializer, 
    QuestionMediaSerializer, 
    FacultySerializer
)

User = get_user_model()

@pytest.mark.django_db
def test_user_serializer_create():
    data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "securepassword",
        "role": "faculty"
    }
    serializer = UserSerializer(data=data)
    assert serializer.is_valid()
    user = serializer.save()
    assert user.username == "testuser"
    assert user.email == "testuser@example.com"
    assert user.check_password("securepassword")

@pytest.mark.django_db
def test_department_serializer():
    department = Department.objects.create(name="Computer Science")
    serializer = DepartmentSerializer(department)
    assert serializer.data["name"] == "Computer Science"

@pytest.mark.django_db
def test_course_serializer():
    department = Department.objects.create(name="Mathematics")
    course = Course.objects.create(name="Algebra", department=department)
    serializer = CourseSerializer(course)
    assert serializer.data["name"] == "Algebra"
    assert serializer.data["department"] == department.id

@pytest.mark.django_db
def test_unit_serializer():
    department = Department.objects.create(name="Physics")
    course = Course.objects.create(name="Quantum Mechanics", department=department)
    unit = Unit.objects.create(name="Wave Function", course=course)
    serializer = UnitSerializer(unit)
    assert serializer.data["name"] == "Wave Function"
    assert serializer.data["course"] == course.id

@pytest.mark.django_db
def test_question_serializer_validate_unit():
    department = Department.objects.create(name="Biology")
    course = Course.objects.create(name="Genetics", department=department)
    unit = Unit.objects.create(name="DNA", course=course)
    question_data = {"unit": unit.id, "text": "What is DNA?"}
    serializer = QuestionSerializer(data=question_data)
    assert serializer.is_valid()
    question = serializer.save()
    assert question.text == "What is DNA?"

@pytest.mark.django_db
def test_question_media_serializer():
    department = Department.objects.create(name="History")
    course = Course.objects.create(name="Ancient Civilizations", department=department)
    unit = Unit.objects.create(name="Mesopotamia", course=course)
    question = Question.objects.create(unit=unit, text="Describe Mesopotamian culture.")
    media = QuestionMedia.objects.create(question=question, media_type="image", media_path="path/to/image.jpg")
    serializer = QuestionMediaSerializer(media)
    assert serializer.data["media_type"] == "image"
    assert serializer.data["media_path"] == "path/to/image.jpg"

@pytest.mark.django_db
def test_faculty_serializer():
    department = Department.objects.create(name="Engineering")
    faculty = Faculty.objects.create(name="John Doe", department=department)
    serializer = FacultySerializer(faculty)
    assert serializer.data["name"] == "John Doe"
    assert serializer.data["department"] == department.id

@pytest.mark.django_db
def test_invalid_course_serializer():
    data = {
        "course_id": "IS202",
        "course_name": "",
        "coordinating_department_id": None
    }
    serializer = CourseSerializer(data=data)
    assert not serializer.is_valid()
    assert "course_name" in serializer.errors
    assert "coordinating_department_id" in serializer.errors

@pytest.mark.django_db
def test_question_serializer_validate_unit_negative():
    data = {"unit": 999, "text": "What is DNA?"}  # Invalid unit ID
    serializer = QuestionSerializer(data=data)
    assert not serializer.is_valid()
    assert "unit" in serializer.errors
