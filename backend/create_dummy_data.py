from database.session import SessionLocal
from models.company import Company
from models.job import Job
from models.user import User, UserRole
from models.candidate import Candidate
from models.application import Application

def create_dummy_companies_and_jobs():
    """Create dummy companies and jobs for different industries in India"""
    db = SessionLocal()
    
    try:
        # Check if dummy data already exists
        existing_company = db.query(Company).filter(Company.company_name == "Tata Consultancy Services").first()
        if existing_company:
            print("Dummy data already exists - forcing recreation...")
            # Delete existing data
            db.query(Job).delete()
            db.query(Application).delete()
            db.query(Company).delete()
            db.query(Candidate).delete()
            db.query(User).filter(User.email.like("%@dummy.com")).delete()
            db.commit()
            print("Existing dummy data cleared")
        else:
            print("Creating fresh dummy data...")
        
        # Create dummy companies - Major Indian companies across sectors
        companies_data = [
            # Technology Companies
            {
                "name": "Tata Consultancy Services",
                "description": "Leading global IT services, consulting and business solutions organization",
                "industry": "technology"
            },
            {
                "name": "Infosys Technologies",
                "description": "Next-generation digital services and consulting company",
                "industry": "technology"
            },
            {
                "name": "Wipro Limited",
                "description": "Global information technology, consulting and business process services company",
                "industry": "technology"
            },
            {
                "name": "HCL Technologies",
                "description": "Multinational IT services company providing software development and IT consulting",
                "industry": "technology"
            },
            
            # Healthcare Companies
            {
                "name": "Apollo Hospitals",
                "description": "India's leading healthcare provider with state-of-the-art medical facilities",
                "industry": "healthcare"
            },
            {
                "name": "Fortis Healthcare",
                "description": "Premier healthcare delivery organization with super-specialty hospitals",
                "industry": "healthcare"
            },
            {
                "name": "Max Healthcare",
                "description": "Comprehensive healthcare provider with advanced medical technology",
                "industry": "healthcare"
            },
            
            # Media & Entertainment
            {
                "name": "Times of India Group",
                "description": "India's largest media and entertainment conglomerate",
                "industry": "media"
            },
            {
                "name": "Zee Entertainment",
                "description": "Leading media and entertainment company with diverse content portfolio",
                "industry": "media"
            },
            {
                "name": "Star India",
                "description": "Premier entertainment television network in India",
                "industry": "media"
            },
            
            # Banking & Finance
            {
                "name": "State Bank of India",
                "description": "India's largest public sector banking and financial services company",
                "industry": "banking"
            },
            {
                "name": "ICICI Bank",
                "description": "Leading private sector bank offering comprehensive banking solutions",
                "industry": "banking"
            },
            {
                "name": "HDFC Bank",
                "description": "India's leading private sector bank with nationwide presence",
                "industry": "banking"
            },
            
            # E-commerce & Retail
            {
                "name": "Reliance Retail",
                "description": "India's largest retail network with diverse product categories",
                "industry": "retail"
            },
            {
                "name": "Flipkart",
                "description": "Leading e-commerce marketplace offering wide range of products",
                "industry": "ecommerce"
            },
            {
                "name": "Amazon India",
                "description": "Global e-commerce giant with strong presence in Indian market",
                "industry": "ecommerce"
            },
            
            # Manufacturing
            {
                "name": "Reliance Industries",
                "description": "Diversified conglomerate with interests in petrochemicals, telecom, and retail",
                "industry": "manufacturing"
            },
            {
                "name": "Mahindra & Mahindra",
                "description": "Leading multinational automobile manufacturing corporation",
                "industry": "manufacturing"
            },
            {
                "name": "Larsen & Toubro",
                "description": "Major engineering, construction, manufacturing and financial services conglomerate",
                "industry": "manufacturing"
            }
        ]
        
        # Create users and companies
        companies = []
        for i, company_data in enumerate(companies_data):
            # Create user for company
            user = User(
                email=f"company{i+1}@dummy.com",
                password_hash="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm",  # "password123"
                role=UserRole.company
            )
            db.add(user)
            db.flush()
            
            # Create company
            company = Company(
                user_id=user.id,
                company_name=company_data["name"],
                description=company_data["description"]
            )
            db.add(company)
            companies.append(company)
        
        # Create comprehensive jobs data with Indian locations and salary ranges
        jobs_data = [
            # Technology Jobs - TCS
            {
                "company_idx": 0,
                "title": "Senior Python Developer",
                "description": "We are seeking an experienced Python Developer to join our AI/ML team at TCS Mumbai. You will work on cutting-edge machine learning projects, develop scalable applications, and collaborate with cross-functional teams to deliver innovative solutions for Fortune 500 clients. The role involves designing and implementing complex algorithms, optimizing code performance, and mentoring junior developers.",
                "skills": ["python", "machine learning", "tensorflow", "pytorch", "sql", "aws", "docker", "kubernetes", "git", "agile"],
                "location": "Mumbai, Maharashtra",
                "salary": "₹18-25 LPA"
            },
            {
                "company_idx": 0,
                "title": "Full Stack Java Developer",
                "description": "Join TCS Bangalore as a Full Stack Developer working on enterprise applications for global clients. You will be responsible for designing, developing, and maintaining web applications using Java, Spring Boot, React, and modern cloud technologies. The position offers exposure to microservices architecture and DevOps practices.",
                "skills": ["java", "spring boot", "react", "javascript", "mysql", "mongodb", "rest api", "aws", "microservices", "jenkins"],
                "location": "Bangalore, Karnataka",
                "salary": "₹15-22 LPA"
            },
            {
                "company_idx": 0,
                "title": "DevOps Engineer",
                "description": "TCS Pune is looking for a skilled DevOps Engineer to manage our cloud infrastructure and implement CI/CD pipelines. You will work with Kubernetes, Docker, and various AWS services to ensure high availability and scalability of our applications. Experience with infrastructure as code and monitoring tools is essential.",
                "skills": ["docker", "kubernetes", "aws", "azure", "terraform", "jenkins", "gitlab ci", "prometheus", "grafana", "linux"],
                "location": "Pune, Maharashtra",
                "salary": "₹16-24 LPA"
            },
            
            # Technology Jobs - Infosys
            {
                "company_idx": 1,
                "title": "Data Scientist",
                "description": "Infosys Hyderabad is hiring Data Scientists to work on advanced analytics projects for banking and healthcare clients. You will apply machine learning techniques to solve complex business problems, develop predictive models, and present insights to stakeholders. Strong background in statistics and programming is required.",
                "skills": ["python", "machine learning", "data science", "sql", "tensorflow", "statistics", "tableau", "power bi", "nlp", "deep learning"],
                "location": "Hyderabad, Telangana",
                "salary": "₹17-28 LPA"
            },
            {
                "company_idx": 1,
                "title": "Cloud Architect",
                "description": "Join Infosys Chennai as a Cloud Architect to design and implement cloud solutions for enterprise clients. You will be responsible for creating cloud migration strategies, optimizing cloud costs, and ensuring security compliance. Experience with multi-cloud environments is preferred.",
                "skills": ["aws", "azure", "gcp", "cloud architecture", "devops", "terraform", "kubernetes", "security", "networking", "microservices"],
                "location": "Chennai, Tamil Nadu",
                "salary": "₹20-35 LPA"
            },
            {
                "company_idx": 1,
                "title": "UI/UX Designer",
                "description": "Infosys Delhi NCR is looking for creative UI/UX Designers to design intuitive user interfaces for web and mobile applications. You will work closely with product managers and developers to create user-centered designs, conduct user research, and maintain design systems.",
                "skills": ["ui design", "ux design", "figma", "adobe xd", "prototyping", "user research", "wireframing", "responsive design", "design systems", "html/css"],
                "location": "Noida, Uttar Pradesh",
                "salary": "₹12-18 LPA"
            },
            
            # Technology Jobs - Wipro
            {
                "company_idx": 2,
                "title": "Cybersecurity Analyst",
                "description": "Wipro Bengaluru is seeking Cybersecurity Analysts to protect our digital infrastructure and client systems. You will monitor security threats, conduct vulnerability assessments, implement security controls, and respond to security incidents. Knowledge of security frameworks and compliance standards is essential.",
                "skills": ["cybersecurity", "network security", "penetration testing", "siem", "firewall management", "incident response", "risk assessment", "compliance", "encryption", "security tools"],
                "location": "Bengaluru, Karnataka",
                "salary": "₹14-22 LPA"
            },
            {
                "company_idx": 2,
                "title": "Mobile App Developer",
                "description": "Wipro Pune is hiring Mobile App Developers to create native and cross-platform mobile applications for iOS and Android. You will work with React Native, Flutter, or native technologies to build high-performance mobile apps with excellent user experience.",
                "skills": ["react native", "flutter", "swift", "kotlin", "java", "mobile development", "ios", "android", "rest api", "firebase"],
                "location": "Pune, Maharashtra",
                "salary": "₹13-20 LPA"
            },
            
            # Healthcare Jobs - Apollo Hospitals
            {
                "company_idx": 4,
                "title": "Senior Medical Officer",
                "description": "Apollo Hospitals Delhi is seeking experienced Medical Officers for our multi-specialty hospital. You will be responsible for patient diagnosis, treatment planning, and coordinating with specialists. MBBS with minimum 5 years experience required. Post-graduation preferred.",
                "skills": ["medicine", "diagnosis", "patient care", "treatment planning", "medical terminology", "clinical research", "emergency medicine", "healthcare regulations", "electronic health records", "medical ethics"],
                "location": "New Delhi, Delhi",
                "salary": "₹15-30 LPA"
            },
            {
                "company_idx": 4,
                "title": "Registered Nurse - ICU",
                "description": "Join Apollo Chennai's ICU team as a Registered Nurse. You will provide critical care to patients, monitor vital signs, administer medications, and collaborate with the medical team. B.Sc Nursing with ICU experience required. ACLS certification preferred.",
                "skills": ["critical care", "icu nursing", "patient monitoring", "emergency response", "medication administration", "medical equipment", "patient assessment", "clinical documentation", "infection control", "bcls"],
                "location": "Chennai, Tamil Nadu",
                "salary": "₹6-12 LPA"
            },
            {
                "company_idx": 4,
                "title": "Healthcare Administrator",
                "description": "Apollo Hyderabad is looking for Healthcare Administrators to manage hospital operations, staff scheduling, and ensure quality healthcare delivery. You will oversee compliance with healthcare regulations, manage budgets, and implement process improvements.",
                "skills": ["healthcare management", "hospital administration", "staff management", "budget planning", "healthcare regulations", "quality assurance", "operations management", "patient services", "medical billing", "hipaa compliance"],
                "location": "Hyderabad, Telangana",
                "salary": "₹10-18 LPA"
            },
            
            # Healthcare Jobs - Fortis
            {
                "company_idx": 5,
                "title": "Cardiologist",
                "description": "Fortis Gurugram is seeking experienced Cardiologists for our state-of-the-art cardiac care center. You will diagnose and treat heart conditions, perform cardiac procedures, and manage patient care. MD/DM in Cardiology required with minimum 3 years experience.",
                "skills": ["cardiology", "cardiac diagnosis", "echocardiography", "cardiac procedures", "patient care", "clinical research", "medical ethics", "emergency cardiac care", "catheterization", "cardiac rehabilitation"],
                "location": "Gurugram, Haryana",
                "salary": "₹25-45 LPA"
            },
            {
                "company_idx": 5,
                "title": "Medical Laboratory Technician",
                "description": "Fortis Mumbai needs Medical Laboratory Technicians to conduct complex medical tests and analyses. You will operate sophisticated lab equipment, maintain quality control, and ensure accurate test results. B.Sc in Medical Laboratory Technology required.",
                "skills": ["medical laboratory", "clinical pathology", "biochemistry", "microbiology", "hematology", "quality control", "lab equipment", "sample analysis", "medical testing", "laboratory safety"],
                "location": "Mumbai, Maharashtra",
                "salary": "₹4-8 LPA"
            },
            
            # Media Jobs - Times Group
            {
                "company_idx": 7,
                "title": "Senior Journalist",
                "description": "Times of India Mumbai is hiring experienced Journalists to cover politics, business, and entertainment beats. You will research stories, conduct interviews, write compelling articles, and meet tight deadlines. Excellent writing skills and news judgment required.",
                "skills": ["journalism", "news writing", "investigative reporting", "interviewing", "content creation", "editing", "media ethics", "digital journalism", "seo writing", "social media"],
                "location": "Mumbai, Maharashtra",
                "salary": "₹8-15 LPA"
            },
            {
                "company_idx": 7,
                "title": "Digital Content Manager",
                "description": "Times Internet Delhi NCR is looking for Digital Content Managers to oversee content strategy for our digital platforms. You will manage content calendars, coordinate with writers, analyze performance metrics, and optimize content for SEO and engagement.",
                "skills": ["content strategy", "digital marketing", "seo", "content management", "analytics", "social media marketing", "editorial planning", "team management", "content optimization", "web analytics"],
                "location": "Noida, Uttar Pradesh",
                "salary": "₹10-18 LPA"
            },
            {
                "company_idx": 7,
                "title": "Video Producer",
                "description": "Times Now Bengaluru is seeking Video Producers to create engaging video content for news and entertainment. You will conceptualize video ideas, coordinate production teams, edit footage, and ensure high-quality output for broadcast and digital platforms.",
                "skills": ["video production", "video editing", "content creation", "storytelling", "camera operation", "lighting", "sound engineering", "post-production", "broadcasting", "multimedia"],
                "location": "Bengaluru, Karnataka",
                "salary": "₹9-16 LPA"
            },
            
            # Media Jobs - Zee Entertainment
            {
                "company_idx": 8,
                "title": "Creative Director",
                "description": "Zee TV Mumbai is hiring Creative Directors to lead content development for television shows and digital series. You will oversee creative teams, develop show concepts, manage production budgets, and ensure content aligns with brand strategy and audience preferences.",
                "skills": ["creative direction", "content development", "television production", "team leadership", "budget management", "storytelling", "brand strategy", "audience analysis", "production management", "creative writing"],
                "location": "Mumbai, Maharashtra",
                "salary": "₹18-35 LPA"
            },
            {
                "company_idx": 8,
                "title": "Social Media Manager",
                "description": "Zee Entertainment Hyderabad is looking for Social Media Managers to handle our digital presence across platforms. You will create social media campaigns, engage with audiences, analyze metrics, and collaborate with marketing teams to enhance brand visibility.",
                "skills": ["social media marketing", "content creation", "community management", "analytics", "digital strategy", "campaign management", "influencer marketing", "social media tools", "content scheduling", "brand management"],
                "location": "Hyderabad, Telangana",
                "salary": "₹7-14 LPA"
            },
            
            # Banking Jobs - SBI
            {
                "company_idx": 10,
                "title": "Relationship Manager",
                "description": "State Bank of India Mumbai is seeking Relationship Managers for our priority banking segment. You will manage high-net-worth client portfolios, provide financial advice, cross-sell banking products, and ensure exceptional customer service.",
                "skills": ["relationship management", "banking products", "financial advisory", "customer service", "sales", "portfolio management", "risk assessment", "compliance", "financial planning", "negotiation"],
                "location": "Mumbai, Maharashtra",
                "salary": "₹8-15 LPA"
            },
            {
                "company_idx": 10,
                "title": "Credit Analyst",
                "description": "SBI Corporate Banking Delhi is hiring Credit Analysts to assess loan applications, analyze financial statements, evaluate credit risk, and make recommendations for loan approvals. Strong analytical skills and knowledge of credit policies required.",
                "skills": ["credit analysis", "financial analysis", "risk assessment", "banking regulations", "financial modeling", "loan processing", "compliance", "financial statements", "credit policies", "underwriting"],
                "location": "New Delhi, Delhi",
                "salary": "₹9-16 LPA"
            },
            {
                "company_idx": 10,
                "title": "Digital Banking Product Manager",
                "description": "SBI Bengaluru is looking for Product Managers to lead digital banking initiatives. You will develop mobile banking features, coordinate with tech teams, analyze user feedback, and drive digital transformation projects.",
                "skills": ["product management", "digital banking", "fintech", "agile methodologies", "user experience", "product strategy", "stakeholder management", "data analysis", "mobile applications", "innovation"],
                "location": "Bengaluru, Karnataka",
                "salary": "₹12-22 LPA"
            },
            
            # Banking Jobs - ICICI Bank
            {
                "company_idx": 11,
                "title": "Investment Banker",
                "description": "ICICI Bank Mumbai is seeking Investment Bankers for our corporate finance team. You will work on M&A deals, IPOs, and debt financing transactions. Experience in financial modeling, valuation, and deal execution is essential.",
                "skills": ["investment banking", "financial modeling", "valuation", "mergers and acquisitions", "ipo", "debt financing", "due diligence", "financial analysis", "deal structuring", "corporate finance"],
                "location": "Mumbai, Maharashtra",
                "salary": "₹20-40 LPA"
            },
            {
                "company_idx": 11,
                "title": "Risk Manager",
                "description": "ICICI Risk Management Hyderabad is hiring Risk Managers to identify, assess, and mitigate banking risks. You will develop risk frameworks, monitor risk exposure, and ensure regulatory compliance. Knowledge of Basel norms and risk management tools required.",
                "skills": ["risk management", "banking risk", "regulatory compliance", "basel norms", "risk assessment", "internal controls", "audit", "financial risk", "operational risk", "risk modeling"],
                "location": "Hyderabad, Telangana",
                "salary": "₹14-25 LPA"
            },
            
            # E-commerce Jobs - Flipkart
            {
                "company_idx": 14,
                "title": "Product Manager - E-commerce",
                "description": "Flipkart Bengaluru is hiring Product Managers for our e-commerce platform. You will define product roadmaps, work with engineering teams, analyze user behavior, and drive features that enhance the online shopping experience for millions of customers.",
                "skills": ["product management", "e-commerce", "user experience", "data analysis", "agile", "product strategy", "stakeholder management", "a/b testing", "roadmap planning", "cross-functional collaboration"],
                "location": "Bengaluru, Karnataka",
                "salary": "₹15-30 LPA"
            },
            {
                "company_idx": 14,
                "title": "Supply Chain Analyst",
                "description": "Flipkart Supply Chain Mumbai is looking for Analysts to optimize our logistics network. You will analyze delivery patterns, forecast demand, optimize warehouse operations, and improve last-mile delivery efficiency.",
                "skills": ["supply chain", "logistics", "data analysis", "demand forecasting", "warehouse management", "route optimization", "inventory management", "analytics", "operations research", "process improvement"],
                "location": "Mumbai, Maharashtra",
                "salary": "₹10-18 LPA"
            },
            {
                "company_idx": 14,
                "title": "Category Manager - Electronics",
                "description": "Flipkart Delhi NCR is seeking Category Managers for our electronics vertical. You will manage supplier relationships, negotiate deals, plan inventory, and drive sales growth for consumer electronics and mobile devices.",
                "skills": ["category management", "vendor management", "negotiation", "inventory planning", "sales strategy", "market analysis", "product merchandising", "pricing strategy", "supplier relations", "business development"],
                "location": "Gurgaon, Haryana",
                "salary": "₹12-20 LPA"
            },
            
            # Manufacturing Jobs - Reliance Industries
            {
                "company_idx": 16,
                "title": "Chemical Engineer",
                "description": "Reliance Industries Jamnagar is hiring Chemical Engineers for our petrochemical complex. You will oversee production processes, optimize plant operations, ensure safety compliance, and implement process improvements in our world-class manufacturing facility.",
                "skills": ["chemical engineering", "process engineering", "plant operations", "safety management", "process optimization", "quality control", "troubleshooting", "petrochemicals", "production planning", "environmental compliance"],
                "location": "Jamnagar, Gujarat",
                "salary": "₹12-22 LPA"
            },
            {
                "company_idx": 16,
                "title": "Mechanical Engineer",
                "description": "Reliance Mumbai is seeking Mechanical Engineers for our manufacturing units. You will design mechanical systems, maintain equipment, oversee installation projects, and ensure optimal performance of industrial machinery.",
                "skills": ["mechanical engineering", "cad design", "equipment maintenance", "project management", "manufacturing processes", "quality assurance", "troubleshooting", "industrial engineering", "automation", "safety standards"],
                "location": "Mumbai, Maharashtra",
                "salary": "₹10-18 LPA"
            },
            
            # Manufacturing Jobs - Mahindra & Mahindra
            {
                "company_idx": 17,
                "title": "Automotive Design Engineer",
                "description": "Mahindra & Mahindra Pune is hiring Automotive Design Engineers for our vehicle development team. You will design vehicle components, conduct simulations, oversee prototyping, and contribute to the development of SUVs and electric vehicles.",
                "skills": ["automotive design", "cad software", "vehicle engineering", "simulation", "prototyping", "product development", "mechanical design", "electric vehicles", "automotive systems", "project management"],
                "location": "Pune, Maharashtra",
                "salary": "₹11-20 LPA"
            },
            {
                "company_idx": 17,
                "title": "Quality Assurance Manager",
                "description": "Mahindra Chennai is looking for QA Managers to ensure product quality across our manufacturing processes. You will implement quality systems, conduct audits, manage quality teams, and drive continuous improvement initiatives.",
                "skills": ["quality assurance", "quality management", "six sigma", "auditing", "process improvement", "iso standards", "team leadership", "statistical analysis", "quality control", "manufacturing quality"],
                "location": "Chennai, Tamil Nadu",
                "salary": "₹13-22 LPA"
            }
        ]
        
        # Create jobs
        for job_data in jobs_data:
            if job_data["company_idx"] < len(companies):
                company = companies[job_data["company_idx"]]
                print(f"Creating job for company {company.id}: {company.company_name}")
                job = Job(
                    company_id=company.id,
                    job_title=job_data["title"],
                    job_description=job_data["description"],
                    required_skills=job_data["skills"],
                    location=job_data["location"],
                    salary=job_data["salary"]
                )
                db.add(job)
        
        db.commit()
        print(f"Created {len(companies)} companies and {len(jobs_data)} jobs")
        
    except Exception as e:
        print(f"Error creating dummy data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_dummy_companies_and_jobs()
