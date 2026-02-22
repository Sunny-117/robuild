#!/bin/bash

# Test all playground examples
set -e

echo "🧪 Testing all playground examples..."

# List of examples to test
examples=(
  "basic-bundle"
  "multi-format"
  "transform-mode"
  "react-app"
  "vue-app"
  "exports-generation"
  "asset-handling"
  "tsup-style"
  "unbuild-style"
  "plugin-examples"
  "es2015-target"
)

failed_examples=()
successful_examples=()

for example in "${examples[@]}"; do
  echo ""
  echo "📦 Testing $example..."

  if [ -d "$example" ]; then
    cd "$example"

    # Install dependencies if package.json exists
    if [ -f "package.json" ]; then
      echo "  Installing dependencies..."
      pnpm install --silent
    fi

    # Run build
    echo "  Building..."
    if pnpm build > /dev/null 2>&1; then
      echo "  ✅ $example - SUCCESS"
      successful_examples+=("$example")
    else
      echo "  ❌ $example - FAILED"
      failed_examples+=("$example")
    fi

    cd ..
  else
    echo "  ⚠️  Directory $example not found"
    failed_examples+=("$example")
  fi
done

echo ""
echo "📊 Test Results:"
echo "  ✅ Successful: ${#successful_examples[@]}"
echo "  ❌ Failed: ${#failed_examples[@]}"

if [ ${#successful_examples[@]} -gt 0 ]; then
  echo ""
  echo "✅ Successful examples:"
  for example in "${successful_examples[@]}"; do
    echo "  - $example"
  done
fi

if [ ${#failed_examples[@]} -gt 0 ]; then
  echo ""
  echo "❌ Failed examples:"
  for example in "${failed_examples[@]}"; do
    echo "  - $example"
  done
  exit 1
fi

echo ""
echo "🎉 All examples passed!"
