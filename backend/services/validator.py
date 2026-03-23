import re
from services.llm import classify_relevance

def validate_provider_mismatch(question: str, selected_provider: str | None) -> dict:
    """
    Detects if the user's question mentions a cloud provider different from the selected one.
    Returns a dict with 'mismatch' (bool) and 'detected_providers' (list).
    """
    if not selected_provider:
        return {"mismatch": False, "detected_providers": []}

    q = question.lower()
    selected_p = selected_provider.lower()

    # Define provider keyword maps (expanded lists)
    provider_keywords = {
        "aws": [
            # Core
            "aws", "amazon web services",

            # Compute
            "ec2", "elastic compute cloud", "lambda", "aws lambda",
            "ecs", "eks", "fargate", "lightsail", "batch",

            # Storage
            "s3", "simple storage service", "ebs", "efs", "fsx",
            "glacier", "storage gateway",

            # Database
            "rds", "aurora", "dynamodb", "redshift", "elasticache",
            "neptune", "timestream", "ql", "keyspaces",

            # Networking
            "vpc aws", "route53", "cloudfront", "api gateway",
            "direct connect", "global accelerator", "elastic load balancing",
            "alb", "nlb", "elbv2",

            # Security
            "iam aws", "iam role aws", "cognito", "kms aws",
            "secrets manager", "shield", "waf", "guardduty",
            "inspector", "macie", "detective", "security hub",

            # DevOps & Monitoring
            "cloudwatch", "cloudtrail", "cloudformation",
            "codedeploy", "codepipeline", "codebuild",
            "x-ray", "opsworks", "systems manager",

            # Analytics & Big Data
            "athena", "kinesis", "glue", "emr",
            "data pipeline", "lake formation",

            # AI/ML
            "sagemaker", "rekognition", "comprehend",
            "lex", "polly", "textract", "transcribe", "translate",

            # Messaging & Integration
            "sqs", "sns", "eventbridge", "step functions",
            "mq", "appsync",

            # Migration & Transfer
            "dms", "datasync", "snowball", "migration hub",

            # Management
            "organizations", "control tower", "trusted advisor",
            "license manager", "service catalog"
        ],

        "gcp": [
            # Core
            "gcp", "google cloud", "google cloud platform",

            # Compute
            "compute engine", "gce", "app engine",
            "cloud functions", "cloud run", "gke",
            "kubernetes engine",

            # Storage
            "cloud storage", "gcs", "persistent disk",
            "filestore", "archive storage",

            # Database
            "cloud sql", "spanner", "bigtable",
            "firestore", "datastore", "alloydb",

            # Networking
            "vpc google", "cloud load balancing",
            "cloud cdn", "cloud dns", "interconnect",
            "cloud nat",

            # Security
            "iam gcp", "cloud iam", "kms gcp",
            "secret manager", "identity aware proxy",
            "cloud armor", "beyondcorp",

            # DevOps & Monitoring
            "cloud build", "cloud deploy",
            "operations suite", "stackdriver",
            "cloud logging", "cloud monitoring",
            "error reporting", "trace",

            # Analytics & Big Data
            "bigquery", "dataflow", "dataproc",
            "pub/sub", "composer", "dataplex",

            # AI/ML
            "vertex ai", "automl", "vision ai",
            "speech to text", "text to speech",
            "translation ai", "dialogflow",

            # API & Integration
            "apigee", "endpoints",

            # Hybrid & Multi-cloud
            "anthos",

            # Migration
            "migrate for compute engine",
            "transfer service",

            # Management
            "resource manager", "org policy",
            "cloud console"
        ],

        "azure": [
            # Core
            "azure", "microsoft azure",

            # Compute
            "virtual machine", "vm azure",
            "azure functions", "app service",
            "aks", "azure kubernetes service",
            "service fabric",

            # Storage
            "blob storage", "disk storage",
            "file storage", "queue storage",
            "storage account",

            # Database
            "sql database", "azure sql",
            "cosmos db", "mysql azure",
            "postgresql azure", "synapse",
            "database for maria db",

            # Networking
            "virtual network", "vnet",
            "application gateway",
            "front door", "traffic manager",
            "load balancer azure",
            "expressroute", "vpn gateway",

            # Security
            "entra id", "azure active directory",
            "aad", "key vault",
            "defender for cloud",
            "sentinel", "azure policy",

            # DevOps & Monitoring
            "azure devops", "monitor",
            "log analytics", "application insights",
            "automation account",

            # Analytics & Big Data
            "synapse analytics", "databricks",
            "data factory", "stream analytics",

            # AI/ML
            "azure machine learning",
            "cognitive services",
            "bot service",
            "openai service",

            # Integration
            "logic app", "service bus",
            "event grid", "api management",

            # Hybrid & Multi-cloud
            "azure arc", "stack hub",

            # Migration
            "migrate", "site recovery",

            # Management
            "arm template", "blueprint",
            "cost management",
            "resource manager"
        ]
    }

    detected_others = []

    for provider, keywords in provider_keywords.items():
        if provider == selected_p:
            continue
        
        # Check if any keyword of another provider is in the question
        for kw in keywords:
            # Use regex to find word boundaries to avoid false positives like "iam" in "diagram"
            if re.search(rf"\b{re.escape(kw)}\b", q):
                detected_others.append(provider.upper())
                break # Only need one keyword to detect the provider

    return {
        "mismatch": len(detected_others) > 0,
        "detected_providers": list(set(detected_others))
    }

def is_query_relevant(question: str) -> bool:
    """
    Checks if a query is relevant to the domain (Cloud Security, IAM, etc.)
    and not just gibberish or simple greetings.
    """
    q = question.strip().lower()

    # 1. Minimum length check (avoid single char or very short strings)
    if len(q) < 3:
        return False

    # 2. Basic greetings/small talk that should be handled differently (if not already handled)
    # The user mentioned "hi" triggers small talk, so we keep it simple.
    greetings = ["hi", "hello", "hey", "thanks", "thank you", "bye", "goodbye"]
    if q in greetings:
        return True # Let it pass if we want LLM to handle greetings, but user said "hi" is already handled.
    
    # If the user mentioned "hi" is triggered elsewhere, we might want to let perfectly normal greetings pass
    # but block "hiii" or "heyoo" if they don't match exactly.

    # 3. Domain keywords - if any of these are present, it's definitely relevant.
    domain_keywords = [
        "iam", "policy", "security", "cloud", "aws", "gcp", "azure", "access", 
        "role", "permission", "bucket", "s3", "storage", "compute", "network", 
        "firewall", "vpc", "audit", "log", "compliance", "identity", "token",
        "secret", "key", "vault", "encrypt", "decrypt", "user", "group"  
    ]

    if len(q.split()) >= 2:
        # Secondary check with LLM for more robustness
        return classify_relevance(question)
    
    if any(re.search(rf"\b{re.escape(kw)}\b", q) for kw in domain_keywords):
        return True

    # 4. Gibberish/Irrelevance detection
    # If it's a long string with no spaces and no keywords, it might be gibberish
    if " " not in q and len(q) > 10:
        return False

    # Small talk patterns like "hiii", "heyyy"
    if re.match(r"^(h+i+|h+e+y+|h+e+l+o+)\W*$", q):
        # We only allow exact short greetings if we want them to pass.
        # Repeating chars often indicates low-effort/irrelevant input.
        if len(q) > 5: 
            return False

    # If it doesn't match any domain keywords and looks like random chars
    if not any(char.isalpha() for char in q):
        return False

    # Default to True for now to avoid false positives, but we can tighten this.
    # If it's at least two words, we'll let it try retrieval.


    return False
