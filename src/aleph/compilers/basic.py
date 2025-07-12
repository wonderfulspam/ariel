"""Basic audio compiler that concatenates segments."""

import io
from pathlib import Path
from typing import List

from pydub import AudioSegment

from aleph.models import AudioSegment as AlephAudioSegment


class BasicAudioCompiler:
    """Compiler that concatenates audio segments sequentially."""
    
    def __init__(self, silence_duration_ms: int = 500) -> None:
        """Initialize compiler with optional silence between segments."""
        self.silence_duration_ms = silence_duration_ms
    
    def compile(self, segments: List[AlephAudioSegment], output_path: Path) -> None:
        """Compile audio segments into a single output file."""
        if not segments:
            raise ValueError("No audio segments to compile")
        
        # Create silence segment for transitions
        silence = AudioSegment.silent(duration=self.silence_duration_ms)
        
        # Start with the first segment
        combined_audio = AudioSegment.from_mp3(io.BytesIO(segments[0].audio_data))
        
        # Add remaining segments with silence between them
        for segment in segments[1:]:
            audio_segment = AudioSegment.from_mp3(io.BytesIO(segment.audio_data))
            combined_audio += silence + audio_segment
        
        # Export the final audio
        combined_audio.export(str(output_path), format="mp3")