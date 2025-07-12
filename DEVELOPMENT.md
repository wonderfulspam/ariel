# Development Notes

## 📋 Important Guidelines

### Use Justfile Commands
**Always use `just` commands instead of running `uv` directly.** This ensures consistency and proper environment setup.

```bash
# ✅ Correct
just lint
just run convert --help
just check

# ❌ Avoid
uv run ruff check .
uv run ariel convert --help
```

### Pre-commit Hooks

This project uses pre-commit hooks to ensure code quality. The hooks automatically run:
- Code formatting with ruff
- Linting with ruff
- Type checking with mypy
- Basic file checks (trailing whitespace, etc.)

**Setup**: Pre-commit hooks are automatically installed when you run `just install-dev`.

**Manual commands**:
- `just pre-commit` - Run all pre-commit hooks manually
- `just pre-commit-install` - Install pre-commit hooks
- `just pre-commit-update` - Update hook versions

### Version Control with Jujutsu (jj)

This project uses **Jujutsu (jj)** instead of Git for version control. Jj is a Git-compatible VCS with these key concepts:

- **Every change is a commit** - No staging area, working copy changes are automatically tracked
- **Branches are just pointers to commits** - Simpler mental model than Git
- **Atomic commits** - Each logical change should be its own commit
- **Edit history directly** - Use `jj edit` to fix issues in previous commits rather than creating "fix" commits

**Essential jj commands**:
- `jj status` - Show working copy status
- `jj new` - Create a new change and start working on it
- `jj describe --message "msg"` - Set commit message for current change
- `jj commit --message "msg"` - Commit with message (preferred for automation)
- `jj log` - Show the commit graph
- `jj edit <revision>` - Edit a previous commit directly
- `jj squash` - Squash changes into parent commit

**Best practices**:
- Always use non-interactive flags: `--message`, `--no-edit`, etc.
- Prefer `jj commit` over `jj describe` for automation
- Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for all commit messages

### Available Commands
- `just help` - Show all available commands
- `just install-dev` - Install with development dependencies
- `just run <args>` - Run the CLI with arguments
- `just check` - Run all checks (lint, typecheck, test)
- `just pre-commit` - Run pre-commit hooks manually
- `just lint` / `just lint-fix` - Linting
- `just format` - Code formatting
- `just typecheck` - Type checking
- `just test` / `just test-cov` - Testing
- `just convert <file>` - Convert text to audiobook
- `just web` - Start web interface server
- `just build` - Build the package
- `just clean` - Clean build artifacts

## 🏗️ Architecture Overview

### Backend Components (Python)
- **TextParser**: `basic`, `advanced` - Parse text into segments
- **CharacterAnalyzer**: `basic`, `statistical` - Analyze characters and assign voices
- **VoiceGenerator**: `edge-tts` - Generate audio from text
- **AudioCompiler**: `basic` - Combine audio segments

### Frontend Stack (TypeScript)
- **Runtime**: Bun (3-10x faster package management)
- **Framework**: Vite + React 18 (lightning-fast dev server)
- **Styling**: Tailwind CSS (utility-first, rapid development)
- **Testing**: Playwright + BDD with Gherkin feature files

### Testing Strategy
- **BDD (Behavior-Driven Development)**: Feature files written in Gherkin
- **End-to-End Testing**: Playwright for real browser automation
- **Cross-Browser**: Tests run on Chrome, Firefox, Safari, and mobile
- **Visual Testing**: Screenshot comparisons and responsive design validation
- **API Mocking**: MSW (Mock Service Worker) for backend independence

### Key Features
- Component swapping via CLI flags or config files
- YAML/JSON configuration support
- Dry-run mode for testing
- Rich CLI output with progress indicators
- Character profiling with voice assignment
- Modern web interface with real-time updates

## 🧪 Testing Commands

```bash
# Quick functional test
just run convert simple_test.txt --dry-run

# Test different parsers
just run convert test_input.txt --parser advanced --analyzer statistical --dry-run

# List available components and voices
just run list-components
just run list-voices --language en

# Generate audio previews
just run preview test_input.txt --segments 3

# Start web interface
just web
# or with custom port
just run web --port 8080

# Frontend Development (Vite + Bun)
cd frontend
bun dev              # Start development server (very fast!)
bun build            # Build for production
bun test             # Run BDD tests with Playwright
bun run test:headed  # Run tests with browser UI
bun run test:ui      # Run tests with Playwright UI
bun run test:debug   # Debug tests step by step
```

## 🔧 Development Workflow

1. Start new work: `jj new` (creates new change)
2. Make code changes
3. Run `just check` to verify everything passes
4. Test functionality with `just run <command>`
5. Use `just format` to ensure consistent formatting
6. Commit atomic change: `jj commit --message "feat: your change description"`
7. For fixes to previous commits: `jj edit <revision>` then make changes

## ⚠️ Known Issues

- **Edge TTS Connection**: Sometimes Edge TTS service returns no audio. This is an external service issue, not a code problem.
- **Type Checking**: Some mypy errors remain for external libraries without type stubs.

## 📁 Key Files

- `justfile` - Development commands
- `src/ariel/core/pipeline.py` - Main processing pipeline
- `src/ariel/core/interfaces.py` - Abstract base classes
- `src/ariel/core/factory.py` - Component factory
- `src/ariel/cli.py` - Command-line interface

## Technical Foundation
## Technical Foundation

### Language and Runtime

- **Python 3.12**: Latest stable version with good ecosystem support
  - Pattern matching (match/case) for cleaner code
  - Better error messages
  - Performance improvements
  - Avoid 3.13 until libraries catch up

### Development Tools

- **Package Manager**: `uv` instead of pip
  - Faster dependency resolution
  - Better reproducible builds
  - Single tool for venv and package management
- **Project Structure**: Modern Python with `pyproject.toml`
- **Type Hints**: Full type annotations with `mypy` for validation
- **Formatting**: `ruff` for linting and formatting (faster than black+flake8)

### Key Libraries

- **CLI**: `typer` - Type-hint based CLI framework
- **Async**: `asyncio` + `aiofiles` for concurrent operations
- **Audio**: `pydub` + `ffmpeg` for audio processing
- **TTS**: `edge-tts` for primary implementation
- **HTTP**: `httpx` for async API calls
- **Config**: `pydantic` + `pydantic-settings` for configuration
- **Progress**: `rich` for beautiful terminal output
- **Testing**: `pytest` + `pytest-asyncio`

### Project Structure
```
ariel/
├── pyproject.toml          # Modern Python project file
├── uv.lock                 # Lock file from uv
├── README.md
├── src/
│   └── ariel/
│       ├── __init__.py
│       ├── __main__.py     # Entry point
│       ├── cli.py          # Typer CLI definition
│       ├── models.py       # Pydantic models
│       ├── core/
│       ├── parsers/
│       ├── analyzers/
│       ├── generators/
│       └── compilers/
└── tests/
```

### Code Style Decisions

- Use async/await throughout for better concurrency
- Pydantic models for all data structures
- Abstract base classes using Python's `abc` module
- Dependency injection for swappable components
- Rich exceptions with helpful error messages

---
