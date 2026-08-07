import CONST from './const.js';

// =============================================================================
// pattern normalization, matching, range and score computation

const escapeStringRegexp = (str) => str.replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&');

const toPatternList = (patterns) => {
    if (typeof patterns === 'string') {
        return patterns.trim().split(/\s+/g);
    }
    if (Array.isArray(patterns)) {
        return patterns;
    }
    return patterns && typeof patterns === 'object' ? [patterns] : [];
};

const getCaseSensitive = (value, defaultValue) => {
    return typeof value === 'boolean' ? value : defaultValue;
};

const getFlags = (caseSensitive, flags = '') => {
    const newFlags = flags.replace('i', '');
    return caseSensitive ? newFlags : `${newFlags}i`;
};

const getNegatedInfo = (pattern, negated, negatedPrefix) => {
    if (typeof negated === 'undefined' && negatedPrefix && pattern.startsWith(negatedPrefix)) {
        return {
            pattern: pattern.slice(negatedPrefix.length),
            negated: true
        };
    }
    return {
        pattern, negated
    };
};

const getCaseSensitiveInfo = (info) => {
    if (info.pattern.startsWith('case:')) {
        info.pattern = info.pattern.slice('case:'.length);
        info.caseSensitive = true;
    }
    return info;
};

const getPatternData = (item) => {
    return typeof item === 'string' ? {
        pattern: item
    } : item;
};

const getPatternInfo = (data, negatedPrefix) => {
    const patternType = typeof data.pattern;
    if (patternType !== 'string' && patternType !== 'function' && !(data.pattern instanceof RegExp)) {
        return;
    }
    if (patternType === 'string') {
        const negatedInfo = getNegatedInfo(data.pattern.trim(), data.negated, negatedPrefix);
        const info = getCaseSensitiveInfo(negatedInfo);
        return info.pattern ? info : null;
    }
    return {
        pattern: data.pattern,
        negated: data.negated
    };
};

const stringPatternToSource = (pattern) => {
    let source = '';
    for (let i = 0; i < pattern.length; i++) {
        const character = pattern[i];
        if (character === '\\' && pattern[i + 1] === '*') {
            source += '\\*';
            i += 1;
        } else if (character === '*') {
            source += '[\\s\\S]*?';
        } else {
            source += escapeStringRegexp(character);
        }
    }
    return source;
};

const setNormalizedRegExp = (normalized) => {
    const isRegExp = normalized.pattern instanceof RegExp;
    const source = isRegExp ? normalized.pattern.source : stringPatternToSource(normalized.pattern);
    const originalFlags = isRegExp ? normalized.pattern.flags : '';
    normalized.source = source;
    normalized.regexp = new RegExp(source, getFlags(normalized.caseSensitive, originalFlags));
    return normalized;
};

const normalizePattern = (item, caseSensitive, negatedPrefix) => {
    const data = getPatternData(item);
    if (!data) {
        return;
    }
    const info = getPatternInfo(data, negatedPrefix);
    if (!info) {
        return;
    }

    const normalized = {
        pattern: info.pattern,
        caseSensitive: info.caseSensitive || getCaseSensitive(data.caseSensitive, caseSensitive),
        negated: info.negated === true
    };
    if (typeof info.pattern === 'function') {
        normalized.matcher = info.pattern;
        return normalized;
    }
    return setNormalizedRegExp(normalized);
};

const normalizePatterns = (patterns, options = {}) => {
    const list = toPatternList(patterns);
    const caseSensitive = options.caseSensitive === true;
    const negatedPrefix = typeof options.negatedPrefix === 'string' ? options.negatedPrefix : '-';
    return list.map((item) => normalizePattern(item, caseSensitive, negatedPrefix)).filter(Boolean);
};

const match = (item, text, rowItem, columnItem, context) => {
    if (item.matcher) {
        const matchedText = item.matcher.call(context, text, rowItem, columnItem);
        if (typeof matchedText !== 'string' || !matchedText) {
            return;
        }
        const source = escapeStringRegexp(matchedText);
        return {
            highlightPattern: {
                source,
                regexp: new RegExp(source, getFlags(item.caseSensitive))
            }
        };
    }

    item.regexp.lastIndex = 0;
    const matched = item.regexp.exec(text);
    item.regexp.lastIndex = 0;
    if (matched) {
        return {
            highlightPattern: item
        };
    }
};

const isPatternMatched = (item) => {
    if (item.negated) {
        return !item.matched;
    }
    return item.matched;
};

const isMatched = (patterns, matchMode) => {
    if (matchMode === 'or') {
        return patterns.some(isPatternMatched);
    }

    const positivePatterns = patterns.filter((item) => !item.negated);
    const positiveMatched = positivePatterns.some((item) => item.matched);
    const negatedMatched = patterns.some((item) => item.negated && item.matched);
    if (matchMode === 'negatedFirst') {
        return !negatedMatched && (positivePatterns.length ? positiveMatched : true);
    }
    if (matchMode === 'positiveFirst') {
        return positiveMatched || (!negatedMatched && !positivePatterns.length);
    }
    // default: 'and' — every pattern condition must be satisfied
    return patterns.every(isPatternMatched);
};

const isCaseExactMatch = (text, range, pattern) => {
    if (pattern.caseSensitive) {
        return true;
    }
    let regexp = pattern.caseExactRegexp;
    if (!regexp) {
        const flags = pattern.regexp.flags.replace(/[igy]/g, '');
        regexp = new RegExp(pattern.source, `${flags}y`);
        pattern.caseExactRegexp = regexp;
    }
    regexp.lastIndex = range.start;
    const matched = regexp.exec(text);
    return Boolean(matched && regexp.lastIndex === range.end);
};

const isWordCharacterCode = (code) => {
    if (code === 95) {
        return true;
    }
    if (code >= 48 && code <= 57) {
        return true;
    }
    if (code >= 65 && code <= 90) {
        return true;
    }
    return code >= 97 && code <= 122;
};

const getRangeQualityScore = (text, range) => {
    if (range.start === 0) {
        return range.end === text.length ? 20 : 10;
    }
    return isWordCharacterCode(text.charCodeAt(range.start - 1)) ? 0 : 5;
};

const getMatchScore = (matchInfo) => {
    const ranges = matchInfo.ranges;
    if (!ranges.length) {
        return -1;
    }

    let bestRange = ranges[0];
    let bestQualityScore = getRangeQualityScore(matchInfo.text, bestRange);
    // A later range can only improve a normal substring to a word-boundary match.
    for (let i = 1; i < ranges.length && bestQualityScore === 0; i++) {
        const range = ranges[i];
        const qualityScore = getRangeQualityScore(matchInfo.text, range);
        if (qualityScore) {
            bestRange = range;
            bestQualityScore = qualityScore;
        }
    }

    // Reward the matched column and cap repeated-occurrence rewards at two.
    let score = 20 + Math.min(ranges.length - 1, 2) + bestQualityScore;
    if (isCaseExactMatch(matchInfo.text, bestRange, matchInfo.highlightPattern)) {
        score += 2;
    }
    return score;
};

const getOrderScore = (previousColumnRanges, matchInfo) => {
    if (!previousColumnRanges) {
        return 0;
    }
    const ranges = matchInfo.ranges;
    // Ranges are sorted by start, so the last range has the largest start and the
    // stored previous range (first range of the previous pattern) the smallest end.
    // Comparing them keeps the original any-occurrence order check in O(1).
    const lastRange = ranges[ranges.length - 1];
    const previousRange = previousColumnRanges.get(matchInfo.id);
    previousColumnRanges.set(matchInfo.id, ranges[0]);
    return previousRange && lastRange.start >= previousRange.end ? 5 : 0;
};

const getHighlightMatchScore = (patterns) => {
    let score = 0;
    // A single pattern cannot receive an order bonus, so avoid the common-case allocation.
    const previousColumnRanges = patterns.length > 1 ? new Map() : null;

    for (const pattern of patterns) {
        if (!pattern.matches.length) {
            continue;
        }

        // Matching more positive patterns is the strongest relevance signal.
        score += 100;

        for (const matchInfo of pattern.matches) {
            const matchScore = getMatchScore(matchInfo);
            if (matchScore < 0) {
                continue;
            }
            score += matchScore;

            // Score order immediately instead of allocating per-column range arrays.
            score += getOrderScore(previousColumnRanges, matchInfo);
        }
    }

    return score;
};

const getPatternRanges = (text, item) => {
    const source = typeof item === 'string' ? escapeStringRegexp(item) : item.source;
    if (!source) {
        return [];
    }

    let regexp;
    if (typeof item === 'string') {
        regexp = new RegExp(source, 'gi');
    } else {
        regexp = item.rangesRegexp;
        if (!regexp) {
            const flags = `${item.regexp.flags.replace(/[gy]/g, '')}g`;
            regexp = new RegExp(source, flags);
            item.rangesRegexp = regexp;
        }
        regexp.lastIndex = 0;
    }

    const ranges = [];
    let matched = regexp.exec(text);
    while (matched) {
        if (matched[0].length) {
            ranges.push({
                start: matched.index,
                end: matched.index + matched[0].length
            });
        } else {
            regexp.lastIndex += 1;
        }
        matched = regexp.exec(text);
    }
    regexp.lastIndex = 0;
    return ranges;
};

const getRanges = (text, patterns) => {
    if (patterns.length === 1) {
        return getPatternRanges(text, patterns[0]);
    }

    const ranges = [];
    for (const item of patterns) {
        const patternRanges = getPatternRanges(text, item);
        for (const range of patternRanges) {
            ranges.push(range);
        }
    }
    ranges.sort((a, b) => a.start - b.start || b.end - a.end);
    return ranges;
};

// =============================================================================
// highlight keywords: text extraction, row matching, caches

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

    const normalizedPatterns = normalizePatterns(patterns, options);
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
        if (item.negated) {
            // Negated patterns only need a boolean result and are never highlighted
            // or scored, so stop at the first matching column.
            if (match(item, textInfo.text, rowItem, textInfo.columnItem, context)) {
                result.matched = true;
                break;
            }
            continue;
        }
        const matched = match(item, textInfo.text, rowItem, textInfo.columnItem, context);
        if (!matched) {
            continue;
        }
        matched.id = textInfo.id;
        matched.text = textInfo.text;
        result.matches.push(matched);
        result.matched = true;
    }
    return result;
};

const getPatternResults = (context, normalizedPatterns, texts, rowItem, matchMode) => {
    const patternResults = [];
    if (matchMode === 'and') {
        // Every pattern must be satisfied, so stop at the first unsatisfied pattern
        // (a positive pattern with no match, or a negated pattern that matched)
        // instead of evaluating the remaining patterns for this row.
        for (const item of normalizedPatterns) {
            const result = getPatternResult(context, item, texts, rowItem);
            patternResults.push(result);
            const satisfied = item.negated ? !result.matched : result.matched;
            if (!satisfied) {
                return {
                    patternResults,
                    isMatched: false
                };
            }
        }
        return {
            patternResults,
            isMatched: true
        };
    }
    for (const item of normalizedPatterns) {
        patternResults.push(getPatternResult(context, item, texts, rowItem));
    }
    return {
        patternResults,
        isMatched: isMatched(patternResults, matchMode)
    };
};

const setHighlightMatches = (rowItem, patternResults, computeRanges) => {
    for (const result of patternResults) {
        for (const matchInfo of result.matches) {
            // Ranges are only consumed by score computation; skip the extra full-text
            // regex scan when scoring is disabled.
            if (computeRanges) {
                matchInfo.ranges = getPatternRanges(matchInfo.text, matchInfo.highlightPattern);
            }
            const cacheKey = `${CONST.HIGHLIGHT_KEY}${matchInfo.id}`;
            const cellPatterns = rowItem[cacheKey] || [];
            cellPatterns.push(matchInfo.highlightPattern);
            rowItem[cacheKey] = cellPatterns;
        }
    }
};

// Invalidate the per-row highlight caches for a changed column. The extracted
// html text (HIGHLIGHT_TEXT_KEY) is cached on the row item and would otherwise
// stay stale after updateCell/updateRow mutate the same row object.
const clearHighlightCache = (rowItem, id) => {
    if (!rowItem || !id) {
        return;
    }
    rowItem[`${CONST.HIGHLIGHT_KEY}${id}`] = null;
    rowItem[`${CONST.HIGHLIGHT_TEXT_KEY}${id}`] = null;
};

// exported surface is only what grid modules (init-rows/update) consume;
// normalization, matching, ranges and per-pattern results stay module-internal
export {
    clearHighlightCache,
    escapeHtml,
    getCachedPatterns,
    getHighlightMatchScore,
    getHighlightTexts,
    getPatternResults,
    getRanges,
    setHighlightMatches
};
