"""Enhanced processing pipeline with modular components."""

import io
from pathlib import Path
from typing import Any

from pydub import AudioSegment

from ..models import AudioSegment
from ..models import ProcessingConfig, TextSegment
from .config import ConfigManager
from .factory import factory
from .interfaces import (
    AudioCompiler,
    Character,
    CharacterAnalyzer,
    TextParser,
    VoiceGenerator,
)


class ProcessingPipeline:
    """Enhanced processing pipeline with modular components."""

    def __init__(self, config: ProcessingConfig | None = None):
        self.config = config or ProcessingConfig()
        self.config_manager = ConfigManager()

        # Initialize components
        self.parser: TextParser | None = None
        self.analyzer: CharacterAnalyzer | None = None
        self.generator: VoiceGenerator | None = None
        self.compiler: AudioCompiler | None = None

        self._initialize_components()

    def _initialize_components(self):
        """Initialize pipeline components based on configuration."""
        try:
            self.parser = factory.create_parser(self.config.parser_type)
            self.analyzer = factory.create_analyzer(self.config.analyzer_type)
            self.generator = factory.create_generator(self.config.voice_generator_type)
            self.compiler = factory.create_compiler(self.config.compiler_type)
        except ValueError as e:
            raise ValueError(f"Failed to initialize components: {e}")

    async def process_text_file(
        self, input_file: Path, output_file: Path | None = None, dry_run: bool = False
    ) -> dict[str, Any]:
        """Process a text file through the complete pipeline."""
        # Read input text
        with open(input_file, encoding="utf-8") as f:
            text = f.read()

        return await self.process_text(text, output_file, dry_run, input_file.stem)

    async def process_text(
        self,
        text: str,
        output_file: Path | None = None,
        dry_run: bool = False,
        base_name: str = "output",
    ) -> dict[str, Any]:
        """Process text through the complete pipeline."""
        results = {
            "input_length": len(text),
            "segments": [],
            "characters": [],
            "audio_segments": [],
            "output_file": None,
            "processing_time": 0.0,
        }

        # Step 1: Parse text into segments
        print("🔍 Parsing text...")
        segments = await self.parser.parse(text)
        results["segments"] = [
            {
                "text": seg.text[:100] + "..." if len(seg.text) > 100 else seg.text,
                "speaker_type": seg.speaker_type.value,
                "speaker_name": seg.speaker_name,
                "confidence": seg.confidence,
            }
            for seg in segments
        ]
        print(f"   Found {len(segments)} text segments")

        # Step 2: Analyze characters
        print("👥 Analyzing characters...")
        characters = await self.analyzer.analyze(segments)
        results["characters"] = [
            {
                "name": char.name,
                "type": char.character_type,
                "dialogue_count": char.dialogue_count,
                "voice_id": char.voice_id,
                "sample_dialogue": char.sample_dialogue[:2],  # First 2 samples
            }
            for char in characters
        ]
        print(f"   Identified {len(characters)} characters")

        # Display character analysis
        for char in characters:
            print(
                f"   - {char.name} ({char.character_type}): {char.dialogue_count} segments"
            )
            if char.voice_id:
                print(f"     Voice: {char.voice_id}")

        if dry_run:
            print("🏃 Dry run complete - skipping audio generation")
            return results

        # Step 3: Generate audio for each segment
        print("🎤 Generating audio...")
        audio_segments = await self._generate_audio_segments(segments, characters)
        results["audio_segments"] = len(audio_segments)
        print(f"   Generated {len(audio_segments)} audio segments")

        # Step 4: Compile final audio
        if output_file is None:
            output_file = Path(f"{base_name}_audiobook.{self.config.output_format}")

        print("🎵 Compiling final audio...")
        final_output = await self.compiler.compile_audio(
            audio_segments, str(output_file), format=self.config.output_format
        )
        results["output_file"] = final_output
        print(f"   Created: {final_output}")

        return results

    async def _generate_audio_segments(
        self, segments: list[TextSegment], characters: list[Character]
    ) -> list[AudioSegment]:
        """Generate audio for all text segments."""
        # Create voice mapping from character analysis
        voice_mapping = {}
        for char in characters:
            if char.voice_id:
                voice_mapping[char.name] = char.voice_id

        # Add any configured voice mappings
        for name, voice_profile in self.config.voice_mappings.items():
            voice_mapping[name] = voice_profile.voice_id

        # Generate audio segments
        audio_segments = []
        total_segments = len(segments)

        for i, segment in enumerate(segments, 1):
            print(f"   Generating {i}/{total_segments}: {segment.speaker_name}")

            # Get voice for this segment
            voice_id = voice_mapping.get(
                segment.speaker_name, voice_mapping.get("narrator", "en-US-AriaNeural")
            )

            # Generate audio
            audio_data = await self.generator.generate_audio(
                segment.text,
                voice_id,
                {},  # voice characteristics
            )

            # Calculate duration
            audio_io = io.BytesIO(audio_data)
            audio_segment_pydub = AudioSegment.from_mp3(audio_io)
            duration_ms = len(audio_segment_pydub)

            # Create audio segment
            audio_segment = AudioSegment(
                audio_data=audio_data,
                text=segment.text,
                speaker_type=segment.speaker_type,
                speaker_name=segment.speaker_name,
                duration_ms=duration_ms,
                voice_id=voice_id,
            )

            audio_segments.append(audio_segment)

        return audio_segments

    async def preview_audio(self, text: str, max_segments: int = 3) -> list[bytes]:
        """Generate preview audio for the first few segments."""
        # Parse text
        segments = await self.parser.parse(text)
        preview_segments = segments[:max_segments]

        # Analyze characters
        characters = await self.analyzer.analyze(preview_segments)

        # Generate preview audio
        audio_data_list = []
        voice_mapping = {
            char.name: char.voice_id for char in characters if char.voice_id
        }

        for segment in preview_segments:
            voice_id = voice_mapping.get(segment.speaker_name, "en-US-AriaNeural")

            audio_data = await self.generator.generate_audio(segment.text, voice_id)
            audio_data_list.append(audio_data)

        return audio_data_list

    async def list_available_voices(self) -> list[dict[str, Any]]:
        """List available voices from the configured generator."""
        return await self.generator.list_voices()

    def update_config(self, **kwargs):
        """Update pipeline configuration."""
        for key, value in kwargs.items():
            if hasattr(self.config, key):
                setattr(self.config, key, value)

        # Reinitialize components if component types changed
        component_keys = {
            "parser_type",
            "analyzer_type",
            "voice_generator_type",
            "compiler_type",
        }
        if any(key in component_keys for key in kwargs.keys()):
            self._initialize_components()
