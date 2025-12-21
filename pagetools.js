let allFonts = [];
let defaultFont = 'Average-Regular';


function initFonts_old() {
    
    defaultFont = window.getComputedStyle(document.body).fontFamily;

    allFonts = [];
    for (const sheet of document.styleSheets) {
        try {
            for (const rule of sheet.cssRules) {
                if (rule instanceof CSSFontFaceRule) {
                    const family = rule.style.fontFamily.replace(/['"]/g, '');
                    if (!allFonts.includes(family)) allFonts.push(family);
                }
            }
        } catch (e) {
            console.warn("Access blocked to stylesheet contents (CORS).");
        }
    }
}

function initFonts() {
    // 1. Try to scan the stylesheets first (Standard way)
    const detectedFonts = [];
    for (const sheet of document.styleSheets) {
        try {
            const rules = sheet.cssRules || sheet.rules;
            if (!rules) continue;
            for (const rule of rules) {
                if (rule.type === 5 || rule instanceof CSSFontFaceRule) {
                    const family = rule.style.fontFamily.replace(/['"]/g, '').trim();
                    if (family && !detectedFonts.includes(family)) {
                        detectedFonts.push(family);
                    }
                }
            }
        } catch (e) { continue; }
    }

    // 2. Fallback: If Firefox detected 0 or only 1 font, use the hardcoded list
    // This solves the "Inactive Font" issue in Firefox.
    if (detectedFonts.length <= 1) {
        allFonts = [
            'Petrona-Thin', 'OHfont', 'Cardo-Regular', 'GoudyBookletter1911-Regular',
            'CrimsonPro-VariableFont_wght', 'Quattrocento-Regular', 'Average-Regular',
            'Cormorant-VariableFont_wght', 'Cormorant-Regular', 'OldStandardTT-Regular',
            'Petrona-Regular', 'Montaga-Regular', 'LindenHill-Regular', 'CrimsonText-Regular',
            'LibreBaskerville-VariableFont_wght', 'Platypi-VariableFont_wght', 
            'Lancelot-Regular', 'NotoSans-VariableFont_wdth,wght'
        ];
        console.log("Firefox fallback triggered. Fonts loaded from list.");
    } else {
        allFonts = detectedFonts;
        console.log("Fonts detected from CSS:", allFonts);
    }

    // Initialize your default font
    defaultFont = window.getComputedStyle(document.body).fontFamily.replace(/['"]/g, '');
}


function rotateCustomFonts() {
    if (allFonts.length === 0) initFonts();
    if (allFonts.length === 0) return;

    // 1. Get the ACTUAL font being rendered (even if set in a CSS file)
    const computedStyle = window.getComputedStyle(document.body).fontFamily;
    
    // Clean up quotes for a cleaner search
    const cleanComputedStyle = computedStyle.split(',')[0].replace(/['"]/g, '');

    // 2. Search our list to see if any of our custom fonts are currently active
    let currentIndex = allFonts.findIndex(font => cleanComputedStyle.includes(font));

    // 3. Move to the next font
    // If currentIndex is -1 (default font not in our custom list), nextIndex becomes 0
    const nextIndex = (currentIndex + 1) % allFonts.length;
    const nextFont = allFonts[nextIndex];

    // 4. Apply the new font
    document.body.style.fontFamily = `"${nextFont}", ${defaultFont}`;//, sans-serif`;

    console.log(`Detected rendered font: ${cleanComputedStyle}`);
    console.log(`Switched to: ${nextFont}`);
}
window.addEventListener('load', () => {
    initFonts();
});






// /**
//  * Cycles the body's font-family through all @font-face 
//  * declarations found in the document's stylesheets.
//  */
// function rotateCustomFonts() {
//   const customFonts = [];

//   // 1. Iterate through all stylesheets
//   for (const sheet of document.styleSheets) {
//     console.log(sheet)
//     console.log(sheet.href)
//     if (! sheet.href || ! sheet.href.includes('fonts.css')){
//      continue;
//     }
//     try {
//       // 2. Iterate through all rules in the stylesheet
//       for (const rule of sheet.cssRules) {
//         // Check if the rule is a @font-face declaration
//         if (rule instanceof CSSFontFaceRule) {
//           // Get the font-family name (removing extra quotes)
//           const familyName = rule.style.fontFamily.replace(/['"]/g, '');
          
//           // Avoid duplicates
//           if (!customFonts.includes(familyName)) {
//             customFonts.push(familyName);
//           }
//         }
//       }
//     } catch (e) {
//       // Catch cross-origin errors if a stylesheet is hosted on a different domain
//       console.warn("Could not read stylesheet: ", sheet.href);
//     }
//   }

//   if (customFonts.length === 0) {
//     console.log("No custom @font-face rules found.");
//     return;
//   }

//   // 3. Determine the current font and pick the next one in the array
//   const currentFont = document.body.style.fontFamily.replace(/['"]/g, '');
//   console.log('current', currentFont)
//   // console.log(customFonts)
//   const currentIndex = customFonts.indexOf(currentFont);
//   const nextIndex = (currentIndex + 1) % customFonts.length;
//   const nextFont = customFonts[nextIndex];

//   // 4. Apply the new font
//   document.body.style.fontFamily = `"${nextFont}, "`;
  
//   console.log(`Switched to: ${nextFont}`);
// }