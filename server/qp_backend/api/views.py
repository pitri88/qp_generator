from django.shortcuts import redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from django.utils.decorators import method_decorator
from django.utils.timezone import now
from django.contrib.auth.models import update_last_login

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.authentication import TokenAuthentication

from django.middleware.csrf import get_token, rotate_token
from django.db.models import Q
from django.contrib.auth.hashers import make_password
from django.contrib.sessions.models import Session
from django.db import transaction
from django.urls import reverse
from django.http import JsonResponse, FileResponse
from django.views import View
from django.shortcuts import get_object_or_404

from rest_framework.authtoken.models import Token
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.renderers import JSONRenderer

import json
import os
import logging
from datetime import datetime
from django.db.models import Count
from django.utils import timezone

# Rate limiting setup
try:
    from django_ratelimit.decorators import ratelimit
except ImportError:
    # If django_ratelimit is not installed, create a dummy decorator
    def ratelimit(*args, **kwargs):
        def decorator(f):
            return f
        return decorator

from .models import *
from .serializers import *
from .parser import upload_questions
from .middleware import role_required, class_role_required
from .utils.paper_generator import QuestionPaperGenerator

# Filter functions
def apply_question_filters(params):
    filters = Q()
    if 'unit_id' in params:
        filters &= Q(unit_id=params['unit_id'])
    if 'co' in params:
        filters &= Q(co=params['co'])
    if 'bt' in params:
        filters &= Q(bt=params['bt'])
    if 'marks' in params:
        filters &= Q(marks=params['marks'])
    return filters

def apply_department_filters(params):
    filters = Q()
    if 'name' in params:
        filters &= Q(name__icontains=params['name'])
    return filters

def apply_course_filters(params):
    filters = Q()
    if 'name' in params:
        filters &= Q(name__icontains=params['name'])
    if 'department' in params:
        filters &= Q(department=params['department'])
    return filters

def apply_unit_filters(params):
    filters = Q()
    if 'course_id' in params:
        filters &= Q(course_id=params['course_id'])
    if 'unit_name' in params:
        filters &= Q(unit_name__icontains=params['unit_name'])
    return filters

def generate_question_paper(questions, format='pdf'):
    # TODO: Implement the actual question paper generation logic
    # This is a placeholder implementation
    paper = {
        'questions': [
            {
                'id': q.id,
                'text': q.text,
                'marks': q.marks,
                'unit': q.unit_id.unit_name if q.unit_id else None
            } for q in questions
        ],
        'total_marks': sum(q.marks for q in questions),
        'format': format
    }
    return paper

class CustomPagination(PageNumberPagination):
    page_size = 10

# Admin Dashboard
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@role_required(['admin'])
def admin_dashboard_view(request):
    try:
        # Get counts from database
        stats = {
            'departments': Department.objects.count(),
            'courses': Course.objects.count(),
            'faculty': Faculty.objects.count(),
            'questions': Question.objects.count()
        }

        # Get analytics data
        analytics = {
            'questions_by_course': Course.objects.annotate(
                question_count=Count('questions')
            ).values('course_name', 'question_count'),
            'questions_by_difficulty': Question.objects.values('difficulty_level').annotate(
                count=Count('q_id')
            ),
            'papers_generated': PaperMetadata.objects.values('course_code').annotate(
                count=Count('id')
            ),
            'faculty_course_distribution': Faculty.objects.annotate(
                course_count=Count('facultycourse')
            ).values('name', 'course_count')
        }

        return Response({
            'stats': stats,
            'analytics': analytics
        })
    except Exception as e:
        print(f"Error in admin dashboard: {str(e)}")
        return Response({'error': str(e)}, status=500)


# Faculty Dashboard
class FacultyDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        try:
            if not request.user.role == 'faculty':
                return Response(
                    {"error": "Access denied. This endpoint requires faculty role."}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            faculty_profile = request.user.faculty_profile
            print(f"Found faculty profile: {faculty_profile.f_id}")
            
            # Debug: Print all courses in the system
            all_courses = Course.objects.all()
            print("\nAll courses in system:")
            for course in all_courses:
                print(f"Course Code: {course.course_id}, Name: {course.course_name}")
            
            # Get faculty course mappings
            faculty_courses = FacultyCourse.objects.filter(faculty_id=faculty_profile.f_id)
            print(f"\nFound {faculty_courses.count()} faculty course mappings")
            
            courses_data = []
            for fc in faculty_courses:
                try:
                    course = Course.objects.get(course_id=fc.course_id_id)
                    print(f"\nProcessing course: Code={course.course_id}, Name={course.course_name}")
                    
                    units = Unit.objects.filter(course_id=course.course_id)
                    unit_names = [unit.unit_name for unit in units]
                    print(f"Found {len(unit_names)} units for course")
                    
                    courses_data.append({
                        'id': course.course_id,
                        'name': course.course_name,
                        'code': course.course_id,
                        'units': unit_names
                    })
                except Course.DoesNotExist:
                    print(f"Warning: Course with ID {fc.course_id_id} not found")
                    continue
                except Exception as e:
                    print(f"Error processing course: {str(e)}")
                    continue
            
            if not courses_data:
                print("No valid courses found for faculty")
                return Response({
                    "error": "No valid courses found for faculty",
                    'faculty_id': faculty_profile.f_id,
                    'name': faculty_profile.name,
                    'email': faculty_profile.email,
                    'courses': []
                }, status=status.HTTP_404_NOT_FOUND)

            print(f"\nReturning {len(courses_data)} courses")
            return Response({
                'faculty_id': faculty_profile.f_id,
                'name': faculty_profile.name,
                'email': faculty_profile.email,
                'courses': courses_data
            })
        except Faculty.DoesNotExist:
            print(f"Faculty profile not found for user {request.user.username}")
            return Response({"error": "Faculty profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error in faculty dashboard: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# For login
class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # No authentication required for login

    @method_decorator(csrf_exempt)  # Temporarily disable CSRF for testing
    @method_decorator(ratelimit(key='ip', rate='5/m', block=True))
    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            role = request.data.get('role')

            if not all([username, password, role]):
                return Response(
                    {"error": "Username, password, and role are required."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            if role not in ['admin', 'faculty']:
                return Response(
                    {"error": "Invalid role. Must be either 'admin' or 'faculty'."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = authenticate(username=username, password=password)
            
            if not user:
                return Response(
                    {"error": "Invalid credentials"}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )

            if not user.is_active:
                return Response(
                    {"error": "User account is inactive."}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            if user.role != role:
                return Response(
                    {"error": f"User does not have the '{role}' role."}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            login(request, user)
            update_last_login(None, user)
            
            # Create or get the auth token
            token, _ = Token.objects.get_or_create(user=user)
            
            response_data = {
                "message": "Login successful",
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": "An unexpected error occurred during login."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Logout View
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            logout(request)
            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Logout failed. Try again later."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

# Log out from all devices
class LogoutAllDevicesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user_sessions = Session.objects.filter(expire_date__gte=now())
            for session in user_sessions:
                data = session.get_decoded()
                if data.get('_auth_user_id') == str(request.user.id):
                    session.delete()

            return Response({"message": "Logged out from all devices successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Could not logout from all devices."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Combine both user profile and this into one if they are the same. Retrieves faculty and related information
# as set by the Admin role or edited previously by the faculty itself.
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @method_decorator(login_required)
    @method_decorator(csrf_protect)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request):
        try:
            if request.user.role == 'faculty':
                profile = Faculty.objects.filter(user=request.user).first()
                if not profile:
                    return Response({"error": "Faculty profile not found."},
                                    status=status.HTTP_404_NOT_FOUND)
                serializer = FacultySerializer(profile)
            elif request.user.role == 'admin':
                serializer = AdminSerializer(request.user)
            else:
                return Response({"error": "Invalid role detected."},
                                status=status.HTTP_403_FORBIDDEN)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": "Failed to load profile."}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request):
        try:
            if request.user.role == 'faculty':
                profile = Faculty.objects.filter(user=request.user).first()
                if not profile:
                    return Response({"error": "Faculty profile not found."}, 
                                    status=status.HTTP_404_NOT_FOUND)
                serializer = FacultySerializer(profile, data=request.data, partial=True)
            elif request.user.role == 'admin':
                serializer = AdminSerializer(request.user, data=request.data, partial=True)
            else:
                return Response({"error": "Invalid role."}, status=status.HTTP_403_FORBIDDEN)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Failed to update profile."}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Secure APIView with session authentication
class SecureAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @method_decorator(login_required)
    @method_decorator(csrf_protect)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)


# Department CRUD View
@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@role_required(['admin'])
def department_view(request, dept_id=None):
    if request.method == 'DELETE':
        if not dept_id:
            return Response({'error': 'Department ID is required'}, status=400)
        
        try:
            department = Department.objects.get(dept_id=dept_id)
            department.delete()  # This will trigger the custom delete method
            return Response({'message': 'Department deleted successfully'})
        except Department.DoesNotExist:
            return Response({'error': 'Department not found'}, status=404)
        except Exception as e:
            print(f"Error deleting department: {str(e)}")
            return Response({'error': str(e)}, status=400)
    
    elif request.method == 'GET':
        try:
            if dept_id:
                department = Department.objects.get(dept_id=dept_id)
                data = {
                    'dept_id': department.dept_id,
                    'dept_name': department.dept_name,
                    'course_count': department.get_course_count(),
                    'faculty_count': department.get_faculty_count()
                }
                return Response({'department': data})
            else:
                departments = Department.objects.all()
                data = [{
                    'dept_id': dept.dept_id,
                    'dept_name': dept.dept_name,
                    'course_count': dept.get_course_count(),
                    'faculty_count': dept.get_faculty_count()
                } for dept in departments]
                return Response({'departments': data})
        except Department.DoesNotExist:
            return Response({'error': 'Department not found'}, status=404)
        except Exception as e:
            print(f"Error in department GET: {str(e)}")
            return Response({'error': str(e)}, status=400)

    elif request.method == 'POST':
        try:
            dept_name = request.data.get('dept_name')
            if not dept_name:
                return Response({'error': 'Department name is required'}, status=400)

            department = Department.objects.create(dept_name=dept_name)
            return Response({
                'message': 'Department created successfully',
                'department': {
                    'dept_id': department.dept_id,
                    'dept_name': department.dept_name
                }
            }, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    return Response({'error': 'Method not allowed'}, status=405)


# Course CRUD View
@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@role_required(['admin'])
def course_view(request, course_id=None):
    if request.method == 'GET':
        try:
            if course_id:
                course = Course.objects.get(course_id=course_id)
                data = {
                    'course_id': course.course_id,
                    'course_name': course.course_name,
                    'department_id': course.department_id.dept_id if course.department_id else None,
                    'department_name': course.get_department_name(),
                    'question_count': course.get_question_count(),
                    'unit_count': course.get_unit_count(),
                    'faculty_count': course.get_faculty_count()
                }
                return Response({'course': data})
            else:
                courses = Course.objects.all()
                data = [{
                    'course_id': course.course_id,
                    'course_name': course.course_name,
                    'department_id': course.department_id.dept_id if course.department_id else None,
                    'department_name': course.get_department_name(),
                    'question_count': course.get_question_count(),
                    'unit_count': course.get_unit_count(),
                    'faculty_count': course.get_faculty_count()
                } for course in courses]
                return Response({'courses': data})
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)
        except Exception as e:
            print(f"Error in course GET: {str(e)}")
            return Response({'error': str(e)}, status=400)

    elif request.method == 'POST':
        try:
            course_id = request.data.get('course_id')
            course_name = request.data.get('course_name')
            department_id = request.data.get('department_id')

            if not course_id or not course_name:
                return Response({
                    'error': 'Course ID and name are required'
                }, status=400)

            if Course.objects.filter(course_id=course_id).exists():
                return Response({'error': 'Course with this ID already exists'}, status=400)

            department = None
            if department_id:
                try:
                    department = Department.objects.get(dept_id=department_id)
                except Department.DoesNotExist:
                    return Response({'error': 'Department not found'}, status=404)

            course = Course.objects.create(
                course_id=course_id,
                course_name=course_name,
                department_id=department
            )

            return Response({
                'message': 'Course created successfully',
                'course': {
                    'course_id': course.course_id,
                    'course_name': course.course_name,
                    'department_id': course.department_id.dept_id if course.department_id else None,
                    'department_name': course.department_id.dept_name if course.department_id else 'Not Assigned'
                }
            }, status=201)
        except Exception as e:
            print(f"Error in course POST: {str(e)}")
            return Response({'error': str(e)}, status=400)

    elif request.method == 'PUT':
        try:
            if not course_id:
                course_id = request.data.get('course_id')
            
            if not course_id:
                return Response({'error': 'Course ID is required'}, status=400)

            course = Course.objects.get(course_id=course_id)
            department_id = request.data.get('department_id')

            if department_id:
                try:
                    department = Department.objects.get(dept_id=department_id)
                    course.department_id = department
                except Department.DoesNotExist:
                    return Response({'error': 'Department not found'}, status=404)
            else:
                course.department_id = None

            course.save()

            # Return updated course data
            return Response({
                'message': 'Course updated successfully',
                'course': {
                    'course_id': course.course_id,
                    'course_name': course.course_name,
                    'department_id': course.department_id.dept_id if course.department_id else None,
                    'department_name': course.get_department_name()
                }
            })
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)
        except Exception as e:
            print(f"Error in course PUT: {str(e)}")
            return Response({'error': str(e)}, status=400)

    def delete(self, request, course_id=None):
        try:
            if not course_id:
                course_id = request.query_params.get('course_id')
            
            if not course_id:
                return Response({'error': 'Course ID is required'}, status=400)

            course = Course.objects.get(course_id=course_id)
            course.delete()
            return Response({'message': f'Course {course_id} deleted successfully'})
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)
        except Exception as e:
            print(f"Error in course DELETE: {str(e)}")
            return Response({'error': str(e)}, status=400)


# Faculty-Course Mapping View
@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
@role_required(['admin'])  # Only admin can access this endpoint
def faculty_course_mapping_view(request):
    if request.method == 'GET':
        try:
            mappings = FacultyCourse.objects.select_related(
                'faculty_id', 
                'course_id',
                'course_id__department_id'
            ).all()
            
            data = [{
                'faculty_id': m.faculty_id.f_id,
                'faculty_name': m.faculty_id.name,
                'course_id': m.course_id.course_id,
                'course_name': m.course_id.course_name,
                'department_name': m.course_id.get_department_name()
            } for m in mappings]
            
            return Response({'mappings': data})
        except Exception as e:
            print(f"Error in mapping GET: {str(e)}")
            return Response({'error': str(e)}, status=400)

    elif request.method == 'POST':
        try:
            faculty_id = request.data.get('faculty_id')
            course_id = request.data.get('course_id')

            if not faculty_id or not course_id:
                return Response({'error': 'Both faculty_id and course_id are required'}, status=400)

            faculty = Faculty.objects.get(f_id=faculty_id)
            course = Course.objects.get(course_id=course_id)

            # Check if mapping already exists
            if FacultyCourse.objects.filter(faculty_id=faculty, course_id=course).exists():
                return Response({'error': 'This faculty-course mapping already exists'}, status=400)

            mapping = FacultyCourse.objects.create(faculty_id=faculty, course_id=course)
            return Response({
                'message': 'Faculty-course mapping created successfully',
                'mapping': {
                    'faculty_id': faculty.f_id,
                    'faculty_name': faculty.name,
                    'course_id': course.course_id,
                    'course_name': course.course_name,
                    'department_name': course.get_department_name()
                }
            }, status=201)
        except Faculty.DoesNotExist:
            return Response({'error': 'Faculty not found'}, status=404)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)
        except Exception as e:
            print(f"Error in mapping POST: {str(e)}")
            return Response({'error': str(e)}, status=400)

    elif request.method == 'DELETE':
        try:
            faculty_id = request.data.get('faculty_id')
            course_id = request.data.get('course_id')

            if not faculty_id or not course_id:
                return Response({'error': 'Both faculty_id and course_id are required'}, status=400)

            mapping = FacultyCourse.objects.filter(
                faculty_id__f_id=faculty_id,
                course_id__course_id=course_id
            ).first()

            if not mapping:
                return Response({'error': 'Faculty-course mapping not found'}, status=404)

            mapping.delete()
            return Response({'message': 'Faculty-course mapping deleted successfully'})
        except Exception as e:
            print(f"Error in mapping DELETE: {str(e)}")
            return Response({'error': str(e)}, status=400)


# Unit CRUD View
class UnitCRUDView(SecureAPIView):
    def get(self, request):
        units = Unit.objects.all().select_related('course')
        serializer = UnitSerializer(units, many=True)
        return Response({'units': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        course = get_object_or_404(Course, course_id=request.data.get('course_id'))
        serializer = UnitSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(course=course)
            return Response({'message': 'Unit created successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        unit = get_object_or_404(Unit, id=request.data.get('id'))
        serializer = UnitSerializer(unit, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Unit updated successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        unit = get_object_or_404(Unit, id=request.data.get('id'))
        unit.delete()
        return Response({'message': 'Unit deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


# Admin Faculty Management
@method_decorator(login_required, name='dispatch')
@method_decorator(csrf_protect, name='dispatch')
class AddFacultyView(APIView):
    def post(self, request):
        data = request.data
        try:
            department = Department.objects.get(id=data['department_id'])
        except Department.DoesNotExist:
            return Response({"error": "Invalid department ID"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=data['username'],
            password=data['password'],
            email=data.get('email', ''),
            role='faculty'
        )
        faculty = Faculty.objects.create(
            f_id=f"F{user.id:03d}",
            user=user,
            name=data.get('name', user.username),
            email=data.get('email', ''),
            password_hash=user.password,
            role='faculty',
            department_id=department
        )
        
        return Response({"message": f"Faculty {faculty.user.username} added successfully"}, status=status.HTTP_201_CREATED)


# Mapping Faculty to Courses
@method_decorator(login_required, name='dispatch')
@method_decorator(csrf_protect, name='dispatch')
class MapFacultyToCoursesView(APIView):
    def post(self, request):
        data = request.data
        faculty_id = data.get('faculty_id')
        course_ids = data.get('course_ids')

        try:
            faculty = Faculty.objects.get(id=faculty_id)
        except Faculty.DoesNotExist:
            return Response({"error": "Faculty not found"}, status=status.HTTP_404_NOT_FOUND)
        
        for course_id in course_ids:
            try:
                course = Course.objects.get(course_id=course_id)
                faculty.courses.add(course)
            except Course.DoesNotExist:
                return Response({"error": f"Course {course_id} not found"}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({"message": "Faculty mapped to courses successfully"}, status=status.HTTP_200_OK)
    

# Add Unit (BOTH)
@method_decorator(login_required, name='dispatch')
@method_decorator(csrf_protect, name='dispatch')
class AddUnitView(APIView):
    def post(self, request):
        data = request.data
        try:
            course = Course.objects.get(course_id=data['course_id'])
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        unit = Unit.objects.create(**data)
        return Response({"message": f"Unit {unit.unit_name} added successfully"}, status=status.HTTP_201_CREATED)
    

# List all questions of all units of a selected course (FACULTY)
class QuestionListView(APIView):
    permission_classes = [IsAuthenticated]

    @method_decorator(login_required)
    @method_decorator(csrf_protect)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request):
        course_id = request.query_params.get('course_id')
        if not course_id:
            return Response({"error": "Course ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        questions = Question.objects.filter(course_id=course_id).prefetch_related('media').select_related('unit_id')

        pagination_class = CustomPagination

        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# Add questions manually (FACULTY)
class AddQuestionView(APIView):
    permission_classes = [IsAuthenticated]  # Require authentication

    def post(self, request):
        data = request.data
        media_data = data.pop('media', [])  # Extract media data from the request

        serializer = QuestionSerializer(data=data)
        if serializer.is_valid():
            question = serializer.save()
            media_objects = [
                QuestionMedia(question_id=question, **media) for media in media_data
            ]
            QuestionMedia.objects.bulk_create(media_objects)
            return Response({"message": "Question and media added successfully"}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

# Uploading questions from file (FACULTY)
class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    parser_classes = [MultiPartParser, FormParser]
    renderer_classes = [JSONRenderer]

    def post(self, request):
        try:
            faculty_profile = request.user.faculty_profile
            course_id = request.data.get('course_id')
            
            # Check if faculty is associated with the course
            if not FacultyCourse.objects.filter(faculty_id=faculty_profile, course_id=course_id).exists():
                print(f"Access denied: Faculty {faculty_profile.f_id} does not have access to course {course_id}")
                return Response({"error": "You do not have permission to upload questions for this course"}, 
                             status=status.HTTP_403_FORBIDDEN)
            
            file = request.FILES.get('file')
            if not file:
                return Response({"error": "No file was uploaded"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate file extension
            if not file.name.endswith(('.doc', '.docx')):
                return Response({"error": "Invalid file format. Please upload a .doc or .docx file"}, 
                             status=status.HTTP_400_BAD_REQUEST)

            # Create temp directory if it doesn't exist
            os.makedirs("temp", exist_ok=True)
            os.makedirs("images", exist_ok=True)
            
            # Save the file temporarily
            file_path = f"temp/{file.name}"
            with open(file_path, "wb") as f:
                for chunk in file.chunks():
                    f.write(chunk)

            try:
                # Process the file using the parser
                questions = upload_questions(file_path, course_id)
                if not questions:
                    return Response({"error": "No questions found in the document"}, status=status.HTTP_400_BAD_REQUEST)
                
                return Response({
                    "message": f"Successfully uploaded {len(questions)} questions",
                    "questions": [{
                        "id": q.q_id,
                        "text": q.text,
                        "marks": q.marks,
                        "co": q.co,
                        "bt": q.bt,
                        "unit": q.unit_id.unit_id
                    } for q in questions]
                }, status=status.HTTP_201_CREATED)
            
            finally:
                # Clean up - remove temporary file
                if os.path.exists(file_path):
                    os.remove(file_path)
            
        except Faculty.DoesNotExist:
            return Response({"error": "Faculty profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
        except Unit.DoesNotExist:
            return Response({"error": "Unit not found for the given course"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logging.error(f"Error processing file: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Based on the filters(appropriate attributes of Question entity like CO, BT, unit_id specified in the indexes)
# return the questions of the selected course (FACULTY)
@method_decorator(login_required, name='dispatch')
@method_decorator(csrf_protect, name='dispatch')
class FetchQuestionsView(APIView):
    def get(self, request):
        filters = apply_question_filters(request.query_params)
        questions = Question.objects.filter(filters).prefetch_related('media')  # Prefetch media
        response_data = []

        for question in questions:
            media = QuestionMedia.objects.filter(question_id=question)
            question_data = {
                "id": question.id,
                "text": question.text,
                "marks": question.marks,
                "media": [{"type": m.type, "url": m.url} for m in media],
            }
            response_data.append(question_data)
        
        return Response(response_data, status=status.HTTP_200_OK)
    

# Listing departments, courses, units based on filters or none (ADMIN)
@method_decorator(login_required, name='dispatch')
@method_decorator(csrf_protect, name='dispatch')
class ListEntitiesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, entity_type):
        """Dynamically retrieve departments, courses, or units."""
        entity_map = {
            'departments': Department,
            'courses': Course,
            'units': Unit,
        }
        model = entity_map.get(entity_type)

        if not model:
            return Response({"error": "Invalid entity type"}, status=status.HTTP_400_BAD_REQUEST)

        filters = {
            'departments': apply_department_filters,
            'courses': apply_course_filters,
            'units': apply_unit_filters,
        }.get(entity_type)(request.query_params)

        entities = model.objects.filter(filters)
        serializer = {
            'departments': DepartmentSerializer,
            'courses': CourseSerializer,
            'units': UnitSerializer,
        }.get(entity_type)(entities, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


# Question Paper Generation
class GeneratePaperView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Create a simple metadata object without saving to database
            class SimpleMetadata:
                def __init__(self, data, faculty):
                    self.course_code = data.get('course_code')
                    self.course_title = data.get('course_title')
                    self.date = datetime.strptime(data.get('date'), '%Y-%m-%d')
                    self.max_marks = data.get('max_marks')
                    self.duration = data.get('duration')
                    self.semester = data.get('semester')
                    self.faculty = faculty
                    self.is_improvement_cie = data.get('is_improvement_cie', False)

            metadata = SimpleMetadata(request.data, request.user.faculty_profile)

            # Create question selections without saving to database
            class SimpleQuestionSelection:
                def __init__(self, question, part):
                    self.question = question
                    self.part = part

            selected_questions = []
            part_a_questions = request.data['selected_questions']['part_a']
            part_b_questions = request.data['selected_questions']['part_b']

            # Process Part A questions
            for q_id in part_a_questions:
                question = Question.objects.get(q_id=q_id)
                selected_questions.append(SimpleQuestionSelection(question, 'A'))

            # Process Part B questions
            for q_id in part_b_questions:
                question = Question.objects.get(q_id=q_id)
                selected_questions.append(SimpleQuestionSelection(question, 'B'))

            # Get all questions with their media
            question_ids = [q.question.q_id for q in selected_questions]
            questions_data = Question.objects.filter(q_id__in=question_ids).prefetch_related('media')

            # Create paper directory if it doesn't exist
            os.makedirs("generated_papers", exist_ok=True)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_path = f"generated_papers/question_paper_{timestamp}.docx"

            # Generate the paper
            doc = QuestionPaperGenerator.create_paper(metadata, selected_questions, questions_data)
            doc.save(output_path)

            # Return the file
            response = FileResponse(
                open(output_path, 'rb'),
                content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            )
            response['Content-Disposition'] = f'attachment; filename="question_paper_{timestamp}.docx"'
            return response

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Enhance Scalability and Session Management
class SessionManagementMixin:
    @staticmethod
    def clear_inactive_sessions():
        from django.contrib.sessions.models import Session
        from datetime import datetime

        sessions = Session.objects.all()
        for session in sessions:
            if session.expire_date < datetime.now():
                session.delete()

class UserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            users = CustomUser.objects.all().select_related('faculty')
            user_data = []
            
            for user in users:
                data = {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                    'is_active': user.is_active,
                    'last_login': user.last_login,
                    'date_joined': user.date_joined,
                }
                
                # Add faculty-specific info if the user is a faculty member
                if user.role == 'faculty' and hasattr(user, 'faculty'):
                    faculty = user.faculty
                    data.update({
                        'department': faculty.department.name if faculty.department else None,
                        'courses': [
                            {
                                'id': course.course_id,
                                'name': course.name
                            } for course in faculty.courses.all()
                        ]
                    })
                
                user_data.append(data)
            
            return Response(user_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Failed to fetch users", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class FilterQuestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            unit_numbers = request.data.get('unit_numbers', [])
            cos = request.data.get('cos', [])
            bts = request.data.get('bts', [])
            marks = request.data.get('marks', [])

            questions = Question.objects.filter(
                unit_id__unit_id__in=unit_numbers,
                co__in=cos,
                bt__in=bts,
                marks__in=marks
            ).prefetch_related('questionmedia_set')

            response_data = []
            for question in questions:
                media = question.questionmedia_set.first()
                question_data = {
                    "id": question.q_id,
                    "text": question.text,
                    "marks": question.marks,
                    "co": question.co,
                    "bt": question.bt,
                    "unit": question.unit_id.unit_id,
                    "image_paths": media.image_paths if media else None,
                    "equations": media.equations if media else None
                }
                response_data.append(question_data)

            return Response({"questions": response_data})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
@role_required(['admin', 'faculty'])  # Allow both admin and faculty access
def faculty_course_view(request):
    if request.method == 'GET':
        try:
            # If admin, get all mappings
            if request.user.role == 'admin':
                mappings = FacultyCourse.objects.select_related(
                    'faculty_id', 
                    'course_id'
                ).all()
                data = [{
                    'faculty_id': m.faculty_id.f_id,
                    'faculty_name': m.faculty_id.name,
                    'course_id': m.course_id.course_id,
                    'course_name': m.course_id.course_name,
                    'department_name': m.course_id.get_department_name()
                } for m in mappings]
                return Response({'mappings': data})
            
            # If faculty, get only their mappings
            faculty = Faculty.objects.get(user=request.user)
            mappings = FacultyCourse.objects.select_related('course_id').filter(faculty_id=faculty)
            data = [{
                'course_id': m.course_id.course_id,
                'course_name': m.course_id.course_name,
                'department_name': m.course_id.get_department_name()
            } for m in mappings]
            return Response({'mappings': data})

        except Faculty.DoesNotExist:
            return Response({'error': 'Faculty profile not found'}, status=404)
        except Exception as e:
            print(f"Error in faculty course GET: {str(e)}")
            return Response({'error': str(e)}, status=400)

    elif request.method == 'POST':
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can create mappings'}, status=403)
            
        try:
            faculty_id = request.data.get('faculty_id')
            course_id = request.data.get('course_id')

            if not faculty_id or not course_id:
                return Response({'error': 'Both faculty_id and course_id are required'}, status=400)

            faculty = Faculty.objects.get(f_id=faculty_id)
            course = Course.objects.get(course_id=course_id)

            # Check if mapping already exists
            if FacultyCourse.objects.filter(faculty_id=faculty, course_id=course).exists():
                return Response({'error': 'This faculty-course mapping already exists'}, status=400)

            mapping = FacultyCourse.objects.create(faculty_id=faculty, course_id=course)
            return Response({
                'message': 'Faculty-course mapping created successfully',
                'mapping': {
                    'faculty_id': faculty.f_id,
                    'faculty_name': faculty.name,
                    'course_id': course.course_id,
                    'course_name': course.course_name
                }
            }, status=201)
        except Faculty.DoesNotExist:
            return Response({'error': 'Faculty not found'}, status=404)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)
        except Exception as e:
            print(f"Error in faculty course POST: {str(e)}")
            return Response({'error': str(e)}, status=400)

    elif request.method == 'DELETE':
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can delete mappings'}, status=403)
            
        try:
            faculty_id = request.data.get('faculty_id')
            course_id = request.data.get('course_id')

            if not faculty_id or not course_id:
                return Response({'error': 'Both faculty_id and course_id are required'}, status=400)

            mapping = FacultyCourse.objects.filter(
                faculty_id__f_id=faculty_id,
                course_id__course_id=course_id
            ).first()

            if not mapping:
                return Response({'error': 'Faculty-course mapping not found'}, status=404)

            mapping.delete()
            return Response({'message': 'Faculty-course mapping deleted successfully'})
        except Exception as e:
            print(f"Error in faculty course DELETE: {str(e)}")
            return Response({'error': str(e)}, status=400)

    return Response({'error': 'Method not allowed'}, status=405)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@role_required(['admin'])
def faculty_view(request, f_id=None):
    """View for managing faculty members"""
    
    if request.method == 'DELETE':
        if not f_id:
            return Response({'error': 'Faculty ID is required'}, status=400)
        
        try:
            faculty = Faculty.objects.get(f_id=f_id)
            faculty.delete()  # This will trigger the custom delete method
            return Response({'message': 'Faculty deleted successfully'})
        except Faculty.DoesNotExist:
            return Response({'error': 'Faculty not found'}, status=404)
        except Exception as e:
            print(f"Error deleting faculty: {str(e)}")
            return Response({'error': str(e)}, status=400)

    elif request.method == 'GET':
        if f_id:
            try:
                faculty = Faculty.objects.get(f_id=f_id)
                data = {
                    'f_id': faculty.f_id,
                    'name': faculty.name,
                    'email': faculty.email,
                    'department_id': faculty.department_id.dept_id if faculty.department_id else None,
                    'department_name': faculty.get_department_name(),
                    'course_count': faculty.get_course_count(),
                    'paper_count': faculty.get_paper_count()
                }
                return Response({'faculty': data})
            except Faculty.DoesNotExist:
                return Response({'error': 'Faculty not found'}, status=404)
        else:
            faculty = Faculty.objects.all()
            data = [{
                'f_id': f.f_id,
                'name': f.name,
                'email': f.email,
                'department_id': f.department_id.dept_id if f.department_id else None,
                'department_name': f.get_department_name(),
                'course_count': f.get_course_count(),
                'paper_count': f.get_paper_count()
            } for f in faculty]
            return Response({'faculty': data})

    elif request.method == 'POST':
        try:
            # Get required fields
            f_id = request.data.get('f_id')
            name = request.data.get('name')
            email = request.data.get('email')
            password = request.data.get('password')
            department_id = request.data.get('department_id')
            
            # Validate required fields
            missing_fields = []
            if not f_id:
                missing_fields.append('Faculty ID')
            if not name:
                missing_fields.append('Name')
            if not email:
                missing_fields.append('Email')
            if not password:
                missing_fields.append('Password')
            
            if missing_fields:
                return Response({
                    'error': f'Missing required fields: {", ".join(missing_fields)}'
                }, status=400)

            # Check if faculty already exists
            if Faculty.objects.filter(f_id=f_id).exists():
                return Response({'error': 'Faculty with this ID already exists'}, status=400)

            # Check if email already exists
            if CustomUser.objects.filter(email=email).exists():
                return Response({'error': 'Email already exists'}, status=400)

            # Create user account
            try:
                user = CustomUser.objects.create_user(
                    username=email,
                    email=email,
                    password=password,
                    role='faculty'
                )
            except Exception as e:
                return Response({'error': f'Failed to create user account: {str(e)}'}, status=400)
            
            # Get department if provided
            department = None
            if department_id:
                try:
                    department = Department.objects.get(dept_id=department_id)
                except Department.DoesNotExist:
                    user.delete()  # Rollback user creation
                    return Response({'error': 'Department not found'}, status=404)

            # Create faculty
            try:
                faculty = Faculty.objects.create(
                    f_id=f_id,
                    name=name,
                    email=email,
                    user=user,
                    department_id=department
                )
            except Exception as e:
                user.delete()  # Rollback user creation
                return Response({'error': f'Failed to create faculty: {str(e)}'}, status=400)

            return Response({
                'message': 'Faculty created successfully',
                'faculty': {
                    'f_id': faculty.f_id,
                    'name': faculty.name,
                    'email': faculty.email,
                    'department_id': faculty.department_id.dept_id if faculty.department_id else None,
                    'department_name': faculty.department_id.dept_name if faculty.department_id else 'Not Assigned'
                }
            }, status=201)
        except Exception as e:
            print(f"Error in faculty POST: {str(e)}")
            return Response({'error': str(e)}, status=400)

    return Response({'error': 'Method not allowed'}, status=405)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@role_required(['admin'])
def question_view(request, q_id=None):
    if request.method == 'GET':
        try:
            if q_id:
                question = Question.objects.select_related(
                    'course_id',
                    'unit_id'
                ).get(q_id=q_id)
                data = {
                    'q_id': question.q_id,
                    'text': question.text,
                    'course_id': question.course_id.course_id,
                    'course_name': question.course_id.course_name,
                    'unit_id': question.unit_id.unit_id,
                    'unit_name': question.unit_id.unit_name,
                    'co': question.co,
                    'bt': question.bt,
                    'marks': question.marks,
                    'difficulty_level': question.difficulty_level,
                    'tags': question.tags
                }
                return Response({'question': data})
            else:
                questions = Question.objects.select_related(
                    'course_id',
                    'unit_id'
                ).all()
                data = [{
                    'q_id': q.q_id,
                    'text': q.text,
                    'course_id': q.course_id.course_id,
                    'course_name': q.course_id.course_name,
                    'unit_id': q.unit_id.unit_id,
                    'unit_name': q.unit_id.unit_name,
                    'co': q.co,
                    'bt': q.bt,
                    'marks': q.marks,
                    'difficulty_level': q.difficulty_level,
                    'tags': q.tags
                } for q in questions]
                return Response({'questions': data})
        except Question.DoesNotExist:
            return Response({'error': 'Question not found'}, status=404)
        except Exception as e:
            print(f"Error in question GET: {str(e)}")
            return Response({'error': str(e)}, status=400)

    elif request.method == 'POST':
        try:
            # Get required fields
            text = request.data.get('text')
            course_id = request.data.get('course_id')
            unit_id = request.data.get('unit_id')
            co = request.data.get('co')
            bt = request.data.get('bt')
            marks = request.data.get('marks')
            
            # Validate required fields
            if not all([text, course_id, unit_id, co, bt, marks]):
                return Response({
                    'error': 'Missing required fields'
                }, status=400)

            # Get course and unit
            course = Course.objects.get(course_id=course_id)
            unit = Unit.objects.get(unit_id=unit_id, course_id=course)

            # Create question
            question = Question.objects.create(
                text=text,
                course_id=course,
                unit_id=unit,
                co=co,
                bt=bt,
                marks=marks,
                difficulty_level=request.data.get('difficulty_level', 'medium'),
                tags=request.data.get('tags', [])
            )

            return Response({
                'message': 'Question created successfully',
                'question': {
                    'q_id': question.q_id,
                    'text': question.text,
                    'course_id': course.course_id,
                    'course_name': course.course_name,
                    'unit_id': unit.unit_id,
                    'unit_name': unit.unit_name,
                    'co': question.co,
                    'bt': question.bt,
                    'marks': question.marks,
                    'difficulty_level': question.difficulty_level,
                    'tags': question.tags
                }
            }, status=201)
        except (Course.DoesNotExist, Unit.DoesNotExist):
            return Response({'error': 'Course or Unit not found'}, status=404)
        except Exception as e:
            print(f"Error in question POST: {str(e)}")
            return Response({'error': str(e)}, status=400)

    return Response({'error': 'Method not allowed'}, status=405)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@role_required(['admin'])
def question_stats(request):
    try:
        questions = Question.objects.all()
        data = {
            'total_count': questions.count(),
            'by_course': Question.objects.values('course_id__course_name').annotate(
                count=Count('q_id')
            ),
            'by_difficulty': Question.objects.values('difficulty_level').annotate(
                count=Count('q_id')
            ),
            'by_marks': Question.objects.values('marks').annotate(
                count=Count('q_id')
            )
        }
        return Response(data)
    except Exception as e:
        print(f"Error in question stats: {str(e)}")
        return Response({'error': str(e)}, status=400)

