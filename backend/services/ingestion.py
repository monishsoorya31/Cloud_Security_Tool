import hashlib
from bs4 import BeautifulSoup

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.document_loaders import RecursiveUrlLoader

from apps.documents.models import Document
from django.conf import settings

def fetch_and_clean_text(url: str, max_depth: int = 2) -> str:
    """
    Recursively fetches pages using RecursiveUrlLoader
    and extracts ONLY clean, visible article text.
    """

    loader = RecursiveUrlLoader(
        url=url,
        max_depth=max_depth,
    )

    documents = loader.load()
    cleaned_pages = []

    for doc in documents:
        html = doc.page_content
        if not html:
            continue

        soup = BeautifulSoup(html, "html.parser")

        # Remove non-content / UI / devsite junk
        for tag in soup([
            "script",
            "style",
            "nav",
            "footer",
            "header",
            "svg",
            "img",
            "devsite-toc",
            "devsite-actions",
            "noscript",
            "aside",
        ]):
            tag.decompose()

        text = soup.get_text(separator=" ")
        text = " ".join(text.split())

        # keep only meaningful body text
        if len(text) > 200:
            cleaned_pages.append(text)

    return "\n\n".join(cleaned_pages)

def generate_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def chunk_text(text: str):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150,
        separators=["\n\n", "\n", ".", " "],
    )
    return splitter.split_text(text)

def get_vectorstore():
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    return Chroma(
        persist_directory=settings.VECTOR_DB_PATH,
        embedding_function=embeddings,
    )

def is_valid_doc_text(text: str) -> bool:
    if not text:
        return False
    if len(text) < 120:
        return False
    if text.count("&quot;") > 3:
        return False
    if "Grow your career" in text:
        return False
    return True

def ingest_document(title: str, url: str, provider: str, version: str = None):
    # 1️⃣ Fetch + clean
    raw_text = fetch_and_clean_text(url)

    if not raw_text:
        print(f"⚠️ No content fetched from {url}")
        return

    content_hash = generate_hash(raw_text)

    # 2️⃣ DB metadata
    doc, created = Document.objects.get_or_create(
        source_url=url,
        defaults={
            "title": title,
            "provider": provider,
            "version": version,
            "content_hash": content_hash,
        },
    )

    # 3️⃣ Skip unchanged
    if not created and doc.content_hash == content_hash and doc.is_indexed:
        print("⚠️ Document unchanged and already indexed. Skipping.")
        return

    # 4️⃣ Chunk clean text
    chunks = chunk_text(raw_text)

    # 5️⃣ Validate chunks
    valid_chunks = [
        c for c in chunks
        if is_valid_doc_text(c)
    ]

    if not valid_chunks:
        print(f"⚠️ No useful chunks found for {url}")
        return

     # 6️⃣ Embed (BATCH INSERT FIX)
    vectorstore = get_vectorstore()

    try:
        BATCH_SIZE = 1000  # ✅ safe value (can keep 500 also)

        metadatas = [
            {
                "source": url,
                "provider": provider,
                "title": title,
            }
            for _ in valid_chunks
        ]

        for i in range(0, len(valid_chunks), BATCH_SIZE):
            batch_texts = valid_chunks[i:i + BATCH_SIZE]
            batch_metas = metadatas[i:i + BATCH_SIZE]

            batch_ids = [
                f"{provider}:{generate_hash(url)}:{i+j}"
                for j in range(len(batch_texts))
            ]

            vectorstore.add_texts(
                texts=batch_texts,
                metadatas=batch_metas,
                ids=batch_ids
            )


            print(f"✅ Inserted {min(i + BATCH_SIZE, len(valid_chunks))}/{len(valid_chunks)} chunks")

    except Exception as e:
        print(f"❌ Vector insertion failed: {e}")
        return


    # 7️⃣ Update DB state
    doc.content_hash = content_hash
    doc.is_indexed = True
    doc.save()

    print(f"✅ Ingested {len(valid_chunks)} chunks from {url}")
