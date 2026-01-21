
from groq import Groq
import time

class LLM:
    def __init__(self, api_key, model="openai/gpt-oss-20b"):
        self.client = Groq(api_key=api_key)
        self.model = model

    def ask_llm(self, system_prompt, user_prompt, retries=5):
    
        last_error = ""
        for attempt in range(1, retries + 1):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                )
                text = response.choices[0].message.content
                if text:
                    return text

            except Exception as e:
                last_error = str(e)
                print(f"[LLM WARNING] Attempt {attempt} failed: {last_error}")

            time.sleep(1) 

        return f"[LLM ERROR] All {retries} retries failed. Last error: {last_error}"