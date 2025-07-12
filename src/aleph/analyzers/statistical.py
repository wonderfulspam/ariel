"""Statistical character analyzer with enhanced speaker pattern detection."""

from collections import defaultdict

from ..core.interfaces import Character, CharacterAnalyzer
from ..models import SpeakerType, TextSegment


class StatisticalCharacterAnalyzer(CharacterAnalyzer):
    """Statistical analyzer that uses frequency and patterns for character profiling."""

    def __init__(self) -> None:
        # Extended voice mappings
        self.voice_mappings = {
            "narrator": "en-US-AriaNeural",
            "male_young": "en-US-DavisNeural",
            "male_older": "en-US-GuyNeural",
            "female_young": "en-US-JennyNeural",
            "female_older": "en-US-NancyNeural",
            "default_male": "en-US-BrandonNeural",
            "default_female": "en-US-AvaNeural",
        }

        # Gender indicators in names and speech patterns
        self.female_indicators = {
            "names": {
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
                "sandra",
                "ruth",
                "sharon",
                "linda",
                "patricia",
                "jennifer",
                "maria",
                "susan",
                "margaret",
                "dorothy",
                "lisa",
                "nancy",
                "karen",
                "betty",
                "helen",
                "sandra",
                "donna",
                "carol",
                "ruth",
                "sharon",
                "michelle",
                "laura",
                "sarah",
                "kimberly",
            },
            "speech_patterns": {
                "oh my",
                "goodness",
                "darling",
                "sweetheart",
                "dear",
                "gracious",
                "lovely",
                "wonderful",
                "beautiful",
            },
        }

        # Age indicators in speech
        self.older_speech_patterns = {
            "back in my day",
            "when i was young",
            "years ago",
            "in my time",
            "child",
            "young man",
            "young woman",
            "my dear",
            "sonny",
            "whippersnapper",
            "nowadays",
            "these days",
        }

        self.younger_speech_patterns = {
            "awesome",
            "cool",
            "totally",
            "like",
            "whatever",
            "dude",
            "omg",
            "seriously",
            "no way",
            "for real",
        }

    async def analyze(self, segments: list[TextSegment]) -> list[Character]:
        """Analyze segments using statistical patterns for character profiling."""
        character_data: dict[str, dict] = defaultdict(
            lambda: {
                "dialogue_count": 0,
                "sample_dialogue": [],
                "total_confidence": 0.0,
                "speaker_type": SpeakerType.CHARACTER,
                "speech_text": [],
                "word_count": 0,
                "avg_sentence_length": 0.0,
                "vocabulary": set(),
            }
        )

        # Collect detailed character data
        for segment in segments:
            name = segment.speaker_name
            char_data = character_data[name]

            char_data["speaker_type"] = segment.speaker_type
            char_data["dialogue_count"] += 1
            char_data["total_confidence"] += segment.confidence

            if segment.speaker_type == SpeakerType.CHARACTER:
                char_data["speech_text"].append(segment.text)

                # Track sample dialogue
                if len(char_data["sample_dialogue"]) < 5:
                    sample = (
                        segment.text[:150] + "..."
                        if len(segment.text) > 150
                        else segment.text
                    )
                    char_data["sample_dialogue"].append(sample)

                # Linguistic analysis
                words = segment.text.lower().split()
                char_data["word_count"] += len(words)
                char_data["vocabulary"].update(words)

        # Create enhanced Character objects
        characters = []
        for name, data in character_data.items():
            if data["dialogue_count"] == 0:
                continue

            # Analyze speech patterns for character profiling
            profile = self._analyze_speech_patterns(name, data)

            # Assign voice based on analysis
            voice_id = self._assign_voice_by_profile(profile)

            character = Character(
                name=name,
                character_type=data["speaker_type"].value,
                voice_id=voice_id,
                voice_characteristics=profile,
            )
            character.dialogue_count = data["dialogue_count"]
            character.sample_dialogue = data["sample_dialogue"]

            characters.append(character)

        return characters

    def _analyze_speech_patterns(self, name: str, data: dict) -> dict:
        """Analyze speech patterns to determine character profile."""
        profile = {
            "gender": "unknown",
            "age_category": "unknown",
            "personality_traits": [],
            "confidence_score": 0.0,
        }

        if data["speaker_type"] == SpeakerType.NARRATOR:
            profile["gender"] = "neutral"
            profile["age_category"] = "adult"
            return profile

        all_speech = " ".join(data["speech_text"]).lower()
        name_lower = name.lower()

        # Gender detection
        gender_score = 0

        # Check name against known female names
        for female_name in self.female_indicators["names"]:
            if female_name in name_lower:
                gender_score += 2
                break

        # Check speech patterns
        for pattern in self.female_indicators["speech_patterns"]:
            if pattern in all_speech:
                gender_score += 1

        profile["gender"] = "female" if gender_score > 0 else "male"

        # Age detection
        age_score_older = sum(
            1 for pattern in self.older_speech_patterns if pattern in all_speech
        )
        age_score_younger = sum(
            1 for pattern in self.younger_speech_patterns if pattern in all_speech
        )

        if age_score_older > age_score_younger:
            profile["age_category"] = "older"
        elif age_score_younger > 0:
            profile["age_category"] = "younger"
        else:
            profile["age_category"] = "adult"

        # Personality analysis (basic)
        if data["word_count"] > 0:
            avg_words_per_dialogue = data["word_count"] / data["dialogue_count"]

            if avg_words_per_dialogue > 20:
                profile["personality_traits"].append("talkative")
            elif avg_words_per_dialogue < 5:
                profile["personality_traits"].append("reserved")

            # Vocabulary diversity
            vocab_diversity = (
                len(data["vocabulary"]) / data["word_count"]
                if data["word_count"] > 0
                else 0
            )
            if vocab_diversity > 0.7:
                profile["personality_traits"].append("articulate")

        # Calculate confidence based on amount of data
        if data["dialogue_count"] >= 5:
            profile["confidence_score"] = min(0.9, 0.5 + (data["dialogue_count"] * 0.1))
        else:
            profile["confidence_score"] = 0.3 + (data["dialogue_count"] * 0.1)

        return profile

    def _assign_voice_by_profile(self, profile: dict) -> str:
        """Assign voice based on character profile."""
        if profile.get("gender") == "neutral":
            return self.voice_mappings["narrator"]

        gender = profile.get("gender", "male")
        age = profile.get("age_category", "adult")

        # Map to voice based on gender and age
        if gender == "female":
            if age == "older":
                return self.voice_mappings["female_older"]
            elif age == "younger":
                return self.voice_mappings["female_young"]
            else:
                return self.voice_mappings["default_female"]
        else:  # male or unknown
            if age == "older":
                return self.voice_mappings["male_older"]
            elif age == "younger":
                return self.voice_mappings["male_young"]
            else:
                return self.voice_mappings["default_male"]
