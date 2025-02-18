from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('login/', views.login_view, name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('logout/all/', views.LogoutAllDevicesView.as_view(), name='logout_all'),
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),

    # Role-based dashboards
    path('admin-dashboard/', views.admin_dashboard_view, name='admin-dashboard'),
    path('faculty-dashboard/', views.FacultyDashboardView.as_view(), name='faculty_dashboard'),

    # Profile management
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),

    # Admin CRUD endpoints
    path('department/', views.department_view, name='department-list'),
    path('department/<str:dept_id>/', views.department_view, name='department-detail'),
    path('course/', views.course_view, name='course-list'),
    path('course/<str:course_id>/', views.course_view, name='course-detail'),
    path('faculty-course-mapping/<str:faculty_id>/<str:course_id>/', 
         views.faculty_course_mapping, 
         name='faculty-course-mapping'),
    path('unit/', views.UnitCRUDView.as_view(), name='unit'),

    # Question Management
    path('questions/', views.question_view, name='question-list'),
    path('questions/<int:q_id>/', views.question_view, name='question-detail'),
    path('course/<str:course_id>/questions/', views.course_questions_view, name='course-questions'),
    path('add-question/', views.question_view, name='add-question'),
    path('upload-question/', views.FileUploadView.as_view(), name='upload_question'),
    path('course/<str:course_id>/filter-questions/', views.FilterQuestionsView.as_view(), name='filter-questions'),
    path('generate-paper/', views.GeneratePaperView.as_view(), name='generate_paper'),
    path('questions/', views.QuestionListView.as_view(), name='list_questions'),

    # Department Management
    path('departments/', views.ListEntitiesView.as_view(), name='view_departments'),

    # Course Management
    path('courses/', views.ListEntitiesView.as_view(), name='view_courses'),

    # Unit Management
    path('units/', views.ListEntitiesView.as_view(), name='view_units'),

    # Admin Management
    path('users/', views.UserListView.as_view(), name='user_list'),

    path('faculty/', views.faculty_view, name='faculty-list'),
    path('faculty/<str:f_id>/', views.faculty_view, name='faculty-detail'),
    # Faculty course management
    path('faculty-courses/', views.faculty_course_view, name='faculty-courses'),

    # Individual question operations
    path('question/', views.question_view, name='question'),
    path('question/<str:q_id>/', views.question_view, name='question-detail'),
]
