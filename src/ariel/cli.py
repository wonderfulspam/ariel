"""CLI interface for Ariel audiobook converter."""

import asyncio
from pathlib import Path

import typer
from rich.console import Console
from rich.table import Table

from .core.config import ConfigManager
from .core.factory import factory
from .core.pipeline import ProcessingPipeline
from .models import ProcessingConfig

app = typer.Typer(
    name="ariel",
    help="Transform public domain books into audiobooks with AI-generated voices.",
)
console = Console()


@app.command()
def convert(
    input_file: Path = typer.Argument(..., help="Input text file to convert"),
    output: Path | None = typer.Option(
        None, "--output", "-o", help="Output audio file path"
    ),
    config: Path | None = typer.Option(
        None, "--config", "-c", help="Configuration file (YAML/JSON)"
    ),
    parser: str | None = typer.Option(
        None, "--parser", help="Text parser to use (basic, advanced)"
    ),
    analyzer: str | None = typer.Option(
        None, "--analyzer", help="Character analyzer to use (basic, statistical)"
    ),
    voice_gen: str | None = typer.Option(
        None, "--voice-gen", help="Voice generator to use (edge-tts)"
    ),
    dry_run: bool = typer.Option(
        False, "--dry-run", help="Analyze text without generating audio"
    ),
) -> None:
    """Convert a text file to an audiobook."""
    if not input_file.exists():
        console.print(f"[red]Error: Input file '{input_file}' not found.[/red]")
        raise typer.Exit(1)

    if not input_file.suffix.lower() == ".txt":
        console.print(
            "[red]Error: Only .txt files are supported in this version.[/red]"
        )
        raise typer.Exit(1)

    # Load configuration
    config_manager = ConfigManager(config)
    processing_config = config_manager.load_config()

    # Override with command line options
    if parser:
        processing_config.parser_type = parser
    if analyzer:
        processing_config.analyzer_type = analyzer
    if voice_gen:
        processing_config.voice_generator_type = voice_gen

    # Set output file
    if output is None:
        output = input_file.with_suffix(f".{processing_config.output_format}")

    console.print(f"[green]Converting '{input_file}' to audiobook...[/green]")
    console.print("[blue]Configuration:[/blue]")
    console.print(f"  Parser: {processing_config.parser_type}")
    console.print(f"  Analyzer: {processing_config.analyzer_type}")
    console.print(f"  Voice Generator: {processing_config.voice_generator_type}")

    if dry_run:
        console.print("[yellow]Running in dry-run mode (no audio generation)[/yellow]")
    else:
        console.print(f"[blue]Output will be saved to: {output}[/blue]")

    # Create and run pipeline
    pipeline = ProcessingPipeline(processing_config)

    try:
        results = asyncio.run(pipeline.process_text_file(input_file, output, dry_run))

        # Display results
        console.print("\n[green]✓ Processing complete![/green]")
        console.print(f"  Input length: {results['input_length']:,} characters")
        console.print(f"  Text segments: {len(results['segments'])}")
        console.print(f"  Characters identified: {len(results['characters'])}")

        if not dry_run and results["output_file"]:
            console.print(f"  Audiobook saved to: {results['output_file']}")

    except Exception as e:
        console.print(f"[red]Error during conversion: {e}[/red]")
        raise typer.Exit(1)


@app.command()
def preview(
    input_file: Path = typer.Argument(..., help="Input text file to preview"),
    segments: int = typer.Option(
        3, "--segments", "-n", help="Number of segments to preview"
    ),
    parser: str | None = typer.Option(None, "--parser", help="Text parser to use"),
    analyzer: str | None = typer.Option(
        None, "--analyzer", help="Character analyzer to use"
    ),
) -> None:
    """Generate preview audio for the first few segments."""
    if not input_file.exists():
        console.print(f"[red]Error: Input file '{input_file}' not found.[/red]")
        raise typer.Exit(1)

    # Read input text
    with open(input_file, encoding="utf-8") as f:
        text = f.read()

    # Create pipeline configuration
    config = ProcessingConfig()
    if parser:
        config.parser_type = parser
    if analyzer:
        config.analyzer_type = analyzer

    pipeline = ProcessingPipeline(config)

    console.print(f"[green]Generating preview for '{input_file}'...[/green]")
    console.print(f"[blue]Preview segments: {segments}[/blue]")

    try:
        audio_list = asyncio.run(pipeline.preview_audio(text, segments))

        # Save preview files
        for i, audio_data in enumerate(audio_list, 1):
            output_file = input_file.parent / f"{input_file.stem}_preview_{i}.mp3"
            with open(output_file, "wb") as f:
                f.write(audio_data)
            console.print(f"  Preview {i} saved to: {output_file}")

        console.print("[green]✓ Preview generation complete![/green]")

    except Exception as e:
        console.print(f"[red]Error generating preview: {e}[/red]")
        raise typer.Exit(1)


@app.command("list-voices")
def list_voices(
    voice_gen: str = typer.Option(
        "edge-tts", "--voice-gen", help="Voice generator to list voices for"
    ),
    filter_lang: str | None = typer.Option(
        None, "--language", help="Filter by language (e.g., 'en')"
    ),
) -> None:
    """List available voices for the specified voice generator."""
    try:
        config = ProcessingConfig(voice_generator_type=voice_gen)
        pipeline = ProcessingPipeline(config)

        console.print(f"[green]Available voices for {voice_gen}:[/green]")

        voices = asyncio.run(pipeline.list_available_voices())

        # Filter by language if specified
        if filter_lang:
            voices = [
                v for v in voices if v.get("language", "").startswith(filter_lang)
            ]

        # Create a table
        table = Table(show_header=True, header_style="bold magenta")
        table.add_column("Voice ID", style="cyan")
        table.add_column("Name", style="green")
        table.add_column("Gender", style="blue")
        table.add_column("Language", style="yellow")

        for voice in voices:
            table.add_row(
                voice.get("id", ""),
                voice.get("name", ""),
                voice.get("gender", ""),
                voice.get("locale", ""),
            )

        console.print(table)
        console.print(f"\n[blue]Total voices: {len(voices)}[/blue]")

    except Exception as e:
        console.print(f"[red]Error listing voices: {e}[/red]")
        raise typer.Exit(1)


@app.command("list-components")
def list_components() -> None:
    """List available component implementations."""
    console.print("[green]Available Components:[/green]\n")

    # Create tables for each component type
    parsers_table = Table(
        title="Text Parsers", show_header=True, header_style="bold cyan"
    )
    parsers_table.add_column("Name", style="cyan")
    parsers_table.add_column("Description", style="white")

    for parser in factory.list_parsers():
        description = {
            "basic": "Simple quotation mark detection",
            "advanced": "Pattern-based dialogue attribution",
        }.get(parser, "Custom parser")
        parsers_table.add_row(parser, description)

    analyzers_table = Table(
        title="Character Analyzers", show_header=True, header_style="bold blue"
    )
    analyzers_table.add_column("Name", style="blue")
    analyzers_table.add_column("Description", style="white")

    for analyzer in factory.list_analyzers():
        description = {
            "basic": "Simple narrator/character distinction",
            "statistical": "Frequency and pattern-based analysis",
        }.get(analyzer, "Custom analyzer")
        analyzers_table.add_row(analyzer, description)

    generators_table = Table(
        title="Voice Generators", show_header=True, header_style="bold green"
    )
    generators_table.add_column("Name", style="green")
    generators_table.add_column("Description", style="white")

    for generator in factory.list_generators():
        description = {
            "edge-tts": "Microsoft Edge Text-to-Speech (free)",
        }.get(generator, "Custom generator")
        generators_table.add_row(generator, description)

    console.print(parsers_table)
    console.print()
    console.print(analyzers_table)
    console.print()
    console.print(generators_table)


@app.command()
def web(
    port: int = typer.Option(8000, "--port", "-p", help="Port to run web server on"),
    host: str = typer.Option("0.0.0.0", "--host", help="Host to bind web server to"),
) -> None:
    """Start the web interface."""
    try:
        import uvicorn

        from .web.app import app as web_app

        console.print("[green]Starting web interface...[/green]")
        console.print(
            f"[blue]Server will be available at: http://localhost:{port}[/blue]"
        )

        uvicorn.run(web_app, host=host, port=port, reload=False)

    except ImportError:
        console.print(
            "[red]Error: Web dependencies not installed. Run 'uv sync' to install them.[/red]"
        )
        raise typer.Exit(1)
    except Exception as e:
        console.print(f"[red]Error starting web server: {e}[/red]")
        raise typer.Exit(1)


if __name__ == "__main__":
    app()
