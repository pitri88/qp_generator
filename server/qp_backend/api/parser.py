import os
import json
import docx
from lxml import etree
import logging
from .models import Question, QuestionMedia, Course, Unit
from django.conf import settings
from django.db import transaction

# Configure logging
logging.basicConfig(level=logging.INFO)

class EquationHandler:
    @staticmethod
    def extract_equations(cell) -> list:
        equations = []
        try:
            math_elements = cell._element.findall('.//m:oMath', 
                namespaces={'m': 'http://schemas.openxmlformats.org/officeDocument/2006/math'})
            for math_elem in math_elements:
                mathml_str = etree.tostring(math_elem, pretty_print=True).decode('utf-8')
                text_repr = ' '.join(math_elem.xpath('.//m:t/text()', 
                    namespaces={'m': 'http://schemas.openxmlformats.org/officeDocument/2006/math'}))
                equations.append({
                    'mathml': mathml_str,
                    'text': text_repr,
                    'latex': "Latex conversion not implemented for MathML"
                })
        except Exception as e:
            logging.error(f"Error extracting equations: {e}")
        return equations

class QuestionPaperParser:
    @staticmethod
    def get_images_from_cell(cell, doc):
        images = []
        try:
            drawings = cell._element.findall('.//w:drawing',
                namespaces={'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
                           'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'})
            
            for drawing in drawings:
                blip = drawing.find('.//a:blip',
                    namespaces={'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'})
                if blip is not None:
                    embed = blip.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
                    if embed:
                        # Get the image data
                        rel = doc.part.rels[embed]
                        image_bytes = rel.target_part.blob
                        images.append(image_bytes)
        except Exception as e:
            logging.error(f"Error extracting images: {e}")
        return images

    @staticmethod
    def parse_docx(file_path, course_id):
        questions = []
        try:
            doc = docx.Document(file_path)
            course = Course.objects.get(course_id=course_id)

            with transaction.atomic():  # Use transaction to ensure data consistency
                for table in doc.tables:
                    for i, row in enumerate(table.rows[1:], 1):
                        try:
                            cells = row.cells
                            if len(cells) < 7:
                                logging.warning(f"Skipping row {i} due to insufficient cells")
                                continue
                            
                            question_text = cells[1].text.strip()
                            equations = EquationHandler.extract_equations(cells[1])
                            images_in_cell = QuestionPaperParser.get_images_from_cell(cells[2], doc)

                            # Get or create the unit
                            unit_number = int(cells[4].text.strip())
                            unit, created = Unit.objects.get_or_create(
                                unit_id=unit_number,
                                course_id=course,
                                defaults={'unit_name': f'Unit {unit_number}'}
                            )

                            # Create question first to get its ID
                            question = Question.objects.create(
                                unit_id=unit,
                                course_id=course,
                                text=question_text,
                                co=cells[5].text.strip(),
                                bt=cells[6].text.strip(),
                                marks=int(cells[3].text.strip()),
                                difficulty_level='Easy',  
                                tags={},  
                            )

                            # Now use question ID for image filenames
                            image_paths = []
                            for idx, image_bytes in enumerate(images_in_cell, 1):
                                os.makedirs("images", exist_ok=True)
                                temp_filename = f"question_{question.q_id}_{idx}.png"
                                temp_path = os.path.join("images", temp_filename)
                                
                                with open(temp_path, "wb") as img_file:
                                    img_file.write(image_bytes)
                                
                                image_paths.append(temp_path)
                            
                            question_media = QuestionMedia.objects.create(
                                question_id=question,
                                image_paths=image_paths if image_paths else None,
                                equations=equations if equations else None
                            )

                            questions.append(question)
                        except Exception as row_error:
                            logging.error(f"Error processing row {i}: {row_error}")
                            continue  # Continue with next row instead of failing entire batch
            return questions
        except Exception as e:
            logging.error(f"Error parsing DOCX file: {e}")
            return []

def upload_questions(file_path, course_id):
    return QuestionPaperParser.parse_docx(file_path, course_id)