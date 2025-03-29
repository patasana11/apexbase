#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p src/tests/selenium/logs

# Default to running all tests
TESTS=("homepage.test.ts" "login.test.ts" "dashboard.test.ts" "functions.test.ts")
HEADLESS=true
VERBOSE=""

# Parse command line arguments
for arg in "$@"
do
  case $arg in
    --no-headless)
      HEADLESS=false
      ;;
    --verbose)
      VERBOSE="--reporter=verbose"
      ;;
    *)
      # If not a flag, it's a test name
      if [[ $arg != -* ]]; then
        # Check if it ends with .test.ts, otherwise append it
        if [[ $arg != *.test.ts && $arg != *.ts ]]; then
          arg="${arg}.test.ts"
        fi
        # Only add this test to the list
        if [ "${#TESTS[@]}" -eq 4 ]; then
          # Reset the array if we haven't explicitly specified tests yet
          TESTS=("$arg")
        else
          TESTS+=("$arg")
        fi
      fi
      ;;
  esac
done

# Export environment variables
export SELENIUM_HEADLESS=$HEADLESS

# Print test configuration
echo "Running Selenium tests with Vitest..."
echo "Headless mode: $HEADLESS"
if [ "$HEADLESS" = "false" ]; then
  echo "NOTE: Running in non-headless mode will open browser windows"
fi

# Build command with the tests to run
TEST_PATHS=""
for test in "${TESTS[@]}"
do
  TEST_PATHS+="src/tests/selenium/$test "
done

# Run the tests
npx vitest run $TEST_PATHS $VERBOSE 