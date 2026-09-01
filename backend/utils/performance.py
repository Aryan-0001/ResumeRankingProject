"""
Performance optimization utilities for caching and database optimization
"""
import functools
import hashlib
import json
import time
from typing import Any, Dict, Optional, Union
from datetime import datetime, timedelta

# Simple in-memory cache for development
_cache_store: Dict[str, Dict[str, Any]] = {}

def cache_key_generator(*args, **kwargs) -> str:
    """Generate a unique cache key based on function arguments"""
    key_data = str(args) + str(sorted(kwargs.items()))
    return hashlib.md5(key_data.encode()).hexdigest()

def cache_result(expire_seconds: int = 300):
    """
    Decorator to cache function results in memory
    
    Args:
        expire_seconds: Cache expiration time in seconds (default: 5 minutes)
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{cache_key_generator(*args, **kwargs)}"
            
            # Check if cache exists and is not expired
            if cache_key in _cache_store:
                cache_entry = _cache_store[cache_key]
                if time.time() - cache_entry['timestamp'] < expire_seconds:
                    return cache_entry['result']
                else:
                    # Remove expired entry
                    del _cache_store[cache_key]
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            _cache_store[cache_key] = {
                'result': result,
                'timestamp': time.time()
            }
            
            return result
        return wrapper
    return decorator

def clear_cache(pattern: Optional[str] = None):
    """Clear cache entries, optionally matching a pattern"""
    if pattern:
        keys_to_remove = [k for k in _cache_store.keys() if pattern in k]
        for key in keys_to_remove:
            del _cache_store[key]
    else:
        _cache_store.clear()

def get_cache_stats() -> Dict[str, Any]:
    """Get cache statistics"""
    return {
        'total_entries': len(_cache_store),
        'keys': list(_cache_store.keys()),
        'memory_usage_estimate': sum(len(str(v)) for v in _cache_store.values())
    }

# Database query optimization utilities
def optimize_query_params(limit: int = 100, offset: int = 0) -> Dict[str, int]:
    """Generate optimized query parameters"""
    return {
        'limit': min(limit, 1000),  # Cap at 1000 to prevent large queries
        'offset': max(0, offset)
    }

# Batch processing utilities
def batch_process(items: list, batch_size: int = 50):
    """Process items in batches to improve performance"""
    for i in range(0, len(items), batch_size):
        yield items[i:i + batch_size]

# Performance monitoring
class PerformanceMonitor:
    """Simple performance monitoring for function execution"""
    
    def __init__(self):
        self.metrics: Dict[str, list] = {}
    
    def record_execution(self, func_name: str, execution_time: float):
        """Record execution time for a function"""
        if func_name not in self.metrics:
            self.metrics[func_name] = []
        self.metrics[func_name].append(execution_time)
    
    def get_stats(self, func_name: str) -> Dict[str, float]:
        """Get performance statistics for a function"""
        if func_name not in self.metrics:
            return {}
        
        times = self.metrics[func_name]
        return {
            'avg_time': sum(times) / len(times),
            'min_time': min(times),
            'max_time': max(times),
            'call_count': len(times)
        }
    
    def get_all_stats(self) -> Dict[str, Dict[str, float]]:
        """Get all performance statistics"""
        return {func: self.get_stats(func) for func in self.metrics.keys()}

# Global performance monitor instance
performance_monitor = PerformanceMonitor()

def monitor_performance(func):
    """Decorator to monitor function performance"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            execution_time = time.time() - start_time
            performance_monitor.record_execution(func.__name__, execution_time)
    return wrapper
