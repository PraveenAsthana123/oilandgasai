"""Local source-cited text retrieval. No generated operational instructions."""
from functools import lru_cache
from sklearn.feature_extraction.text import TfidfVectorizer
from app.analytics.catalog import ROOT, catalog


@lru_cache(maxsize=1)
def build_index():
    documents = []
    paths = list((ROOT / 'docs').glob('*.md')) + list((ROOT / 'data' / 'public' / 'documents').glob('*.md'))
    for path in sorted(paths):
        text = path.read_text()[:150000]
        for index in range(0, len(text), 1800):
            documents.append({'source': str(path.relative_to(ROOT)), 'offset': index,
                              'text': text[index:index+2000]})
    for item in catalog():
        documents.append({'source': f"module:{item['id']}", 'offset': 0,
                          'text': ' '.join(str(value) for value in item.values())})
    vectorizer = TfidfVectorizer(stop_words='english', max_features=20000)
    matrix = vectorizer.fit_transform([d['text'] for d in documents])
    return documents, vectorizer, matrix


def search(query, limit=5):
    documents, vectorizer, matrix = build_index()
    scores = (matrix @ vectorizer.transform([query]).T).toarray().ravel()
    indexes = scores.argsort()[::-1][:limit]
    return {'method': 'TF-IDF lexical retrieval; no generated answer',
            'items': [documents[i] | {'score': float(scores[i])} for i in indexes if scores[i] > 0]}
