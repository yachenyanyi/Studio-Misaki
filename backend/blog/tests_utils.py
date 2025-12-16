from django.test import SimpleTestCase
from blog.utils import SSEUsageExtractor
import json

class SSEUsageExtractorTests(SimpleTestCase):
    def test_simple_extraction(self):
        extractor = SSEUsageExtractor()
        data = {
            'usage_metadata': {
                'input_tokens': 10,
                'output_tokens': 20,
                'total_tokens': 30
            }
        }
        chunk = f"event: messages\ndata: {json.dumps(data)}\n\n"
        extractor.process_chunk(chunk)
        self.assertIsNotNone(extractor.last_usage)
        self.assertEqual(extractor.last_usage['total_tokens'], 30)

    def test_chunked_event(self):
        extractor = SSEUsageExtractor()
        data = {
            'usage_metadata': {'total_tokens': 50}
        }
        json_str = json.dumps(data)
        
        # Split across chunks
        chunk1 = "event: messages\ndata: " + json_str[:5]
        chunk2 = json_str[5:] + "\n\n"
        
        extractor.process_chunk(chunk1)
        self.assertIsNone(extractor.last_usage) # Not ready yet
        
        extractor.process_chunk(chunk2)
        self.assertIsNotNone(extractor.last_usage)
        self.assertEqual(extractor.last_usage['total_tokens'], 50)

    def test_nested_usage(self):
        extractor = SSEUsageExtractor()
        data = {
            'some_key': {
                'nested': {
                    'usage_metadata': {'total_tokens': 100}
                }
            }
        }
        chunk = f"data: {json.dumps(data)}\n\n"
        extractor.process_chunk(chunk)
        self.assertEqual(extractor.last_usage['total_tokens'], 100)

    def test_ignore_invalid_json(self):
        extractor = SSEUsageExtractor()
        chunk = "data: {invalid_json\n\n"
        extractor.process_chunk(chunk)
        self.assertIsNone(extractor.last_usage)
