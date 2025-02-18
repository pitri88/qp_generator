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
        fields = ['unit_id', 'unit_name']

# Question Serializer
class QuestionSerializer(serializers.ModelSerializer):
    unit = UnitSerializer(read_only=True)
    course_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = Question
        fields = [
            'q_id', 
            'text', 
            'unit_id',
            'unit',
            'course_id',
            'co', 
            'bt', 
            'marks', 
            'difficulty_level',
            'type'
        ]

    def validate(self, data):
        unit_id = data.get('unit_id')
        course_id = data.get('course_id')
        
        try:
            # Get the specific unit for this course
            unit = Unit.objects.get(unit_id=unit_id, course_id=course_id)
            data['unit_id'] = unit
            data['course_id'] = unit.course_id
        except Unit.DoesNotExist:
            raise serializers.ValidationError("The specified unit does not exist for this course.")
        except Unit.MultipleObjectsReturned:
            raise serializers.ValidationError("Multiple units found. This should not happen.")
        
        return data

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
