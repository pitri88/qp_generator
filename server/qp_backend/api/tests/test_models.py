from django.test import TestCase
from api.models import Department, Course, Unit, Question, QuestionMedia, Faculty, CustomUser

class TestModels(TestCase):
    def setUp(self):
        self.department = Department.objects.create(dept_name="Information Science")
        self.course = Course.objects.create(
            course_id="IS101",
            course_name="Introduction to Programming",
            coordinating_department_id=self.department,
        )
        self.unit = Unit.objects.create(
            unit_id=1, unit_name="Basics of Python", course_id=self.course
        )
        self.question = Question.objects.create(
            unit_id=self.unit,
            course_id=self.course,
            text="What is Python?",
            co="CO1",
            bt="BT2",
            marks=5,
            type="Quiz",
            difficulty_level="Easy",
            tags={"tag1": "Python"},
        )
        self.media = QuestionMedia.objects.create(
            question_id=self.question, type="Image", url="http://example.com/image.png"
        )

    def test_department_creation(self):
        self.assertEqual(self.department.dept_name, "Information Science")

    def test_course_creation(self):
        self.assertEqual(self.course.course_name, "Introduction to Programming")
        self.assertEqual(self.course.coordinating_department_id, self.department)

    def test_unit_creation(self):
        self.assertEqual(self.unit.unit_name, "Basics of Python")
        self.assertEqual(self.unit.course_id, self.course)

    def test_question_creation(self):
        question = Question.objects.create(
            unit_id=self.unit,
            course_id=self.course,
            text="Define recursion.",
            co="CO2",
            bt="BT3",
            marks=10,
            type="Theory",
            difficulty_level="Medium",
            tags={"tag2": "Recursion"},
        )
        self.assertEqual(question.tags, {"tag2": "Recursion"})

    def test_cascade_delete(self):
        self.unit.delete()
        self.unit.save()
        self.assertFalse(Question.objects.filter(unit_id=self.unit).exists())

    def test_media_creation(self):
        self.assertEqual(self.media.type, "Image")
        self.assertEqual(self.media.url, "http://example.com/image.png")
