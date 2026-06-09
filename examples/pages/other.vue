<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Other Example:</div>
            </div>
        </div>
        <div ref="gridContainer" class="grid-container flex-auto">
            <div class="tg-turbogrid">

                <div class="flex-row">
                    <div>tree collapsed:</div>
                    <div class="tg-cell">
                        <div class="tg-tree-icon tg-tree-icon-collapsed"></div>
                    </div>
                    <div>expanded:</div>
                    <div class="tg-cell">
                        <div class="tg-tree-icon tg-tree-icon-expanded"></div>
                    </div>
                </div>

                <div class="flex-row">
                    <div>checkbox unselected:</div>
                    <div class="tg-cell">
                        <div class="tg-checkbox"></div>
                    </div>
                    <div>selected:</div>
                    <div class="tg-cell">
                        <div class="tg-checkbox tg-selected"></div>
                    </div>
                    <div>mixed:</div>
                    <div class="tg-cell">
                        <div class="tg-checkbox tg-mixed"></div>
                    </div>
                </div>

                <div class="flex-row">
                    <div>radio unselected:</div>
                    <div class="tg-cell">
                        <div class="tg-radio"></div>
                    </div>
                    <div>selected:</div>
                    <div class="tg-cell">
                        <div class="tg-radio tg-selected"></div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { Icon } from 'turbogrid';
import {
    ref, onMounted, nextTick
} from 'vue';

const gridContainer = ref(null);

onMounted(() => {
    nextTick(() => {
        const container = gridContainer.value;

        container.querySelectorAll('.tg-tree-icon').forEach((item) => {
            item.innerHTML = Icon.getIcon('tree');
        });

        container.querySelectorAll('.tg-checkbox').forEach((item) => {
            item.innerHTML = Icon.getIcon('checkbox');
        });

        container.querySelectorAll('.tg-radio').forEach((item) => {
            item.innerHTML = Icon.getIcon('radio');
        });
    });
});
</script>

<style scoped>
.grid-container .flex-row .tg-cell {
    width: 30px;
    height: 30px;
    position: relative;
}
</style>
