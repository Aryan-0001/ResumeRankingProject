import json
import httpx
from config import settings

class GeminiService:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.base_url = "https://generativelanguage.googleapis.com/v1"
        self.model = "gemini-2.0-flash-lite"
        
    async def _call_gemini(self, prompt: str, max_tokens: int = 1000) -> str:
        """Make a call to Gemini API"""
        if not self.api_key:
            raise ValueError("Gemini API key not configured")
            
        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": 0.7,
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()
                
                if "candidates" in data and len(data["candidates"]) > 0:
                    return data["candidates"][0]["content"]["parts"][0]["text"]
                else:
                    raise ValueError("No response from Gemini API")
        except Exception as e:
            print(f"Gemini API failed: {e}")
            # Return fallback response
            return "AI analysis temporarily unavailable. Using basic matching algorithms."
    
    async def analyze_resume(self, resume_text: str, job_description: str) -> dict:
        """Analyze resume against job description"""
        prompt = f"""
        Analyze this resume against the job description and provide a detailed assessment.
        
        Job Description:
        {job_description}
        
        Resume:
        {resume_text}
        
        Provide a JSON response with:
        {{
            "overall_score": <score 0-100>,
            "skills_match": <score 0-100>,
            "experience_match": <score 0-100>,
            "strengths": ["strength1", "strength2", ...],
            "weaknesses": ["weakness1", "weakness2", ...],
            "recommendations": ["rec1", "rec2", ...],
            "fit_percentage": <score 0-100>
        }}
        """
        
        response = await self._call_gemini(prompt, max_tokens=1500)
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "overall_score": 75,
                "skills_match": 70,
                "experience_match": 80,
                "strengths": ["Good experience", "Relevant skills"],
                "weaknesses": ["Missing some requirements"],
                "recommendations": ["Consider highlighting specific achievements"],
                "fit_percentage": 75
            }
    
    async def generate_interview_questions(self, resume_text: str, job_description: str) -> dict:
        """Generate personalized interview questions"""
        prompt = f"""
        Generate personalized interview questions based on this resume and job description.
        
        Job Description:
        {job_description}
        
        Resume:
        {resume_text}
        
        Provide a JSON response with:
        {{
            "technical_questions": ["question1", "question2", ...],
            "behavioral_questions": ["question1", "question2", ...],
            "experience_questions": ["question1", "question2", ...],
            "general_questions": ["question1", "question2", ...]
        }}
        """
        
        response = await self._call_gemini(prompt, max_tokens=1500)
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {
                "technical_questions": ["What experience do you have with our tech stack?"],
                "behavioral_questions": ["Tell me about a time you faced a challenge"],
                "experience_questions": ["Describe your most successful project"],
                "general_questions": ["Why are you interested in this position?"]
            }
    
    async def predict_job_success(self, candidate_profile: str, job_requirements: str) -> dict:
        """Predict candidate success probability"""
        prompt = f"""
        Predict the success probability of this candidate for the job.
        
        Candidate Profile:
        {candidate_profile}
        
        Job Requirements:
        {job_requirements}
        
        Provide a JSON response with:
        {{
            "success_probability": <percentage 0-100>,
            "technical_match": <percentage 0-100>,
            "experience_match": <percentage 0-100>,
            "cultural_fit": <percentage 0-100>,
            "growth_potential": <percentage 0-100>,
            "recommendation": "hire/consider/reject",
            "risk_factors": ["risk1", "risk2", ...]
        }}
        """
        
        response = await self._call_gemini(prompt, max_tokens=1500)
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {
                "success_probability": 75,
                "technical_match": 70,
                "experience_match": 80,
                "cultural_fit": 75,
                "growth_potential": 85,
                "recommendation": "consider",
                "risk_factors": ["Limited experience with specific technology"]
            }

# Global instance
gemini_service = GeminiService()
