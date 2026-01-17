
from google import genai
import time

class LLM:
    def __init__(self, api_key, model="gemini-3-flash-preview"):
        self.client = genai.Client(api_key=api_key)
        self.model = model

    def ask_llm(self, system_prompt, user_prompt, retries=5):
        last_error = ""

        for attempt in range(1, retries + 1):
            try:
                prompt = (
                    f"SYSTEM:\n{system_prompt}\n\n"
                    f"USER:\n{user_prompt}"
                )

                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt
                )

                if response and response.text:
                    return response.text

            except Exception as e:
                last_error = str(e)
                print(f"[LLM WARNING] Attempt {attempt} failed: {last_error}")

            time.sleep(1)

        return f"[LLM ERROR] All {retries} retries failed. Last error: {last_error}"
