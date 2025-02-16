from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Department, Course, Unit, QuestionMedia, Question, Faculty, FacultyCourse

User = get_user_model()

# User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role')
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            role=validated_data.get('role', 'faculty'),
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

# Department Serializer
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['dept_id', 'dept_name']

# Course Serializer
class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

# Unit Serializer
class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = '__all__'

# Question Serializer
class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

    def validate_unit(self, value):
        if not Unit.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("The specified unit does not exist.")
        return value

# Question Media Serializer
class QuestionMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionMedia
        fields = '__all__'

# Faculty Serializer
class FacultySerializer(serializers.ModelSerializer):
    department_id = DepartmentSerializer(read_only=True)
    
    class Meta:
        model = Faculty
        fields = ['f_id', 'name', 'email', 'department_id']

class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role')
        read_only_fields = ('username', 'role')  # These fields should not be editable

class FacultyCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacultyCourse
        fields = ('faculty_id', 'course_id')
