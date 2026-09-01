from fastapi import APIRouter
 
from routes.auth_routes import router as auth_router
from routes.candidate_routes import router as candidate_router
from routes.company_routes import router as company_router
 
api_router = APIRouter(prefix="/api")
 
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(candidate_router, prefix="/candidate", tags=["candidate"])
api_router.include_router(company_router, prefix="/company", tags=["company"])
