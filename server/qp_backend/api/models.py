from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.postgres.fields import ArrayField

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('faculty', 'Faculty'),
    ]
    
    # Make these fields nullable instead of removing them
    first_name = models.CharField(max_length=150, null=True, blank=True)
    last_name = models.CharField(max_length=150, null=True, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='faculty')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.username

class Department(models.Model):
    dept_id = models.AutoField(primary_key=True)
    dept_name = models.CharField(max_length=255)

    def get_course_count(self):
        return self.courses.count()

    def get_faculty_count(self):
        return self.faculty_members.count()

    def delete(self, *args, **kwargs):
        # Set department_id to NULL for all associated courses
        self.courses.all().update(department_id=None)
        # Set department_id to NULL for all associated faculty
        self.faculty_members.all().update(department_id=None)
        super().delete(*args, **kwargs)

    def __str__(self):
        return self.dept_name

    class Meta:
        indexes = [
            models.Index(fields=['dept_name'], name='department_name_idx'),
        ]

class Course(models.Model):
    course_id = models.CharField(max_length=50, primary_key=True)
    course_name = models.CharField(max_length=255)
    department_id = models.ForeignKey(
        Department, 
        on_delete=models.SET_NULL,
        related_name='courses',
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.course_id} - {self.course_name}"

    def get_department_name(self):
        return self.department_id.dept_name if self.department_id else "Not Assigned"

    def clean(self):
        if not self.course_id:
            raise ValidationError('Course ID is required')
        if not self.course_name:
            raise ValidationError('Course name is required')

    def get_question_count(self):
        return self.questions.count()

    def get_unit_count(self):
        return self.units.count()

    def get_faculty_count(self):
        return self.facultycourse_set.count()

    class Meta:
        indexes = [
            models.Index(fields=['course_name'], name='course_name_idx'),
        ]

class Unit(models.Model):
    unit_id = models.IntegerField()
    unit_name = models.CharField(max_length=255)
    course_id = models.ForeignKey(
        'Course', on_delete=models.CASCADE, related_name='units'
    )

    class Meta:
        unique_together = ('unit_id', 'course_id')
        indexes = [
            models.Index(fields=['unit_name'], name='unit_name_idx'),
        ]

class Question(models.Model):
    q_id = models.AutoField(primary_key=True)
    unit_id = models.ForeignKey(
        'Unit', on_delete=models.CASCADE, related_name='questions'
    )
    course_id = models.ForeignKey(
        'Course', on_delete=models.CASCADE, related_name='questions'
    )
    text = models.TextField()
    co = models.CharField(max_length=50, default="N/A")
    bt = models.CharField(max_length=50, default="N/A")
    marks = models.IntegerField(default=0)
    type = models.CharField(
        max_length=50,
        choices=[('Quiz', 'Quiz'), ('Test', 'Test'), ('MCQ', 'MCQ')],
        default='Test',
    )
    difficulty_level = models.CharField(
        max_length=50,
        choices=[('Easy', 'Easy'), ('Medium', 'Medium'), ('Hard', 'Hard')],
        default='Easy',
    )
    tags = models.JSONField(default=dict)
    image = models.ImageField(upload_to='question_images/', null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['course_id', 'unit_id'], name='api_questio_course_unit_idx'),
            models.Index(fields=['co', 'bt'], name='api_questio_co_bt_idx'),
            models.Index(fields=['difficulty_level'], name='question_difficulty_idx'),
            models.Index(fields=['tags'], name='tags_idx'),
        ]

class QuestionMedia(models.Model):
    qm_id = models.AutoField(primary_key=True)
    question_id = models.ForeignKey(
        'Question', 
        on_delete=models.CASCADE, 
        related_name='media'
    )
    image_paths = models.JSONField(default=list, blank=True, null=True)
    equations = models.JSONField(default=list, blank=True, null=True)

    def __str__(self):
        return f"Media for Question {self.question_id.q_id}"

    def save(self, *args, **kwargs):
        # Ensure equations and image_paths are lists
        if self.equations is None:
            self.equations = []
        if self.image_paths is None:
            self.image_paths = []
        super().save(*args, **kwargs)

class Faculty(models.Model):
    f_id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='faculty_profile',
        null=True
    )
    department_id = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='faculty_members'
    )

    def delete(self, *args, **kwargs):
        # Delete associated user first
        if self.user:
            self.user.delete()
        # Delete associated faculty-course mappings
        FacultyCourse.objects.filter(faculty_id=self).delete()
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.f_id} - {self.name}"

    def get_department_name(self):
        return self.department_id.dept_name if self.department_id else "Not Assigned"

    def get_course_count(self):
        return self.facultycourse_set.count()

    def get_paper_count(self):
        return self.papermetadata_set.count()

    class Meta:
        verbose_name_plural = "Faculty"
        indexes = [
            models.Index(fields=['name'], name='faculty_name_idx'),
            models.Index(fields=['email'], name='faculty_email_idx'),
        ]

class FacultyCourse(models.Model):
    faculty_id = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    course_id = models.ForeignKey(Course, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('faculty_id', 'course_id')

class PaperMetadata(models.Model):
    course_code = models.CharField(max_length=50)
    course_title = models.CharField(max_length=255)
    date = models.DateField()
    max_marks = models.IntegerField()
    duration = models.CharField(max_length=50)
    semester = models.CharField(max_length=20)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    is_improvement_cie = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

class QuestionSelection(models.Model):
    PART_CHOICES = [
        ('A', 'Part A'),
        ('B', 'Part B'),
        ('none', 'No Part')
    ]
    
    paper = models.ForeignKey(PaperMetadata, on_delete=models.CASCADE, related_name='selections')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    part = models.CharField(max_length=4, choices=PART_CHOICES)
    order = models.IntegerField()

    class Meta:
        ordering = ['part', 'order']
