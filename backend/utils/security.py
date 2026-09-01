"""
Security utilities for rate limiting, input validation, and authentication
"""
import time
import hashlib
import secrets
from typing import Dict, Optional, Set
from datetime import datetime, timedelta
from fastapi import Request, HTTPException, status
from collections import defaultdict
import re

# Simple in-memory rate limiting store
_rate_limit_store: Dict[str, Dict[str, any]] = {}

class RateLimiter:
    """Simple rate limiting implementation"""
    
    def __init__(self, max_requests: int = 100, window_seconds: int = 3600):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
    
    def is_allowed(self, identifier: str) -> tuple[bool, Dict[str, int]]:
        """Check if request is allowed based on rate limit"""
        now = time.time()
        window_start = now - self.window_seconds
        
        # Clean up old entries
        if identifier in _rate_limit_store:
            _rate_limit_store[identifier]['requests'] = [
                req_time for req_time in _rate_limit_store[identifier]['requests']
                if req_time > window_start
            ]
        else:
            _rate_limit_store[identifier] = {'requests': []}
        
        # Check if under limit
        request_count = len(_rate_limit_store[identifier]['requests'])
        
        if request_count >= self.max_requests:
            return False, {
                'limit': self.max_requests,
                'remaining': 0,
                'reset_time': int(window_start + self.window_seconds)
            }
        
        # Add current request
        _rate_limit_store[identifier]['requests'].append(now)
        
        return True, {
            'limit': self.max_requests,
            'remaining': self.max_requests - request_count - 1,
            'reset_time': int(now + self.window_seconds)
        }

# Rate limiters for different endpoints
login_rate_limiter = RateLimiter(max_requests=5, window_seconds=900)  # 5 login attempts per 15 minutes
api_rate_limiter = RateLimiter(max_requests=1000, window_seconds=3600)  # 1000 requests per hour
upload_rate_limiter = RateLimiter(max_requests=10, window_seconds=3600)  # 10 uploads per hour

def get_client_identifier(request: Request) -> str:
    """Get client identifier for rate limiting"""
    # Try to get user ID from JWT token, fallback to IP
    client_ip = request.client.host if request.client else "unknown"
    
    # Check for API key or token in headers
    auth_header = request.headers.get("authorization")
    if auth_header:
        return f"token:{hashlib.md5(auth_header.encode()).hexdigest()[:16]}"
    
    return f"ip:{client_ip}"

def rate_limit_check(limiter: RateLimiter):
    """Decorator to check rate limits"""
    def decorator(func):
        def wrapper(request: Request, *args, **kwargs):
            identifier = get_client_identifier(request)
            allowed, info = limiter.is_allowed(identifier)
            
            if not allowed:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "error": "Rate limit exceeded",
                        "limit": info['limit'],
                        "reset_time": info['reset_time']
                    },
                    headers={
                        "X-RateLimit-Limit": str(info['limit']),
                        "X-RateLimit-Remaining": str(info['remaining']),
                        "X-RateLimit-Reset": str(info['reset_time'])
                    }
                )
            
            return func(request, *args, **kwargs)
        return wrapper
    return decorator

# Input validation and sanitization
class SecurityValidator:
    """Security validation utilities"""
    
    # Common SQL injection patterns
    SQL_INJECTION_PATTERNS = [
        r'(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)',
        r'(--|#|\/\*|\*\/)',
        r'(\b(or|and)\s+\d+\s*=\s*\d+)',
        r'(\b(or|and)\s+\'[^\']*\'\s*=\s*\'[^\']*\')',
        r'(\;\s*(drop|delete|update|insert)\b)',
    ]
    
    # XSS patterns
    XSS_PATTERNS = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'on\w+\s*=',
        r'<iframe[^>]*>',
        r'<object[^>]*>',
        r'<embed[^>]*>',
    ]
    
    @classmethod
    def check_sql_injection(cls, input_string: str) -> bool:
        """Check for SQL injection patterns"""
        input_lower = input_string.lower()
        for pattern in cls.SQL_INJECTION_PATTERNS:
            if re.search(pattern, input_lower, re.IGNORECASE):
                return True
        return False
    
    @classmethod
    def check_xss(cls, input_string: str) -> bool:
        """Check for XSS patterns"""
        for pattern in cls.XSS_PATTERNS:
            if re.search(pattern, input_string, re.IGNORECASE | re.DOTALL):
                return True
        return False
    
    @classmethod
    def validate_input(cls, input_string: str, max_length: int = 1000) -> Dict[str, any]:
        """Comprehensive input validation"""
        result = {
            'is_valid': True,
            'errors': [],
            'sanitized': input_string
        }
        
        # Length check
        if len(input_string) > max_length:
            result['errors'].append(f'Input exceeds maximum length of {max_length} characters')
            result['is_valid'] = False
        
        # SQL injection check
        if cls.check_sql_injection(input_string):
            result['errors'].append('Potentially dangerous SQL injection pattern detected')
            result['is_valid'] = False
        
        # XSS check
        if cls.check_xss(input_string):
            result['errors'].append('Potentially dangerous XSS pattern detected')
            result['is_valid'] = False
        
        # Basic sanitization
        sanitized = input_string
        # Remove HTML tags
        sanitized = re.sub(r'<[^>]+>', '', sanitized)
        # Remove excessive whitespace
        sanitized = re.sub(r'\s+', ' ', sanitized).strip()
        result['sanitized'] = sanitized
        
        return result

# JWT token security
class TokenSecurity:
    """JWT token security utilities"""
    
    @staticmethod
    def generate_secure_token(length: int = 32) -> str:
        """Generate cryptographically secure random token"""
        return secrets.token_urlsafe(length)
    
    @staticmethod
    def hash_token(token: str) -> str:
        """Hash token for secure storage"""
        return hashlib.sha256(token.encode()).hexdigest()
    
    @staticmethod
    def verify_token_strength(token: str) -> bool:
        """Verify token has sufficient entropy"""
        return len(token) >= 32 and not token.isalnum()

# File upload security
class FileSecurity:
    """File upload security utilities"""
    
    ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.doc'}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    DANGEROUS_EXTENSIONS = {
        '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', 
        '.jar', '.app', '.deb', '.pkg', '.dmg', '.rpm', '.sh'
    }
    
    @classmethod
    def validate_file_upload(cls, filename: str, file_size: int, content_type: str) -> Dict[str, any]:
        """Validate uploaded file for security"""
        result = {
            'is_valid': True,
            'errors': []
        }
        
        # Check file extension
        file_ext = '.' + filename.split('.')[-1].lower() if '.' in filename else ''
        
        if file_ext not in cls.ALLOWED_EXTENSIONS:
            result['errors'].append(f'File type {file_ext} not allowed')
            result['is_valid'] = False
        
        if file_ext in cls.DANGEROUS_EXTENSIONS:
            result['errors'].append('Dangerous file type detected')
            result['is_valid'] = False
        
        # Check file size
        if file_size > cls.MAX_FILE_SIZE:
            result['errors'].append(f'File size exceeds maximum allowed size of {cls.MAX_FILE_SIZE} bytes')
            result['is_valid'] = False
        
        # Basic content type validation
        expected_types = {
            '.pdf': 'application/pdf',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.doc': 'application/msword'
        }
        
        if file_ext in expected_types and content_type != expected_types[file_ext]:
            result['errors'].append(f'Content type {content_type} does not match file extension {file_ext}')
            result['is_valid'] = False
        
        return result

# Session security
class SessionSecurity:
    """Session management security"""
    
    def __init__(self):
        self.active_sessions: Dict[str, Dict[str, any]] = {}
        self.session_timeout = 3600  # 1 hour
    
    def create_session(self, user_id: int, user_role: str) -> str:
        """Create secure session"""
        session_id = secrets.token_urlsafe(32)
        self.active_sessions[session_id] = {
            'user_id': user_id,
            'user_role': user_role,
            'created_at': time.time(),
            'last_activity': time.time()
        }
        return session_id
    
    def validate_session(self, session_id: str) -> Optional[Dict[str, any]]:
        """Validate session and update activity"""
        if session_id not in self.active_sessions:
            return None
        
        session = self.active_sessions[session_id]
        
        # Check timeout
        if time.time() - session['last_activity'] > self.session_timeout:
            del self.active_sessions[session_id]
            return None
        
        # Update last activity
        session['last_activity'] = time.time()
        return session
    
    def revoke_session(self, session_id: str) -> bool:
        """Revoke session"""
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]
            return True
        return False
    
    def cleanup_expired_sessions(self):
        """Clean up expired sessions"""
        now = time.time()
        expired_sessions = [
            sid for sid, session in self.active_sessions.items()
            if now - session['last_activity'] > self.session_timeout
        ]
        
        for sid in expired_sessions:
            del self.active_sessions[sid]

# Global session manager
session_manager = SessionSecurity()

# Authentication decorators
def require_role(required_role: str):
    """Decorator to require specific user role"""
    def decorator(func):
        def wrapper(request: Request, *args, **kwargs):
            # This would integrate with your JWT authentication
            # For now, it's a placeholder
            return func(request, *args, **kwargs)
        return wrapper
    return decorator
