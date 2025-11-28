const monthItems = document.getElementById('monthItems');
const dayItems = document.getElementById('dayItems');
const yearItems = document.getElementById('yearItems');
const monthWheel = document.getElementById('monthWheel');
const dayWheel = document.getElementById('dayWheel');
const yearWheel = document.getElementById('yearWheel');
const findDayBtn = document.getElementById('findDayBtn');
const result = document.getElementById('result');
const error = document.getElementById('error');

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const today = new Date();
const currentYear = today.getFullYear();

let selectedMonth = today.getMonth() + 1;
let selectedDay = today.getDate();
let selectedYear = today.getFullYear() - 20;

function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function populateMonth() {
    monthItems.innerHTML = '';
    months.forEach((month, index) => {
        const item = document.createElement('div');
        item.className = 'wheel-item';
        item.textContent = month;
        item.setAttribute('data-value', index + 1);
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', 'false');
        monthItems.appendChild(item);
    });
}

function populateDay(maxDays) {
    const currentSelected = selectedDay;
    dayItems.innerHTML = '';
    for (let i = 1; i <= maxDays; i++) {
        const item = document.createElement('div');
        item.className = 'wheel-item';
        item.textContent = i;
        item.setAttribute('data-value', i);
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', 'false');
        dayItems.appendChild(item);
    }
    
    if (currentSelected > maxDays) {
        selectedDay = maxDays;
    }
}

function populateYear() {
    yearItems.innerHTML = '';
    for (let i = currentYear; i >= 1900; i--) {
        const item = document.createElement('div');
        item.className = 'wheel-item';
        item.textContent = i;
        item.setAttribute('data-value', i);
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', 'false');
        yearItems.appendChild(item);
    }
}

function updateSelection(wheel, items) {
    const wheelRect = wheel.getBoundingClientRect();
    const centerY = wheelRect.top + wheelRect.height / 2;
    
    let closestItem = null;
    let minDistance = Infinity;
    
    items.forEach(item => {
        item.classList.remove('selected');
        item.setAttribute('aria-selected', 'false');
        
        const itemRect = item.getBoundingClientRect();
        const itemCenterY = itemRect.top + itemRect.height / 2;
        const distance = Math.abs(centerY - itemCenterY);
        
        if (distance < minDistance) {
            minDistance = distance;
            closestItem = item;
        }
    });
    
    if (closestItem) {
        closestItem.classList.add('selected');
        closestItem.setAttribute('aria-selected', 'true');
        return parseInt(closestItem.getAttribute('data-value'));
    }
    return null;
}

function scrollToValue(wheel, items, value) {
    const item = Array.from(items).find(i => 
        parseInt(i.getAttribute('data-value')) === value
    );
    
    if (item) {
        setTimeout(() => {
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
    }
}

function handleWheelScroll(wheel, items, callback) {
    let scrollTimeout;
    
    wheel.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const value = updateSelection(wheel, items);
            if (value !== null) {
                callback(value);
            }
        }, 100);
    });
    
    const value = updateSelection(wheel, items);
    if (value !== null) {
        callback(value);
    }
}

function handleKeyboard(wheel, items, getValue, setValue) {
    wheel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            
            const currentValue = getValue();
            const allValues = Array.from(items).map(i => 
                parseInt(i.getAttribute('data-value'))
            );
            
            const currentIndex = allValues.indexOf(currentValue);
            let newIndex;
            
            if (e.key === 'ArrowUp') {
                newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
            } else {
                newIndex = currentIndex < allValues.length - 1 ? currentIndex + 1 : allValues.length - 1;
            }
            
            const newValue = allValues[newIndex];
            setValue(newValue);
            scrollToValue(wheel, items, newValue);
        }
    });
}

function validateDate(day, month, year) {
    if (year < 1900 || year > currentYear) {
        return { valid: false, error: 'Year must be between 1900 and current year!' };
    }
    
    const selectedDate = new Date(year, month - 1, day);
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (selectedDate > todayDate) {
        return { valid: false, error: 'Date must not be in the future.' };
    }
    
    const maxDays = getDaysInMonth(month, year);
    if (day > maxDays) {
        return { 
            valid: false, 
            error: `${months[month - 1]} ${year} only has ${maxDays} days!` 
        };
    }
    
    return { valid: true };
}

function getDayOfWeek(day, month, year) {
    const date = new Date(year, month - 1, day);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
}

function formatDate(day, month, year) {
    return `${months[month - 1]} ${day}, ${year}`;
}

function showResult(message) {
    result.innerHTML = message;
    result.classList.add('show');
    error.classList.remove('show');
}

function showError(message) {
    error.textContent = message;
    error.classList.add('show');
    result.classList.remove('show');
}

function updateDayWheel() {
    const maxDays = getDaysInMonth(selectedMonth, selectedYear);
    populateDay(maxDays);
    
    const dayItemsList = dayItems.querySelectorAll('.wheel-item');
    scrollToValue(dayWheel, dayItemsList, selectedDay);
    
    handleWheelScroll(dayWheel, dayItemsList, (value) => {
        selectedDay = value;
    });
}

populateMonth();
populateDay(31);
populateYear();

const monthItemsList = monthItems.querySelectorAll('.wheel-item');
const dayItemsList = dayItems.querySelectorAll('.wheel-item');
const yearItemsList = yearItems.querySelectorAll('.wheel-item');

scrollToValue(monthWheel, monthItemsList, selectedMonth);
scrollToValue(dayWheel, dayItemsList, selectedDay);
scrollToValue(yearWheel, yearItemsList, selectedYear);

handleWheelScroll(monthWheel, monthItemsList, (value) => {
    selectedMonth = value;
    updateDayWheel();
});

handleWheelScroll(dayWheel, dayItemsList, (value) => {
    selectedDay = value;
});

handleWheelScroll(yearWheel, yearItemsList, (value) => {
    selectedYear = value;
    updateDayWheel();
});

handleKeyboard(monthWheel, monthItemsList, () => selectedMonth, (v) => {
    selectedMonth = v;
    updateDayWheel();
});

handleKeyboard(dayWheel, dayItemsList, () => selectedDay, (v) => {
    selectedDay = v;
});

handleKeyboard(yearWheel, yearItemsList, () => selectedYear, (v) => {
    selectedYear = v;
    updateDayWheel();
});

findDayBtn.addEventListener('click', calculateBirthDay);
findDayBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        calculateBirthDay();
    }
});

function calculateBirthDay() {
    const validation = validateDate(selectedDay, selectedMonth, selectedYear);
    
    if (!validation.valid) {
        showError(validation.error);
        return;
    }
    
    const dayOfWeek = getDayOfWeek(selectedDay, selectedMonth, selectedYear);
    const formattedDate = formatDate(selectedDay, selectedMonth, selectedYear);
    
    showResult(`You were born on <strong>${dayOfWeek}</strong>, ${formattedDate}.`);
}
