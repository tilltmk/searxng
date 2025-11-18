# SPDX-License-Identifier: AGPL-3.0-or-later
"""AI Integration for Search Results

Enhances search results with AI-powered features based on user preferences:
- Relevance scoring
- Result summaries
"""

import typing
import json
from typing import Optional, Dict, Any, List

try:
    import httpx
    HAS_HTTPX = True
except ImportError:
    HAS_HTTPX = False


def enhance_results_with_ai(
    results: List[Any],
    query: str,
    ai_provider: str,
    ai_scoring: bool,
    ai_summaries: bool,
    ollama_url: str = 'http://localhost:11434',
    ollama_model: str = 'llama3.2',
    anthropic_api_key: str = '',
    anthropic_model: str = 'claude-3-5-sonnet-20241022',
    openai_api_key: str = '',
    openai_model: str = 'gpt-4o',
) -> List[Any]:
    """Enhance search results with AI features based on user preferences."""
    
    if not HAS_HTTPX:
        return results
    
    if ai_provider == 'none' or (not ai_scoring and not ai_summaries):
        return results
    
    # Only process first 5 results for performance
    results_to_process = results[:5]
    
    for result in results_to_process:
        # Handle both dict-like and object-like results
        if hasattr(result, 'get'):
            title = result.get('title', '')
            content = result.get('content', '')
        else:
            title = getattr(result, 'title', '') or ''
            content = getattr(result, 'content', '') or ''
        
        if not title and not content:
            continue
        
        # AI Scoring
        if ai_scoring:
            score = _score_result(
                query, title, content,
                ai_provider, ollama_url, ollama_model,
                anthropic_api_key, anthropic_model,
                openai_api_key, openai_model
            )
            if score:
                if hasattr(result, '__setitem__'):
                    result['ai_score'] = score
                else:
                    setattr(result, 'ai_score', score)
        
        # AI Summary
        if ai_summaries and content:
            summary = _summarize_result(
                title, content,
                ai_provider, ollama_url, ollama_model,
                anthropic_api_key, anthropic_model,
                openai_api_key, openai_model
            )
            if summary:
                if hasattr(result, '__setitem__'):
                    result['ai_summary'] = summary.strip()
                else:
                    setattr(result, 'ai_summary', summary.strip())
    
    return results


def _call_ollama(prompt: str, url: str, model: str) -> Optional[str]:
    """Call Ollama API."""
    if not HAS_HTTPX:
        return None
    
    try:
        response = httpx.post(
            f"{url}/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "stream": False
            },
            timeout=10.0
        )
        
        if response.status_code == 200:
            return response.json().get('response', '')
    except Exception:
        pass
    
    return None


def _call_anthropic(prompt: str, api_key: str, model: str) -> Optional[str]:
    """Call Anthropic Claude API."""
    if not HAS_HTTPX or not api_key:
        return None
    
    try:
        response = httpx.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            json={
                "model": model,
                "max_tokens": 200,
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            },
            timeout=10.0
        )
        
        if response.status_code == 200:
            content = response.json().get('content', [])
            if content and len(content) > 0:
                return content[0].get('text', '')
    except Exception:
        pass
    
    return None


def _call_openai(prompt: str, api_key: str, model: str) -> Optional[str]:
    """Call OpenAI GPT API."""
    if not HAS_HTTPX or not api_key:
        return None
    
    try:
        response = httpx.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": model,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 200,
                "temperature": 0.3
            },
            timeout=10.0
        )
        
        if response.status_code == 200:
            choices = response.json().get('choices', [])
            if choices and len(choices) > 0:
                return choices[0].get('message', {}).get('content', '')
    except Exception:
        pass
    
    return None


def _call_ai(
    prompt: str,
    provider: str,
    ollama_url: str,
    ollama_model: str,
    anthropic_api_key: str,
    anthropic_model: str,
    openai_api_key: str,
    openai_model: str,
) -> Optional[str]:
    """Call configured AI backend."""
    if provider == 'ollama':
        return _call_ollama(prompt, ollama_url, ollama_model)
    elif provider == 'anthropic':
        return _call_anthropic(prompt, anthropic_api_key, anthropic_model)
    elif provider == 'openai':
        return _call_openai(prompt, openai_api_key, openai_model)
    return None


def _score_result(
    query: str,
    title: str,
    content: str,
    provider: str,
    ollama_url: str,
    ollama_model: str,
    anthropic_api_key: str,
    anthropic_model: str,
    openai_api_key: str,
    openai_model: str,
) -> Optional[str]:
    """Score a search result's relevance."""
    prompt = f"""Rate the relevance of this search result to the query on a scale of high/medium/low.
Query: {query}
Title: {title}
Content: {content[:200]}

Respond with only one word: high, medium, or low."""
    
    response = _call_ai(
        prompt, provider, ollama_url, ollama_model,
        anthropic_api_key, anthropic_model,
        openai_api_key, openai_model
    )
    
    if response:
        response = response.strip().lower()
        if 'high' in response:
            return 'high'
        elif 'medium' in response:
            return 'medium'
        elif 'low' in response:
            return 'low'
    
    return None


def _summarize_result(
    title: str,
    content: str,
    provider: str,
    ollama_url: str,
    ollama_model: str,
    anthropic_api_key: str,
    anthropic_model: str,
    openai_api_key: str,
    openai_model: str,
) -> Optional[str]:
    """Generate a brief summary of the result."""
    prompt = f"""Summarize this search result in one concise sentence (max 20 words):
Title: {title}
Content: {content[:300]}

Summary:"""
    
    return _call_ai(
        prompt, provider, ollama_url, ollama_model,
        anthropic_api_key, anthropic_model,
        openai_api_key, openai_model
    )

