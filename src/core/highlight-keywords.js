import CONST from './const.js';
import Matcher from './matcher.js';

const htmlRegexp = /<\/?[a-z][\s\S]*>/i;

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const getPatternSnapshot = (item) => {
    if (!item || typeof item !== 'object') {
        return {
            value: item
        };
    }
    return {
        object: true,
        pattern: item.pattern,
        caseSensitive: item.caseSensitive,
        negated: item.negated
    };
};

const isSamePatternItem = (item, snapshot) => {
    if (!snapshot.object) {
        return item === snapshot.value;
    }
    if (!item || typeof item !== 'object') {
        return false;
    }
    return item.pattern === snapshot.pattern
        && item.caseSensitive === snapshot.caseSensitive
        && item.negated === snapshot.negated;
};

const isSamePatterns = (patterns, snapshots) => {
    const isList = Array.isArray(patterns);
    const length = isList ? patterns.length : 1;
    if (!snapshots || snapshots.length !== length) {
        return false;
    }
    for (let i = 0; i < length; i++) {
        const item = isList ? patterns[i] : patterns;
        if (!isSamePatternItem(item, snapshots[i])) {
            return false;
        }
    }
    return true;
};

const getPatternSnapshots = (patterns) => {
    const list = Array.isArray(patterns) ? patterns : [patterns];
    return list.map(getPatternSnapshot);
};

const getCachedPatterns = (context, patterns, options) => {
    const caseSensitive = options.caseSensitive === true;
    const negatedPrefix = typeof options.negatedPrefix === 'string' ? options.negatedPrefix : '-';
    const cache = context.highlightKeywordsPatternCache;
    if (cache && cache.caseSensitive === caseSensitive && cache.negatedPrefix === negatedPrefix && isSamePatterns(patterns, cache.snapshots)) {
        return cache;
    }

    const normalizedPatterns = Matcher.normalizePatterns(patterns, options);
    const newCache = {
        caseSensitive,
        negatedPrefix,
        snapshots: getPatternSnapshots(patterns),
        normalizedPatterns,
        positivePatterns: normalizedPatterns.filter((item) => !item.negated),
        hasCustomMatcher: normalizedPatterns.some((item) => item.matcher)
    };
    context.highlightKeywordsPatternCache = newCache;
    return newCache;
};

const getHtmlText = (rowItem, html, id) => {
    const cacheKey = `${CONST.HIGHLIGHT_TEXT_KEY}${id}`;
    const cacheText = rowItem[cacheKey];
    if (typeof cacheText === 'string') {
        return cacheText;
    }
    const div = document.createElement('div');
    div.innerHTML = html;
    // textContent includes hidden text, but innerText not
    const text = div.innerText;
    rowItem[cacheKey] = text;
    return text;
};

const getHighlightTextInfo = (context, rowItem, id, textGenerator, hasCustomMatcher) => {
    let text = rowItem[id];
    if (typeof textGenerator === 'function') {
        text = textGenerator(rowItem, id);
    }
    if (text === null || typeof text === 'undefined') {
        return;
    }

    let str = `${text}`.trim();
    if (!str) {
        return;
    }
    if (str.includes('<') && htmlRegexp.test(str)) {
        str = getHtmlText(rowItem, str, id);
    }
    return {
        id,
        columnItem: hasCustomMatcher ? context.getColumnItem(id) : null,
        text: str
    };
};

const getHighlightTexts = (context, rowItem, columns, textGenerator, hasCustomMatcher) => {
    const texts = [];
    for (const id of columns) {
        const textInfo = getHighlightTextInfo(context, rowItem, id, textGenerator, hasCustomMatcher);
        if (textInfo) {
            texts.push(textInfo);
        }
    }
    return texts;
};

const getPatternResult = (context, item, texts, rowItem) => {
    const result = {
        negated: item.negated,
        matches: [],
        matched: false
    };
    for (const textInfo of texts) {
        const matched = Matcher.match(item, textInfo.text, rowItem, textInfo.columnItem, context);
        if (!matched) {
            continue;
        }
        matched.id = textInfo.id;
        matched.text = textInfo.text;
        result.matches.push(matched);
        result.matched = true;
        // Negated patterns only need a boolean result and are never highlighted or scored.
        if (item.negated) {
            break;
        }
    }
    return result;
};

const setHighlightMatches = (rowItem, patternResults) => {
    for (const result of patternResults) {
        for (const match of result.matches) {
            match.ranges = Matcher.getPatternRanges(match.text, match.highlightPattern);
            const cacheKey = `${CONST.HIGHLIGHT_KEY}${match.id}`;
            const cellPatterns = rowItem[cacheKey] || [];
            cellPatterns.push(match.highlightPattern);
            rowItem[cacheKey] = cellPatterns;
        }
    }
};

export {
    escapeHtml,
    getCachedPatterns,
    getHighlightTexts,
    getPatternResult,
    setHighlightMatches
};
