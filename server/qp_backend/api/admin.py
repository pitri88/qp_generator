# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['course_id', 'course_name', 'department_id']
    list_filter = ['department_id']
    search_fields = ['course_id', 'course_name']
    ordering = ['course_id']

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['dept_id', 'dept_name']
    search_fields = ['dept_name']
    ordering = ['dept_id']

@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ['f_id', 'name', 'email', 'department_id']
    list_filter = ['department_id']
    search_fields = ['name', 'email']
    ordering = ['f_id']

@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ['unit_id', 'unit_name', 'course_id']
    list_filter = ['course_id']
    search_fields = ['unit_name']
    ordering = ['unit_id']

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['q_id', 'text', 'course_id', 'unit_id', 'co', 'bt', 'marks']
    list_filter = ['course_id', 'unit_id', 'co', 'bt', 'marks']
    search_fields = ['text']
    ordering = ['q_id']

@admin.register(FacultyCourse)
class FacultyCourseAdmin(admin.ModelAdmin):
    list_display = ['faculty_id', 'course_id']
    list_filter = ['faculty_id', 'course_id']
    ordering = ['faculty_id']

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'role', 'is_active']
    list_filter = ['role', 'is_active']
    search_fields = ['username', 'email']
    ordering = ['username']

class QuestionMediaAdmin(admin.ModelAdmin):
    list_display = ('qm_id', 'question_id')
    list_filter = ('question_id',)
