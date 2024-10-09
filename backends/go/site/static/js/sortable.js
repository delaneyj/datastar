import Sortable from 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.3/+esm'

const sortContainer = document.getElementById('sortContainer')

new Sortable(sortContainer, {
    animation: 150,
    ghostClass: 'opacity-25',
    onEnd: (evt) => {
        if (!window.ds) throw new Error('Datastar is not defined')
        const orderInfo = ds.signalByName('orderInfo')
        orderInfo.value = `Moved from ${evt.oldIndex} to ${evt.newIndex}`
    }
})

