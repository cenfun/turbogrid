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

const getRanges = (text, patterns) => {
    const ranges = [];
    patterns.forEach((item) => {
        const source = typeof item === 'string' ? escapeStringRegexp(item) : item.source;
        if (!source) {
            return;
        }
        const flags = typeof item === 'string' ? 'gi' : `${item.regexp.flags.replace(/[gy]/g, '')}g`;
        const regexp = new RegExp(source, flags);
        let matched = regexp.exec(text);
        while (matched) {
            if (matched[0].length) {
                ranges.push({
                    start: matched.index,
                    end: matched.index + matched[0].length
                });
            }
            if (!matched[0].length) {
                regexp.lastIndex += 1;
            }
            matched = regexp.exec(text);
        }
    });
    ranges.sort((a, b) => a.start - b.start || b.end - a.end);
    return ranges;
};

export default {
    normalizePatterns,
    match,
    isMatched,
    getRanges
};
