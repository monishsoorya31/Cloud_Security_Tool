from services.retriever import semantic_search
from services.llm import call_llm
from services.reasoning import build_context
from services.query_expander import expand_query_for_security
from django.conf import settings

# ✅ Use absolute path from settings
PROMPT_PATH = settings.BASE_DIR / "core/prompts/policy_prompt.txt"

# ✅ Load prompt once (Cache it)
try:
    PROMPT_TEMPLATE = PROMPT_PATH.read_text()
except FileNotFoundError:
    PROMPT_TEMPLATE = ""
    print(f"⚠️ Warning: Prompt file not found at {PROMPT_PATH}")

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

    prompt_template = PROMPT_TEMPLATE

    final_prompt = prompt_template.format(
        context=context,
        question=question
    )

    answer = call_llm(final_prompt)

    return {
        "answer": answer.strip(),
        "sources": [chunk["metadata"] for chunk in good_chunks]
    }
