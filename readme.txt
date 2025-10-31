================================================================================
CLAUDE-CODE-TAMAGOTCHI - VIRTUAL PET SIMULATION
================================================================================

Project Name:       Claude Code Tamagotchi
Organization:       kk-digital
Repository:         https://github.com/kk-digital/claude-code-tamagotchi

GitHub URL (HTTPS): https://github.com/kk-digital/claude-code-tamagotchi
GitHub URL (SSH):   git@github.com:kk-digital/claude-code-tamagotchi

================================================================================
PROJECT DESCRIPTION
================================================================================

Claude Code Tamagotchi is a virtual pet simulation integrated with LLM
capabilities for intelligent interaction and feedback analysis.

Key Features:
- TypeScript-only codebase (no backend/frontend split)
- Pet simulation engine with state management (hunger, happiness, energy)
- Groq LLM integration for intelligent thoughts and responses
- Feedback system with transcript analysis
- Activity and decay systems for realistic pet behavior
- Command-line interface for pet interaction

Architecture:
- Single-language TypeScript application
- Node.js or Bun runtime
- SQLite for feedback storage
- No external database servers required

================================================================================
CODE METRICS
================================================================================

Total Files:                50 files
Lines of Code:              7,343 lines
TypeScript Files:           27 files (6,178 lines, 84.1% of code)
Classes/Interfaces:         32 classes/interfaces
Functions:                  12 functions
Cyclomatic Complexity:      1,581
Average Complexity/File:    58.1

Development Estimate:       7.73 months, 2.52 people, $219,160

Key Characteristics:
- 100% production code (no test files)
- No interface abstractions
- High TypeScript complexity (58.1 avg per file)
- Focused, small team requirements

================================================================================
DOCKER SETUP
================================================================================

This repository has been cloned into a Docker sandbox environment.

Docker Location:    /Users/sp/claude/claude-docker.tamagotchi/
Docker Config:      ../docker-tamagotchi/
Dockerfile:         ../docker-tamagotchi/Dockerfile
Setup Instructions: ../docker-tamagotchi/todo.txt

To run in Docker:
1. Navigate to ../docker-tamagotchi/
2. Build image: docker build -t tamagotchi:latest -f Dockerfile .
3. Run container: See docker-tamagotchi/todo.txt for detailed instructions

Docker Features:
- Debian Bookworm base
- Node.js 20.x LTS
- Bun runtime (alternative to Node.js)
- TypeScript support
- Build tools (gcc, g++, make)
- Claude Code compatible

================================================================================
QUICK START (LOCAL)
================================================================================

Prerequisites:
- Node.js 20.x or Bun 1.x
- TypeScript
- Groq API key (for LLM features)

Setup with npm:
1. Install dependencies:
   npm install

2. Build TypeScript:
   npm run build

3. Configure environment:
   Create .env file with Groq API key

4. Run application:
   npm start

Setup with Bun (Alternative):
1. Install dependencies:
   bun install

2. Run directly (no build needed):
   bun run index.ts

================================================================================
TOP TYPESCRIPT FILES
================================================================================

Largest Files by Lines of Code:
1. src/llm/GroqClient.ts                       732 lines (165 complexity)
2. src/workers/analyze-transcript.ts           486 lines (178 complexity)
3. src/engine/feedback/FeedbackDatabase.ts     416 lines (116 complexity)
4. src/engine/thoughts/actionThoughts.ts       404 lines (29 complexity)
5. src/engine/feedback/TranscriptAnalyzer.ts   341 lines (91 complexity)
6. src/engine/PetEngine.ts                     331 lines (103 complexity)
7. src/engine/thoughts/codingThoughts.ts       277 lines (21 complexity)
8. src/engine/thoughts/needThoughts.ts         260 lines (36 complexity)
9. src/engine/StateManager.ts                  268 lines (51 complexity)
10. src/engine/ActivitySystem.ts               256 lines (87 complexity)

================================================================================
DOCUMENTATION
================================================================================

Full documentation is available in the repository:
- README.md - Project overview and usage
- CHANGELOG.md - Version history
- CONTRIBUTING.md - Contribution guidelines
- CODE_OF_CONDUCT.md - Community standards
- docs/ - Additional documentation

Claude Commands:
- claude-commands/ - Pet interaction commands
  * pet-feed.md, pet-play.md, pet-clean.md
  * pet-status.md, pet-stats.md
  * pet-sleep.md, pet-wake.md
  * pet-reset.md

================================================================================
COMPARISON WITH HEPHAESTUS
================================================================================

claude-code-tamagotchi vs Hephaestus:
- Language:           TypeScript-only vs Python + TypeScript
- Files:              50 files vs 372 files (7.4x smaller)
- Code:               7,343 lines vs 75,637 lines (10.3x smaller)
- Complexity:         1,581 vs 6,252 (4.0x less complex)
- Test Coverage:      0% vs 18% (no tests)
- Architecture:       Single-language vs full-stack
- Team Size:          2.5 people vs 11.5 people
- Development Time:   7.7 months vs 19.6 months

Different Approaches:
- Tamagotchi: Simple, focused, TypeScript-only
- Hephaestus: Complex, comprehensive, polyglot architecture

================================================================================
DOCKER TESTING AND DEPLOYMENT
================================================================================

Docker Environment: docker-tamagotchi (port 8224, 4 cores, 8GB memory)

Build and run Docker environment:
  cd /Users/sp/claude/claude-docker.tamagotchi/docker-tamagotchi/
  docker-compose build
  docker-compose up -d

Verify container:
  docker ps | grep docker-tamagotchi
  docker logs docker-tamagotchi

Run test suite (inside container):
  docker exec -w /home/user/tamagotchi-build docker-tamagotchi \
    /root/.bun/bin/bun run src/index.ts status

Test Tamagotchi pet:
  docker exec -w /home/user/tamagotchi-build docker-tamagotchi \
    /root/.bun/bin/bun run src/index.ts status

  # Expected output:
  # (◕ᴥ◕) ☀️ Buddy 🙂 | 🍖 70% ⚡ 90% 🧼 100% ❤️ 80% | 📁 tamagotchi-build

Test Claude Code CLI:
  docker exec docker-tamagotchi claude --version
  docker exec docker-tamagotchi claude --help

  # Note: Requires API key for full functionality:
  # docker exec docker-tamagotchi claude -p "your prompt here"

Check development tools:
  docker exec docker-tamagotchi node --version  # v20.19.5
  docker exec docker-tamagotchi npm --version   # 11.6.2
  docker exec docker-tamagotchi go version      # go1.23.4
  docker exec docker-tamagotchi sqlite3 --version

Access container shell:
  docker exec -it -u user docker-tamagotchi bash

Full test report: /Users/sp/claude/claude-docker.tamagotchi/docker-tamagotchi/test-report.txt

================================================================================
END OF README
================================================================================
