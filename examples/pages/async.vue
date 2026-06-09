<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Async test</div>
            </div>
        </div>
        <div ref="gridContainer" class="grid-container flex-auto">
            <canvas class="canvas"></canvas>
        </div>
    </div>
</template>

<script setup>
import {
    onMounted, onBeforeUnmount, ref
} from 'vue';

const gridContainer = ref(null);

onMounted(() => {
    const { Util } = window.turbogrid;

    const canvas = document.querySelector('.canvas');
    const context = canvas.getContext('2d');

    const paintColors = ['gray', 'green', 'blue', 'red'];
    const totalLanes = paintColors.length;

    const flush = function() {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        const y = Math.floor(canvas.height / totalLanes);

        context.fillStyle = paintColors[0];
        context.fillText('regular', 10, y * 0.5);

        context.fillStyle = paintColors[1];
        context.fillText('microtask', 10, y * 1.5);

        context.fillStyle = paintColors[2];
        context.fillText('throttle', 10, y * 2.5);

        context.fillStyle = paintColors[3];
        context.fillText('debounce', 10, y * 3.5);
    };

    let pos = 0;

    const paintSync = function(lane) {
        if (pos >= canvas.width) {
            pos = 0;
            flush();
        }

        context.lineWidth = 1;
        context.strokeStyle = paintColors[lane];

        const x = pos + 0.5;
        const y = canvas.height / totalLanes * lane;
        const height = canvas.height / totalLanes;

        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x, y + height);
        context.stroke();
    };

    const paintMicrotask = Util.microtask(paintSync);
    const paintThrottle = Util.throttle(paintSync, 100);
    const paintDebounce = Util.debounce(paintSync, 100);

    canvas.addEventListener('mousemove', function(e) {
        pos += 2;
        paintSync(0);
        paintMicrotask(1);
        paintThrottle(2);
        paintDebounce(3);

        pos += 2;
        paintSync(0);
        paintMicrotask(1);
        paintThrottle(2);
        paintDebounce(3);
    });

    const resize = () => {
        const container = gridContainer.value;
        const bw = container.offsetWidth;
        const bh = container.offsetHeight;
        canvas.width = bw - 10;
        canvas.height = bh - 50;
        pos = 0;
        flush();
    };

    const onResize = resize;
    window.addEventListener('resize', onResize);

    resize();
});

onBeforeUnmount(() => {
});
</script>

<style scoped>
</style>
