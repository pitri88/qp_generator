from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from functools import wraps
'''
def role_required(required_role):
    def decorator(view_func):
        def _wrapped_view(request, *args, **kwargs):
            role = request.session.get('role')
            if role != required_role:
                return JsonResponse({'error': 'Unauthorized access'}, status=403)
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator
'''
def role_required(allowed_roles):
    """Decorator for function-based views"""
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            print(f"Checking access for user: {request.user.username}")
            print(f"User role: {request.user.role}")
            print(f"Allowed roles: {allowed_roles}")
            
            # Convert to list if single role is passed
            roles = allowed_roles if isinstance(allowed_roles, (list, tuple)) else [allowed_roles]
            
            # Check if user's role is in allowed roles
            if request.user.role in roles:
                return view_func(request, *args, **kwargs)
            
            # If role check fails, return 403 with error message
            return Response({
                'error': f'Access denied. Required roles: {", ".join(roles)}'
            }, status=403)
            
        return _wrapped_view
    return decorator

def class_role_required(allowed_roles):
    """Decorator for class-based views"""
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(self, request, *args, **kwargs):
            print(f"Checking access for user: {request.user.username}")
            print(f"User role: {request.user.role}")
            print(f"Allowed roles: {allowed_roles}")
            
            # Convert to list if single role is passed
            roles = allowed_roles if isinstance(allowed_roles, (list, tuple)) else [allowed_roles]
            
            # Check if user's role is in allowed roles
            if request.user.role in roles:
                return view_func(self, request, *args, **kwargs)
            
            # If role check fails, return 403 with error message
            return Response({
                'error': f'Access denied. Required roles: {", ".join(roles)}'
            }, status=403)
            
        return _wrapped_view
    return decorator
