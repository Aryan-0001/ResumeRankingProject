"""
API Documentation and Swagger UI configuration
"""
from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from typing import Dict, Any

def custom_openapi(app: FastAPI) -> Dict[str, Any]:
    """Generate custom OpenAPI schema with enhanced documentation"""
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="AI Resume Ranking & Job Fit API",
        version="2.0.0",
        description="""
        ## AI Resume Ranking & Job Fit Prediction System
        
        A comprehensive recruitment platform that leverages AI and machine learning to:
        - Parse and analyze resumes from PDF/DOCX files
        - Rank candidates based on job fit using semantic similarity
        - Predict job fit percentages with explainable AI
        - Provide role-based access for candidates and companies
        
        ### Key Features
        - **Resume Parsing**: Extract text, skills, education, and experience from resumes
        - **Semantic Ranking**: Use TF-IDF and BERT embeddings for intelligent matching
        - **Fit Prediction**: Machine learning models for job compatibility scoring
        - **Role-based Access**: Separate dashboards for candidates and companies
        - **Real-time Analytics**: Performance metrics and system monitoring
        
        ### Authentication
        The API uses JWT tokens for authentication. Include the token in the Authorization header:
        `Authorization: Bearer <your-jwt-token>`
        
        ### Rate Limiting
        - General API: 1000 requests per hour
        - Login attempts: 5 requests per 15 minutes
        - File uploads: 10 uploads per hour
        
        ### Error Handling
        All errors follow a consistent format:
        ```json
        {
          "error": "Error description",
          "error_code": "ERROR_CODE",
          "details": {},
          "timestamp": "2024-01-01T00:00:00Z"
        }
        ```
        """,
        routes=app.routes,
    )
    
    # Add custom schemas and examples
    openapi_schema["components"]["schemas"].update({
        "UserRegister": {
            "type": "object",
            "properties": {
                "email": {
                    "type": "string",
                    "format": "email",
                    "description": "User email address",
                    "example": "john.doe@example.com"
                },
                "password": {
                    "type": "string",
                    "minLength": 8,
                    "description": "Password (min 8 characters, must include uppercase, lowercase, and digit)",
                    "example": "SecurePass123!"
                },
                "role": {
                    "type": "string",
                    "enum": ["candidate", "company"],
                    "description": "User role"
                }
            },
            "required": ["email", "password", "role"]
        },
        "UserLogin": {
            "type": "object",
            "properties": {
                "email": {
                    "type": "string",
                    "format": "email",
                    "description": "User email address",
                    "example": "john.doe@example.com"
                },
                "password": {
                    "type": "string",
                    "description": "User password",
                    "example": "SecurePass123!"
                }
            },
            "required": ["email", "password"]
        },
        "JobPost": {
            "type": "object",
            "properties": {
                "job_title": {
                    "type": "string",
                    "description": "Job title",
                    "example": "Senior Software Engineer"
                },
                "job_description": {
                    "type": "string",
                    "description": "Detailed job description",
                    "example": "We are looking for a senior software engineer with experience in Python, React, and cloud technologies..."
                },
                "required_skills": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of required skills",
                    "example": ["Python", "React", "AWS", "Docker"]
                }
            },
            "required": ["job_title", "job_description", "required_skills"]
        },
        "CandidateProfile": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "Candidate's full name",
                    "example": "John Doe"
                },
                "skills": {
                    "type": "string",
                    "description": "Candidate's skills (comma-separated)",
                    "example": "Python, React, Machine Learning, AWS"
                },
                "education": {
                    "type": "string",
                    "description": "Education details",
                    "example": "Bachelor's in Computer Science from MIT"
                },
                "experience": {
                    "type": "string",
                    "description": "Work experience details",
                    "example": "3 years of software development experience"
                }
            }
        },
        "CompanyProfile": {
            "type": "object",
            "properties": {
                "company_name": {
                    "type": "string",
                    "description": "Company name",
                    "example": "Tech Solutions Inc."
                },
                "description": {
                    "type": "string",
                    "description": "Company description",
                    "example": "A leading technology company specializing in AI solutions"
                }
            }
        },
        "Application": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "integer",
                    "description": "Application ID"
                },
                "candidate_id": {
                    "type": "integer",
                    "description": "Candidate ID"
                },
                "job_id": {
                    "type": "integer",
                    "description": "Job ID"
                },
                "resume_score": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 100,
                    "description": "Resume similarity score (0-100)"
                },
                "fit_percentage": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 100,
                    "description": "Job fit percentage (0-100)"
                },
                "status": {
                    "type": "string",
                    "enum": ["applied", "shortlisted", "rejected"],
                    "description": "Application status"
                },
                "created_at": {
                    "type": "string",
                    "format": "date-time",
                    "description": "Application creation timestamp"
                }
            }
        },
        "Error": {
            "type": "object",
            "properties": {
                "error": {
                    "type": "string",
                    "description": "Error message"
                },
                "error_code": {
                    "type": "string",
                    "description": "Machine-readable error code"
                },
                "details": {
                    "type": "object",
                    "description": "Additional error details"
                },
                "timestamp": {
                    "type": "string",
                    "format": "date-time",
                    "description": "Error timestamp"
                }
            }
        },
        "Success": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "example": "success"
                },
                "message": {
                    "type": "string",
                    "description": "Success message"
                },
                "data": {
                    "type": "object",
                    "description": "Response data"
                },
                "timestamp": {
                    "type": "string",
                    "format": "date-time",
                    "description": "Response timestamp"
                },
                "meta": {
                    "type": "object",
                    "description": "Additional metadata"
                }
            }
        }
    })
    
    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT authentication token"
        }
    }
    
    # Add global security
    openapi_schema["security"] = [{"BearerAuth": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

def setup_swagger_ui(app: FastAPI):
    """Setup custom Swagger UI"""
    
    @app.get("/docs", include_in_schema=False)
    async def custom_swagger_ui_html():
        return get_swagger_ui_html(
            openapi_url=app.openapi_url,
            title=app.title + " - API Documentation",
            oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
            swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
            swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
            swagger_ui_parameters={
                "deepLinking": True,
                "displayRequestDuration": True,
                "docExpansion": "none",
                "operationsSorter": "alpha",
                "filter": True,
                "showExtensions": True,
                "showCommonExtensions": True,
                "tryItOutEnabled": True
            }
        )
    
    # Add ReDoc documentation
    @app.get("/redoc", include_in_schema=False)
    async def redoc_html():
        from fastapi.responses import HTMLResponse
        
        return HTMLResponse("""
        <!DOCTYPE html>
        <html>
        <head>
            <title>AI Resume Ranking API - ReDoc</title>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
            <style>
                body { margin: 0; padding: 0; }
                redoc { height: 100vh; }
            </style>
        </head>
        <body>
            <redoc spec-url="/openapi.json"></redoc>
            <script src="https://cdn.jsdelivr.net/npm/redoc@2.0.0/bundles/redoc.standalone.js"></script>
        </body>
        </html>
        """)

# API endpoint examples and documentation
def add_api_examples():
    """Add detailed examples for API endpoints"""
    return {
        "auth": {
            "register": {
                "summary": "Register a new user",
                "description": "Create a new user account with either candidate or company role",
                "request_body": {
                    "content": {
                        "application/json": {
                            "example": {
                                "email": "john.doe@example.com",
                                "password": "SecurePass123!",
                                "role": "candidate"
                            }
                        }
                    }
                },
                "responses": {
                    "201": {
                        "description": "User successfully registered",
                        "content": {
                            "application/json": {
                                "example": {
                                    "message": "User registered successfully",
                                    "user_id": 123
                                }
                            }
                        }
                    }
                }
            },
            "login": {
                "summary": "Authenticate user",
                "description": "Login with email and password to receive JWT token",
                "request_body": {
                    "content": {
                        "application/json": {
                            "example": {
                                "email": "john.doe@example.com",
                                "password": "SecurePass123!"
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Login successful",
                        "content": {
                            "application/json": {
                                "example": {
                                    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                                    "token_type": "bearer",
                                    "expires_in": 7200
                                }
                            }
                        }
                    }
                }
            }
        },
        "candidate": {
            "upload_resume": {
                "summary": "Upload resume file",
                "description": "Upload and parse a resume file (PDF or DOCX)",
                "request_body": {
                    "content": {
                        "multipart/form-data": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "file": {
                                        "type": "string",
                                        "format": "binary"
                                    }
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Resume uploaded and parsed successfully",
                        "content": {
                            "application/json": {
                                "example": {
                                    "message": "Resume uploaded successfully",
                                    "extracted_text": "John Doe\nSoftware Engineer...",
                                    "skills": ["Python", "React", "AWS"],
                                    "parsed_data": {
                                        "name": "John Doe",
                                        "email": "john.doe@example.com",
                                        "skills": ["Python", "React", "AWS"],
                                        "education": "Bachelor's in Computer Science",
                                        "experience": "3 years"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "company": {
            "post_job": {
                "summary": "Post a new job",
                "description": "Create a new job posting",
                "request_body": {
                    "content": {
                        "application/json": {
                            "example": {
                                "job_title": "Senior Software Engineer",
                                "job_description": "We are looking for a senior software engineer with experience in Python, React, and cloud technologies...",
                                "required_skills": ["Python", "React", "AWS", "Docker"]
                            }
                        }
                    }
                },
                "responses": {
                    "201": {
                        "description": "Job posted successfully",
                        "content": {
                            "application/json": {
                                "example": {
                                    "id": 456,
                                    "job_title": "Senior Software Engineer",
                                    "job_description": "We are looking for a senior software engineer...",
                                    "required_skills": ["Python", "React", "AWS", "Docker"],
                                    "company_id": 789,
                                    "created_at": "2024-01-01T12:00:00Z"
                                }
                            }
                        }
                    }
                }
            }
        }
    }
