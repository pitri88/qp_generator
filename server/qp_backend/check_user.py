import os
import django

# Configure settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qp_backend.settings')
django.setup()

# Import the custom user model
from django.contrib.auth import get_user_model
User = get_user_model()

# Check the user
try:
    user = User.objects.get(username="admin2")
    print(f"User active: {user.is_active}")
    print(f"Password matches: {user.check_password('admin2123')}")
except User.DoesNotExist:
    print("User admin2 does not exist")

user.set_password("admin2123")
user.save()
print(f"Password for {user.username} has been reset.")
