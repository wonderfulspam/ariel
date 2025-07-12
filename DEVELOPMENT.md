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
uv run aleph convert --help
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

### Conventional Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). All commit messages should adhere to this specification to maintain a clear and descriptive version history.

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

1. Make code changes
2. Run `just check` to verify everything passes
3. Test functionality with `just run <command>`
4. Use `just format` to ensure consistent formatting
5. Commit changes when ready

## ⚠️ Known Issues

- **Edge TTS Connection**: Sometimes Edge TTS service returns no audio. This is an external service issue, not a code problem.
- **Type Checking**: Some mypy errors remain for external libraries without type stubs.

## 📁 Key Files

- `justfile` - Development commands
- `src/aleph/core/pipeline.py` - Main processing pipeline
- `src/aleph/core/interfaces.py` - Abstract base classes
- `src/aleph/core/factory.py` - Component factory
- `src/aleph/cli.py` - Command-line interface
