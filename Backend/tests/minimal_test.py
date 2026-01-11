#!/usr/bin/env python3

print("Starting minimal test...")

def test_function():
    return "Test successful"

if __name__ == "__main__":
    print("In main block")
    result = test_function()
    print(f"Result: {result}")