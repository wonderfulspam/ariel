"""Basic audio compiler that concatenates segments."""

import io
from pathlib import Path

from pydub import AudioSegment as PydubAudioSegment

from ..core.interfaces import AudioCompiler
from ..models import AudioSegment


class BasicAudioCompiler(AudioCompiler):
    """Compiler that concatenates audio segments sequentially."""

    def __init__(self, silence_duration_ms: int = 500) -> None:
        """Initialize compiler with optional silence between segments."""
        self.silence_duration_ms = silence_duration_ms

    async def compile_audio(
        self, segments: list[AudioSegment], output_path: str, **kwargs
    ) -> str:
        """Compile audio segments into a single output file."""
        if not segments:
            raise ValueError("No audio segments to compile")

        # Create silence segment for transitions
        silence = PydubAudioSegment.silent(duration=self.silence_duration_ms)

        # Start with the first segment
        combined_audio = PydubAudioSegment.from_mp3(io.BytesIO(segments[0].audio_data))

        # Add remaining segments with silence between them
        for segment in segments[1:]:
            audio_segment = PydubAudioSegment.from_mp3(io.BytesIO(segment.audio_data))
            combined_audio += silence + audio_segment

        # Ensure output directory exists
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)

        # Export the final audio
        format_type = kwargs.get("format", "mp3")
        combined_audio.export(str(output_file), format=format_type)

        return str(output_file)

    def compile(self, segments: list[AudioSegment], output_path: Path) -> None:
        """Compile audio segments into a single output file (backward compatibility)."""
        if not segments:
            raise ValueError("No audio segments to compile")

        # Create silence segment for transitions
        silence = PydubAudioSegment.silent(duration=self.silence_duration_ms)

        # Start with the first segment
        combined_audio = PydubAudioSegment.from_mp3(io.BytesIO(segments[0].audio_data))

        # Add remaining segments with silence between them
        for segment in segments[1:]:
            audio_segment = PydubAudioSegment.from_mp3(io.BytesIO(segment.audio_data))
            combined_audio += silence + audio_segment

        # Export the final audio
        combined_audio.export(str(output_path), format="mp3")
