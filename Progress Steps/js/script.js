const progress = document.getElementById('progress')
const prev = document.getElementById('prev')
const next = document.getElementById('next')
const circles = document.querySelectorAll('.circle')

// Set the Active to number 1 by default
let currentActive = 1

// Add +1 to the active number
next.addEventListener('click', () => {
    currentActive++

    // Check if it's at the end (ne pas depasser)
    if(currentActive > circles.length) {
        currentActive = circles.length
    }

    update()

})

// Add -1 to the active number
prev.addEventListener('click', () => {
    currentActive--

    // Check if it's equal or less then 1(ne pas depasser)
    if(currentActive < 1) {
        currentActive = 1
    }

    update()
})

function update() {
    // Using the index of the current circle 
    circles.forEach((circle, idx) => {
        if(idx < currentActive) {
            circle.classList.add('active')
        } else {
            circle.classList.remove('active')
        }
    })

    const actives = document.querySelectorAll('.active')

    // To get an accurate progress bar in percentage '%' for the width css, I used the lenght of active circles vs the total circles
    progress.style.width = (actives.length - 1) / (circles.length - 1) * 100 + '%'

    if(currentActive === 1) {
        prev.disabled = true
    } else if(currentActive === circles.length) {
        next.disabled = true
    } else {
        prev.disabled = false
        next.disabled = false
    }
}