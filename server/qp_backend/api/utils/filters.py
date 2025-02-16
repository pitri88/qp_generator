# utils/question_filters.py
from django.db.models import Q

def apply_question_filters(params):
    filters = Q()
    if params.get('course_id'):
        filters &= Q(course_id=params['course_id'])
    if params.get('unit_id'):
        filters &= Q(unit_id=params['unit_id'])
    if params.get('difficulty_level'):
        filters &= Q(difficulty_level=params['difficulty_level'])
    return filters

def apply_department_filters(params):
    filters = Q()
    if params.get('department_id'):
        filters &= Q(id=params['department_id'])
    return filters

def apply_course_filters(params):
    filters = Q()
    if params.get('department_id'):
        filters &= Q(department_id=params['department_id'])
    if params.get('faculty_id'):
        filters &= Q(faculty_id=params['faculty_id'])
    return filters

def apply_unit_filters(params):
    filters = Q()
    if params.get('course_id'):
        filters &= Q(course_id=params['course_id'])
    return filters
