document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const exerciseButtons = document.querySelectorAll('.exercise-btn');
    const exerciseTitle = document.getElementById('exercise-title');
    const exerciseDescription = document.getElementById('exercise-description');
    const startButton = document.getElementById('start-exercise');
    const stopButton = document.getElementById('stop-exercise');
    const durationSelect = document.getElementById('exercise-duration');
    const breathingCircle = document.querySelector('.breathing-circle');
    const breathingInstruction = document.getElementById('breathing-instruction');
    const breathingTimer = document.getElementById('breathing-timer');
    
    // Exercise definitions
    const exercises = {
        'box': {
            title: 'Box Breathing',
            description: 'Box breathing involves inhaling, holding, exhaling, and holding again for equal counts. This technique can help reduce stress and improve focus.',
            sequence: [
                { action: 'inhale', duration: 4, instruction: 'Inhale' },
                { action: 'hold', duration: 4, instruction: 'Hold' },
                { action: 'exhale', duration: 4, instruction: 'Exhale' },
                { action: 'hold', duration: 4, instruction: 'Hold' }
            ]
        },
        '4-7-8': {
            title: '4-7-8 Breathing',
            description: 'The 4-7-8 breathing technique involves breathing in for 4 seconds, holding for 7 seconds, and exhaling for 8 seconds. It\'s designed to reduce anxiety and help with sleep.',
            sequence: [
                { action: 'inhale', duration: 4, instruction: 'Inhale' },
                { action: 'hold', duration: 7, instruction: 'Hold' },
                { action: 'exhale', duration: 8, instruction: 'Exhale' }
            ]
        },
        'deep': {
            title: 'Deep Breathing',
            description: 'Deep breathing focuses on taking slow, deep breaths, fully expanding your lungs and abdomen. This technique helps activate the body\'s relaxation response.',
            sequence: [
                { action: 'inhale', duration: 5, instruction: 'Inhale Deeply' },
                { action: 'exhale', duration: 5, instruction: 'Exhale Fully' }
            ]
        }
    };
    
    let currentExercise = 'box';
    let exerciseInterval;
    let isExercising = false;
    let currentStep = 0;
    let stepTimer = 0;
    let totalTimer = 0;
    let exerciseDuration = parseInt(durationSelect.value);
    
    // Initialize with box breathing
    updateExerciseInfo('box');
    
    // Exercise button click handlers
    exerciseButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (isExercising) return; // Don't change during exercise
            
            // Update active button
            exerciseButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update current exercise
            currentExercise = this.getAttribute('data-exercise');
            updateExerciseInfo(currentExercise);
        });
    });
    
    // Update exercise information
    function updateExerciseInfo(exerciseKey) {
        const exercise = exercises[exerciseKey];
        exerciseTitle.textContent = exercise.title;
        exerciseDescription.textContent = exercise.description;
    }
    
    // Start exercise button
    startButton.addEventListener('click', function() {
        if (isExercising) return;
        
        isExercising = true;
        startButton.classList.add('hidden');
        stopButton.classList.remove('hidden');
        
        // Get selected duration
        exerciseDuration = parseInt(durationSelect.value);
        totalTimer = 0;
        
        // Start the exercise sequence
        startExerciseSequence();
    });
    
    // Stop exercise button
    stopButton.addEventListener('click', function() {
        stopExercise();
    });
    
    // Start the breathing exercise sequence
    function startExerciseSequence() {
        const exercise = exercises[currentExercise];
        currentStep = 0;
        stepTimer = 0;
        
        // Update UI for first step
        updateBreathingStep(exercise.sequence[currentStep]);
        
        // Start interval
        exerciseInterval = setInterval(function() {
            // Update step timer
            stepTimer++;
            
            // Update total timer
            totalTimer++;
            
            // Check if current step is complete
            const currentSequence = exercise.sequence[currentStep];
            if (stepTimer >= currentSequence.duration) {
                // Move to next step
                currentStep = (currentStep + 1) % exercise.sequence.length;
                stepTimer = 0;
                
                // Update UI for new step
                updateBreathingStep(exercise.sequence[currentStep]);
            }
            
            // Update timer display
            breathingTimer.textContent = currentSequence.duration - stepTimer;
            
            // Check if exercise duration is reached
            if (totalTimer >= exerciseDuration) {
                stopExercise();
            }
        }, 1000);
    }
    
    // Update the breathing animation and instructions
    function updateBreathingStep(step) {
        // Remove all classes
        breathingCircle.classList.remove('inhale', 'exhale', 'hold');
        
        // Add appropriate class
        breathingCircle.classList.add(step.action);
        
        // Update instruction
        breathingInstruction.textContent = step.instruction;
        
        // Update timer
        breathingTimer.textContent = step.duration;
    }
    
    // Stop the exercise
    function stopExercise() {
        if (!isExercising) return;
        
        clearInterval(exerciseInterval);
        isExercising = false;
        
        // Reset UI
        breathingCircle.classList.remove('inhale', 'exhale', 'hold');
        breathingInstruction.textContent = 'Ready';
        breathingTimer.textContent = '';
        
        stopButton.classList.add('hidden');
        startButton.classList.remove('hidden');
    }
});

