#!/bin/bash

# Deploy Firestore rules
echo "Deploying Firestore rules..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "Please login to Firebase first:"
    echo "firebase login"
    exit 1
fi

# Deploy the rules
firebase deploy --only firestore:rules

echo "Firestore rules deployed successfully!"
