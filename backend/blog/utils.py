import json

class SSEUsageExtractor:
    """
    Helper class to extract usage_metadata from an SSE stream incrementally.
    This avoids buffering the entire stream content in memory.
    """
    def __init__(self):
        self.buffer = ""
        self.last_usage = None

    def process_chunk(self, chunk):
        """
        Process a chunk of data (bytes or str).
        """
        if isinstance(chunk, bytes):
            text = chunk.decode('utf-8', errors='ignore')
        else:
            text = chunk
        
        self.buffer += text
        
        # Process complete events separated by double newlines
        while '\n\n' in self.buffer:
            event_text, self.buffer = self.buffer.split('\n\n', 1)
            self._parse_event(event_text)

    def _parse_event(self, event_text):
        for line in event_text.split('\n'):
            if line.startswith('data:'):
                data_str = line[5:].strip()
                try:
                    # Optimization: Quick check before parsing JSON
                    if 'usage_metadata' in data_str:
                        data = json.loads(data_str)
                        usage = self._find_usage(data)
                        if usage:
                            self.last_usage = usage
                except Exception:
                    # Ignore parse errors for individual lines
                    pass

    def _find_usage(self, obj):
        """
        Recursively search for usage_metadata in a JSON object.
        """
        if isinstance(obj, dict):
            if 'usage_metadata' in obj and obj['usage_metadata']:
                return obj['usage_metadata']
            for v in obj.values():
                res = self._find_usage(v)
                if res: return res
        elif isinstance(obj, list):
            for item in obj:
                res = self._find_usage(item)
                if res: return res
        return None
