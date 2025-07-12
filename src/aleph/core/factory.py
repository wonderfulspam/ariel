"""Component factory for creating parser, analyzer, generator, and compiler instances."""

from ..core.interfaces import (
    AudioCompiler,
    CharacterAnalyzer,
    TextParser,
    VoiceGenerator,
)


class ComponentFactory:
    """Factory for creating processing pipeline components."""

    def __init__(self):
        self._parsers: dict[str, type[TextParser]] = {}
        self._analyzers: dict[str, type[CharacterAnalyzer]] = {}
        self._generators: dict[str, type[VoiceGenerator]] = {}
        self._compilers: dict[str, type[AudioCompiler]] = {}

        self._register_default_components()

    def _register_default_components(self):
        """Register default component implementations."""
        # Parsers
        from ..parsers.advanced import AdvancedTextParser
        from ..parsers.basic import BasicTextParser

        self.register_parser("basic", BasicTextParser)
        self.register_parser("advanced", AdvancedTextParser)

        # Analyzers
        from ..analyzers.basic import BasicCharacterAnalyzer
        from ..analyzers.statistical import StatisticalCharacterAnalyzer

        self.register_analyzer("basic", BasicCharacterAnalyzer)
        self.register_analyzer("statistical", StatisticalCharacterAnalyzer)

        # Voice Generators
        from ..generators.edge_tts import EdgeTTSVoiceGenerator

        self.register_generator("edge-tts", EdgeTTSVoiceGenerator)

        # Audio Compilers
        from ..compilers.basic import BasicAudioCompiler

        self.register_compiler("basic", BasicAudioCompiler)

    def register_parser(self, name: str, parser_class: type[TextParser]):
        """Register a text parser implementation."""
        self._parsers[name] = parser_class

    def register_analyzer(self, name: str, analyzer_class: type[CharacterAnalyzer]):
        """Register a character analyzer implementation."""
        self._analyzers[name] = analyzer_class

    def register_generator(self, name: str, generator_class: type[VoiceGenerator]):
        """Register a voice generator implementation."""
        self._generators[name] = generator_class

    def register_compiler(self, name: str, compiler_class: type[AudioCompiler]):
        """Register an audio compiler implementation."""
        self._compilers[name] = compiler_class

    def create_parser(self, parser_type: str, **kwargs) -> TextParser:
        """Create a text parser instance."""
        if parser_type not in self._parsers:
            available = ", ".join(self._parsers.keys())
            raise ValueError(
                f"Unknown parser type '{parser_type}'. Available: {available}"
            )

        parser_class = self._parsers[parser_type]
        return parser_class(**kwargs)

    def create_analyzer(self, analyzer_type: str, **kwargs) -> CharacterAnalyzer:
        """Create a character analyzer instance."""
        if analyzer_type not in self._analyzers:
            available = ", ".join(self._analyzers.keys())
            raise ValueError(
                f"Unknown analyzer type '{analyzer_type}'. Available: {available}"
            )

        analyzer_class = self._analyzers[analyzer_type]
        return analyzer_class(**kwargs)

    def create_generator(self, generator_type: str, **kwargs) -> VoiceGenerator:
        """Create a voice generator instance."""
        if generator_type not in self._generators:
            available = ", ".join(self._generators.keys())
            raise ValueError(
                f"Unknown generator type '{generator_type}'. Available: {available}"
            )

        generator_class = self._generators[generator_type]
        return generator_class(**kwargs)

    def create_compiler(self, compiler_type: str, **kwargs) -> AudioCompiler:
        """Create an audio compiler instance."""
        if compiler_type not in self._compilers:
            available = ", ".join(self._compilers.keys())
            raise ValueError(
                f"Unknown compiler type '{compiler_type}'. Available: {available}"
            )

        compiler_class = self._compilers[compiler_type]
        return compiler_class(**kwargs)

    def list_parsers(self) -> list[str]:
        """List available parser types."""
        return list(self._parsers.keys())

    def list_analyzers(self) -> list[str]:
        """List available analyzer types."""
        return list(self._analyzers.keys())

    def list_generators(self) -> list[str]:
        """List available generator types."""
        return list(self._generators.keys())

    def list_compilers(self) -> list[str]:
        """List available compiler types."""
        return list(self._compilers.keys())


# Global factory instance
factory = ComponentFactory()
