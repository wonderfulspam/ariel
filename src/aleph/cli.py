"""CLI interface for Aleph audiobook converter."""

import asyncio
from pathlib import Path
from typing import Optional

import typer
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

from aleph.core.converter import AudiobookConverter

app = typer.Typer(
    name="aleph",
    help="Transform public domain books into audiobooks with AI-generated voices.",
)
console = Console()


@app.command()
def convert(
    input_file: Path = typer.Argument(..., help="Input text file to convert"),
    output: Optional[Path] = typer.Option(
        None, "--output", "-o", help="Output audio file path"
    ),
) -> None:
    """Convert a text file to an audiobook."""
    if not input_file.exists():
        console.print(f"[red]Error: Input file '{input_file}' not found.[/red]")
        raise typer.Exit(1)
    
    if not input_file.suffix.lower() == ".txt":
        console.print(f"[red]Error: Only .txt files are supported in this version.[/red]")
        raise typer.Exit(1)
    
    if output is None:
        output = input_file.with_suffix(".mp3")
    
    console.print(f"[green]Converting '{input_file}' to audiobook...[/green]")
    console.print(f"[blue]Output will be saved to: {output}[/blue]")
    
    converter = AudiobookConverter()
    
    try:
        asyncio.run(converter.convert(input_file, output))
        console.print(f"[green]✓ Conversion complete! Audiobook saved to: {output}[/green]")
    except Exception as e:
        console.print(f"[red]Error during conversion: {e}[/red]")
        raise typer.Exit(1)


if __name__ == "__main__":
    app()