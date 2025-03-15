document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = today.toLocaleDateString('en-US', options);
    
    // Initialize mood selection
    const moodOptions = document.querySelectorAll('.mood-option');
    let selectedMood = null;
    
    moodOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            moodOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Store selected mood
            selectedMood = this.getAttribute('data-mood');
        });
    });
    
    // Initialize mood calendar
    const moodCalendar = document.getElementById('mood-calendar');
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    
    // Get stored moods from localStorage
    const storedMoods = JSON.parse(localStorage.getItem('moodData')) || {};
    
    // Create calendar grid
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        moodCalendar.appendChild(emptyDay);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        
        const dayNumber = document.createElement('span');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);
        
        // Check if there's a mood stored for this day
        const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${day}`;
        if (storedMoods[dateKey]) {
            dayCell.classList.add('has-mood');
            
            const moodIndicator = document.createElement('div');
            moodIndicator.className = 'mood-indicator';
            
            // Set emoji based on mood
            switch(storedMoods[dateKey].mood) {
                case 'great':
                    moodIndicator.textContent = '😄';
                    break;
                case 'good':
                    moodIndicator.textContent = '🙂';
                    break;
                case 'okay':
                    moodIndicator.textContent = '😐';
                    break;
                case 'bad':
                    moodIndicator.textContent = '😔';
                    break;
                case 'awful':
                    moodIndicator.textContent = '😢';
                    break;
            }
            
            dayCell.appendChild(moodIndicator);
            
            // Add tooltip functionality for notes
            if (storedMoods[dateKey].notes) {
                dayCell.title = storedMoods[dateKey].notes;
            }
        }
        
        moodCalendar.appendChild(dayCell);
    }
    
    // Save mood entry
    const saveMoodBtn = document.getElementById('save-mood');
    saveMoodBtn.addEventListener('click', function() {
        if (!selectedMood) {
            alert('Please select a mood before saving.');
            return;
        }
        
        const notes = document.getElementById('mood-notes').value;
        const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        
        // Get existing mood data or initialize empty object
        const moodData = JSON.parse(localStorage.getItem('moodData')) || {};
        
        // Save current mood
        moodData[dateKey] = {
            mood: selectedMood,
            notes: notes
        };
        
        // Save to localStorage
        localStorage.setItem('moodData', JSON.stringify(moodData));
        
        // Show saved message
        const savedMessage = document.getElementById('mood-saved-message');
        savedMessage.classList.remove('hidden');
        
        // Hide message after 3 seconds
        setTimeout(() => {
            savedMessage.classList.add('hidden');
        }, 3000);
        
        // Refresh the page to update calendar
        setTimeout(() => {
            location.reload();
        }, 3100);
    });
});

