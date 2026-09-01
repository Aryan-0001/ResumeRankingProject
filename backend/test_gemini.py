import asyncio
import sys
sys.path.append('.')

from ml.gemini_service import gemini_service

async def test_gemini():
    try:
        result = await gemini_service.predict_job_success(
            "Candidate: John Doe, Skills: Python, JavaScript, React",
            "Job: Senior React Developer, Skills: React, JavaScript, TypeScript"
        )
        print("✅ Gemini API working!")
        print(f"Result: {result}")
    except Exception as e:
        print(f"❌ Gemini API error: {e}")

if __name__ == "__main__":
    asyncio.run(test_gemini())
