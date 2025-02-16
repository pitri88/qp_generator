from django.urls import path
from .views import *

urlpatterns = [
    # User Authentication
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('logout/all/', LogoutAllDevicesView.as_view(), name='logout_all'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),

    # Role-based dashboards
    path('admin-dashboard/', admin_dashboard_view, name='admin_dashboard'),
    path('faculty-dashboard/', FacultyDashboardView.as_view(), name='faculty_dashboard'),

     # Profile management
    path('profile/', UserProfileView.as_view(), name='user_profile'),

    # Admin CRUD endpoints
    path('department/', department_view, name='department-list'),
    path('department/<int:dept_id>/', department_view, name='department-detail'),
    path('course/', course_view, name='course-list'),
    path('course/<str:course_id>/', course_view, name='course-detail'),
    path('faculty-course-mapping/', faculty_course_mapping_view, name='faculty-course-mapping'),
    path('unit/', UnitCRUDView.as_view(), name='unit_crud'),

    # Question Management
    path('add-question/', AddQuestionView.as_view(), name='add_question'),
    path('upload-question/', FileUploadView.as_view(), name='upload_question'),
    path('filter-questions/', FilterQuestionsView.as_view(), name='filter_questions'),
    path('generate-paper/', GeneratePaperView.as_view(), name='generate_paper'),
    path('questions/', QuestionListView.as_view(), name='list_questions'),
    path('question/', question_view, name='question-list'),
    path('question/<int:q_id>/', question_view, name='question-detail'),

    # Department Management

    path('departments/', ListEntitiesView.as_view(), name='view_departments'),

    # Course Management
    
    path('courses/', ListEntitiesView.as_view(), name='view_courses'),

    # Unit Management
   
    path('units/', ListEntitiesView.as_view(), name='view_units'),

    # Admin Management
    path('users/', UserListView.as_view(), name='user_list'),

    path('faculty/', faculty_view, name='faculty-list'),
    path('faculty/<str:f_id>/', faculty_view, name='faculty-detail'),
    path('faculty-course/', faculty_course_view, name='faculty-course'),
]
