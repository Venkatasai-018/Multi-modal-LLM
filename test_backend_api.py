#!/usr/bin/env python3
"""
Quick test script to verify backend API responses
Run this while backend is running to check if API returns correct data
"""

import requests
import json

API_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("\n=== Testing Health Endpoint ===")
    try:
        response = requests.get(f"{API_URL}/")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_stats():
    """Test stats endpoint"""
    print("\n=== Testing Stats Endpoint ===")
    try:
        response = requests.get(f"{API_URL}/stats")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Verify expected fields
        if "total_documents" in data and "total_queries" in data:
            print("✅ Stats has correct format")
            return True
        else:
            print("❌ Stats missing required fields")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_history():
    """Test history endpoint"""
    print("\n=== Testing History Endpoint ===")
    try:
        response = requests.get(f"{API_URL}/history")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response has {len(data.get('history', []))} items")
        
        if data.get('history') is not None:
            if len(data['history']) > 0:
                print(f"Sample item: {json.dumps(data['history'][0], indent=2)}")
                # Check if it has question and answer fields
                sample = data['history'][0]
                if 'question' in sample and 'answer' in sample:
                    print("✅ History has correct format")
                    return True
                else:
                    print("❌ History items missing 'question' or 'answer' fields")
                    return False
            else:
                print("✅ History format correct (empty)")
                return True
        else:
            print("❌ History response missing 'history' field")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_query():
    """Test query endpoint"""
    print("\n=== Testing Query Endpoint ===")
    try:
        payload = {
            "question": "What is AI?",
            "top_k": 3
        }
        response = requests.post(f"{API_URL}/query", json=payload)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Check expected fields
        if "answer" in data and "sources" in data and "processing_time" in data:
            print("✅ Query response has correct format")
            return True
        else:
            print("❌ Query response missing required fields")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Backend API Test Script")
    print("=" * 60)
    
    results = {
        "health": test_health(),
        "stats": test_stats(),
        "history": test_history(),
        "query": test_query()
    }
    
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    for test, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test.ljust(20)}: {status}")
    
    all_passed = all(results.values())
    print("\n" + ("=" * 60))
    if all_passed:
        print("✅ All tests passed! Backend API is working correctly.")
    else:
        print("❌ Some tests failed. Check the output above for details.")
    print("=" * 60)
