from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import warnings
import logging
import time

# Suppress bcrypt version warning
warnings.filterwarnings('ignore', message='.*error reading bcrypt version.*')
logging.getLogger('passlib.handlers.bcrypt').setLevel(logging.ERROR)

from config import settings
from database.session import init_db
from routes.router import api_router
from utils.error_handling import global_exception_handler, log_api_request
from utils.security import api_rate_limiter, get_client_identifier
from utils.api_docs import custom_openapi, setup_swagger_ui

app = FastAPI(title="AI Resume Ranking & Job Fit API", version="2.0.0")

# Set custom OpenAPI schema
app.openapi = lambda: custom_openapi(app)

# Setup Swagger UI
setup_swagger_ui(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add global exception handler
app.add_exception_handler(Exception, global_exception_handler)

# Add rate limiting middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    start_time = time.time()
    
    # Check rate limits
    client_id = get_client_identifier(request)
    allowed, rate_info = api_rate_limiter.is_allowed(client_id)
    
    if not allowed:
        return JSONResponse(
            status_code=429,
            content={
                "error": "Rate limit exceeded",
                "limit": rate_info['limit'],
                "reset_time": rate_info['reset_time']
            },
            headers={
                "X-RateLimit-Limit": str(rate_info['limit']),
                "X-RateLimit-Remaining": str(rate_info['remaining']),
                "X-RateLimit-Reset": str(rate_info['reset_time'])
            }
        )
    
    # Process request
    response = await call_next(request)
    
    # Log API request
    process_time = time.time() - start_time
    log_api_request(request, process_time)
    
    # Add rate limit headers
    response.headers["X-RateLimit-Limit"] = str(rate_info['limit'])
    response.headers["X-RateLimit-Remaining"] = str(rate_info['remaining'])
    response.headers["X-RateLimit-Reset"] = str(rate_info['reset_time'])
    
    return response


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}

@app.get("/api/metrics")
def get_metrics() -> dict:
    """Get system metrics and performance stats"""
    from utils.performance import performance_monitor, get_cache_stats
    from utils.security import session_manager
    
    # Clean up expired sessions
    session_manager.cleanup_expired_sessions()
    
    return {
        "performance": performance_monitor.get_all_stats(),
        "cache": get_cache_stats(),
        "security": {
            "active_sessions": len(session_manager.active_sessions)
        },
        "timestamp": time.time()
    }


app.include_router(api_router)
