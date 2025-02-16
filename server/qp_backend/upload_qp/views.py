from django.shortcuts import render

# Create your views here.
# views.py
from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import os
from django.conf import settings
import logging
from .models import Question, QuestionMedia
from docx import Document

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class QuestionUploadView(View):
    def post(self, request):
        try:
            if 'wordFile' not in request.FILES:
                return JsonResponse({
                    'status': 'error',
                    'message': 'No file was uploaded'
                }, status=400)

            uploaded_file = request.FILES['wordFile']
            
            # Validate file extension
            if not uploaded_file.name.endswith(('.doc', '.docx')):
                return JsonResponse({
                    'status': 'error',
                    'message': 'Invalid file format. Please upload a .doc or .docx file'
                }, status=400)

            # Create temporary directory if it doesn't exist
            temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
            os.makedirs(temp_dir, exist_ok=True)

            # Save the file temporarily
            file_path = os.path.join(temp_dir, uploaded_file.name)
            with open(file_path, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)

            # Parse the document
            doc = Document(file_path)
            questions_data = []

            # Process each table in the document
            for table in doc.tables:
                for row in table.rows[1:]:  # Skip header row
                    try:
                        cells = row.cells
                        
                        # Extract data from cells
                        question_data = {
                            'question_text': cells[1].text.strip(),
                            'marks': int(cells[3].text.strip()),
                            'unit_no': int(cells[4].text.strip()),
                            'coo': cells[5].text.strip(),
                            'bt': cells[6].text.strip()
                        }
                        
                        # Create Question instance
                        question = Question.objects.create(**question_data)
                        
                        # Process images if present in cell[2]
                        images = self._extract_images(cells[2], question.id)
                        
                        # Create QuestionMedia instance
                        if images:
                            QuestionMedia.objects.create(
                                question=question,
                                image_paths=images
                            )
                        
                        questions_data.append(question_data)
                        
                    except Exception as e:
                        logger.error(f"Error processing row: {str(e)}")
                        continue

            # Clean up - remove temporary file
            os.remove(file_path)

            return JsonResponse({
                'status': 'success',
                'message': f'Successfully processed {len(questions_data)} questions',
                'questions': questions_data
            })

        except Exception as e:
            logger.error(f"Error processing file: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)

    def _extract_images(self, cell, question_id):
        """Extract images from a cell and save them"""
        image_paths = []
        try:
            # Create images directory if it doesn't exist
            images_dir = os.path.join(settings.MEDIA_ROOT, 'question_images')
            os.makedirs(images_dir, exist_ok=True)

            # Extract images from cell
            for i, shape in enumerate(cell._element.findall('.//w:drawing',
                {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'})):
                
                image_filename = f'question_{question_id}_image_{i+1}.png'
                image_path = os.path.join('question_images', image_filename)
                full_path = os.path.join(settings.MEDIA_ROOT, image_path)

                # Save image
                with open(full_path, 'wb') as img_file:
                    img_file.write(shape.blob)
                
                image_paths.append(image_path)

        except Exception as e:
            logger.error(f"Error extracting images: {str(e)}")

        return image_paths

# urls.py
