import json
from sentence_transformers import CrossEncoder
from src2.groq_llm import LLM

class Retrieve:
    def __init__(self,vector_store,embedding,top_k=15,similarity_threshold=-0.3,api_key=""):
        self.vector_store = vector_store
        self.embedding = embedding
        self.queries = None
        self.all_queries = []
        self.top_k = top_k
        self.similarity_threshold = similarity_threshold
        self.llm = LLM(api_key=api_key)
        self.reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')


    def break_query(self,queries):
        self.queries=queries
        separators = ["and", ",", "vs", "also", "plus"]

        multiple_questions = (
            any(word in self.queries.lower() for word in separators) or
            self.queries.lower().count("what") + self.queries.lower().count("why") + self.queries.lower().count("when") > 1 or
            self.queries.count("?") > 1
        )

        if not multiple_questions:
            self.all_queries = [self.queries]
            return

        system_prompt = (
            "You will receive a query with multiple questions. "
            "Break it into separate questions while PRESERVING the exact keywords from the original query. "
            "Do NOT rephrase or use synonyms - keep the original words like 'day', 'date', 'roadmap', etc. "
            "Return ONLY a JSON array of strings, nothing else.no text etc "
            "\n\nExample:"
            "\nInput: 'What is X? Also tell me Y day in roadmap'"
            "\nOutput: [\"What is X?\", \"What is Y day in roadmap?\"]"
            "\n\nIMPORTANT: Keep original keywords exactly as they appear!"
        )
     
        response = self.llm.ask_llm(system_prompt, self.queries, retries=5)
        
        try:

            clean_response = response.strip()
            if clean_response.startswith('```'):
                lines = clean_response.split('\n')
                clean_response = '\n'.join(lines[1:-1])
            if clean_response.startswith('json'):
                clean_response = clean_response[4:].strip()
            
            self.all_queries = json.loads(clean_response)
                
        except json.JSONDecodeError as e:
            print(f"JSON decode failed: {e}")
            print("Using full query as single question")
            self.all_queries = [self.queries]

    def retrieve_with_rerank(self, query, top_k):
      
        query_embedding = self.embedding.do_embadding([query])[0]
        retrieval_k = top_k * 2  
        result = self.vector_store.collection.query(
            query_embeddings=[query_embedding],
            n_results=retrieval_k
        )
        if not result["documents"] or not result["documents"][0]:
            return []
        
        docs = result["documents"][0]
        distances = result["distances"][0]
        
        filtered_docs = []
        for doc, distance in zip(docs, distances):
            similarity = 1 - distance
            if similarity >= self.similarity_threshold:
                filtered_docs.append(doc)
        
        if not filtered_docs:
            print(f"No docs passed similarity threshold {self.similarity_threshold}")
            return []


        print(f"Reranking {len(filtered_docs)} chunks...")
        pairs = [[query, doc] for doc in filtered_docs]
        scores = self.reranker.predict(pairs)
        ranked = sorted(zip(filtered_docs, scores), key=lambda x: x[1], reverse=True)
        return [doc for doc, _ in ranked[:5]]
 

    def get_retrieve(self):
        query_contexts = {}
    
        for idx, query in enumerate(self.all_queries, 1):
            print(f"\n[INFO] Query {idx}/{len(self.all_queries)}: {query}")
            
            contexts = self.retrieve_with_rerank(query, self.top_k)  
            if contexts:
                print(f"Sample: {contexts[0][:80]}...")
            else:
                print(f"No relevant chunks found for this query")
            
            query_contexts[query] = contexts

        context_sections = []
        for query, contexts in query_contexts.items():
            section = f"\n\n{'='*70}\n"
            section += f"CONTEXT FOR QUESTION: '{query}'\n"
            section += f"{'='*70}\n"
            
            if contexts:
                section += "\n\n".join(contexts) 
            else:
                section += "No relevant information found in the knowledge base."
            
            context_sections.append(section)
        combined_context = "\n".join(context_sections)
        system_prompt = (
            "You are a helpful AI assistant. Answer each question separately using ONLY the information "
            "provided in its dedicated context section. "
            "\n\nRULES:"
            "\n1. Each question has its own context section marked with '=== CONTEXT FOR QUESTION ==='."
            "\n2. Use ONLY the information from that specific section to answer each question."
            "\n3. If the context doesn't contain enough information, state: "
            "'This information is not available in the provided context.'"
            "\n4. Be concise, accurate, and direct."
            "\n5. Number your answers (1., 2., 3., etc.) to match the question numbers."
        )
        
        user_prompt = "QUESTIONS:\n"
        for i, q in enumerate(self.all_queries, 1):
            user_prompt += f"{i}. {q}\n"
        
        user_prompt += combined_context
        
        final_answer = self.llm.ask_llm(system_prompt, user_prompt, retries=5)
        return final_answer

