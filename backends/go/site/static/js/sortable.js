import Sortable from 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.3/+esm'

const sortContainer = document.getElementById('sortContainer')

new Sortable(sortContainer, {
    animation: 150,
    ghostClass: 'opacity-25',
    onEnd: (evt) => {
        sortContainer.dispatchEvent(new CustomEvent('reordered', {detail: {orderInfo: `Moved from ${evt.oldIndex} to ${evt.newIndex}`}}));
    }
})

