"""Edge-TTS based audio generator."""

import asyncio
import io
from typing import Any

import edge_tts
from pydub import AudioSegment as PydubAudioSegment

from ..core.interfaces import VoiceGenerator
from ..models import AudioSegment, SpeakerType, TextSegment


class EdgeTTSVoiceGenerator(VoiceGenerator):
    """Text-to-speech generator using Edge-TTS."""

    def __init__(self) -> None:
        # Voice mapping for different speaker types
        self.voice_map: dict[SpeakerType, str] = {
            SpeakerType.NARRATOR: "en-US-JennyNeural",  # Female narrator voice
            SpeakerType.CHARACTER: "en-US-GuyNeural",  # Male character voice
        }

    async def generate_audio(
        self,
        text: str,
        voice_id: str,
        voice_characteristics: dict[str, Any] | None = None,
    ) -> bytes:
        """Generate audio for given text with specified voice."""
        # Create TTS communicate object
        communicate = edge_tts.Communicate(text, voice_id)

        # Generate audio data
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]

        return audio_data

    async def generate_audio_for_segment(self, segment: TextSegment) -> AudioSegment:
        """Generate audio for a text segment (backward compatibility)."""
        voice = self.voice_map.get(segment.speaker_type, "en-US-AriaNeural")

        audio_data = await self.generate_audio(segment.text, voice)

        # Convert to AudioSegment to get duration
        audio_io = io.BytesIO(audio_data)
        audio_segment = PydubAudioSegment.from_mp3(audio_io)
        duration_ms = len(audio_segment)

        return AudioSegment(
            audio_data=audio_data,
            text=segment.text,
            speaker_type=segment.speaker_type,
            speaker_name=segment.speaker_name,
            duration_ms=duration_ms,
            voice_id=voice,
        )

    async def list_voices(self) -> list[dict[str, Any]]:
        """List available voices."""
        voices = await edge_tts.list_voices()
        return [
            {
                "id": voice["ShortName"],
                "name": voice["FriendlyName"],
                "gender": voice["Gender"],
                "locale": voice["Locale"],
                "language": voice["Locale"].split("-")[0],
            }
            for voice in voices
        ]

    async def generate_multiple(
        self, segments: list[TextSegment]
    ) -> list[AudioSegment]:
        """Generate audio for multiple segments concurrently."""
        tasks = [self.generate_audio_for_segment(segment) for segment in segments]
        return await asyncio.gather(*tasks)
