"""Main converter class that orchestrates the audiobook creation process."""

from pathlib import Path

from rich.console import Console
from rich.progress import (
    BarColumn,
    Progress,
    SpinnerColumn,
    TaskProgressColumn,
    TextColumn,
)

from ariel.compilers.basic import BasicAudioCompiler
from ariel.generators.edge_tts import EdgeTTSGenerator
from ariel.parsers.basic import BasicTextParser

console = Console()


class AudiobookConverter:
    """Main converter that orchestrates the entire audiobook creation process."""

    def __init__(self) -> None:
        self.parser = BasicTextParser()
        self.generator = EdgeTTSGenerator()
        self.compiler = BasicAudioCompiler()

    async def convert(self, input_path: Path, output_path: Path) -> None:
        """Convert a text file to an audiobook."""
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TaskProgressColumn(),
            console=console,
        ) as progress:
            # Step 1: Read the input file
            read_task = progress.add_task("Reading input file...", total=1)
            try:
                with open(input_path, encoding="utf-8") as f:
                    text = f.read()
                progress.update(read_task, completed=1)
            except Exception as e:
                raise RuntimeError(f"Failed to read input file: {e}")

            # Step 2: Parse text into segments
            parse_task = progress.add_task("Parsing text segments...", total=1)
            try:
                segments = self.parser.parse(text)
                progress.update(parse_task, completed=1)
                console.print(f"[green]Found {len(segments)} text segments[/green]")
            except Exception as e:
                raise RuntimeError(f"Failed to parse text: {e}")

            # Step 3: Generate audio for each segment
            audio_task = progress.add_task("Generating audio...", total=len(segments))
            try:
                audio_segments = []
                for i, segment in enumerate(segments):
                    audio_segment = await self.generator.generate_audio(segment)
                    audio_segments.append(audio_segment)
                    progress.update(audio_task, advance=1)

                    # Show progress info
                    speaker_emoji = (
                        "🎭" if segment.speaker_type.value == "character" else "📖"
                    )
                    progress.console.print(
                        f"{speaker_emoji} Generated audio for {segment.speaker_type.value}: "
                        f"{segment.text[:50]}{'...' if len(segment.text) > 50 else ''}"
                    )

            except Exception as e:
                raise RuntimeError(f"Failed to generate audio: {e}")

            # Step 4: Compile audio segments
            compile_task = progress.add_task("Compiling final audiobook...", total=1)
            try:
                self.compiler.compile(audio_segments, output_path)
                progress.update(compile_task, completed=1)
            except Exception as e:
                raise RuntimeError(f"Failed to compile audio: {e}")

            # Calculate total duration
            total_duration_ms = sum(seg.duration_ms for seg in audio_segments)
            total_minutes = total_duration_ms / (1000 * 60)
            console.print(
                f"[green]Total audiobook duration: {total_minutes:.1f} minutes[/green]"
            )
