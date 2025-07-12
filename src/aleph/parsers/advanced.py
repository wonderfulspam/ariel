"""Advanced text parser with dialogue attribution patterns."""

import re

from ..core.interfaces import TextParser
from ..models import SpeakerType, TextSegment


class AdvancedTextParser(TextParser):
    """Advanced parser that detects dialogue and attempts speaker attribution."""

    def __init__(self) -> None:
        # Pattern to match quoted text with potential attribution
        self.dialogue_pattern = re.compile(r'"([^"]*)"')

        # Common dialogue attribution patterns
        self.attribution_patterns = [
            # "said X" patterns
            re.compile(
                r"(?:said|says|replied|asked|whispered|shouted|exclaimed|muttered|declared)\s+([A-Z][a-zA-Z\s]+?)(?:\.|,|$)",
                re.IGNORECASE,
            ),
            # "X said" patterns
            re.compile(
                r"([A-Z][a-zA-Z\s]+?)\s+(?:said|says|replied|asked|whispered|shouted|exclaimed|muttered|declared)(?:\.|,|$)",
                re.IGNORECASE,
            ),
            # Direct attribution: "John: "Hello""
            re.compile(r'([A-Z][a-zA-Z\s]+?):\s*"', re.IGNORECASE),
        ]

        # Common titles/honorifics to clean from names
        self.titles = {
            "mr",
            "mrs",
            "ms",
            "dr",
            "professor",
            "sir",
            "madam",
            "lord",
            "lady",
        }

    async def parse(self, text: str) -> list[TextSegment]:
        """Parse text into segments with speaker attribution."""
        segments: list[TextSegment] = []

        # Split text into paragraphs for better context
        paragraphs = text.split("\n\n")

        for paragraph in paragraphs:
            if not paragraph.strip():
                continue

            para_segments = await self._parse_paragraph(paragraph.strip())
            segments.extend(para_segments)

        # If no segments found, treat as narrative
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

    async def _parse_paragraph(self, paragraph: str) -> list[TextSegment]:
        """Parse a single paragraph for dialogue and attribution."""
        segments: list[TextSegment] = []
        current_pos = 0

        # Find all dialogue in this paragraph
        dialogue_matches = list(self.dialogue_pattern.finditer(paragraph))

        for i, match in enumerate(dialogue_matches):
            start, end = match.span()
            dialogue_text = match.group(1).strip()

            # Add narrative text before this dialogue
            if start > current_pos:
                narrative_text = paragraph[current_pos:start].strip()
                if narrative_text:
                    segments.append(
                        TextSegment(
                            text=narrative_text,
                            speaker_type=SpeakerType.NARRATOR,
                            speaker_name="narrator",
                            confidence=1.0,
                        )
                    )

            # Try to find speaker attribution for this dialogue
            if dialogue_text:
                speaker_name, confidence = self._find_speaker_attribution(
                    paragraph, match, i == 0
                )

                segments.append(
                    TextSegment(
                        text=dialogue_text,
                        speaker_type=SpeakerType.CHARACTER,
                        speaker_name=speaker_name,
                        confidence=confidence,
                    )
                )

            current_pos = end

        # Add remaining narrative text
        if current_pos < len(paragraph):
            remaining_text = paragraph[current_pos:].strip()
            if remaining_text:
                segments.append(
                    TextSegment(
                        text=remaining_text,
                        speaker_type=SpeakerType.NARRATOR,
                        speaker_name="narrator",
                        confidence=1.0,
                    )
                )

        # If no dialogue found, treat entire paragraph as narrative
        if not dialogue_matches:
            segments.append(
                TextSegment(
                    text=paragraph,
                    speaker_type=SpeakerType.NARRATOR,
                    speaker_name="narrator",
                    confidence=1.0,
                )
            )

        return segments

    def _find_speaker_attribution(
        self, paragraph: str, dialogue_match: re.Match, is_first_dialogue: bool
    ) -> tuple[str, float]:
        """Find speaker attribution for a dialogue segment."""
        dialogue_start, dialogue_end = dialogue_match.span()

        # Look for attribution patterns around the dialogue

        # Check for direct attribution (Name: "dialogue")
        colon_match = re.search(
            r'([A-Z][a-zA-Z\s]+?):\s*"',
            paragraph[max(0, dialogue_start - 50) : dialogue_end],
        )
        if colon_match:
            name = self._clean_speaker_name(colon_match.group(1))
            if name:
                return name, 0.95

        # Look for attribution in surrounding context (before and after)
        context_before = paragraph[max(0, dialogue_start - 100) : dialogue_start]
        context_after = paragraph[dialogue_end : dialogue_end + 100]

        # Try attribution patterns in context after dialogue
        for pattern in self.attribution_patterns:
            match = pattern.search(context_after)
            if match:
                name = self._clean_speaker_name(match.group(1))
                if name:
                    return name, 0.8

        # Try attribution patterns in context before dialogue
        for pattern in self.attribution_patterns:
            matches = list(pattern.finditer(context_before))
            if matches:
                # Take the last match (closest to dialogue)
                match = matches[-1]
                name = self._clean_speaker_name(match.group(1))
                if name:
                    return name, 0.7

        # Fallback: generic character name with low confidence
        return "character", 0.3

    def _clean_speaker_name(self, raw_name: str) -> str | None:
        """Clean and validate a potential speaker name."""
        if not raw_name:
            return None

        # Remove extra whitespace and normalize
        name = " ".join(raw_name.strip().split())

        # Skip if too long (likely not a name)
        if len(name) > 30:
            return None

        # Skip if contains numbers or strange characters
        if re.search(r'[0-9@#$%^&*()_+=\[\]{}|\\:";\'<>?,./]', name):
            return None

        # Remove common titles
        words = name.lower().split()
        cleaned_words = [w for w in words if w not in self.titles]

        if not cleaned_words:
            return None

        # Reconstruct name with proper capitalization
        cleaned_name = " ".join(word.title() for word in cleaned_words)

        # Must have at least one letter
        if not re.search(r"[a-zA-Z]", cleaned_name):
            return None

        return cleaned_name
