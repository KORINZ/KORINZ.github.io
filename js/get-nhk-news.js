let previousNewsUrl = '';

document.getElementById('fetch-news-btn').addEventListener('click', printNewsArticleContent);

async function printNewsArticleContent() {
    let url = await getRandomNewsUrl();
    while (url === previousNewsUrl) {
        url = await getRandomNewsUrl();
    }
    previousNewsUrl = url;

    const response = await fetch(url);
    const html = await response.text();

    const title = extractTitle(html);
    const date = extractDate(html);
    const articleContent = extractArticleContent(html);
    const uniqueIds = extractUniqueMatchingIds(html);
    const vocab = createWordPronunciationMap(html, uniqueIds);
    const dictionaryEntries = await getDictionaryEntries(url);

    let vocabSection = '';
    let dictionarySection = '';

    if (dictionaryEntries.length > 0) {
        const dictionaryText = dictionaryEntries.map(entry => `${entry.word}:<br>${entry.defs}`).join('<br><br>');
        vocabSection = `
            <h3>単語</h3>
            <p>${vocab}</p>
        `;
        dictionarySection = `
            <h3>辞書</h3>
            <p>${dictionaryText}</p>
        `;
    }

    const newsBox = document.getElementById('newsBox');
    newsBox.innerHTML = `
        <h2><a style="text-decoration: none;" href="${url}" target="_blank">${title} <i class="fas fa-external-link-alt"></i></a></h2>
        <p><strong>${date}</strong></p>
        <p>${articleContent}</p>
        ${vocabSection}
        ${dictionarySection}
    `;
    newsBox.scrollTop = 0; // Reset scroll bar to the top
}


async function getRandomNewsUrl() {
    const newsListUrl = 'https://www3.nhk.or.jp/news/easy/top-list.json';
    const response = await fetch(newsListUrl);
    const newsList = await response.json();

    const newsIds = newsList.slice(0, 10).map(article => article.news_id);

    const randomIndex = Math.floor(Math.random() * newsIds.length);
    const randomId = newsIds[randomIndex];

    return `https://www3.nhk.or.jp/news/easy/${randomId}/${randomId}.html`;
}

function extractTitle(html) {
    const titleMatch = html.match(/<h1[^>]*class="article-title"[^>]*>((.|\n)*?)<\/h1>/i);
    return titleMatch ? titleMatch[1].trim().replace(/<ruby>(.*?)<rt>.*?<\/rt><\/ruby>/g, '$1') : "Title not found";
}

function extractDate(html) {
    const dateMatch = html.match(/<p[^>]*class="article-date"[^>]*>(.*?)<\/p>/i);
    return dateMatch ? dateMatch[1] : "Date not found";
}

function extractArticleContent(html) {
    // Remove player wrapper div if present
    html = html.replace(/<div class="playerWrapper"[^>]*>((.|\n)*?)<\/div>/i, '');

    // Extract article body content
    const articleMatch = html.match(/<div[^>]*class="article-body"[^>]*>((.|\n)*?)<\/div>/i);

    if (articleMatch) {
        const articleBody = articleMatch[1];
        // Match all paragraphs
        const paragraphs = articleBody.match(/<p[^>]*>(.|\n)*?<\/p>/gi);

        if (!paragraphs) return "No paragraphs found";

        // Process each paragraph
        const cleanedParagraphs = paragraphs
            .map(paragraph => {
                return paragraph
                    // Replace ruby tags with styled span structure
                    .replace(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g, (match, kanji, furigana) => {
                        return `<ruby>${kanji}<rt>${furigana}</rt></ruby>`;
                    })
                    // Remove color span tags while keeping their content
                    .replace(/<span class="color[^"]*">(.*?)<\/span>/g, '$1')
                    // Remove any remaining HTML tags except ruby
                    .replace(/<(?!\/?ruby|\/?rt)[^>]*>/g, '');
            })
            // Filter out empty paragraphs
            .filter(paragraph => {
                // Remove all HTML tags to check if there's any content
                const textContent = paragraph.replace(/<[^>]*>/g, '').trim();
                return textContent.length > 0;
            });

        // Add the content to a styled container
        const container = document.createElement('div');
        container.style.fontFamily = 'sans-serif';
        container.style.lineHeight = '1.8';
        container.style.fontSize = '16px';
        container.innerHTML = cleanedParagraphs.join('<br><br>');

        // Apply the ruby styles globally once (not in the content)
        const style = document.createElement('style');
        style.textContent = `
            ruby {
                ruby-align: center;
                ruby-position: over;
                -webkit-ruby-position: over;
            }
            rt {
                font-size: 0.625em;
                color: #000;
                letter-spacing: 0;
                text-align: center;
            }
            @media (prefers-color-scheme: dark) {
                rt {
                    color: #fff;
                }
            }
            .dark rt {
                color: #fff;
            }
        `;
        if (!document.head.querySelector('style[data-ruby-styles]')) {
            style.setAttribute('data-ruby-styles', 'true');
            document.head.appendChild(style);
        }

        return container.outerHTML;
    }

    return "Article content not found";
}

function createWordPronunciationMap(html, ids) {
    const wordPronunciationPairs = [];

    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const wordHtml = extractWordHtmlForId(html, id);
        const rtMatches = extractRtMatches(wordHtml);
        const combinedRtMatches = rtMatches.length > 0 ? rtMatches.join('、') : null;
        const word = wordHtml.replace(/<rt>.*?<\/rt>/g, '').replace(/<[^>]*>/g, '').trim();

        if (word) {
            const pronunciation = combinedRtMatches ? `(${combinedRtMatches})` : "";
            wordPronunciationPairs.push(`${word}${pronunciation}`);
        }
    }

    return wordPronunciationPairs.join('、');
}



function extractWordHtmlForId(html, id) {
    const wordPattern = new RegExp('<a href="javascript:void\\(0\\)" class="dicWin" id="' + id + '">(.*?)<\/a>', 'g');
    const wordMatch = wordPattern.exec(html);

    return wordMatch ? wordMatch[1] : null;
}

function extractUniqueMatchingIds(html) {
    const pattern = /id="(RSHOK-[^"]*)"/g;
    let match;
    const uniqueMatchingIds = new Set();

    while (match = pattern.exec(html)) {
        const id = match[1];
        uniqueMatchingIds.add(id);
    }

    return Array.from(uniqueMatchingIds);
}

function extractWordForId(html, id) {
    const wordPattern = new RegExp('<a href="javascript:void\\(0\\)" class="dicWin" id="' + id + '">(.*?)<\/a>', 'g');
    const wordMatch = wordPattern.exec(html);

    if (wordMatch) {
        const wordHtml = wordMatch[1];
        let word = wordHtml.replace(/<[^>]*>/g, '');
        const rtMatches = extractRtMatches(wordHtml);

        if (rtMatches.length > 0) {
            const combinedRtMatches = rtMatches.join('、');
            word = wordHtml.replace(/<rt>.*?<\/rt>/g, '');
            word = word.replace(/<[^>]*>/g, '');
            word = word.trim() + ' (' + combinedRtMatches + ')';
        }

        word = word.replace(/（/g, '(').replace(/）/g, ')');
        return word;
    } else {
        return null;
    }
}

function extractRtMatches(wordHtml) {
    const rtPattern = /<rt>(.*?)<\/rt>/g;
    const rtMatches = [];
    let rtMatch;

    while (rtMatch = rtPattern.exec(wordHtml)) {
        rtMatches.push(rtMatch[1]);
    }

    return rtMatches;
}


async function getDictionaryEntries(url) {
    const dictUrl = url.replace("html", "out.dic");
    try {
        const response = await fetch(dictUrl);
        if (!response.ok) {
            if (response.status === 404) {
                console.log('Dictionary file not found. Returning empty array.');
                return [];
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const dictEntries = data.reikai.entries;
        const entriesArray = [];

        for (const entryKey in dictEntries) {
            const entries = dictEntries[entryKey];
            const word = getDictWord(entries);
            const defs = getDictDefs(entries);
            entriesArray.push({ word, defs });
        }

        return entriesArray;
    } catch (error) {
        console.error('Error fetching dictionary entries:', error);
        return [];
    }
}


function getDictWord(entries) {
    return entries[0].hyouki[0];
}


function getDictDefs(entries) {
    return entries.map((entry, i) => {
        const defs = entry.def.replace(/<rt>.*?<\/rt>|<[^>]+>/g, '');
        return `${toRoman(i + 1)}) ${defs}`;
    }).join('<br>'); // join definitions with a line break
}


function toRoman(num) {
    const romanMap = [{
        value: 15,
        symbol: 'xv'
    },
    {
        value: 14,
        symbol: 'xiv'
    },
    {
        value: 13,
        symbol: 'xiii'
    },
    {
        value: 12,
        symbol: 'xii'
    },
    {
        value: 11,
        symbol: 'xi'
    },
    {
        value: 10,
        symbol: 'x'
    },
    {
        value: 9,
        symbol: 'ix'
    },
    {
        value: 5,
        symbol: 'v'
    },
    {
        value: 4,
        symbol: 'iv'
    },
    {
        value: 1,
        symbol: 'i'
    },
    ];

    let roman = '';

    for (const {
        value,
        symbol
    }
        of romanMap) {
        while (num >= value) {
            roman += symbol;
            num -= value;
        }
    }

    return roman;
}


let timeoutId = null; // Store the timeout ID here

document.getElementById('copy-news-btn').addEventListener('click', function () {
    const newsBox = document.getElementById('newsBox');

    // Create a temporary element to handle text extraction
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newsBox.innerHTML;

    // Remove furigana (rt tags) from the temporary element
    tempDiv.querySelectorAll('rt').forEach(rt => rt.remove());

    // Extract text from the cleaned HTML
    const textToCopy = tempDiv.innerText;

    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            console.log('Text copied to clipboard');

            // Display the "Copied!" message with check icon
            const messageSpan = document.getElementById('copy-message');
            const path = window.location.pathname;
            const isJapanese = path.includes('ja');
            messageSpan.innerHTML = isJapanese ? 'コピーされました <i class="fa-solid fa-check"></i>' : 'Copied <i class="fa-solid fa-check"></i>';
            messageSpan.style.fontWeight = 'bold';

            // Clear any previous timeout
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
            }

            // Set a new timeout to clear the message after 2 seconds
            timeoutId = setTimeout(() => {
                messageSpan.innerHTML = '';
                messageSpan.style.fontWeight = 'normal';
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
});
