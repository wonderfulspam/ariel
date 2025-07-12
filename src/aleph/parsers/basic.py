"""Basic text parser that detects dialogue using quotation marks."""

import re

from ..core.interfaces import TextParser
from ..models import SpeakerType, TextSegment


class BasicTextParser(TextParser):
    """Simple parser that uses quotation marks to identify dialogue."""

    def __init__(self) -> None:
        # Pattern to match quoted text (dialogue)
        self.dialogue_pattern = re.compile(r'"([^"]*)"')

    async def parse(self, text: str) -> list[TextSegment]:
        """Parse text into segments with speaker attribution."""
        segments: list[TextSegment] = []
        current_pos = 0

        # Find all dialogue matches
        for match in self.dialogue_pattern.finditer(text):
            start, end = match.span()
            dialogue_text = match.group(1).strip()

            # Add any narrative text before this dialogue
            if start > current_pos:
                narrative_text = text[current_pos:start].strip()
                if narrative_text:
                    segments.append(
                        TextSegment(
                            text=narrative_text,
                            speaker_type=SpeakerType.NARRATOR,
                            speaker_name="narrator",
                            confidence=1.0,
                        )
                    )

            # Add the dialogue
            if dialogue_text:
                segments.append(
                    TextSegment(
                        text=dialogue_text,
                        speaker_type=SpeakerType.CHARACTER,
                        speaker_name="character",
                        confidence=1.0,
                    )
                )

            current_pos = end

        # Add any remaining narrative text
        if current_pos < len(text):
            remaining_text = text[current_pos:].strip()
            if remaining_text:
                segments.append(
                    TextSegment(
                        text=remaining_text,
                        speaker_type=SpeakerType.NARRATOR,
                        speaker_name="narrator",
                        confidence=1.0,
                    )
                )

        # If no dialogue was found, treat entire text as narrative
        if not segments:
            segments.append(
                TextSegment(
                    text=text.strip(),
                    speaker_type=SpeakerType.NARRATOR,
                    speaker_name="narrator",
                    confidence=1.0,
                )
            )

        return segments
