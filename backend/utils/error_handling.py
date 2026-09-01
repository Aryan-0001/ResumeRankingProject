"""
Enhanced error handling and logging utilities
"""
import logging
import traceback
import sys
from datetime import datetime
from typing import Any, Dict, Optional
from functools import wraps
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

# Configure enhanced logging
import os
log_dir = 'logs'
os.makedirs(log_dir, exist_ok=True)
log_file = os.path.join(log_dir, 'app.log')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

class AppException(Exception):
    """Base application exception"""
    def __init__(self, message: str, error_code: str = None, details: Dict[str, Any] = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)

class DatabaseException(AppException):
    """Database related exceptions"""
    pass

class MLServiceException(AppException):
    """ML service related exceptions"""
    pass

class AuthenticationException(AppException):
    """Authentication related exceptions"""
    pass

class ValidationException(AppException):
    """Validation related exceptions"""
    pass

def handle_exceptions(func):
    """Decorator to handle exceptions and log them"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except AppException as e:
            logger.error(f"Application error in {func.__name__}: {e.message}", extra={
                'error_code': e.error_code,
                'details': e.details,
                'traceback': traceback.format_exc()
            })
            raise HTTPException(
                status_code=400,
                detail={
                    "error": e.message,
                    "error_code": e.error_code,
                    "details": e.details
                }
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {str(e)}", extra={
                'traceback': traceback.format_exc()
            })
            raise HTTPException(
                status_code=500,
                detail="Internal server error"
            )
    return wrapper

async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for FastAPI"""
    logger.error(f"Global exception handler: {str(exc)}", extra={
        'url': str(request.url),
        'method': request.method,
        'traceback': traceback.format_exc()
    })
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path)
        }
    )

def log_api_request(request: Request, response_time: float = None):
    """Log API request details"""
    log_data = {
        'method': request.method,
        'url': str(request.url),
        'client_ip': request.client.host if request.client else None,
        'user_agent': request.headers.get('user-agent'),
        'timestamp': datetime.utcnow().isoformat()
    }
    
    if response_time is not None:
        log_data['response_time_ms'] = round(response_time * 1000, 2)
    
    logger.info(f"API Request: {request.method} {request.url}", extra=log_data)

def log_user_action(user_id: Optional[int], action: str, details: Dict[str, Any] = None):
    """Log user actions for audit trail"""
    log_data = {
        'user_id': user_id,
        'action': action,
        'timestamp': datetime.utcnow().isoformat(),
        'details': details or {}
    }
    
    logger.info(f"User Action: {action}", extra=log_data)

def log_ml_operation(operation: str, input_size: int, output_size: int = None, execution_time: float = None):
    """Log ML operations for monitoring"""
    log_data = {
        'operation': operation,
        'input_size': input_size,
        'output_size': output_size,
        'execution_time_ms': round(execution_time * 1000, 2) if execution_time else None,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    logger.info(f"ML Operation: {operation}", extra=log_data)

def log_database_operation(operation: str, table: str, record_count: int = None, execution_time: float = None):
    """Log database operations for monitoring"""
    log_data = {
        'operation': operation,
        'table': table,
        'record_count': record_count,
        'execution_time_ms': round(execution_time * 1000, 2) if execution_time else None,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    logger.info(f"DB Operation: {operation} on {table}", extra=log_data)

# Error response utilities
def create_error_response(message: str, error_code: str = None, status_code: int = 400, details: Dict[str, Any] = None):
    """Create standardized error response"""
    return {
        "error": message,
        "error_code": error_code,
        "status": status_code,
        "timestamp": datetime.utcnow().isoformat(),
        "details": details or {}
    }

def create_success_response(data: Any = None, message: str = "Success", meta: Dict[str, Any] = None):
    """Create standardized success response"""
    return {
        "status": "success",
        "message": message,
        "data": data,
        "timestamp": datetime.utcnow().isoformat(),
        "meta": meta or {}
    }

# Validation utilities
def validate_email(email: str) -> bool:
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password_strength(password: str) -> Dict[str, Any]:
    """Validate password strength"""
    result = {
        'is_valid': True,
        'errors': [],
        'score': 0
    }
    
    if len(password) < 8:
        result['errors'].append('Password must be at least 8 characters long')
        result['is_valid'] = False
    else:
        result['score'] += 1
    
    if not any(c.isupper() for c in password):
        result['errors'].append('Password must contain at least one uppercase letter')
        result['is_valid'] = False
    else:
        result['score'] += 1
    
    if not any(c.islower() for c in password):
        result['errors'].append('Password must contain at least one lowercase letter')
        result['is_valid'] = False
    else:
        result['score'] += 1
    
    if not any(c.isdigit() for c in password):
        result['errors'].append('Password must contain at least one digit')
        result['is_valid'] = False
    else:
        result['score'] += 1
    
    return result

def sanitize_input(text: str) -> str:
    """Sanitize user input to prevent injection attacks"""
    import re
    # Remove potentially harmful characters
    text = re.sub(r'[<>"\']', '', text)
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text
