# Ariel - Public Domain Audiobook Converter

## Project Overview

Ariel transforms public domain books into audiobooks with AI-generated voices
for different characters. Like Shakespeare's spirit Ariel, who could transform
and adapt to any form, this tool transforms written words through a sea-change
into something rich and strange - bringing text to life with diverse voices
that emerge from the digital realm to tell their stories.

---

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

## Iteration 1a: Proof of Concept

### Objective

Build the simplest possible system that produces a working audiobook from a text
file.

### Requirements

- **Input**: Plain text file (.txt)
- **Output**: Single audio file (MP3) with distinct voices for narrator and
  dialogue
- **Processing**:
  - Distinguish between narrative text and character dialogue
  - Assign different TTS voices to narrator vs characters
  - Generate continuous audio output

### Constraints

- Use Edge-TTS for initial implementation (no API key required)
- Two voices only: one for narrator, one for all character dialogue
- No configuration files - hardcoded settings acceptable
- Optimize for speed of implementation over accuracy

### Command Interface

```bash
ariel convert <input_file>
```

### Technical Stack

- **Python**: 3.12 (good balance of features and stability, avoiding 3.13 until
  ecosystem catches up)
- **Package Manager**: `uv` for faster, more reliable dependency resolution
- **Project Management**: Use `pyproject.toml` instead of `setup.py`
- **CLI Framework**: `typer` (modern, type-hints based, better than
  click/argparse)
- **Audio Processing**: `pydub` with `ffmpeg`
- **Async**: Use `asyncio` for concurrent TTS requests

### Success Criteria

- Produces listenable audio from any plain text file
- Clear distinction between narrator and character voices
- Minimal dependencies and setup required

---

## Iteration 1b: Enhanced CLI with Flexible Architecture

### Objective

Transform the PoC into an extensible system where each processing stage can have
multiple implementations.

### Core Components

#### 1. Text Parser

**Purpose**: Extract narrative and dialogue segments from input text

**Required Implementations**:
- Basic: Simple quotation mark detection
- Advanced: Pattern matching for dialogue attribution ("said X", "X replied")
- LLM-based: Context-aware speaker identification

**Interface Requirements**:
- Input: Raw text
- Output: List of segments with speaker attribution

#### 2. Character Analyzer

**Purpose**: Identify unique characters and their characteristics

**Required Implementations**:
- Basic: Simple narrator/character distinction
- Statistical: Track speaker frequency and patterns
- LLM-based: Generate rich character profiles with voice suggestions

**Interface Requirements**:
- Input: Parsed segments
- Output: Character profiles with voice recommendations

#### 3. Voice Generator

**Purpose**: Convert text to speech with specified voice characteristics

**Required Implementations**:
- Edge-TTS (primary, no API key needed)
- OpenAI TTS (high quality alternative)
- At least one more alternative (ElevenLabs, Azure, or Coqui)

**Interface Requirements**:
- Input: Text segment and voice parameters
- Output: Audio data

**Technical Note**: Use `edge-tts` Python package for the primary implementation

#### 4. Audio Compiler

**Purpose**: Combine audio segments into final output

**Required Implementations**:
- Sequential compilation with smooth transitions
- Chapter-aware compilation (optional)

**Interface Requirements**:
- Input: List of audio segments
- Output: Complete audio file(s)

### Configuration System

Support YAML/JSON configuration for:
- Pipeline component selection
- API credentials
- Voice mappings
- Output preferences

### Command Interface

```bash
# Basic usage
ariel convert <input_file>

# With options
ariel convert <input_file> --config <config_file> --output <output_file>

# Component selection
ariel convert <input_file> --parser llm --analyzer basic --voice-gen edge-tts
```

### Additional Commands

- `--dry-run`: Show character analysis without generating audio
- `--preview`: Generate sample audio (first N words)
- `--list-voices`: Show available voices for selected TTS engine

### Error Handling

- Graceful fallback between component implementations
- Clear error messages for missing dependencies or API failures
- Resume capability for interrupted processing

### Success Criteria

- Modular architecture with clean interfaces
- Easy addition of new implementations
- Maintains PoC simplicity for basic use cases
- Significant improvement in character attribution accuracy with advanced parsers

---

## Iteration 2: Web Interface

### Objective

Create a web-based interface for interactive audiobook creation and voice
customization.

### Core Features

#### Book Management

- Upload books (txt, epub)
- View processing status
- Access generated audiobooks

#### Character & Voice Management

- Visual character list with detected dialogue
- Voice assignment interface
- Natural language voice customization
- Real-time preview of voice changes

#### Audio Generation

- Progress tracking
- Chapter-based generation options
- Multiple output formats

### User Flows

#### Primary Flow

1. User uploads book
2. System analyzes and presents character list
3. User assigns/customizes voices using natural language
4. User previews and adjusts
5. System generates complete audiobook
6. User downloads result

#### Voice Customization Flow

1. Select character
2. Enter prompt: "Make voice sound older and more authoritative"
3. Preview sample dialogue
4. Iterate until satisfied

### Technical Requirements

- REST API for backend operations
- Real-time updates for long-running processes
- Persistent storage for projects
- Authentication (optional for first version)

### API Endpoints

- Book upload and management
- Character retrieval and updates
- Voice configuration and preview
- Audio generation and download
- Project save/load

### Success Criteria

- Intuitive interface for non-technical users
- Natural language voice customization works reliably
- Processing time comparable to CLI version
- Support for iterative refinement of voices

---

## General Requirements

### Performance

- Process 100k word novel in reasonable time
- Support streaming for large files
- Efficient caching of generated audio segments

### Quality

- Audio output comparable to commercial audiobooks
- Accurate character attribution (target: 90%+ with best parser)
- Natural transitions between speakers

### Extensibility

- Clear interfaces for adding new components
- Plugin system that doesn't require core modifications
- Support for future features (emotion detection, multiple languages)

### Documentation

- Clear setup instructions
- API documentation for each component
- Examples for common use cases
