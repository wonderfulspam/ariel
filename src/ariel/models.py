"""Pydantic models for Ariel."""

from enum import Enum
from typing import Any

from pydantic import BaseModel


class SpeakerType(str, Enum):
    """Type of speaker in the text."""

    NARRATOR = "narrator"
    CHARACTER = "character"


class TextSegment(BaseModel):
    """A segment of text with speaker attribution."""

    text: str
    speaker_type: SpeakerType
    speaker_name: str = "narrator"
    confidence: float = 1.0


class AudioSegment(BaseModel):
    """An audio segment with metadata."""

    audio_data: bytes
    text: str
    speaker_type: SpeakerType
    speaker_name: str
    duration_ms: int
    voice_id: str | None = None


class VoiceProfile(BaseModel):
    """Voice profile for a character."""

    voice_id: str
    characteristics: dict[str, Any] = {}
    engine: str = "edge-tts"


class CharacterProfile(BaseModel):
    """Character profile with voice and dialogue information."""

    name: str
    character_type: str = "character"
    voice_profile: VoiceProfile | None = None
    dialogue_count: int = 0
    sample_dialogue: list[str] = []
    confidence: float = 1.0


class ProcessingConfig(BaseModel):
    """Configuration for the processing pipeline."""

    parser_type: str = "basic"
    analyzer_type: str = "basic"
    voice_generator_type: str = "edge-tts"
    compiler_type: str = "basic"
    voice_mappings: dict[str, VoiceProfile] = {}
    output_format: str = "mp3"
