"""Edge-TTS based audio generator."""

import asyncio
import io
from typing import Dict

import edge_tts
from pydub import AudioSegment

from aleph.models import AudioSegment as AlephAudioSegment, SpeakerType, TextSegment


class EdgeTTSGenerator:
    """Text-to-speech generator using Edge-TTS."""
    
    def __init__(self) -> None:
        # Voice mapping for different speaker types
        self.voice_map: Dict[SpeakerType, str] = {
            SpeakerType.NARRATOR: "en-US-JennyNeural",  # Female narrator voice
            SpeakerType.CHARACTER: "en-US-GuyNeural",   # Male character voice
        }
    
    async def generate_audio(self, segment: TextSegment) -> AlephAudioSegment:
        """Generate audio for a text segment."""
        voice = self.voice_map[segment.speaker_type]
        
        # Create TTS communicate object
        communicate = edge_tts.Communicate(segment.text, voice)
        
        # Generate audio data
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]
        
        # Convert to AudioSegment to get duration
        audio_io = io.BytesIO(audio_data)
        audio_segment = AudioSegment.from_mp3(audio_io)
        duration_ms = len(audio_segment)
        
        return AlephAudioSegment(
            audio_data=audio_data,
            text=segment.text,
            speaker_type=segment.speaker_type,
            speaker_name=segment.speaker_name,
            duration_ms=duration_ms
        )
    
    async def generate_multiple(self, segments: list[TextSegment]) -> list[AlephAudioSegment]:
        """Generate audio for multiple segments concurrently."""
        tasks = [self.generate_audio(segment) for segment in segments]
        return await asyncio.gather(*tasks)