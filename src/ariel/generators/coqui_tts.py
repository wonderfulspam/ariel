"""Coqui TTS based audio generator."""

import asyncio
import io
import tempfile
from pathlib import Path
from typing import Any

from pydub import AudioSegment as PydubAudioSegment

from ..core.interfaces import VoiceGenerator
from ..models import AudioSegment, SpeakerType, TextSegment


class CoquiTTSVoiceGenerator(VoiceGenerator):
    """Text-to-speech generator using Coqui TTS."""

    def __init__(self, model_name: str | None = None) -> None:
        """Initialize Coqui TTS generator.

        Args:
            model_name: Coqui TTS model to use. If None, uses default.
        """
        self.model_name = model_name or "tts_models/en/ljspeech/tacotron2-DDC"
        self.tts = None
        self._initialized = False

        # Voice mapping for different speaker types
        self.voice_map: dict[SpeakerType, str] = {
            SpeakerType.NARRATOR: "female",    # Female narrator voice
            SpeakerType.CHARACTER: "male",     # Male character voice
        }

    async def _initialize_tts(self):
        """Initialize TTS model lazily."""
        if self._initialized:
            return

        try:
            # Import TTS here to avoid import errors if not installed
            from TTS.api import TTS

            # Initialize TTS model
            self.tts = TTS(model_name=self.model_name, progress_bar=False)
            self._initialized = True

        except ImportError:
            raise RuntimeError(
                "Coqui TTS not installed. Install with: pip install TTS"
            )
        except Exception as e:
            raise RuntimeError(f"Failed to initialize Coqui TTS: {e}")

    async def generate_audio(
        self,
        text: str,
        voice_id: str,
        voice_characteristics: dict[str, Any] | None = None,
    ) -> bytes:
        """Generate audio for given text with specified voice."""
        await self._initialize_tts()

        # Get voice characteristics
        characteristics = voice_characteristics or {}

        try:
            # Create temporary file for output
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_path = temp_file.name

            # Generate audio using Coqui TTS
            # Run in thread pool since TTS is synchronous
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.tts.tts_to_file(
                    text=text,
                    file_path=temp_path,
                    speaker=voice_id if self._model_supports_speakers() else None,
                    emotion=characteristics.get("emotion"),
                    speed=characteristics.get("speed", 1.0),
                )
            )

            # Read generated audio file
            audio_segment = PydubAudioSegment.from_wav(temp_path)

            # Convert to MP3 format for consistency
            mp3_io = io.BytesIO()
            audio_segment.export(mp3_io, format="mp3")
            audio_data = mp3_io.getvalue()

            # Clean up temporary file
            Path(temp_path).unlink(missing_ok=True)

            return audio_data

        except Exception as e:
            # Clean up temporary file on error
            Path(temp_path).unlink(missing_ok=True)
            raise RuntimeError(f"Coqui TTS generation failed: {e}")

    def _model_supports_speakers(self) -> bool:
        """Check if the current model supports multiple speakers."""
        if not self.tts:
            return False

        # Check if model has speaker support
        return hasattr(self.tts, 'speakers') and self.tts.speakers is not None

    async def generate_audio_for_segment(self, segment: TextSegment) -> AudioSegment:
        """Generate audio for a text segment (backward compatibility)."""
        voice = self.voice_map.get(segment.speaker_type, "female")

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
        await self._initialize_tts()

        voices = []

        # Add basic voice options
        voices.extend([
            {
                "id": "female",
                "name": "Female Voice",
                "gender": "female",
                "locale": "en-US",
                "language": "en",
                "description": "Default female voice",
            },
            {
                "id": "male",
                "name": "Male Voice",
                "gender": "male",
                "locale": "en-US",
                "language": "en",
                "description": "Default male voice",
            },
        ])

        # Add model-specific speakers if available
        if self._model_supports_speakers():
            try:
                speakers = self.tts.speakers
                if speakers:
                    for speaker in speakers:
                        voices.append({
                            "id": speaker,
                            "name": f"Speaker {speaker}",
                            "gender": "unknown",
                            "locale": "en-US",
                            "language": "en",
                            "description": f"Model speaker: {speaker}",
                        })
            except Exception:
                # Ignore errors when getting speakers
                pass

        return voices

    async def generate_multiple(
        self, segments: list[TextSegment]
    ) -> list[AudioSegment]:
        """Generate audio for multiple segments concurrently."""
        # Note: Coqui TTS may not benefit from high concurrency due to model loading
        # We'll use a semaphore to limit concurrent generations
        semaphore = asyncio.Semaphore(2)  # Limit to 2 concurrent generations

        async def generate_with_semaphore(segment):
            async with semaphore:
                return await self.generate_audio_for_segment(segment)

        tasks = [generate_with_semaphore(segment) for segment in segments]
        return await asyncio.gather(*tasks)

    def set_model(self, model_name: str):
        """Change the TTS model."""
        if model_name != self.model_name:
            self.model_name = model_name
            self.tts = None
            self._initialized = False

    @classmethod
    def list_available_models(cls) -> list[str]:
        """List available Coqui TTS models."""
        try:
            from TTS.api import TTS
            return TTS.list_models()
        except ImportError:
            return []
        except Exception:
            # Return some common models if API call fails
            return [
                "tts_models/en/ljspeech/tacotron2-DDC",
                "tts_models/en/ljspeech/glow-tts",
                "tts_models/en/ljspeech/speedy-speech",
                "tts_models/en/vctk/vits",
                "tts_models/en/sam/tacotron-DDC",
            ]
