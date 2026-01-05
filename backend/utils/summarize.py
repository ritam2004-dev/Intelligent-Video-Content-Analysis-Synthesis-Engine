from transformers import pipeline 

summarizer = pipeline("summarization", model="facebook/bart-large-cnn") 

def summarize_text(text): 
    words = text.split() 
    chunk_size = 350 
    chunks = [] 
    for i in range(0, len(words), chunk_size): 
        chunks.append(" ".join(words[i:i+chunk_size])) 
        
    summary = "" 
    
    for chunk in chunks: 
        result = summarizer(chunk, max_length=150, min_length=60, do_sample=False) 
        summary += result[0]["summary_text"] + " " 
    
    return summary.strip()