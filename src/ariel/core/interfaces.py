"""Abstract base classes for Ariel components."""

from abc import ABC, abstractmethod
from typing import Any

from ..models import AudioSegment, TextSegment


class TextParser(ABC):
    """Abstract base class for text parsers."""

    @abstractmethod
    async def parse(self, text: str) -> list[TextSegment]:
        """Parse text into segments with speaker attribution.

        Args:
            text: Raw input text

        Returns:
            List of text segments with speaker attribution
        """
        pass


class Character:
    """Represents a character with voice characteristics."""

    def __init__(
        self,
        name: str,
        character_type: str = "character",
        voice_id: str | None = None,
        voice_characteristics: dict[str, Any] | None = None,
    ):
        self.name = name
        self.character_type = character_type
        self.voice_id = voice_id
        self.voice_characteristics = voice_characteristics or {}
        self.dialogue_count = 0
        self.sample_dialogue: list[str] = []


class CharacterAnalyzer(ABC):
    """Abstract base class for character analyzers."""

    @abstractmethod
    async def analyze(self, segments: list[TextSegment]) -> list[Character]:
        """Analyze segments to identify unique characters.

        Args:
            segments: Parsed text segments

        Returns:
            List of identified characters with their characteristics
        """
        pass


class VoiceGenerator(ABC):
    """Abstract base class for voice generators."""

    @abstractmethod
    async def generate_audio(
        self,
        text: str,
        voice_id: str,
        voice_characteristics: dict[str, Any] | None = None,
    ) -> bytes:
        """Generate audio for given text with specified voice.

        Args:
            text: Text to convert to speech
            voice_id: Identifier for the voice to use
            voice_characteristics: Additional voice parameters

        Returns:
            Audio data as bytes
        """
        pass

    @abstractmethod
    async def list_voices(self) -> list[dict[str, Any]]:
        """List available voices.

        Returns:
            List of voice information dictionaries
        """
        pass


class AudioCompiler(ABC):
    """Abstract base class for audio compilers."""

    @abstractmethod
    async def compile_audio(
        self, segments: list[AudioSegment], output_path: str, **kwargs
    ) -> str:
        """Compile audio segments into final output.

        Args:
            segments: List of audio segments to compile
            output_path: Path for the output file
            **kwargs: Additional compilation options

        Returns:
            Path to the generated audio file
        """
        pass
