"""Custom tool decorator and registry compatible with Gemini and standard Python async calls."""

import inspect
from typing import Any, Callable, Dict, Optional


class Tool:
    """Encapsulates a callable tool with its schema, description, and metadata."""

    def __init__(
        self,
        name: str,
        description: str,
        parameters: Optional[Dict[str, Any]] = None,
        fn: Optional[Callable] = None,
    ):
        self.name = name
        self.description = description
        self.parameters = parameters or {}
        self.fn = fn
        # Maintain backward compatibility with claude_agent_sdk tool.handler
        self.handler = fn

    async def __call__(self, *args, **kwargs) -> Any:
        if not self.fn:
            raise NotImplementedError(f"Tool {self.name} has no executable function")
        if inspect.iscoroutinefunction(self.fn):
            return await self.fn(*args, **kwargs)
        return self.fn(*args, **kwargs)

    def to_gemini_declaration(self) -> Dict[str, Any]:
        """Convert tool signature to Gemini FunctionDeclaration format."""
        properties = {}
        for param_name, param_type in self.parameters.items():
            type_name = "STRING"
            if param_type in (int, float):
                type_name = "NUMBER"
            elif param_type is bool:
                type_name = "BOOLEAN"
            elif param_type in (list, tuple):
                type_name = "ARRAY"
            elif param_type in (dict,):
                type_name = "OBJECT"
            properties[param_name] = {"type": type_name}

        return {
            "name": self.name,
            "description": self.description,
            "parameters": {
                "type": "OBJECT",
                "properties": properties,
            },
        }


def tool(name: str, description: str, parameters: Optional[Dict[str, Any]] = None):
    """Decorator to register a function as an executable tool.

    Maintains `.handler` attribute so existing test suites and code work unchanged.
    """

    def decorator(fn: Callable) -> Tool:
        t = Tool(name=name, description=description, parameters=parameters, fn=fn)
        return t

    return decorator
