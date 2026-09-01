import json
import httpx
from typing import Dict, List, Any
from config import settings

class AdvancedAIService:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        self.model = "gemini-2.0-flash-lite"
        
    async def _call_gemini(self, prompt: str, max_tokens: int = 2000) -> str:
        """Make a call to Gemini API"""
        if not self.api_key:
            raise ValueError("Gemini API key not configured")
            
        url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
        
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
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            if "candidates" in data and len(data["candidates"]) > 0:
                return data["candidates"][0]["content"]["parts"][0]["text"]
            else:
                raise ValueError("No response from Gemini API")
    
    async def comprehensive_candidate_analysis(self, resume_text: str, job_description: str, company_info: str = "") -> Dict[str, Any]:
        """Ultra-comprehensive candidate analysis"""
        prompt = f"""
        Perform an exhaustive analysis of this candidate for the position. Consider all aspects:
        
        RESUME:
        {resume_text}
        
        JOB DESCRIPTION:
        {job_description}
        
        COMPANY CONTEXT:
        {company_info}
        
        Provide comprehensive analysis in JSON format:
        {{
            "executive_summary": "High-level candidate overview",
            "technical_proficiency": {{
                "overall_score": 85,
                "core_technologies": ["tech1", "tech2"],
                "emerging_technologies": ["tech3", "tech4"],
                "technical_debt_areas": ["area1", "area2"],
                "learning_capability": "High/Medium/Low",
                "problem_solving_approach": "analytical/creative/hybrid"
            }},
            "experience_analysis": {{
                "years_relevant_experience": 5.2,
                "industry_alignment": 90,
                "role_complexity_handling": "Junior/Mid/Senior/Lead",
                "achievement_impact": ["achievement1", "achievement2"],
                "career_progression": "consistent/rapid/plateaued/transitional"
            }},
            "soft_skills_assessment": {{
                "communication": 85,
                "leadership": 75,
                "teamwork": 90,
                "adaptability": 80,
                "problem_solving": 88,
                "emotional_intelligence": 82,
                "time_management": 78,
                "conflict_resolution": 76
            }},
            "cultural_fit_analysis": {{
                "work_style_preference": "collaborative/individual/hybrid",
                "company_values_alignment": 85,
                "team_dynamics_fit": "integrator/leader/specialist",
                "innovation_appetite": "conservative/moderate/aggressive",
                "growth_mindset": "fixed/growth/hybrid"
            }},
            "predictive_indicators": {{
                "success_probability": 87,
                "retention_likelihood": 78,
                "promotion_timeline": "12-18 months",
                "team_impact_score": 82,
                "innovation_potential": 75
            }},
            "development_needs": {{
                "skill_gaps": ["gap1", "gap2"],
                "training_recommendations": ["training1", "training2"],
                "mentorship_areas": ["area1", "area2"],
                "onboarding_focus": ["focus1", "focus2"]
            }},
            "compensation_analysis": {{
                "market_range": "$80k-$120k",
                "recommended_offer": "$95k",
                "negotiation_leverage": "medium/high/low",
                "total_compensation_breakdown": {{
                    "base_percentage": 70,
                    "bonus_percentage": 20,
                    "equity_percentage": 10
                }}
            }},
            "interview_strategy": {{
                "key_areas_to_probe": ["area1", "area2"],
                "red_flags_to_watch": ["flag1", "flag2"],
                "strengths_to_validate": ["strength1", "strength2"],
                "cultural_fit_questions": ["question1", "question2"]
            }},
            "team_compatibility": {{
                "best_team_types": ["type1", "type2"],
                "potential_conflicts": ["conflict1", "conflict2"],
                "collaboration_style": "facilitator/contributor/leader",
                "knowledge_sharing_propensity": "high/medium/low"
            }}
        }}
        """
        
        response = await self._call_gemini(prompt, max_tokens=2000)
        return self._parse_ai_response(response)
            
    
    async def market_intelligence_analysis(self, job_description: str, location: str = "", industry: str = "") -> Dict[str, Any]:
        """Market intelligence for job positioning"""
        prompt = f"""
        Provide comprehensive market intelligence for this position:
        
        JOB DESCRIPTION:
        {job_description}
        
        LOCATION: {location}
        INDUSTRY: {industry}
        
        Provide market analysis in JSON format:
        {{
            "talent_market_analysis": {{
                "candidate_supply": "abundant/moderate/scarce",
                "competition_level": "low/medium/high",
                "time_to_fill_estimate": "2-4 weeks",
                "market_saturation": 65
            }},
            "compensation_intelligence": {{
                "market_median": "$95,000",
                "market_range": ["$80,000", "$120,000"],
                "top_quartile": "$110,000",
                "geographic_adjustment": 1.15,
                "industry_premium": 1.08,
                "skill_premiums": {{
                    "skill1": 1.12,
                    "skill2": 1.08
                }}
            }},
            "skill_demand_trends": {{
                "growing_skills": ["skill1", "skill2"],
                "declining_skills": ["skill3", "skill4"],
                "stable_skills": ["skill5", "skill6"],
                "emerging_skills": ["skill7", "skill8"]
            }},
            "competitor_analysis": {{
                "similar_companies": ["company1", "company2"],
                "compensation_comparison": {{
                    "company1": "$92k",
                    "company2": "$98k"
                }},
                "benefits_comparison": {{
                    "remote_work": "standard/advanced/limited",
                    "health_benefits": "standard/premium/basic"
                }}
            }},
            "hiring_strategy": {{
                "optimal_sourcing_channels": ["channel1", "channel2"],
                "best_hiring_timeline": "6-8 weeks",
                "interview_process_optimization": ["opt1", "opt2"],
                "candidate_attraction_strategies": ["strategy1", "strategy2"]
            }}
        }}
        """
        
        response = await self._call_gemini(prompt, max_tokens=1500)
        return self._parse_ai_response(response)
    
    async def career_path_orchestrator(self, candidate_profile: str, current_role: str, target_role: str, timeline_months: int = 24) -> Dict[str, Any]:
        """AI-powered career path planning"""
        prompt = f"""
        Create a comprehensive career development plan:
        
        CURRENT PROFILE:
        {candidate_profile}
        
        CURRENT ROLE: {current_role}
        TARGET ROLE: {target_role}
        TIMELINE: {timeline_months} months
        
        Provide career roadmap in JSON format:
        {{
            "feasibility_assessment": {{
                "achievement_probability": 75,
                "timeline_realism": "aggressive/realistic/conservative",
                "skill_gap_severity": "low/medium/high",
                "market_demand_alignment": 85
            }},
            "skill_development_roadmap": {{
                "critical_skills": [
                    {{
                        "skill": "skill_name",
                        "current_level": 3,
                        "target_level": 7,
                        "learning_resources": ["resource1", "resource2"],
                        "practice_projects": ["project1", "project2"],
                        "estimated_timeline": "3-4 months",
                        "difficulty": "medium"
                    }}
                ],
                "supporting_skills": [
                    {{
                        "skill": "skill_name",
                        "priority": "medium",
                        "learning_approach": "self-paced/structured/mentored"
                    }}
                ]
            }},
            "experience_building_plan": {{
                "internal_opportunities": ["opportunity1", "opportunity2"],
                "external_projects": ["project1", "project2"],
                "networking_targets": ["target1", "target2"],
                "certification_recommendations": ["cert1", "cert2"],
                "speaking_engagements": ["engagement1", "engagement2"]
            }},
            "milestone_timeline": [
                {{
                    "month": 3,
                    "milestone": "milestone_description",
                    "success_metrics": ["metric1", "metric2"],
                    "checkpoint_activities": ["activity1", "activity2"]
                }}
            ],
            "compensation_projection": {{
                "current_salary": "$80,000",
                "target_salary": "$120,000",
                "intermediate_milestones": [
                    {{"month": 6, "projected_salary": "$85,000"}},
                    {{"month": 12, "projected_salary": "$95,000"}},
                    {{"month": 18, "projected_salary": "$110,000"}}
                ]
            }},
            "risk_mitigation": {{
                "potential_obstacles": ["obstacle1", "obstacle2"],
                "contingency_plans": ["plan1", "plan2"],
                "alternative_paths": ["path1", "path2"],
                "skill_backup_options": ["option1", "option2"]
            }},
            "success_indicators": {{
                "quantitative_metrics": ["metric1", "metric2"],
                "qualitative_indicators": ["indicator1", "indicator2"],
                "validation_methods": ["method1", "method2"]
            }}
        }}
        """
        
        response = await self._call_gemini(prompt, max_tokens=2000)
        return self._parse_ai_response(response)
    
    async def team_compatibility_analyzer(self, team_members: List[Dict], new_candidate: Dict) -> Dict[str, Any]:
        """Advanced team dynamics analysis"""
        team_profiles = json.dumps(team_members, indent=2)
        candidate_profile = json.dumps(new_candidate, indent=2)
        
        prompt = f"""
        Analyze team compatibility and dynamics:
        
        CURRENT TEAM:
        {team_profiles}
        
        NEW CANDIDATE:
        {candidate_profile}
        
        Provide team analysis in JSON format:
        {{
            "team_compatibility_score": 85,
            "role_fit_analysis": {{
                "complementary_skills": ["skill1", "skill2"],
                "skill_overlaps": ["overlap1", "overlap2"],
                "gap_filling_potential": ["gap1", "gap2"],
                "leadership_contribution": "primary/supporting/none"
            }},
            "working_style_analysis": {{
                "collaboration_preference": "high/medium/low",
                "communication_style": "direct/indirect/hybrid",
                "decision_making_approach": "analytical/intuitive/hybrid",
                "conflict_resolution_style": "collaborative/competitive/avoidant"
            }},
            "team_dynamics_impact": {{
                "team_morale_impact": "positive/neutral/negative",
                "productivity_influence": "boost/maintain/detract",
                "innovation_catalyst": true,
                "knowledge_sharing_contribution": "high/medium/low"
            }},
            "potential_synergies": [
                {{
                    "team_member": "member_name",
                    "synergy_type": "skill/knowledge/personality",
                    "collaboration_potential": "high/medium/low",
                    "mutual_benefits": ["benefit1", "benefit2"]
                }}
            ],
            "integration_challenges": [
                {{
                    "challenge": "challenge_description",
                    "severity": "low/medium/high",
                    "mitigation_strategy": "strategy_description"
                }}
            ],
            "team_evolution_potential": {{
                "team_capability_enhancement": "significant/moderate/minimal",
                "culture_enrichment": "positive/neutral/negative",
                "performance_elevation": "high/medium/low"
            }}
        }}
        """
        
        response = await self._call_gemini(prompt, max_tokens=1200)
        return self._parse_ai_response(response)
    
    async def predictive_workforce_planning(self, company_data: Dict, industry_trends: Dict, market_data: Dict) -> Dict[str, Any]:
        """Strategic workforce planning and predictions"""
        company_json = json.dumps(company_data, indent=2)
        trends_json = json.dumps(industry_trends, indent=2)
        market_json = json.dumps(market_data, indent=2)
        
        prompt = f"""
        Provide strategic workforce planning insights:
        
        COMPANY DATA:
        {company_json}
        
        INDUSTRY TRENDS:
        {trends_json}
        
        MARKET DATA:
        {market_json}
        
        Provide workforce planning in JSON format:
        {{
            "future_skill_requirements": {{
                "critical_skills_12_months": ["skill1", "skill2"],
                "emerging_skills_24_months": ["skill3", "skill4"],
                "declining_skills": ["skill5", "skill6"],
                "skill_investment_priorities": ["priority1", "priority2"]
            }},
            "hiring_forecast": {{
                "quarterly_hiring_needs": [5, 8, 12, 7],
                "role_evolution_predictions": [
                    {{
                        "current_role": "role_name",
                        "future_evolution": "evolved_role",
                        "timeline_months": 18,
                        "required_adaptations": ["adapt1", "adapt2"]
                    }}
                ],
                "new_role_emergence": ["role1", "role2"]
            }},
            "talent_risk_assessment": {{
                "retention_risk_roles": ["role1", "role2"],
                "skill_gap_risks": ["gap1", "gap2"],
                "succession_planning_needs": ["need1", "need2"],
                "competitive_vulnerabilities": ["vulnerability1", "vulnerability2"]
            }},
            "development_strategies": {{
                "upskilling_priorities": ["priority1", "priority2"],
                "reskilling_opportunities": ["opportunity1", "opportunity2"],
                "cross_training_recommendations": ["rec1", "rec2"],
                "leadership_pipeline_development": ["dev1", "dev2"]
            }},
            "compensation_strategy": {{
                "market_positioning": "leading/matching/lagging",
                "total_rewards_optimization": ["opt1", "opt2"],
                "incentive_structure_recommendations": ["rec1", "rec2"],
                "benefits_evolution_needs": ["need1", "need2"]
            }},
            "organizational_design_recommendations": {{
                "team_structure_optimizations": ["opt1", "opt2"],
                "reporting_relationship_improvements": ["imp1", "imp2"],
                "workflow_efficiency_gains": ["gain1", "gain2"],
                "collaboration_enhancements": ["enhance1", "enhance2"]
            }}
        }}
        """
        
        response = await self._call_gemini(prompt, max_tokens=2000)
        return self._parse_ai_response(response)
    
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

# Global instance
advanced_ai_service = AdvancedAIService()
