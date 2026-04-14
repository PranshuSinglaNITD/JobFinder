import PyPDF2
import docx
import io

def extract_text(file_content: bytes, filename: str) -> str:
    """Extracts text from PDF, DOCX, or plain text files."""
    text = ""
    try:
        if filename.endswith(".pdf"):
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            for page in pdf_reader.pages:
                text += page.extract_text() or ""
        elif filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(file_content))
            for para in doc.paragraphs:
                text += para.text + "\n"
        else:
            text = file_content.decode("utf-8")
    except Exception as e:
        print(f"Error extracting text: {e}")
        return "" 
    return text