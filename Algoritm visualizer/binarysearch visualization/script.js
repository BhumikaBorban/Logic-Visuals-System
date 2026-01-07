let array = [];
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

function generateRandomArray() {
    let randomArr = Array.from({length: 12}, () => Math.floor(Math.random() * 100));
    initDisplay(randomArr);
}

function setCustomArray() {
    const input = document.getElementById('customInput').value;
    let customArr = input.split(/[,\s]+/)
                         .map(num => parseInt(num.trim()))
                         .filter(num => !isNaN(num));

    if (customArr.length < 2) {
        alert("Please enter at least 2 numbers separated by commas or spaces.");
        return;
    }
    initDisplay(customArr);
}

function initDisplay(newArray) {
    // Binary Search MUST be sorted
    array = newArray.sort((a, b) => a - b);
    
    const container = document.getElementById('array-container');
    container.innerHTML = '';
    
    array.forEach((val, index) => {
        const div = document.createElement('div');
        div.className = 'array-item';
        div.id = `item-${index}`;
        div.innerText = val;
        container.appendChild(div);
    });

    // Show the search section and hide the setup or keep it there
    document.getElementById('array-display-area').style.display = 'block';
    document.getElementById('message').innerText = "Array set! Now enter a target to find.";
    resetUI();
}

async function handleSearch() {
    const target = parseInt(document.getElementById('targetValue').value);
    if (isNaN(target)) {
        alert("Enter a number to search for.");
        return;
    }

    let low = 0;
    let high = array.length - 1;
    let found = false;

    // Reset styles for a new search
    document.querySelectorAll('.array-item').forEach(el => el.className = 'array-item');

    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        
        updatePointerDisplay(low, mid, high);
        applyVisuals(low, high, mid);
        
        document.getElementById('message').innerText = `Checking middle element: ${array[mid]}`;
        await sleep(1000);

        if (array[mid] === target) {
            document.getElementById(`item-${mid}`).className = 'array-item found';
            document.getElementById('message').innerText = `Success! Target ${target} found at index ${mid}.`;
            found = true;
            break;
        }

        if (array[mid] < target) {
            document.getElementById('message').innerText = `${array[mid]} is less than ${target}. Moving Low to ${mid + 1}.`;
            low = mid + 1;
        } else {
            document.getElementById('message').innerText = `${array[mid]} is greater than ${target}. Moving High to ${mid - 1}.`;
            high = mid - 1;
        }
        await sleep(1000);
    }

    if (!found) {
        document.getElementById('message').innerText = `Value ${target} not found in the array.`;
        updatePointerDisplay(low, "-", high);
    }
}

function applyVisuals(low, high, mid) {
    array.forEach((_, i) => {
        const el = document.getElementById(`item-${i}`);
        if (i === mid) el.className = 'array-item mid';
        else if (i >= low && i <= high) el.className = 'array-item active';
        else el.className = 'array-item discarded';
    });
}

function updatePointerDisplay(l, m, h) {
    document.getElementById('low-val').innerText = l;
    document.getElementById('mid-val').innerText = m;
    document.getElementById('high-val').innerText = h;
}

function resetUI() {
    updatePointerDisplay("-", "-", "-");
    document.getElementById('targetValue').value = '';
}

function resetAll() {
    location.reload(); // Simplest way to restart the choice phase
}