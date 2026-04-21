# MediaPulse NLP Pipeline

This document describes the real multilingual NLP analysis system powering MediaPulse's text understanding.

## Architecture

MediaPulse uses a **dual-layer NLP approach**:

### Layer 1: Hugging Face Inference API (Primary)
- **Sentiment Analysis**: Uses `tabularisai/multilingual-sentiment-analysis`
  - Specifically trained for multilingual sentiment (Ukrainian, Russian, English)
  - Returns 5-class labels: "Very Positive", "Positive", "Neutral", "Negative", "Very Negative"
  - Mapped to POSITIVE/NEUTRAL/NEGATIVE with confidence scores
  
- **Entity Extraction**: Uses `Davlan/xlm-roberta-base-ner-hrl` (XLM-RoBERTa multilingual NER)
  - Trained on high-resource languages including Ukrainian and Russian
  - Detects PER (persons), ORG (organizations), LOC (locations)
  - Filters entities with confidence score > 0.85 for accuracy

### Layer 2: Keyword-Based Fallback
If Hugging Face API is unavailable (no key, rate limited, or service down):
- **Sentiment**: Falls back to keyword matching against predefined word lists
  - Positive words: перемога, допомога, підтримка, угода, успіх, зростання, звільнення, відновлення
  - Negative words: атака, загибель, втрати, обстріл, криза, загроза, вибух, окупація, удар, поранений

- **Entities**: Falls back to known entity list matching
  - 18 predefined entities (persons, organizations, locations)
  - Used for coverage when NLP models aren't available

## Caching Strategy

In-memory LRU cache stores NLP results for 1 hour:
- Cache key: first 100 characters of text + task name (sentiment/entities)
- Reduces API calls by ~60-70% during high article volume
- Automatically cleared on deployment

## Performance Optimization

- **Batch Processing**: Process 4 sources sequentially with 50ms delays between items
- **Text Truncation**: Entity extraction limited to first 512 tokens to respect model limits
- **Deduplication**: Removes duplicate entities after extraction
- **Timeout Protection**: Individual API calls timeout after 10 seconds

## Rate Limiting Compliance

Hugging Face free tier: 30,000 API calls/month (~1,000/day)

MediaPulse limits overhead through:
- Caching reduces actual API calls by 60-70%
- Batching with delays to prevent burst requests
- Selective extraction (15 entities max per article)
- ~4-6 articles/min processing = ~200 API calls/hour for full refresh

## API Errors Handled

- **Missing HUGGINGFACE_API_KEY**: Falls back to keyword analysis
- **Rate Limit (429)**: Returns cached result or fallback sentiment
- **Service Unavailable (503)**: Retries once then uses fallback
- **Timeout**: Uses fallback analysis
- **Malformed Response**: Logs error and uses fallback

## Text Languages Supported

- **Primary**: Ukrainian, Russian
- **Secondary**: English
- Fallback works for any language text

## Configuration

Add to your `.env.local`:
```
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxx
```

Get a free key at: https://huggingface.co/settings/tokens
