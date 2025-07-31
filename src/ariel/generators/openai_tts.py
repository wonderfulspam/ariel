"""OpenAI TTS based audio generator."""

import asyncio
import io
from typing import Any

from openai import AsyncOpenAI
from pydub import AudioSegment as PydubAudioSegment

from ..core.interfaces import VoiceGenerator
from ..models import AudioSegment, SpeakerType, TextSegment


class OpenAITTSVoiceGenerator(VoiceGenerator):
    """Text-to-speech generator using OpenAI TTS API."""

    def __init__(self, api_key: str | None = None) -> None:
        """Initialize OpenAI TTS generator.

        Args:
            api_key: OpenAI API key. If None, will try to get from environment.
        """
        self.client = AsyncOpenAI(api_key=api_key)

        # Available OpenAI TTS voices
        self.available_voices = [
            "alloy",    # Neutral, balanced voice
            "echo",     # Male voice
            "fable",    # British accent
            "onyx",     # Deep male voice
            "nova",     # Young female voice
            "shimmer",  # Soft female voice
        ]

        # Voice mapping for different speaker types
        self.voice_map: dict[SpeakerType, str] = {
            SpeakerType.NARRATOR: "alloy",    # Neutral narrator voice
            SpeakerType.CHARACTER: "echo",    # Male character voice
        }

    async def generate_audio(
        self,
        text: str,
        voice_id: str,
        voice_characteristics: dict[str, Any] | None = None,
    ) -> bytes:
        """Generate audio for given text with specified voice."""
        # Validate voice_id
        if voice_id not in self.available_voices:
            # Fallback to default voice if invalid
            voice_id = "alloy"

        # Get voice characteristics
        characteristics = voice_characteristics or {}
        model = characteristics.get("model", "tts-1")  # tts-1 or tts-1-hd
        speed = characteristics.get("speed", 1.0)  # 0.25 to 4.0

        try:
            # Generate audio using OpenAI TTS
            response = await self.client.audio.speech.create(
                model=model,
                voice=voice_id,
                input=text,
                response_format="mp3",
                speed=speed,
            )

            # Return audio data as bytes
            return response.content

        except Exception as e:
            raise RuntimeError(f"OpenAI TTS generation failed: {e}")

    async def generate_audio_for_segment(self, segment: TextSegment) -> AudioSegment:
        """Generate audio for a text segment (backward compatibility)."""
        voice = self.voice_map.get(segment.speaker_type, "alloy")

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
        return [
            {
                "id": "alloy",
                "name": "Alloy",
                "gender": "neutral",
                "locale": "en-US",
                "language": "en",
                "description": "Neutral, balanced voice",
            },
            {
                "id": "echo",
                "name": "Echo",
                "gender": "male",
                "locale": "en-US",
                "language": "en",
                "description": "Male voice",
            },
            {
                "id": "fable",
                "name": "Fable",
                "gender": "male",
                "locale": "en-GB",
                "language": "en",
                "description": "British accent",
            },
            {
                "id": "onyx",
                "name": "Onyx",
                "gender": "male",
                "locale": "en-US",
                "language": "en",
                "description": "Deep male voice",
            },
            {
                "id": "nova",
                "name": "Nova",
                "gender": "female",
                "locale": "en-US",
                "language": "en",
                "description": "Young female voice",
            },
            {
                "id": "shimmer",
                "name": "Shimmer",
                "gender": "female",
                "locale": "en-US",
                "language": "en",
                "description": "Soft female voice",
            },
        ]

    async def generate_multiple(
        self, segments: list[TextSegment]
    ) -> list[AudioSegment]:
        """Generate audio for multiple segments concurrently."""
        tasks = [self.generate_audio_for_segment(segment) for segment in segments]
        return await asyncio.gather(*tasks)
