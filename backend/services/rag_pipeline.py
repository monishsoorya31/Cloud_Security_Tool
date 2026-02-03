from services.retriever import semantic_search
from services.llm import call_llm
from services.reasoning import build_context
from services.query_expander import expand_query_for_security
from django.conf import settings

# ✅ Prompt template paths
PROMPT_DIR = settings.BASE_DIR / "core/prompts"
PROMPT_TEMPLATES = {
    "gcp": PROMPT_DIR / "policy_prompt_gcp.txt",
    "aws": PROMPT_DIR / "policy_prompt_aws.txt",
    "azure": PROMPT_DIR / "policy_prompt_azure.txt",
}

def get_prompt_template(provider: str | None = None) -> str:
    """
    Load the appropriate prompt template based on cloud provider.
    Raises ValueError if provider is not specified or unknown.
    """
    if not provider:
        raise ValueError("Provider parameter is required. Please specify 'gcp', 'aws', or 'azure'.")
    
    provider_key = provider.lower()
    template_path = PROMPT_TEMPLATES.get(provider_key)
    
    if not template_path:
        raise ValueError(f"Unknown provider '{provider}'. Supported providers: {', '.join(PROMPT_TEMPLATES.keys())}")
    
    try:
        return template_path.read_text()
    except FileNotFoundError:
        raise FileNotFoundError(f"Prompt template not found at {template_path}")

SIMILARITY_SCORE_THRESHOLD = settings.RAG_SIMILARITY_THRESHOLD


def answer_query(question: str, provider: str | None = None, top_k: int = 5):
    #expaned query for best retrival
    expanded_query = expand_query_for_security(question, provider)

    if expanded_query.strip() != question.strip():
        print("✅ Query Expanded")
    else:
        print("⚠️ Query NOT Expanded")

    print("Original:", question)
    print("Expanded:", expanded_query)

    # ✅ Semantic search
    retrieved_chunks = semantic_search(
        query=expanded_query,
        provider=provider,
        top_k=top_k
    )

    # ✅ Keep only relevant chunks based on score
    good_chunks = [c for c in retrieved_chunks if c.get("score", 999) <= SIMILARITY_SCORE_THRESHOLD]

    # ✅ If nothing relevant, don't call LLM
    if not good_chunks:
        return {
            "answer": "⚠️ I couldn't find anything related to your question in the uploaded documents. Please ask a valid cloud/IAM/security-related question.",
            "sources": []
        }

    context = build_context(good_chunks)

    # ✅ Load provider-specific prompt template
    prompt_template = get_prompt_template(provider)

    final_prompt = prompt_template.format(
        context=context,
        question=question
    )

    answer = call_llm(final_prompt)

    return {
        "answer": answer.strip(),
        "sources": [chunk["metadata"] for chunk in good_chunks]
    }
