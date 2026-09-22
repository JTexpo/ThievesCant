let dictionary = {};
let lookup = {};
let reverseLookup = {};

let mode = "translate";


// =========================================================
// LOAD DICTIONARY
// =========================================================

async function loadDictionary() {

    try {

        const response = await fetch(
            "thieves_cant_dictionary.json"
        );

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        dictionary = await response.json();

        // Build BOTH directions after the JSON
        // has actually loaded.
        buildLookups();

        renderGlossary();

        document.getElementById(
            "entryCount"
        ).textContent =
            `${Object.keys(dictionary).length} entries`;

    } catch (error) {

        console.error(error);

        document.getElementById(
            "entryCount"
        ).textContent = "Failed to load";

        alert(
            "Could not load thieves_cant_dictionary.json.\n\n" +
            "Make sure the JSON file is in the same directory " +
            "as index.html."
        );
    }
}


// =========================================================
// BUILD LOOKUPS
// =========================================================

function buildLookups() {

    lookup = {};
    reverseLookup = {};


    // -----------------------------------------------------
    // English -> Cant
    // -----------------------------------------------------

    for (
        const [english, cantOptions]
        of Object.entries(dictionary)
    ) {

        const englishKey =
            english
                .trim()
                .toLowerCase();


        const options =
            Array.isArray(cantOptions)
                ? cantOptions
                : [cantOptions];


        lookup[englishKey] =
            options;
    }


    // -----------------------------------------------------
    // Cant -> English
    // -----------------------------------------------------

    for (
        const [english, cantOptions]
        of Object.entries(dictionary)
    ) {

        const options =
            Array.isArray(cantOptions)
                ? cantOptions
                : [cantOptions];


        for (const cant of options) {

            const cantKey =
                String(cant)
                    .trim()
                    .toLowerCase();


            if (!cantKey) {
                continue;
            }


            if (!reverseLookup[cantKey]) {

                reverseLookup[cantKey] = [];
            }


            if (
                !reverseLookup[cantKey]
                    .includes(english)
            ) {

                reverseLookup[cantKey]
                    .push(english);
            }
        }
    }


    // Longer phrases MUST be processed first.
    //
    // For example:
    //
    // "red hand"
    //
    // should be checked before:
    //
    // "hand"

    lookup = sortByLength(lookup);

    reverseLookup =
        sortByLength(reverseLookup);
}


// =========================================================
// SORT LONGEST FIRST
// =========================================================

function sortByLength(object) {

    return Object.fromEntries(
        Object.entries(object)
            .sort(
                ([a], [b]) =>
                    b.length - a.length
            )
    );
}


// =========================================================
// REGEX ESCAPING
// =========================================================

function escapeRegex(string) {

    return string.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}


// =========================================================
// PRESERVE CAPITALIZATION
// =========================================================

function preserveCase(
    original,
    replacement
) {

    if (
        original ===
        original.toUpperCase()
    ) {

        return replacement.toUpperCase();
    }


    if (
        original.length > 0 &&
        original[0] ===
        original[0].toUpperCase()
    ) {

        return (
            replacement.charAt(0).toUpperCase() +
            replacement.slice(1)
        );
    }


    return replacement;
}


// =========================================================
// ENGLISH -> THIEVES' CANT
// =========================================================

function translateToCant(
    text,
    randomize = true
) {

    let result = text;


    for (
        const [english, cantOptions]
        of Object.entries(lookup)
    ) {

        if (
            !english ||
            !cantOptions ||
            cantOptions.length === 0
        ) {
            continue;
        }


        let cant;


        if (randomize) {

            const index =
                Math.floor(
                    Math.random() *
                    cantOptions.length
                );

            cant =
                cantOptions[index];

        } else {

            cant =
                cantOptions[0];
        }


        const pattern =
            new RegExp(
                `(?<!\\w)${escapeRegex(english)}(?!\\w)`,
                "gi"
            );


        result =
            result.replace(
                pattern,
                match =>
                    preserveCase(
                        match,
                        cant
                    )
            );
    }


    return result;
}


// =========================================================
// THIEVES' CANT -> ENGLISH
// =========================================================

function decryptFromCant(text) {

    let result = text;


    for (
        const [cant, englishOptions]
        of Object.entries(reverseLookup)
    ) {

        if (
            !cant ||
            !englishOptions ||
            englishOptions.length === 0
        ) {
            continue;
        }


        /*
         * If there are multiple possible meanings,
         * use the first one for now.
         *
         * Example:
         *
         * Cant:
         *     "foo"
         *
         * Possible meanings:
         *     ["bar", "baz"]
         *
         * The glossary still contains both.
         */

        const english =
            englishOptions[0];


        const pattern =
            new RegExp(
                `(?<!\\w)${escapeRegex(cant)}(?!\\w)`,
                "gi"
            );


        result =
            result.replace(
                pattern,
                match =>
                    preserveCase(
                        match,
                        english
                    )
            );
    }


    return result;
}


// =========================================================
// MAIN TRANSLATION FUNCTION
// =========================================================

function translate() {

    const input =
        document.getElementById(
            "inputText"
        ).value;


    if (!input.trim()) {

        document.getElementById(
            "outputText"
        ).value = "";

        return;
    }


    let output;


    if (mode === "translate") {

        const randomize =
            document.getElementById(
                "randomize"
            ).checked;


        output =
            translateToCant(
                input,
                randomize
            );

    } else {

        output =
            decryptFromCant(
                input
            );
    }


    document.getElementById(
        "outputText"
    ).value =
        output;
}


// =========================================================
// MODE SWITCHING
// =========================================================

function setMode(newMode) {

    mode = newMode;


    document
        .querySelectorAll(".tab")
        .forEach(tab => {

            tab.classList.toggle(
                "active",
                tab.dataset.mode === mode
            );
        });


    const inputLabel =
        document.getElementById(
            "inputLabel"
        );


    const outputLabel =
        document.getElementById(
            "outputLabel"
        );


    const translateButton =
        document.getElementById(
            "translateButton"
        );


    const inputText =
        document.getElementById(
            "inputText"
        );


    const outputText =
        document.getElementById(
            "outputText"
        );


    if (mode === "translate") {

        inputLabel.textContent =
            "English";

        outputLabel.textContent =
            "Thieves' Cant";

        inputText.placeholder =
            "Enter your message...";

        outputText.placeholder =
            "Translation will appear here...";

        translateButton.textContent =
            "Translate";

    } else {

        inputLabel.textContent =
            "Thieves' Cant";

        outputLabel.textContent =
            "English";

        inputText.placeholder =
            "Enter Thieves' Cant...";

        outputText.placeholder =
            "Decrypted message will appear here...";

        translateButton.textContent =
            "Decrypt";
    }
}


// =========================================================
// GLOSSARY
// =========================================================

function renderGlossary(search = "") {

    const body =
        document.getElementById(
            "glossaryBody"
        );


    body.innerHTML = "";


    search =
        search
            .trim()
            .toLowerCase();


    let count = 0;


    for (
        const [english, cantOptions]
        of Object.entries(dictionary)
    ) {

        const options =
            Array.isArray(cantOptions)
                ? cantOptions
                : [cantOptions];


        const cantText =
            options.join(", ");


        const searchable =
            `${english} ${cantText}`
                .toLowerCase();


        if (
            search &&
            !searchable.includes(search)
        ) {

            continue;
        }


        const row =
            document.createElement(
                "tr"
            );


        const englishCell =
            document.createElement(
                "td"
            );


        englishCell.textContent =
            english;


        const cantCell =
            document.createElement(
                "td"
            );


        cantCell.className =
            "cant-word";


        cantCell.textContent =
            cantText;


        row.appendChild(
            englishCell
        );


        row.appendChild(
            cantCell
        );


        body.appendChild(
            row
        );


        count++;
    }


    if (count === 0) {

        const row =
            document.createElement(
                "tr"
            );


        const cell =
            document.createElement(
                "td"
            );


        cell.colSpan = 2;

        cell.className =
            "no-results";


        cell.textContent =
            "No matching entries found.";


        row.appendChild(
            cell
        );


        body.appendChild(
            row
        );
    }
}


// =========================================================
// COPY
// =========================================================

async function copyOutput() {

    const output =
        document.getElementById(
            "outputText"
        );


    if (!output.value) {
        return;
    }


    try {

        await navigator.clipboard.writeText(
            output.value
        );


        const button =
            document.getElementById(
                "copyButton"
            );


        const original =
            button.textContent;


        button.textContent =
            "Copied!";


        setTimeout(
            () => {
                button.textContent =
                    original;
            },
            1200
        );

    } catch (error) {

        output.select();

        document.execCommand(
            "copy"
        );
    }
}


// =========================================================
// CLEAR
// =========================================================

function clearInput() {

    document.getElementById(
        "inputText"
    ).value = "";


    document.getElementById(
        "outputText"
    ).value = "";
}


// =========================================================
// SWAP
// =========================================================

function swapLanguages() {

    const input =
        document.getElementById(
            "inputText"
        );


    const output =
        document.getElementById(
            "outputText"
        );


    const inputValue =
        input.value;


    input.value =
        output.value;


    output.value =
        inputValue;


    setMode(
        mode === "translate"
            ? "decrypt"
            : "translate"
    );
}


// =========================================================
// EVENT LISTENERS
// =========================================================

document
    .querySelectorAll(".tab")
    .forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                setMode(
                    tab.dataset.mode
                );
            }
        );
    });


document
    .getElementById(
        "translateButton"
    )
    .addEventListener(
        "click",
        translate
    );


document
    .getElementById(
        "copyButton"
    )
    .addEventListener(
        "click",
        copyOutput
    );


document
    .getElementById(
        "clearButton"
    )
    .addEventListener(
        "click",
        clearInput
    );


document
    .getElementById(
        "swapButton"
    )
    .addEventListener(
        "click",
        swapLanguages
    );


document
    .getElementById(
        "searchInput"
    )
    .addEventListener(
        "input",
        event => {

            renderGlossary(
                event.target.value
            );
        }
    );


// Ctrl/Cmd + Enter
// translates/decrypts.

document
    .getElementById(
        "inputText"
    )
    .addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                (event.ctrlKey ||
                 event.metaKey)
            ) {

                event.preventDefault();

                translate();
            }
        }
    );


// =========================================================
// START
// =========================================================

loadDictionary();