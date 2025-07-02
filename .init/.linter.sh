#!/bin/bash
cd /home/kavia/workspace/code-generation/petconnect-18446-58b82786/reactjs_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

