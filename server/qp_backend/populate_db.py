import os
import django

# Setup Django environment (if running as a standalone script)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qp_backend.settings')  # Replace 'your_project' with your actual project name
django.setup()

from api.models import Department, Course, Unit, Faculty, CustomUser  # Use CustomUser instead of User

def populate_data():
    try:
        # Add Departments
        print("Adding departments...")
        dept1 = Department.objects.create(dept_id=1, dept_name="Computer Science")
        dept2 = Department.objects.create(dept_id=2, dept_name="Electronics")
        dept3 = Department.objects.create(dept_id=3, dept_name="Mechanical Engineering")
        print("Departments added.")

        # Add Courses
        print("Adding courses...")
        course1 = Course.objects.create(
            course_id="CS234HTA",
            course_name="Advanced Data Structures",
            coordinating_department_id=dept1
        )
        course2 = Course.objects.create(
            course_id="EL101BAS",
            course_name="Basic Electronics",
            coordinating_department_id=dept2
        )
        course3 = Course.objects.create(
            course_id="ME456ENG",
            course_name="Thermodynamics",
            coordinating_department_id=dept3
        )
        print("Courses added.")

        # Add Units
        print("Adding units...")
        unit1 = Unit.objects.create(
            unit_id=1,
            unit_name="Heaps and Trees",
            course_id=course1
        )
        unit2 = Unit.objects.create(
            unit_id=2,
            unit_name="Capacitors and Resistors",
            course_id=course2
        )
        unit3 = Unit.objects.create(
            unit_id=3,
            unit_name="Laws of Thermodynamics",
            course_id=course3
        )
        print("Units added.")

        # Add Faculty
        print("Adding faculty...")
        # Create CustomUser instance
        user1 = CustomUser.objects.create_user(
            username="faculty1",
            email="faculty1@university.edu",
            password="faculty123",
            role="faculty"
        )
        faculty1 = Faculty.objects.create(
            f_id="FAC001",
            name="John Doe",
            email="faculty1@university.edu",
            password_hash=user1.password,
            role=user1.role,
            department_id=dept1
        )
        print("Faculty added.")

        print("Database populated successfully!")
    
    except Exception as e:
        print(f"Error populating database: {e}")

if __name__ == "__main__":
    populate_data()
