"""Pydantic models for Aleph."""

from enum import Enum
from typing import List

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


class AudioSegment(BaseModel):
    """An audio segment with metadata."""
    audio_data: bytes
    text: str
    speaker_type: SpeakerType
    speaker_name: str
    duration_ms: int