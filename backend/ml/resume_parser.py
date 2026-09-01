import re
from typing import Dict, List, Optional

def extract_contact_info(text: str) -> Dict[str, str]:
    """Extract name, email, phone, LinkedIn, GitHub from resume text"""
    contact = {}
    
    # Email extraction
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    if emails:
        contact['email'] = emails[0]
    
    # Phone extraction
    phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    phones = re.findall(phone_pattern, text)
    if phones:
        contact['phone'] = phones[0]
    
    # LinkedIn extraction
    linkedin_pattern = r'linkedin\.com/in/[\w-]+'
    linkedin_matches = re.findall(linkedin_pattern, text, re.IGNORECASE)
    if linkedin_matches:
        contact['linkedin'] = f"https://{linkedin_matches[0]}"
    
    # GitHub extraction
    github_pattern = r'github\.com/[\w-]+'
    github_matches = re.findall(github_pattern, text, re.IGNORECASE)
    if github_matches:
        contact['github'] = f"https://{github_matches[0]}"
    
    # Name extraction (simplified - usually first line or before contact info)
    lines = text.split('\n')
    for line in lines[:5]:  # Check first 5 lines
        line = line.strip()
        if line and len(line.split()) <= 4 and not re.search(r'\d', line):
            if not any(keyword in line.lower() for keyword in ['resume', 'cv', 'experience', 'education']):
                contact['name'] = line
                break
    
    return contact

def extract_education(text: str) -> List[str]:
    """Extract education information"""
    education_keywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college', 'institute']
    education = []
    
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if any(keyword in line.lower() for keyword in education_keywords):
            # Get current line and next 2 lines for context
            edu_text = ' '.join(lines[i:i+3]).strip()
            if len(edu_text) > 10:
                education.append(edu_text)
    
    return education[:3]  # Return top 3 education entries

def extract_experience(text: str) -> List[str]:
    """Extract work experience"""
    experience_keywords = ['experience', 'work', 'job', 'position', 'role', 'company']
    experience = []
    
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if any(keyword in line.lower() for keyword in experience_keywords):
            # Get current line and next 3 lines for context
            exp_text = ' '.join(lines[i:i+4]).strip()
            if len(exp_text) > 15:
                experience.append(exp_text)
    
    return experience[:5]  # Return top 5 experience entries

def extract_projects(text: str) -> List[str]:
    """Extract project information"""
    project_keywords = ['project', 'developed', 'built', 'created', 'designed']
    projects = []
    
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if any(keyword in line.lower() for keyword in project_keywords):
            # Get current line and next 2 lines for context
            proj_text = ' '.join(lines[i:i+3]).strip()
            if len(proj_text) > 20:
                projects.append(proj_text)
    
    return projects[:5]  # Return top 5 projects

def extract_skills_from_text(text: str) -> List[str]:
    """Extract skills from resume text"""
    # Common tech skills
    tech_skills = [
        'python', 'java', 'javascript', 'react', 'node.js', 'angular', 'vue.js',
        'html', 'css', 'sql', 'mongodb', 'postgresql', 'mysql', 'aws', 'azure',
        'docker', 'kubernetes', 'git', 'linux', 'windows', 'machine learning',
        'data science', 'ai', 'deep learning', 'tensorflow', 'pytorch', 'nlp',
        'computer vision', 'devops', 'ci/cd', 'agile', 'scrum', 'rest api',
        'graphql', 'microservices', 'django', 'flask', 'fastapi', 'spring',
        'bootstrap', 'tailwind', 'jquery', 'typescript', 'c++', 'c#', '.net',
        'php', 'ruby', 'swift', 'kotlin', 'scala', 'go', 'rust', 'matlab'
    ]
    
    # Medical skills
    medical_skills = [
        'patient care', 'medical diagnosis', 'surgery', 'anatomy', 'physiology',
        'pharmacology', 'medical records', 'hipaa', 'cpr', 'first aid',
        'medical terminology', 'clinical research', 'healthcare', 'nursing',
        'medicine', 'treatment', 'diagnosis', 'therapy', 'rehabilitation'
    ]
    
    # Transport skills
    transport_skills = [
        'logistics', 'supply chain', 'warehouse', 'inventory', 'shipping',
        'transportation', 'fleet management', 'routing', 'delivery', 'distribution',
        'freight', 'cargo', 'import', 'export', 'customs', 'compliance'
    ]
    
    all_skills = tech_skills + medical_skills + transport_skills
    
    found_skills = []
    text_lower = text.lower()
    
    for skill in all_skills:
        if skill in text_lower:
            found_skills.append(skill)
    
    return list(set(found_skills))  # Remove duplicates

def parse_resume(text: str) -> Dict:
    """Parse resume and extract all information"""
    return {
        'contact': extract_contact_info(text),
        'education': extract_education(text),
        'experience': extract_experience(text),
        'projects': extract_projects(text),
        'skills': extract_skills_from_text(text)
    }
