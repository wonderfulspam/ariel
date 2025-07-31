"""Configuration management for Ariel."""

import json
from pathlib import Path
from typing import Any

import yaml
from pydantic_settings import BaseSettings

from ..models import ProcessingConfig, VoiceProfile


class ArielConfig(BaseSettings):
    """Main configuration class with environment variable support."""

    # Core pipeline settings
    parser_type: str = "basic"
    analyzer_type: str = "basic"
    voice_generator_type: str = "edge-tts"
    compiler_type: str = "basic"

    # Output settings
    output_format: str = "mp3"
    output_directory: str = "./output"

    # Voice settings
    default_narrator_voice: str = "en-US-AriaNeural"
    default_character_voice: str = "en-US-DavisNeural"

    # Processing settings
    max_concurrent_generations: int = 5
    audio_quality: str = "standard"  # low, standard, high

    # API settings for TTS engines
    openai_api_key: str | None = None
    elevenlabs_api_key: str | None = None

    # Coqui TTS settings
    coqui_model_name: str = "tts_models/en/ljspeech/tacotron2-DDC"
    coqui_cache_dir: str | None = None

    class Config:
        env_prefix = "ARIEL_"
        env_file = ".env"


class ConfigManager:
    """Manages configuration loading and validation."""

    def __init__(self, config_file: str | Path | None = None):
        self.config_file = Path(config_file) if config_file else None
        self._base_config = ArielConfig()
        self._processing_config: ProcessingConfig | None = None

    def load_config(self, config_file: str | Path | None = None) -> ProcessingConfig:
        """Load configuration from file or use defaults."""
        if config_file:
            self.config_file = Path(config_file)

        # Start with base configuration
        config_data = self._base_config.model_dump()

        # Override with file configuration if provided
        if self.config_file and self.config_file.exists():
            file_config = self._load_config_file(self.config_file)
            config_data.update(file_config)

        # Create ProcessingConfig
        processing_config = ProcessingConfig(
            parser_type=config_data.get("parser_type", "basic"),
            analyzer_type=config_data.get("analyzer_type", "basic"),
            voice_generator_type=config_data.get("voice_generator_type", "edge-tts"),
            compiler_type=config_data.get("compiler_type", "basic"),
            output_format=config_data.get("output_format", "mp3"),
            voice_mappings=self._parse_voice_mappings(
                config_data.get("voice_mappings", {})
            ),
        )

        self._processing_config = processing_config
        return processing_config

    def _load_config_file(self, config_file: Path) -> dict[str, Any]:
        """Load configuration from YAML or JSON file."""
        try:
            with open(config_file, encoding="utf-8") as f:
                if config_file.suffix.lower() in [".yaml", ".yml"]:
                    return yaml.safe_load(f) or {}
                elif config_file.suffix.lower() == ".json":
                    return json.load(f)
                else:
                    raise ValueError(
                        f"Unsupported config file format: {config_file.suffix}"
                    )
        except (yaml.YAMLError, json.JSONDecodeError, FileNotFoundError) as e:
            raise ValueError(f"Error loading config file {config_file}: {e}")

    def _parse_voice_mappings(
        self, voice_mappings_data: dict[str, Any]
    ) -> dict[str, VoiceProfile]:
        """Parse voice mappings from configuration data."""
        voice_mappings = {}

        for character_name, voice_data in voice_mappings_data.items():
            if isinstance(voice_data, str):
                # Simple string voice ID
                voice_mappings[character_name] = VoiceProfile(voice_id=voice_data)
            elif isinstance(voice_data, dict):
                # Full voice profile
                voice_mappings[character_name] = VoiceProfile(
                    voice_id=voice_data.get("voice_id", ""),
                    characteristics=voice_data.get("characteristics", {}),
                    engine=voice_data.get("engine", "edge-tts"),
                )

        return voice_mappings

    def save_config(self, config_file: str | Path | None = None) -> None:
        """Save current configuration to file."""
        if not config_file and not self.config_file:
            raise ValueError("No config file specified")

        save_path = Path(config_file) if config_file else self.config_file

        if not self._processing_config:
            raise ValueError("No configuration loaded to save")

        # Convert to dictionary
        config_data = self._processing_config.model_dump()

        # Convert voice mappings to serializable format
        config_data["voice_mappings"] = {
            name: {
                "voice_id": profile.voice_id,
                "characteristics": profile.characteristics,
                "engine": profile.engine,
            }
            for name, profile in config_data["voice_mappings"].items()
        }

        # Save based on file extension
        save_path.parent.mkdir(parents=True, exist_ok=True)

        with open(save_path, "w", encoding="utf-8") as f:
            if save_path.suffix.lower() in [".yaml", ".yml"]:
                yaml.dump(config_data, f, default_flow_style=False, indent=2)
            elif save_path.suffix.lower() == ".json":
                json.dump(config_data, f, indent=2)
            else:
                raise ValueError(f"Unsupported config file format: {save_path.suffix}")

    def get_default_config_template(self) -> dict[str, Any]:
        """Get a template configuration with comments."""
        return {
            "# Ariel Configuration": None,
            "parser_type": "basic",  # basic, advanced, llm
            "analyzer_type": "basic",  # basic, statistical, llm
            "voice_generator_type": "edge-tts",  # edge-tts, openai, coqui
            "compiler_type": "basic",  # basic, chapter-aware
            "output_format": "mp3",  # mp3, wav, m4a
            "voice_mappings": {
                "narrator": {
                    "voice_id": "en-US-AriaNeural",
                    "engine": "edge-tts",
                    "characteristics": {},
                },
                "character": {
                    "voice_id": "en-US-DavisNeural",
                    "engine": "edge-tts",
                    "characteristics": {},
                },
            },
            "processing_settings": {
                "max_concurrent_generations": 5,
                "audio_quality": "standard",
            },
        }

    @property
    def current_config(self) -> ProcessingConfig | None:
        """Get the currently loaded processing configuration."""
        return self._processing_config
