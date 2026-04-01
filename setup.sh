#!/bin/bash

# KLPro Pvt Ltd - Quick Start Script for Linux/Mac

echo ""
echo "================================"
echo " KLPro Pvt Ltd - MERN Stack Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/5] Installing root dependencies..."
npm install

echo ""
echo "[2/5] Installing Server dependencies..."
cd Server
npm install
cd ..

echo ""
echo "[3/5] Installing Client dependencies..."
cd Client
npm install
cd ..

echo ""
echo "================================"
echo " Setup Complete!"
echo "================================"
echo ""
echo "To run the application:"
echo ""
echo "Option 1 - Development Mode (requires 2 terminals):"
echo "  Terminal 1: cd Server && npm run dev"
echo "  Terminal 2: cd Client && npm start"
echo ""
echo "Option 2 - Using concurrently:"
echo "  npm run dev"
echo ""
echo "Option 3 - Server only:"
echo "  cd Server && npm start"
echo ""
echo "================================"
echo ""
echo "NOTE: Make sure MongoDB is running on your system!"
echo ""
