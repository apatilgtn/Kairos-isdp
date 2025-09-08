# AI Analysis Migration Testing Guide

This document outlines the testing process for the AI analysis migration from DevvAI to open-source LLM models.

## Overview

The migration process involves replacing DevvAI dependencies with open-source LLM alternatives. To ensure this process is reliable, we've developed testing tools that validate the migration.

## Test Categories

1. **Code Migration Tests** - Verify that DevvAI imports and API calls are replaced correctly
2. **Model Compatibility Tests** - Ensure open-source models provide compatible outputs
3. **Data Format Tests** - Check that data structures are preserved during migration

## Running Tests

### Manual Test Runner

The simplest way to test the migration is using our custom test runner:

```bash
npm run test:ai-migration
```

This script:
1. Creates sample files with DevvAI dependencies
2. Runs the migration on these files
3. Validates the migration results
4. Reports success/failure

### Test Results

The test runner will output results for each test category:

- ✅ Success - Test passed
- ❌ Failure - Test failed

A summary is provided at the end with totals for each category.

## Test Files

The test runner creates temporary test files in `scripts/test-migration-files/`. These files contain:

1. Sample DevvAI code before migration
2. Migrated code (after running the migration)
3. Backup files (if backup option enabled)

After running tests, these files are kept for inspection.

## Model Validation

Part of the test process involves validating that open-source models provide compatible outputs. 

The following models are tested:
- `llama3` (replacing `kimi-k2`)
- `mistral` (replacing `mistral-medium`)
- `gemma-7b` (replacing `google/gemini-1.5-pro`)

## Extending Tests

To add new tests:

1. Update `test-ai-migration.js` with new test cases
2. Create additional sample files to test specific migration scenarios
3. Run the tests to verify migration works in these scenarios

## Troubleshooting

If tests fail, check:

1. **Import Replacement** - Verify DevvAI imports were replaced
2. **API Call Changes** - Confirm API calls were updated
3. **Model Mappings** - Check model names were properly mapped
4. **Configuration Changes** - Validate config parameters were migrated

## Continuous Integration

The migration tests can be integrated into CI pipelines by adding the test command to your workflow:

```yaml
- name: Test Migration
  run: npm run test:ai-migration
```

## Known Limitations

1. The test runner doesn't validate actual API responses from models
2. Some advanced DevvAI features may need manual verification
3. Performance comparisons between DevvAI and open-source models are not included
