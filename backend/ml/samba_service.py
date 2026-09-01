import os
import httpx
from typing import Dict, List, Any
from config import settings

class SambaNovaService:
    def __init__(self):
        self.api_key = os.getenv("SAMBA_NOVA_API_KEY")
        self.base_url = "https://api.sambanova.ai/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def analyze_resume(self, resume_text: str, job_description: str = "") -> Dict[str, Any]:
        """Advanced resume analysis using SambaNova AI"""
        prompt = f"""
        Analyze this resume and provide detailed insights:
        
        RESUME:
        {resume_text}
        
        {"JOB DESCRIPTION:" + job_description if job_description else ""}
        
        Provide analysis in JSON format:
        {{
            "summary": "Brief professional summary",
            "key_skills": ["skill1", "skill2", ...],
            "experience_level": "Junior/Mid/Senior",
            "strengths": ["strength1", "strength2", ...],
            "improvement_areas": ["area1", "area2", ...],
            "personality_traits": ["trait1", "trait2", ...],
            "career_progression": "assessment of career growth",
            "technical_score": 85,
            "communication_score": 90,
            "leadership_potential": 75,
            "fit_score": 80
        }}
        """
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": "Meta-Llama-3.1-70B-Instruct",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 1000
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return self._parse_ai_response(result["choices"][0]["message"]["content"])
            else:
                return {"error": f"API Error: {response.status_code}"}
    
    async def generate_interview_questions(self, resume_text: str, job_description: str) -> List[str]:
        """Generate personalized interview questions"""
        prompt = f"""
        Based on this resume and job description, generate 10 personalized interview questions:
        
        RESUME:
        {resume_text}
        
        JOB DESCRIPTION:
        {job_description}
        
        Generate questions that test:
        1. Technical skills
        2. Problem solving abilities  
        3. Cultural fit
        4. Experience relevance
        5. Future potential
        
        Return as a JSON array of strings:
        ["question1", "question2", ...]
        """
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": "Meta-Llama-3.1-70B-Instruct",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.4,
                    "max_tokens": 800
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return self._parse_json_array(result["choices"][0]["message"]["content"])
            else:
                return ["Error generating questions"]
    
    async def optimize_resume(self, resume_text: str, target_job: str) -> Dict[str, Any]:
        """Optimize resume for specific job"""
        prompt = f"""
        Optimize this resume for the target job:
        
        CURRENT RESUME:
        {resume_text}
        
        TARGET JOB:
        {target_job}
        
        Provide optimization suggestions in JSON format:
        {{
            "optimized_summary": "Improved professional summary",
            "skills_to_highlight": ["skill1", "skill2", ...],
            "skills_to_add": ["skill1", "skill2", ...],
            "experience_improvements": ["suggestion1", "suggestion2", ...],
            "keyword_optimization": ["keyword1", "keyword2", ...],
            "formatting_tips": ["tip1", "tip2", ...],
            "ats_score_improvement": 15
        }}
        """
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": "Meta-Llama-3.1-70B-Instruct",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 1000
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return self._parse_ai_response(result["choices"][0]["message"]["content"])
            else:
                return {"error": "Failed to optimize resume"}
    
    async def predict_job_success(self, candidate_profile: str, job_requirements: str) -> Dict[str, Any]:
        """Predict candidate success probability"""
        prompt = f"""
        Predict job success probability based on candidate profile and job requirements:
        
        CANDIDATE PROFILE:
        {candidate_profile}
        
        JOB REQUIREMENTS:
        {job_requirements}
        
        Provide prediction in JSON format:
        {{
            "success_probability": 85,
            "technical_match": 90,
            "experience_match": 75,
            "cultural_fit": 80,
            "growth_potential": 88,
            "risk_factors": ["risk1", "risk2", ...],
            "recommendation": "Strong candidate with high potential",
            "onboarding_needs": ["need1", "need2", ...]
        }}
        """
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": "Meta-Llama-3.1-70B-Instruct",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2,
                    "max_tokens": 800
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return self._parse_ai_response(result["choices"][0]["message"]["content"])
            else:
                return {"error": "Failed to predict success"}
    
    def _parse_ai_response(self, response_text: str) -> Dict[str, Any]:
        """Parse AI response to extract JSON"""
        try:
            import json
            import re
            
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return {"error": "Could not parse AI response", "raw_response": response_text}
        except Exception as e:
            return {"error": f"Parse error: {str(e)}", "raw_response": response_text}
    
    def _parse_json_array(self, response_text: str) -> List[str]:
        """Parse AI response to extract JSON array"""
        try:
            import json
            import re
            
            # Extract JSON array from response
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return ["Error parsing questions"]
        except Exception as e:
            return [f"Parse error: {str(e)}"]

# Global instance
samba_service = SambaNovaService()
