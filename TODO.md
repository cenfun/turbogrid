<div class="header flex-row">
    <select class="st-theme"></select>
</div>
<div class="body flex-auto flex-row">
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title"></div>
                <select class="st-data">
                
                </select>
            </div>
            <div>
                
            </div>
        </div>
        <div class="grid-container flex-auto"></div>
    </div>
</div>

if (dataStr.startsWith('random')) {
    renderData(window.randomData(dataStr));
    return;
}