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

### Conventional Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). All commit messages should adhere to this specification to maintain a clear and descriptive version history.

### Available Commands
- `just help` - Show all available commands
- `just install-dev` - Install with development dependencies
- `just run <args>` - Run the CLI with arguments
- `just check` - Run all checks (lint, typecheck, test)
- `just lint` / `just lint-fix` - Linting
- `just format` - Code formatting
- `just typecheck` - Type checking
- `just test` / `just test-cov` - Testing
- `just convert <file>` - Convert text to audiobook
- `just build` - Build the package
- `just clean` - Clean build artifacts

## 🏗️ Architecture Overview

### Modular Components
- **TextParser**: `basic`, `advanced` - Parse text into segments
- **CharacterAnalyzer**: `basic`, `statistical` - Analyze characters and assign voices
- **VoiceGenerator**: `edge-tts` - Generate audio from text
- **AudioCompiler**: `basic` - Combine audio segments

### Key Features
- Component swapping via CLI flags or config files
- YAML/JSON configuration support
- Dry-run mode for testing
- Rich CLI output with progress indicators
- Character profiling with voice assignment

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
