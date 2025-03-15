import spacy

# Load the spaCy model
nlp = spacy.load("en_core_web_sm")

def extract_activities(journal_entry):
    """Extract activities from a journal entry using spaCy's dependency parsing."""
    # Process the journal entry with spaCy
    doc = nlp(journal_entry)
    
    # List of generic verbs to exclude
    GENERIC_VERBS = ["went", "attended", "did", "was", "is", "are", "have", "has", "had"]
    
    # List of prepositions to exclude
    PREPOSITIONS = ["with", "after", "before", "during", "in", "on", "at", "to", "for", "by", "about"]
    
    # Extract activities based on dependency parsing
    activities = []
    for sent in doc.sents:
        for token in sent:
            if token.pos_ == "VERB" and token.text.lower() not in GENERIC_VERBS:
                # Combine the verb with its direct object or prepositional phrase
                activity = token.text
                for child in token.children:
                    if child.dep_ in ["dobj", "prep"]:  # Direct object or preposition
                        # Exclude prepositions and their children
                        if child.text.lower() not in PREPOSITIONS:
                            activity += " " + child.text
                            # Stop combining if a preposition is encountered
                            if child.dep_ == "prep":
                                break
                activities.append(activity)
    
    # Remove duplicates
    activities = list(set(activities))
    
    return activities
