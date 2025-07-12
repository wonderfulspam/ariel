"""Basic character analyzer that provides simple narrator/character distinction."""

from collections import defaultdict

from ..core.interfaces import Character, CharacterAnalyzer
from ..models import SpeakerType, TextSegment


class BasicCharacterAnalyzer(CharacterAnalyzer):
    """Basic analyzer that creates simple character profiles."""

    def __init__(self) -> None:
        # Default voice mappings for Edge TTS
        self.default_voices = {
            "narrator": "en-US-AriaNeural",
            "character": "en-US-DavisNeural",
            "male": "en-US-DavisNeural",
            "female": "en-US-JennyNeural",
        }

    async def analyze(self, segments: list[TextSegment]) -> list[Character]:
        """Analyze segments to create basic character profiles."""
        character_data: dict[str, dict] = defaultdict(
            lambda: {
                "dialogue_count": 0,
                "sample_dialogue": [],
                "total_confidence": 0.0,
                "speaker_type": SpeakerType.CHARACTER,
            }
        )

        # Collect character data from segments
        for segment in segments:
            name = segment.speaker_name
            char_data = character_data[name]

            char_data["speaker_type"] = segment.speaker_type
            char_data["dialogue_count"] += 1
            char_data["total_confidence"] += segment.confidence

            # Store sample dialogue (up to 3 examples)
            if (
                segment.speaker_type == SpeakerType.CHARACTER
                and len(char_data["sample_dialogue"]) < 3
            ):
                char_data["sample_dialogue"].append(
                    segment.text[:100] + "..."
                    if len(segment.text) > 100
                    else segment.text
                )

        # Create Character objects
        characters = []
        for name, data in character_data.items():
            # Assign voice based on character type and name
            voice_id = self._assign_voice(name, data["speaker_type"])

            character = Character(
                name=name,
                character_type=data["speaker_type"].value,
                voice_id=voice_id,
                voice_characteristics={},
            )
            character.dialogue_count = data["dialogue_count"]
            character.sample_dialogue = data["sample_dialogue"]

            characters.append(character)

        return characters

    def _assign_voice(self, name: str, speaker_type: SpeakerType) -> str:
        """Assign a voice ID based on character name and type."""
        if speaker_type == SpeakerType.NARRATOR:
            return self.default_voices["narrator"]

        # Simple heuristics for character voices
        name_lower = name.lower()

        # Common female names (basic list)
        female_names = {
            "alice",
            "anna",
            "emma",
            "mary",
            "elizabeth",
            "sarah",
            "jane",
            "helen",
            "margaret",
            "catherine",
            "susan",
            "lisa",
            "donna",
            "karen",
            "nancy",
            "betty",
            "helen",
            "sandra",
            "ruth",
            "sharon",
        }

        # Check if it's a common female name
        for female_name in female_names:
            if female_name in name_lower:
                return self.default_voices["female"]

        # Default to male voice for other characters
        return self.default_voices["male"]
