from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/mood-tracker')
def mood_tracker():
    return render_template('mood_tracker.html')

@app.route('/breathing')
def breathing():
    return render_template('breathing.html')

@app.route('/resources')
def resources():
    return render_template('resources.html')

@app.route('/assessment')
def assessment():
    return render_template('assessment.html')

@app.route('/submit-assessment', methods=['POST'])
def submit_assessment():
    # In a real app, you would process and store this data
    # For the prototype, we'll just return a simple response
    score = sum(int(request.form.get(f'q{i}', 0)) for i in range(1, 6))
    
    if score <= 5:
        result = "Your responses suggest minimal stress levels. Keep up the good work!"
    elif score <= 10:
        result = "Your responses suggest mild stress. Consider trying some of our breathing exercises."
    elif score <= 15:
        result = "Your responses suggest moderate stress. We recommend exploring our resources section."
    else:
        result = "Your responses suggest high stress levels. Consider reaching out to a mental health professional."
    
    return render_template('assessment_result.html', result=result, score=score)

if __name__ == '__main__':
    app.run(debug=True)

